const express = require('express');
const router = express.Router();
const {
  getOverviewStats,
  getLeadsByStatus,
  getLeadsBySource,
  getLeadsOverTime,
  getRecentActivities,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);

router.get('/overview', getOverviewStats);
router.get('/leads-by-status', getLeadsByStatus);
router.get('/leads-by-source', getLeadsBySource);
router.get('/leads-over-time', getLeadsOverTime);
router.get('/recent-activity', getRecentActivities);

module.exports = router;
