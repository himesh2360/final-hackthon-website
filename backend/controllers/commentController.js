const Comment = require('../models/Comment');
const Issue = require('../models/Issue');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get comments for an issue
// @route   GET /api/issues/:issueId/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({ issue: req.params.issueId });

    const comments = await Comment.find({ issue: req.params.issueId })
        .populate('user', 'name avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    res.json({
        success: true,
        count: comments.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        comments
    });
});

// @desc    Add comment to an issue
// @route   POST /api/issues/:issueId/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { content, parentComment } = req.body;

    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Check if this is an official response (from admin)
    const isOfficial = req.user.role === 'admin' || req.user.role === 'superadmin';

    const comment = await Comment.create({
        issue: req.params.issueId,
        user: req.user._id,
        content,
        isOfficial,
        parentComment: parentComment || null
    });

    // Update comment count on issue
    await Issue.findByIdAndUpdate(req.params.issueId, {
        $inc: { commentCount: 1 }
    });

    // Log the comment
    await AuditLog.create({
        action: 'comment_added',
        entityType: 'comment',
        entityId: comment._id,
        user: req.user._id,
        details: { issueId: req.params.issueId },
        ipAddress: req.ip
    });

    await comment.populate('user', 'name avatar role');

    res.status(201).json({
        success: true,
        comment
    });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    // Check ownership or admin
    if (comment.user.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' &&
        req.user.role !== 'superadmin') {
        res.status(403);
        throw new Error('Not authorized to delete this comment');
    }

    const issueId = comment.issue;
    await comment.deleteOne();

    // Update comment count
    await Issue.findByIdAndUpdate(issueId, {
        $inc: { commentCount: -1 }
    });

    res.json({
        success: true,
        message: 'Comment deleted successfully'
    });
});

module.exports = {
    getComments,
    addComment,
    deleteComment
};
