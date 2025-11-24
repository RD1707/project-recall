const supabase = require('../config/supabaseClient');
const sinapseService = require('../services/sinapseService');
const fileProcessor = require('../services/fileProcessingService');

const createConversation = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('sinapse_conversations')
            .insert({
                user_id: userId,
                title: 'Nova Conversa'
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar conversa:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar conversa'
            });
        }

        res.status(201).json({
            success: true,
            conversation: data
        });

    } catch (error) {
        console.error('Erro em createConversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('sinapse_conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar conversas:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar conversas'
            });
        }

        res.json({
            success: true,
            conversations: data || []
        });

    } catch (error) {
        console.error('Erro em getConversations:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        const { data: conversation, error: convError } = await supabase
            .from('sinapse_conversations')
            .select('id')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversa não encontrada'
            });
        }

        const { data, error } = await supabase
            .from('sinapse_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Erro ao buscar mensagens:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao buscar mensagens'
            });
        }

        res.json({
            success: true,
            messages: data || []
        });

    } catch (error) {
        console.error('Erro em getConversationMessages:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const { content, attachments = [] } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Mensagem não pode estar vazia'
            });
        }

        const { data: conversation, error: convError } = await supabase
            .from('sinapse_conversations')
            .select('*')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversa não encontrada'
            });
        }

        const { data: userMessage, error: userMsgError } = await supabase
            .from('sinapse_messages')
            .insert({
                conversation_id: conversationId,
                role: 'USER',
                content: content.trim(),
                attachments: attachments || []
            })
            .select()
            .single();

        if (userMsgError) {
            console.error('Erro ao salvar mensagem do usuário:', userMsgError);
            return res.status(500).json({
                success: false,
                message: 'Erro ao salvar mensagem'
            });
        }

        const { data: historyData } = await supabase
            .from('sinapse_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(20);

        const chatHistory = (historyData || []).reverse().slice(0, -1);

        const aiResponse = await sinapseService.generateResponse(
            userId,
            content,
            chatHistory,
            attachments
        );

        const { data: assistantMessage, error: assistantMsgError } = await supabase
            .from('sinapse_messages')
            .insert({
                conversation_id: conversationId,
                role: 'ASSISTANT',
                content: aiResponse
            })
            .select()
            .single();

        if (assistantMsgError) {
            console.error('Erro ao salvar resposta da IA:', assistantMsgError);
            return res.status(500).json({
                success: false,
                message: 'Erro ao salvar resposta da IA'
            });
        }

        if (conversation.title === 'Nova Conversa') {
            const newTitle = await sinapseService.generateConversationTitle(content);

            await supabase
                .from('sinapse_conversations')
                .update({ title: newTitle })
                .eq('id', conversationId);
        }

        res.json({
            success: true,
            userMessage,
            assistantMessage
        });

    } catch (error) {
        console.error('Erro em sendMessage:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro ao processar mensagem'
        });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        const { data: conversation, error: convError } = await supabase
            .from('sinapse_conversations')
            .select('id')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversa não encontrada'
            });
        }

        const { error } = await supabase
            .from('sinapse_conversations')
            .delete()
            .eq('id', conversationId);

        if (error) {
            console.error('Erro ao deletar conversa:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao deletar conversa'
            });
        }

        res.json({
            success: true,
            message: 'Conversa deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro em deleteConversation:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo enviado'
            });
        }

        const file = req.file;

        if (file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Máximo: 10MB'
            });
        }

        let extractedText = '';

        try {
            if (file.mimetype === 'text/plain') {
                extractedText = file.buffer.toString('utf-8');
            } else {
                extractedText = await fileProcessor.extractText(file);
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            return res.status(400).json({
                success: false,
                message: 'Erro ao processar arquivo. Verifique se o formato é suportado.'
            });
        }

        res.json({
            success: true,
            attachment: {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                content: extractedText.substring(0, 50000) 
            }
        });

    } catch (error) {
        console.error('Erro em uploadAttachment:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar arquivo'
        });
    }
};

const updateConversationTitle = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        const { title } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Título não pode estar vazio'
            });
        }

        const { data: conversation, error: convError } = await supabase
            .from('sinapse_conversations')
            .select('id')
            .eq('id', conversationId)
            .eq('user_id', userId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversa não encontrada'
            });
        }

        const { data, error } = await supabase
            .from('sinapse_conversations')
            .update({ title: title.trim() })
            .eq('id', conversationId)
            .select()
            .single();

        if (error) {
            console.error('Erro ao atualizar título:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar título'
            });
        }

        res.json({
            success: true,
            conversation: data
        });

    } catch (error) {
        console.error('Erro em updateConversationTitle:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

module.exports = {
    createConversation,
    getConversations,
    getConversationMessages,
    sendMessage,
    deleteConversation,
    uploadAttachment,
    updateConversationTitle
};
