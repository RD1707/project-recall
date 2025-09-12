const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
    getProfile, 
    updateProfile,
    uploadAvatar, 
    getProfileByUsername, 
    getLeaderboard,
    completeOnboarding,
    getPublicProfile 
} = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado! Apenas imagens são permitidas.'), false);
        }
    }
});

router.get('/public/:username', getPublicProfile);

router.get('/leaderboard', getLeaderboard);
router.get('/user/:username', getProfileByUsername);

router.use(authMiddleware.authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);

router.post('/avatar', upload.single('avatar'), uploadAvatar);

router.post('/onboarding-complete', completeOnboarding);

module.exports = router;