const express = require('express');
const router = express.Router();
const { getReviewsOverTime, getPerformanceInsights, getAnalyticsSummary, getRecentActivity } = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.authenticateToken);

router.get('/reviews-over-time', getReviewsOverTime);
router.get('/insights', getPerformanceInsights);
router.get('/summary', getAnalyticsSummary);
router.get('/recent-activity', getRecentActivity);


module.exports = router;