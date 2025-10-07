const supabase = require('../config/supabaseClient');
const sinapseService = require('../services/sinapseService');
const FileProcessingService = require('../services/fileProcessingService');

const fileProcessor = new FileProcessingService();

/**
 * Controller da IA Sinapse
 * Gerencia conversas e mensagens com a assistente inteligente
 */

/**
 * Criar nova conversa
 */
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

/**
 * Listar todas as conversas do usuário
 */
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

/**
 * Buscar mensagens de uma conversa específica
 */
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Verificar se a conversa pertence ao usuário
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

        // Buscar mensagens
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

/**
 * Enviar mensagem e receber resposta da IA
 */
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

        // Verificar se a conversa pertence ao usuário
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

        // Salvar mensagem do usuário
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

        // Buscar histórico de mensagens (últimas 20)
        const { data: historyData } = await supabase
            .from('sinapse_messages')
            .select('role, content')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(20);

        // Inverter para ordem cronológica (mais antiga primeiro)
        const chatHistory = (historyData || []).reverse().slice(0, -1); // Remove a última (que acabamos de adicionar)

        // Gerar resposta da IA
        const aiResponse = await sinapseService.generateResponse(
            userId,
            content,
            chatHistory,
            attachments
        );

        // Salvar resposta da IA
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

        // Se for a primeira mensagem, gerar título para a conversa
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

/**
 * Deletar conversa
 */
const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Verificar se a conversa pertence ao usuário antes de deletar
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

        // Deletar conversa (mensagens serão deletadas em cascata)
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

/**
 * Processar arquivo anexado
 */
const uploadAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo enviado'
            });
        }

        const file = req.file;

        // Validar tamanho
        if (file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'Arquivo muito grande. Máximo: 10MB'
            });
        }

        // Extrair texto do arquivo
        let extractedText = '';

        try {
            if (file.mimetype === 'text/plain') {
                extractedText = file.buffer.toString('utf-8');
            } else {
                // Usar o processador de arquivos para PDFs, DOCX, imagens
                extractedText = await fileProcessor.extractText(file);
            }
        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            return res.status(400).json({
                success: false,
                message: 'Erro ao processar arquivo. Verifique se o formato é suportado.'
            });
        }

        // Retornar informações do arquivo processado
        res.json({
            success: true,
            attachment: {
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                content: extractedText.substring(0, 50000) // Limitar a 50k caracteres
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

/**
 * Atualizar título da conversa manualmente
 */
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

        // Verificar se a conversa pertence ao usuário
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

        // Atualizar título
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
