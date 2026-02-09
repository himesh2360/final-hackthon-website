const Issue = require('../models/Issue');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get dashboard overview statistics
// @route   GET /api/analytics/overview
// @access  Admin
const getOverview = asyncHandler(async (req, res) => {
    const [
        totalIssues,
        reportedCount,
        verifiedCount,
        inProgressCount,
        resolvedCount,
        totalUsers
    ] = await Promise.all([
        Issue.countDocuments(),
        Issue.countDocuments({ status: 'reported' }),
        Issue.countDocuments({ status: 'verified' }),
        Issue.countDocuments({ status: 'in_progress' }),
        Issue.countDocuments({ status: 'resolved' }),
        User.countDocuments({ role: 'citizen' })
    ]);

    // Issues created in last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const issuesLastWeek = await Issue.countDocuments({
        createdAt: { $gte: lastWeek }
    });

    // Issues resolved in last 7 days
    const resolvedLastWeek = await Issue.countDocuments({
        status: 'resolved',
        resolvedAt: { $gte: lastWeek }
    });

    res.json({
        success: true,
        stats: {
            totalIssues,
            byStatus: {
                reported: reportedCount,
                verified: verifiedCount,
                inProgress: inProgressCount,
                resolved: resolvedCount
            },
            totalUsers,
            issuesLastWeek,
            resolvedLastWeek,
            resolutionRate: totalIssues > 0
                ? ((resolvedCount / totalIssues) * 100).toFixed(1)
                : 0
        }
    });
});

// @desc    Get issues by category
// @route   GET /api/analytics/by-category
// @access  Admin
const getByCategory = asyncHandler(async (req, res) => {
    const stats = await Issue.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                resolved: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.json({
        success: true,
        stats
    });
});

// @desc    Get issues by status over time
// @route   GET /api/analytics/trend
// @access  Admin
const getTrend = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Issue.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.date': 1 } }
    ]);

    res.json({
        success: true,
        trend: trend.map(t => ({
            date: t._id.date,
            count: t.count
        }))
    });
});

// @desc    Get average resolution time
// @route   GET /api/analytics/resolution-time
// @access  Admin
const getResolutionTime = asyncHandler(async (req, res) => {
    const stats = await Issue.aggregate([
        {
            $match: {
                status: 'resolved',
                resolvedAt: { $exists: true }
            }
        },
        {
            $project: {
                category: 1,
                resolutionTime: {
                    $divide: [
                        { $subtract: ['$resolvedAt', '$createdAt'] },
                        1000 * 60 * 60 * 24 // Convert to days
                    ]
                }
            }
        },
        {
            $group: {
                _id: '$category',
                avgDays: { $avg: '$resolutionTime' },
                count: { $sum: 1 }
            }
        },
        { $sort: { avgDays: 1 } }
    ]);

    // Overall average
    const overall = await Issue.aggregate([
        {
            $match: {
                status: 'resolved',
                resolvedAt: { $exists: true }
            }
        },
        {
            $project: {
                resolutionTime: {
                    $divide: [
                        { $subtract: ['$resolvedAt', '$createdAt'] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $group: {
                _id: null,
                avgDays: { $avg: '$resolutionTime' }
            }
        }
    ]);

    res.json({
        success: true,
        byCategory: stats.map(s => ({
            category: s._id,
            avgDays: parseFloat(s.avgDays.toFixed(1)),
            count: s.count
        })),
        overallAvgDays: overall[0] ? parseFloat(overall[0].avgDays.toFixed(1)) : 0
    });
});

// @desc    Get geographic distribution
// @route   GET /api/analytics/geographic
// @access  Admin
const getGeographicStats = asyncHandler(async (req, res) => {
    const issues = await Issue.find()
        .select('location status category')
        .limit(1000);

    // Group by rough coordinates (for heatmap data)
    const clusters = {};
    issues.forEach(issue => {
        if (issue.location && issue.location.coordinates) {
            // Round to 2 decimal places for clustering
            const key = `${issue.location.coordinates[0].toFixed(2)},${issue.location.coordinates[1].toFixed(2)}`;
            if (!clusters[key]) {
                clusters[key] = {
                    lng: issue.location.coordinates[0],
                    lat: issue.location.coordinates[1],
                    count: 0
                };
            }
            clusters[key].count++;
        }
    });

    res.json({
        success: true,
        clusters: Object.values(clusters)
    });
});

module.exports = {
    getOverview,
    getByCategory,
    getTrend,
    getResolutionTime,
    getGeographicStats
};
