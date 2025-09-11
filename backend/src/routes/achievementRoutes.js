const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.authenticateToken);

router.get('/', achievementController.getAchievements);
router.post('/recalculate', achievementController.recalculateAchievements);
router.post('/force-recalculate', achievementController.forceRecalculate);

module.exports = router;