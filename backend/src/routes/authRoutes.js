const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/check-google-profile', authMiddleware.authenticateToken, authController.checkGoogleProfile);
router.post('/complete-google-profile', authMiddleware.authenticateToken, authController.completeGoogleProfile);

module.exports = router;