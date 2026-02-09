const express = require('express');
const router = express.Router();
const {
    getOverview,
    getByCategory,
    getTrend,
    getResolutionTime,
    getGeographicStats
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/rbac');

// All routes require admin access
router.use(protect);
router.use(isAdmin);

router.get('/overview', getOverview);
router.get('/by-category', getByCategory);
router.get('/trend', getTrend);
router.get('/resolution-time', getResolutionTime);
router.get('/geographic', getGeographicStats);

module.exports = router;
