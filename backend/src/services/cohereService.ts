import { CohereClient } from 'cohere-ai';
import { ChatMessage } from 'cohere-ai/api';
import { EnvironmentConfig } from '../config/environment';
import logger from '../config/logger';

const getApiKey = (): string => {
    const config = EnvironmentConfig.getAIConfig();
    if (!config.cohereApiKey) {
        throw new Error('Cohere API key is not configured');
    }
    return config.cohereApiKey;
};

const cohere = new CohereClient({
    token: getApiKey(),
});

const extractJsonFromResponse = (responseText: string): string => {
    logger.debug('Resposta original da API Cohere:', { responseText });

    let cleaned = responseText.trim();

    cleaned = cleaned.replace(/^```(?:json)?\s*/gm, '');
    cleaned = cleaned.replace(/```\s*$/gm, '');

    const jsonStart = Math.min(
        cleaned.indexOf('[') >= 0 ? cleaned.indexOf('[') : Infinity,
        cleaned.indexOf('{') >= 0 ? cleaned.indexOf('{') : Infinity
    );

    if (jsonStart !== Infinity) {
        cleaned = cleaned.substring(jsonStart);
    }

    let jsonEnd = -1;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (escapeNext) {
            escapeNext = false;
            continue;
        }

        if (char === '\\') {
            escapeNext = true;
            continue;
        }

        if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === '[' || char === '{') {
                bracketCount++;
            } else if (char === ']' || char === '}') {
                bracketCount--;
                if (bracketCount === 0) {
                    jsonEnd = i + 1;
                    break;
                }
            }
        }
    }

    if (jsonEnd > 0) {
        cleaned = cleaned.substring(0, jsonEnd);
    }

    logger.debug('Resposta após limpeza:', { cleaned });
    return cleaned;
};

interface FlashcardData {
    question: string;
    answer: string;
    options?: string[];
}

export const generateFlashcardsFromText = async (textContent: string, count = 5, type = 'Pergunta e Resposta'): Promise<FlashcardData[]> => {

    let promptInstruction = '';

    if (type === 'Múltipla Escolha') {
        promptInstruction = `Cada flashcard deve ser um objeto JSON com as chaves "question" (string), "options" (um array de 4 strings com as alternativas), e "answer" (uma string contendo a resposta correta, que deve ser uma das strings de "options").`;
    } else {
        promptInstruction = `Cada flashcard deve ser um objeto JSON com as chaves "question" (string) e "answer" (string).`;
    }

    const message = `
        Baseado no texto a seguir, gere ${count} flashcards no formato de um array de objetos JSON.
        ${promptInstruction}
        As perguntas devem ser claras e diretas, e as respostas concisas.

        IMPORTANTE: Sua resposta deve conter APENAS o array JSON válido, sem nenhum texto explicativo, comentários ou formatação markdown antes ou depois. Comece diretamente com [ e termine com ].

        Texto: "${textContent}"
    `;

    try {
        const response = await cohere.chat({
            model: 'command-r',
            message: message,
            temperature: 0.3,
        });

        const cleanedResponse = extractJsonFromResponse(response.text);

        const flashcards = JSON.parse(cleanedResponse);

        if (!Array.isArray(flashcards)) {
            throw new Error("A resposta da IA não é um array JSON válido.");
        }

        if (type === 'Múltipla Escolha') {
            for (const card of flashcards) {
                if (!card.question || !Array.isArray(card.options) || card.options.length !== 4 || !card.answer) {
                     throw new Error("Um ou mais flashcards de múltipla escolha gerados pela IA estão com formato inválido.");
                }
            }
        }

        return flashcards;

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Erro detalhado da API Cohere ao gerar flashcards:', { error: errorMessage });
        throw new Error(`Falha ao gerar ou processar flashcards da IA: ${errorMessage}`);
    }
};

export const getExplanationForFlashcard = async (question: string, answer: string): Promise<string | null> => {
    const message = `
        Com base na seguinte pergunta e resposta de um flashcard, explique o conceito principal de forma clara, concisa e didática, como se fosse para um estudante.
        A explicação deve ter no máximo 3 ou 4 frases. Não comece com "A resposta está correta porque..." ou algo semelhante. Vá direto ao ponto.

        Pergunta: "${question}"
        Resposta: "${answer}"

        Explicação:
    `;

    try {
        const response = await cohere.chat({
            model: 'command-r',
            message: message,
            temperature: 0.5,
        });

        return response.text.trim();

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Erro ao gerar explicação da Cohere:', { error: errorMessage });
        return null;
    }
};

export const generateStudyInsight = async (performanceData: { deck_title: string; error_rate: number }[]): Promise<string> => {
    if (!performanceData || performanceData.length === 0) {
        return "Continue a estudar! Ainda não temos dados suficientes para analisar o seu desempenho em detalhe.";
    }

    const topics = performanceData.map(d => `- **${d.deck_title}** (com aproximadamente ${Math.round(d.error_rate)}% de erro)`).join('\n');

    const message = `
        Aja como um tutor de estudos amigável e motivador. Com base nos seguintes dados de desempenho de um utilizador, onde ele está a ter mais dificuldade, gere um insight construtivo e uma sugestão de estudo.
        O texto deve ser curto (2-3 parágrafos), encorajador e prático. Não use jargões.

        Dados de desempenho:
        O utilizador está a errar mais nos seguintes tópicos:
        ${topics}

        Insight Gerado:
    `;

    try {
        const response = await cohere.chat({
            model: 'command-r',
            message: message,
            temperature: 0.6,
        });
        return response.text.trim();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Erro ao gerar insight da Cohere:', { error: errorMessage });
        return 'Não foi possível gerar um insight neste momento. Continue com o bom trabalho!';
    }
};

export const getChatResponse = async (question: string, answer: string, chatHistory: ChatMessage[]): Promise<string | null> => {
    const preamble = `
        Você é um tutor de IA amigável e prestativo chamado Recall. Sua função é ajudar um aluno a entender melhor um tópico específico de um flashcard.
        O contexto do estudo atual é:
        - Pergunta do Flashcard: "${question}"
        - Resposta do Flashcard: "${answer}"

        Responda às perguntas do aluno de forma clara, concisa e didática, mantendo-se sempre dentro do contexto do flashcard. Não desvie do assunto.
    `;

    const userMessage = chatHistory[chatHistory.length - 1];
    const historyForApi = chatHistory.slice(0, chatHistory.length - 1);

    try {
        const response = await cohere.chat({
            model: 'command-r',
            preamble: preamble,
            chatHistory: historyForApi,
            message: userMessage.message,
            temperature: 0.5,
        });

        return response.text.trim();

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error('Erro ao gerar resposta do chat da Cohere:', { error: errorMessage });
        return null;
    }
};