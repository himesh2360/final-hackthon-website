const Issue = require('../models/Issue');
const Upvote = require('../models/Upvote');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
const createIssue = asyncHandler(async (req, res) => {
    const { title, description, category, location, priority } = req.body;

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            images.push({
                url: file.path,
                publicId: file.filename
            });
        });
    }

    const issue = await Issue.create({
        title,
        description,
        category,
        location: {
            type: 'Point',
            coordinates: [location.lng, location.lat],
            address: location.address || ''
        },
        priority: priority || 'medium',
        images,
        reporter: req.user._id,
        statusHistory: [{
            status: 'reported',
            changedBy: req.user._id,
            comment: 'Issue reported'
        }]
    });

    // Log the creation
    await AuditLog.create({
        action: 'issue_created',
        entityType: 'issue',
        entityId: issue._id,
        user: req.user._id,
        details: { title, category },
        ipAddress: req.ip
    });

    await issue.populate('reporter', 'name avatar');

    res.status(201).json({
        success: true,
        issue
    });
});

// @desc    Get all issues with filtering and pagination
// @route   GET /api/issues
// @access  Public
const getIssues = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.category) {
        filter.category = req.query.category;
    }

    if (req.query.priority) {
        filter.priority = req.query.priority;
    }

    // Geospatial query - find issues near a location
    if (req.query.lat && req.query.lng) {
        const maxDistance = parseInt(req.query.maxDistance) || 10000; // Default 10km
        filter.location = {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(req.query.lng), parseFloat(req.query.lat)]
                },
                $maxDistance: maxDistance
            }
        };
    }

    // Search in title and description
    if (req.query.search) {
        filter.$or = [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } }
        ];
    }

    // Get total count
    const total = await Issue.countDocuments(filter);

    // Get issues
    let issues = await Issue.find(filter)
        .populate('reporter', 'name avatar')
        .populate('assignedDepartment', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Check if current user has upvoted each issue
    if (req.user) {
        const issueIds = issues.map(i => i._id);
        const userUpvotes = await Upvote.find({
            issue: { $in: issueIds },
            user: req.user._id
        });
        const upvotedIds = new Set(userUpvotes.map(u => u.issue.toString()));

        issues = issues.map(issue => ({
            ...issue.toObject(),
            hasUpvoted: upvotedIds.has(issue._id.toString())
        }));
    }

    res.json({
        success: true,
        count: issues.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        issues
    });
});

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
const getIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findById(req.params.id)
        .populate('reporter', 'name avatar email')
        .populate('assignedDepartment', 'name contactEmail')
        .populate('assignedTo', 'name avatar')
        .populate('statusHistory.changedBy', 'name role');

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Check if user has upvoted
    let hasUpvoted = false;
    if (req.user) {
        const upvote = await Upvote.findOne({
            issue: issue._id,
            user: req.user._id
        });
        hasUpvoted = !!upvote;
    }

    res.json({
        success: true,
        issue: {
            ...issue.toObject(),
            hasUpvoted
        }
    });
});

// @desc    Update issue (by reporter only)
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = asyncHandler(async (req, res) => {
    let issue = await Issue.findById(req.params.id);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Check ownership or admin
    if (req.user.role === 'citizen') {
        res.status(403);
        throw new Error('Not authorized to update issues. Please contact an admin for changes.');
    }

    const { title, description, category, priority } = req.body;

    issue = await Issue.findByIdAndUpdate(
        req.params.id,
        { title, description, category, priority },
        { new: true, runValidators: true }
    ).populate('reporter', 'name avatar');

    res.json({
        success: true,
        issue
    });
});

// @desc    Delete issue (by reporter or admin)
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = asyncHandler(async (req, res) => {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Check ownership or admin
    if (issue.reporter.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' &&
        req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to delete this issue');
    }

    await issue.deleteOne();

    // Log deletion
    await AuditLog.create({
        action: 'issue_deleted',
        entityType: 'issue',
        entityId: issue._id,
        user: req.user._id,
        details: { title: issue.title },
        ipAddress: req.ip
    });

    res.json({
        success: true,
        message: 'Issue deleted successfully'
    });
});

// @desc    Get issues reported by current user
// @route   GET /api/issues/my-issues
// @access  Private
const getMyIssues = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { reporter: req.user._id };

    if (req.query.status) {
        filter.status = req.query.status;
    }

    const total = await Issue.countDocuments(filter);

    const issues = await Issue.find(filter)
        .populate('assignedDepartment', 'name')
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

// @desc    Get nearby issues (geospatial query)
// @route   GET /api/issues/nearby
// @access  Public
const getNearbyIssues = asyncHandler(async (req, res) => {
    const { lat, lng, maxDistance = 5000 } = req.query;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Latitude and longitude are required');
    }

    const issues = await Issue.find({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(lng), parseFloat(lat)]
                },
                $maxDistance: parseInt(maxDistance)
            }
        }
    })
        .populate('reporter', 'name avatar')
        .limit(50);

    res.json({
        success: true,
        count: issues.length,
        issues
    });
});

// @desc    Get all issues for map display
// @route   GET /api/issues/map
// @access  Public
const getMapIssues = asyncHandler(async (req, res) => {
    const filter = {};

    if (req.query.status) {
        filter.status = req.query.status;
    }

    if (req.query.category) {
        filter.category = req.query.category;
    }

    // Return minimal data for map markers
    const issues = await Issue.find(filter)
        .select('title category status location upvoteCount createdAt')
        .limit(500);

    res.json({
        success: true,
        count: issues.length,
        issues
    });
});

module.exports = {
    createIssue,
    getIssues,
    getIssue,
    updateIssue,
    deleteIssue,
    getMyIssues,
    getNearbyIssues,
    getMapIssues
};
