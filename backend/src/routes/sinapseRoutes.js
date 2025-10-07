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

// Configurar multer para upload de arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        // Aceitar PDFs, DOCX, imagens e texto
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

// Todas as rotas requerem autenticação
router.use(authMiddleware.authenticateToken);

// Rotas de conversas
router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.delete('/conversations/:conversationId', deleteConversation);
router.put('/conversations/:conversationId/title', updateConversationTitle);

// Rotas de mensagens
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', sendMessage);

// Rota de upload de arquivos
router.post('/upload', upload.single('file'), uploadAttachment);

module.exports = router;
