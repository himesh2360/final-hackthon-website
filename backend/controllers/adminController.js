const Issue = require('../models/Issue');
const Department = require('../models/Department');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all issues for admin (with advanced filters)
// @route   GET /api/admin/issues
// @access  Admin
const getAllIssues = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status) filter.status = req.query.status;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.department) filter.assignedDepartment = req.query.department;

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
        if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const total = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
        .populate('reporter', 'name email')
        .populate('assignedDepartment', 'name')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        count: issues.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        issues
    });
});

// @desc    Update issue status
// @route   PATCH /api/admin/issues/:id/status
// @access  Admin
const updateIssueStatus = asyncHandler(async (req, res) => {
    const { status, comment } = req.body;
    const validStatuses = ['reported', 'verified', 'in_progress', 'resolved', 'rejected'];

    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Update status
    issue.status = status;

    // Add to status history
    issue.statusHistory.push({
        status,
        changedBy: req.user._id,
        comment: comment || `Status changed to ${status}`
    });

    // Set resolved date if resolved
    if (status === 'resolved') {
        issue.resolvedAt = new Date();
    }

    await issue.save();

    // Log status change
    await AuditLog.create({
        action: 'status_changed',
        entityType: 'issue',
        entityId: issue._id,
        user: req.user._id,
        details: { oldStatus: issue.status, newStatus: status },
        ipAddress: req.ip
    });

    await issue.populate('reporter', 'name email');
    await issue.populate('statusHistory.changedBy', 'name');

    res.json({
        success: true,
        issue
    });
});

// @desc    Assign issue to department
// @route   PATCH /api/admin/issues/:id/assign
// @access  Admin
const assignDepartment = asyncHandler(async (req, res) => {
    const { departmentId, assigneeId, estimatedResolutionDate } = req.body;

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    if (departmentId) {
        const department = await Department.findById(departmentId);
        if (!department) {
            res.status(404);
            throw new Error('Department not found');
        }
        issue.assignedDepartment = departmentId;
    }

    if (assigneeId) {
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            res.status(404);
            throw new Error('Assignee not found');
        }
        issue.assignedTo = assigneeId;
    }

    if (estimatedResolutionDate) {
        issue.estimatedResolutionDate = new Date(estimatedResolutionDate);
    }

    // Update status to verified if still reported
    if (issue.status === 'reported') {
        issue.status = 'verified';
        issue.statusHistory.push({
            status: 'verified',
            changedBy: req.user._id,
            comment: 'Issue verified and assigned'
        });
    }

    await issue.save();

    // Log assignment
    await AuditLog.create({
        action: 'department_assigned',
        entityType: 'issue',
        entityId: issue._id,
        user: req.user._id,
        details: { departmentId, assigneeId },
        ipAddress: req.ip
    });

    await issue.populate('assignedDepartment', 'name');
    await issue.populate('assignedTo', 'name');

    res.json({
        success: true,
        issue
    });
});

// @desc    Get departments
// @route   GET /api/admin/departments
// @access  Admin
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Department.find({ isActive: true });

    res.json({
        success: true,
        departments
    });
});

// @desc    Create department
// @route   POST /api/admin/departments
// @access  Admin
const createDepartment = asyncHandler(async (req, res) => {
    const { name, description, categories, contactEmail, contactPhone } = req.body;

    const department = await Department.create({
        name,
        description,
        categories,
        contactEmail,
        contactPhone
    });

    res.status(201).json({
        success: true,
        department
    });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  SuperAdmin
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        count: users.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        users
    });
});

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  SuperAdmin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['citizen', 'admin', 'superadmin'];

    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    ).select('-password -refreshToken');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json({
        success: true,
        user
    });
});

module.exports = {
    getAllIssues,
    updateIssueStatus,
    assignDepartment,
    getDepartments,
    createDepartment,
    getUsers,
    updateUserRole
};
