const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    createConversation,
    getConversations,
    getConversationMessages,
    sendMessage,
    deleteConversation,
    uploadAttachment,
    updateConversationTitle
} = require('../controllers/sinapseController');
const authMiddleware = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de arquivo não suportado! Formatos aceitos: PDF, DOCX, TXT, JPG, PNG'), false);
        }
    }
});

router.use(authMiddleware.authenticateToken);

router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.delete('/conversations/:conversationId', deleteConversation);
router.put('/conversations/:conversationId/title', updateConversationTitle);

router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

router.post('/upload', upload.single('file'), uploadAttachment);

module.exports = router;
