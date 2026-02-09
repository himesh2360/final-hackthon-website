const Upvote = require('../models/Upvote');
const Issue = require('../models/Issue');
const AuditLog = require('../models/AuditLog');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Toggle upvote on an issue
// @route   POST /api/issues/:issueId/upvote
// @access  Private
const toggleUpvote = asyncHandler(async (req, res) => {
    const issue = await Issue.findById(req.params.issueId);

    if (!issue) {
        res.status(404);
        throw new Error('Issue not found');
    }

    // Check if user already upvoted
    const existingUpvote = await Upvote.findOne({
        issue: req.params.issueId,
        user: req.user._id
    });

    if (existingUpvote) {
        // Remove upvote
        await existingUpvote.deleteOne();
        await Issue.findByIdAndUpdate(req.params.issueId, {
            $inc: { upvoteCount: -1 }
        });

        // Log removal
        await AuditLog.create({
            action: 'upvote_removed',
            entityType: 'issue',
            entityId: issue._id,
            user: req.user._id,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            upvoted: false,
            upvoteCount: issue.upvoteCount - 1
        });
    } else {
        // Add upvote
        await Upvote.create({
            issue: req.params.issueId,
            user: req.user._id
        });

        await Issue.findByIdAndUpdate(req.params.issueId, {
            $inc: { upvoteCount: 1 }
        });

        // Log addition
        await AuditLog.create({
            action: 'upvote_added',
            entityType: 'issue',
            entityId: issue._id,
            user: req.user._id,
            ipAddress: req.ip
        });

        res.json({
            success: true,
            upvoted: true,
            upvoteCount: issue.upvoteCount + 1
        });
    }
});

// @desc    Get upvote status for an issue
// @route   GET /api/issues/:issueId/upvote
// @access  Private
const getUpvoteStatus = asyncHandler(async (req, res) => {
    const upvote = await Upvote.findOne({
        issue: req.params.issueId,
        user: req.user._id
    });

    res.json({
        success: true,
        upvoted: !!upvote
    });
});

module.exports = {
    toggleUpvote,
    getUpvoteStatus
};
