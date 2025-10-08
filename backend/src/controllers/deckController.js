const supabase = require('../config/supabaseClient');
const { z } = require('zod');
const logger = require('../config/logger');
const pdf = require('pdf-parse');
const { YoutubeTranscript } = require('youtube-transcript');
const { flashcardGenerationQueue, isRedisConnected } = require('../config/queue');
const { processGenerationAndSave } = require('../services/generationService');
const FileProcessingService = require('../services/fileProcessingService');
const { updateAchievementProgress } = require('../services/achievementService');
const { getYouTubeTranscript } = require('../services/youtubeService');

const SUPPORTED_MIME_TYPES = {
    'text/plain': { extension: 'txt', category: 'text' },
    'text/markdown': { extension: 'md', category: 'text' },
    'application/pdf': { extension: 'pdf', category: 'document' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
        extension: 'docx', 
        category: 'document' 
    },
    'image/jpeg': { extension: 'jpg', category: 'image' },
    'image/jpg': { extension: 'jpg', category: 'image' },
    'image/png': { extension: 'png', category: 'image' },
    'image/webp': { extension: 'webp', category: 'image' }
};

const deckSchema = z.object({
  title: z.string({ required_error: 'O título é obrigatório.' }).min(1, 'O título não pode estar vazio.'),
  description: z.string().optional(),
  color: z.string().optional(),
});

const generateSchema = z.object({
    textContent: z.string().min(30, 'O conteúdo de texto precisa ter pelo menos 30 caracteres.'),
    count: z.coerce.number().int().min(1).max(15),
    type: z.enum(['Pergunta e Resposta', 'Múltipla Escolha']),
    difficulty: z.enum(['facil', 'medio', 'dificil']) 
});

const getDecks = async (req, res) => {
  const userId = req.user.id;
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('*, flashcards(count)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const decksWithCount = data.map(deck => {
        const { flashcards, ...deckData } = deck;
        return {
            ...deckData,
            card_count: flashcards[0]?.count || 0
        };
    });

    res.status(200).json(decksWithCount);
  } catch (error) {
    logger.error(`Error fetching decks for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Erro ao buscar os baralhos.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

const createDeck = async (req, res) => {
  const userId = req.user.id;
  console.log(" CREATE DECK ENDPOINT CHAMADO - userId:", userId);
  console.log(" REQ BODY:", req.body);
  logger.info(`[CREATE DECK] Usuário ${userId} tentando criar deck`);
  try {
    const { title, description, color } = deckSchema.parse(req.body);
    console.log(" DADOS DO DECK PARSED:", { title, description, color });

    const { data, error } = await supabase
      .from('decks')
      .insert([{ title, description, user_id: userId, color }])
      .select()
      .single();

    if (error) throw error;
    
    try {
        logger.info(`[DECK CREATION] Atualizando conquistas para usuário ${userId}`);
        const { count, error: countError } = await supabase
            .from('decks')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (countError) throw countError;

        logger.info(`[DECK CREATION] Usuário ${userId} agora tem ${count} decks`);
        
        if (count === 1) {
            logger.info(`[DECK CREATION] Primeiro deck! Atualizando decks_created para ${count}`);
            await updateAchievementProgress(userId, 'decks_created', count);
        }
        logger.info(`[DECK CREATION] Atualizando decks_created_total para ${count}`);
        await updateAchievementProgress(userId, 'decks_created_total', count);
    } catch (achievementError) {
        logger.error(`Falha ao atualizar conquistas para o usuário ${userId} após criar baralho:`, achievementError);
    }

    res.status(201).json({ message: 'Baralho criado com sucesso!', deck: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
    }
    logger.error(`Error creating deck for user ${userId}: ${error.message}`);
    res.status(500).json({ message: 'Erro interno do servidor ao criar o baralho.', code: 'INTERNAL_SERVER_ERROR' });
  }
};

const updateDeck = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const { title, description, color } = deckSchema.parse(req.body);

        const { data, error } = await supabase
            .from('decks')
            .update({ title, description, color })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ message: 'Baralho não encontrado ou você não tem permissão para editá-lo.', code: 'NOT_FOUND' });

        res.status(200).json({ message: 'Baralho atualizado com sucesso!', deck: data });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        logger.error(`Error updating deck ${id} for user ${userId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao atualizar o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const deleteDeck = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const { data: deck, error: deckError } = await supabase
            .from('decks')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        const { error } = await supabase
            .from('decks')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.status(200).json({ message: 'Baralho excluído com sucesso!' });

    } catch (error) {
        logger.error(`Error deleting deck ${id}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao excluir o baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const generateCardsForDeck = async (req, res) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;

    try {
        const { textContent, count, type, difficulty } = generateSchema.parse(req.body);
        const jobData = { deckId, textContent, count, type, difficulty };

        const { data: deck, error: deckError } = await supabase
            .from('decks').select('id').eq('id', deckId).eq('user_id', userId).single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        if (isRedisConnected) {
            await flashcardGenerationQueue.add('generate-text', jobData);
            res.status(202).json({ processing: true, message: 'Geração iniciada!' });
        } else {
            const savedFlashcards = await processGenerationAndSave(jobData);
            res.status(201).json({ message: 'Flashcards gerados!', flashcards: savedFlashcards });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        logger.error(`Erro na geração: ${error.message}`);
        res.status(500).json({ message: 'Erro ao gerar flashcards.', code: 'GENERATION_ERROR' });
    }
};

const generateCardsFromFile = async (req, res) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;

    try {

        if (!req.file) {
            return res.status(400).json({ 
                message: 'Nenhum arquivo foi enviado.', 
                code: 'VALIDATION_ERROR' 
            });
        }

        if (!SUPPORTED_MIME_TYPES[req.file.mimetype]) {
            const supportedTypes = Object.keys(SUPPORTED_MIME_TYPES)
                .map(type => SUPPORTED_MIME_TYPES[type].extension.toUpperCase())
                .join(', ');
            
            return res.status(400).json({ 
                message: `Tipo de arquivo não suportado. Suportados: ${supportedTypes}`, 
                code: 'UNSUPPORTED_FILE_TYPE' 
            });
        }

        const { data: deck, error: deckError } = await supabase
            .from('decks').select('id').eq('id', deckId).eq('user_id', userId).single();

        if (deckError || !deck) {
            return res.status(404).json({ 
                message: 'Baralho não encontrado.', 
                code: 'NOT_FOUND' 
            });
        }

        let extractionResult;
        try {
            extractionResult = await FileProcessingService.extractText(req.file);
        } catch (extractionError) {
            logger.error(`Erro na extração: ${extractionError.message}`);
            return res.status(400).json({ 
                message: extractionError.message, 
                code: 'TEXT_EXTRACTION_FAILED' 
            });
        }

        const { text: textContent, originalLength, wasOptimized, processingInfo } = extractionResult;

        const { count, type, difficulty } = generateSchema
            .pick({ count: true, type: true, difficulty: true })
            .parse(req.body);

        const jobData = {
            deckId,
            textContent,
            count,
            type,
            difficulty,
            fileInfo: {
                ...processingInfo,
                originalLength,
                wasOptimized,
                category: SUPPORTED_MIME_TYPES[req.file.mimetype].category
            }
        };

        if (isRedisConnected) {
            await flashcardGenerationQueue.add('generate-file', jobData);
            
            const responseMessage = wasOptimized 
                ? `Arquivo processado! Texto otimizado de ${originalLength} para ${textContent.length} caracteres.`
                : 'Arquivo processado com sucesso!';

            res.status(202).json({ 
                processing: true, 
                message: responseMessage,
                fileInfo: jobData.fileInfo,
            });
        } else {
            const savedFlashcards = await processGenerationAndSave(jobData);
            res.status(201).json({ 
                message: 'Flashcards gerados com sucesso!', 
                flashcards: savedFlashcards,
                fileInfo: jobData.fileInfo,
            });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        console.error('ERRO COMPLETO na generateCardsFromFile:', error);
        logger.error(`Erro na geração via arquivo: ${error.message}`);
        res.status(500).json({ 
            message: error.message || 'Erro ao gerar flashcards do arquivo.', 
            code: 'GENERATION_ERROR' 
        });
    }
};

const generateCardsFromYouTube = async (req, res) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;

    try {
        const { youtubeUrl, count, type, difficulty } = generateSchema.omit({ textContent: true })
            .extend({ youtubeUrl: z.string().url() })
            .parse(req.body);

        const { data: deck, error: deckError } = await supabase
            .from('decks').select('id').eq('id', deckId).eq('user_id', userId).single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        // Usar o serviço de YouTube para extrair transcrição
        let transcriptData;
        try {
            transcriptData = await getYouTubeTranscript(youtubeUrl);
        } catch (error) {
            logger.warn(`Erro ao extrair transcrição: ${error.message}`);
            return res.status(400).json({
                message: error.message || 'Não foi possível obter a transcrição do vídeo.',
                code: 'YOUTUBE_TRANSCRIPT_ERROR'
            });
        }

        const transcript = transcriptData.text;

        if (!transcript || transcript.trim().length < 30) {
            return res.status(400).json({
                message: 'Transcrição muito curta para gerar flashcards. O vídeo deve ter pelo menos 30 caracteres de conteúdo.',
                code: 'INSUFFICIENT_TRANSCRIPT_CONTENT'
            });
        }

        const jobData = {
            deckId,
            textContent: transcript,
            count,
            type,
            difficulty,
            source: 'youtube',
            sourceUrl: youtubeUrl,
            videoId: transcriptData.videoId
        };

        if (isRedisConnected) {
            await flashcardGenerationQueue.add('generate-youtube', jobData);
            res.status(202).json({
                processing: true,
                message: 'Transcrição obtida! Gerando flashcards...',
                videoId: transcriptData.videoId
            });
        } else {
            const savedFlashcards = await processGenerationAndSave(jobData);
            res.status(201).json({
                message: 'Flashcards gerados com sucesso!',
                flashcards: savedFlashcards,
                videoId: transcriptData.videoId
            });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message, code: 'VALIDATION_ERROR' });
        }
        logger.error(`Erro ao gerar flashcards do YouTube: ${error.message}`);
        res.status(500).json({
            message: 'Erro ao gerar flashcards do YouTube. Verifique se o vídeo possui legendas.',
            code: 'GENERATION_ERROR'
        });
    }
};

const getReviewCardsForDeck = async (req, res) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;
    const today = new Date().toISOString();

    try {
        const { data: deck, error: deckError } = await supabase
            .from('decks').select('id').eq('id', deckId).eq('user_id', userId).single();

        if (deckError || !deck) {
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('deck_id', deckId)
            .or(`due_date.lte.${today},due_date.is.null`)
            .limit(20); 

        if (error) throw error;
        res.status(200).json(data);

    } catch (error) {
        logger.error(`Error fetching review cards: ${error.message}`);
        res.status(500).json({ message: 'Erro ao buscar flashcards.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

const publishDeck = async (req, res) => {
    const { id: deckId } = req.params;
    const userId = req.user.id;
    const { is_shared } = req.body;

    logger.info(`[PUBLISH DECK] Iniciando publicação - deckId: ${deckId}, userId: ${userId}, is_shared: ${is_shared}`);

    if (typeof is_shared !== 'boolean') {
        logger.warn(`[PUBLISH DECK] Valor is_shared inválido: ${is_shared}`);
        return res.status(400).json({ message: 'O valor de is_shared é inválido.', code: 'VALIDATION_ERROR' });
    }

    try {
        const { data: deckExists, error: existsError } = await supabase
            .from('decks')
            .select('id, user_id, is_shared, title')
            .eq('id', deckId)
            .single();

        if (existsError) {
            logger.error(`[PUBLISH DECK] Erro ao verificar existência do deck ${deckId}: ${existsError.message}`);
        }

        if (!deckExists) {
            logger.warn(`[PUBLISH DECK] Deck ${deckId} não existe na base de dados`);
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

        logger.info(`[PUBLISH DECK] Deck encontrado - ID: ${deckExists.id}, Owner: ${deckExists.user_id}, Current is_shared: ${deckExists.is_shared}, Title: ${deckExists.title}`);

        if (deckExists.user_id !== userId) {
            logger.warn(`[PUBLISH DECK] Tentativa de acesso negada - userId: ${userId} não é proprietário do deck ${deckId} (proprietário: ${deckExists.user_id})`);
            return res.status(403).json({ message: 'Você não tem permissão para modificar este baralho.', code: 'FORBIDDEN' });
        }

        const { data: deck, error: deckError } = await supabase
            .from('decks').select('id').eq('id', deckId).eq('user_id', userId).single();

        if (deckError || !deck) {
            logger.error(`[PUBLISH DECK] Erro na verificação de propriedade - deckError: ${deckError?.message}, deck: ${deck}`);
            return res.status(404).json({ message: 'Baralho não encontrado.', code: 'NOT_FOUND' });
        }

    
        const updateData = { is_shared: is_shared };
        if (is_shared) {
            updateData.published_at = new Date().toISOString();
            logger.info(`[PUBLISH DECK] Definindo published_at para deck ${deckId}: ${updateData.published_at}`);
        } else {
            logger.info(`[PUBLISH DECK] Despublicando deck ${deckId} - mantendo published_at para histórico`);
        }

        const { data: updatedDeck, error: updateError } = await supabase
            .from('decks')
            .update(updateData)
            .eq('id', deckId)
            .eq('user_id', userId)
            .select('id, is_shared, published_at')
            .single();

        if (updateError) {
            logger.error(`[PUBLISH DECK] Erro ao atualizar deck ${deckId}: ${updateError.message}`);
            throw updateError;
        }

        logger.info(`[PUBLISH DECK] Deck ${deckId} atualizado com sucesso - is_shared: ${updatedDeck.is_shared}`);

        const message = is_shared ? 'Baralho publicado com sucesso!' : 'Baralho tornado privado com sucesso!';
        res.status(200).json({ message, deck: updatedDeck });

    } catch (error) {
        logger.error(`[PUBLISH DECK] Error updating publish status for deck ${deckId}: ${error.message}`);
        res.status(500).json({ message: 'Erro ao atualizar o status do baralho.', code: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = {
    getDecks,
    createDeck,
    updateDeck,
    deleteDeck,
    generateCardsForDeck,
    generateCardsFromFile,
    generateCardsFromYouTube,
    getReviewCardsForDeck,
    publishDeck 
};