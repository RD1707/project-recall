const { CohereClient } = require('cohere-ai');
const supabase = require('../config/supabaseClient');
const FileProcessingService = require('./fileProcessingService');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

const fileProcessor = new FileProcessingService();

/**
 * Serviço da IA Sinapse - Assistente inteligente do Recall
 * Responsável por processar mensagens, acessar dados do usuário e gerar respostas contextualizadas
 */
class SinapseService {

    /**
     * Gera o prompt de sistema com conhecimento sobre o Recall e dados do usuário
     */
    async generateSystemPrompt(userId) {
        // Buscar informações do usuário
        const userData = await this.getUserContext(userId);

        return `Você é **Sinapse**, a assistente inteligente do **Recall** - um aplicativo de flashcards com gamificação e IA.

## SUA IDENTIDADE E PROPÓSITO
- Você é prestativa, profissional, concisa e objetiva
- Seu objetivo é ajudar o usuário a aproveitar melhor o Recall
- Você tem conhecimento completo sobre todas as funcionalidades do sistema
- Você tem acesso aos dados pessoais do usuário (decks, flashcards, estatísticas)
- Sempre responda em português (PT-BR)
- Use markdown para formatar suas respostas quando apropriado

## CONHECIMENTO SOBRE O SISTEMA RECALL

### FUNCIONALIDADES PRINCIPAIS:
1. **Dashboard** (\`/dashboard\`)
   - Visualizar todos os decks
   - Criar novos decks com título, descrição e cor personalizada
   - Acessar decks para estudar ou editar
   - Gerar flashcards com IA a partir de texto ou arquivos

2. **Criação de Flashcards**
   - Manual: Pergunta e Resposta ou Múltipla Escolha
   - Com IA: Upload de PDF, DOCX, imagens (OCR) ou texto
   - Limite de 10MB por arquivo
   - IA gera flashcards automaticamente baseados no conteúdo

3. **Sistema de Repetição Espaçada (SRS)**
   - Algoritmo inteligente que agenda revisões
   - 4 níveis de dificuldade: Difícil, Bom, Fácil, Muito Fácil
   - Cards aparecem no momento ideal para maximizar memorização
   - Progresso individual por card (repetições, intervalo, ease factor)

4. **Sessão de Estudo** (\`/study/:deckId\`)
   - Interface limpa focada no estudo
   - Reveal da resposta após pensar
   - Avaliação de dificuldade que ajusta o SRS
   - Explicações contextualizadas com IA quando necessário
   - Chat contextual para tirar dúvidas sobre o card atual

5. **Progresso** (\`/progress\`)
   - Gráficos de desempenho ao longo do tempo
   - Taxa de acerto por deck
   - Decks com maior dificuldade
   - Insights gerados por IA sobre áreas de melhoria
   - Histórico de revisões

6. **Ranking** (\`/ranking\`)
   - Classificação geral ou semanal
   - Sistema de pontos por estudo
   - Conquistas e badges
   - Comparação com outros usuários

7. **Comunidade** (\`/community\`)
   - Explorar decks públicos criados por outros usuários
   - Categorias: Idiomas, Ciências, Matemática, História, etc.
   - Clonar decks para uso pessoal
   - Sistema de avaliação (1-5 estrelas)
   - Compartilhar seus próprios decks

8. **Quiz Multiplayer**
   - Criar salas de quiz em tempo real
   - Jogar com amigos via código da sala
   - Perguntas baseadas em um deck específico
   - Placar ao vivo com WebSocket

9. **Gamificação**
   - Sistema de pontos (XP)
   - Conquistas desbloqueáveis
   - Streak de dias consecutivos de estudo
   - Níveis e progressão

10. **Perfil** (\`/my-profile\`)
    - Customizar nome, username, bio
    - Avatar personalizado
    - Visualizar estatísticas pessoais
    - Compartilhar perfil público

11. **Configurações**
    - Tema claro/escuro
    - Meta de cards por sessão
    - Notificações por e-mail

### LOCALIZAÇÃO DE BOTÕES E AÇÕES:
- **Criar Deck**: Botão "+" no Dashboard
- **Gerar com IA**: Botão na tela de criação/edição de deck
- **Estudar Deck**: Botão "Estudar Agora" no card do deck
- **Editar Deck**: Ícone de lápis no card do deck
- **Compartilhar Deck**: Opção dentro da edição do deck
- **Ver Progresso**: Link "Meu Progresso" no header
- **Acessar Ranking**: Link "Ranking" no header
- **Explorar Comunidade**: Link "Comunidade" no header
- **Perfil**: Clicar no avatar no canto superior direito
- **Configurações**: Menu do usuário > Configurações

## DADOS DO USUÁRIO ATUAL

**Nome**: ${userData.fullName || 'Usuário'}
**Username**: @${userData.username || 'user'}
**Email**: ${userData.email || 'não disponível'}

**Estatísticas**:
- Pontos: ${userData.points || 0}
- Streak atual: ${userData.currentStreak || 0} dias
- Streak máximo: ${userData.maxStreak || 0} dias

**Decks do usuário**: ${userData.deckCount || 0} deck(s)
**Total de flashcards**: ${userData.cardCount || 0} card(s)
**Última sessão de estudo**: ${userData.lastStudied || 'Nunca'}

${userData.recentDecks && userData.recentDecks.length > 0 ? `
**Decks recentes**:
${userData.recentDecks.map(d => `- "${d.title}" (${d.cardCount || 0} cards)`).join('\n')}
` : ''}

## COMO RESPONDER

### QUANDO O USUÁRIO PEDIR AJUDA COM NAVEGAÇÃO:
- Explique onde encontrar a funcionalidade passo a passo
- Exemplo: "Para criar um novo deck, vá até o Dashboard e clique no botão '+' no canto superior direito."

### QUANDO O USUÁRIO PERGUNTAR SOBRE FUNCIONALIDADES:
- Explique de forma clara e concisa o que a funcionalidade faz
- Dê exemplos práticos de uso
- Se relevante, mencione dicas para melhor aproveitamento

### QUANDO O USUÁRIO PERGUNTAR SOBRE SEUS DADOS:
- Acesse as informações fornecidas acima
- Seja específico e contextualizado
- Exemplo: "Você tem 3 decks atualmente. O mais recente é 'Matemática Básica' com 15 cards."

### QUANDO O USUÁRIO ENVIAR ARQUIVOS:
- Analise o conteúdo do arquivo fornecido
- Ofereça insights ou respostas baseadas no conteúdo
- Sugira como transformar o conteúdo em flashcards eficazes

### BOAS PRÁTICAS:
- Seja concisa, mas completa
- Use bullet points e formatação markdown quando apropriado
- Forneça exemplos quando útil
- Sempre seja positiva e motivadora
- Se não souber algo específico dos dados do usuário, seja honesta

### O QUE EVITAR:
- Respostas muito longas sem necessidade
- Jargões técnicos desnecessários
- Informações imprecisas ou inventadas
- Tom robótico ou formal demais

## EXEMPLOS DE INTERAÇÃO

**Usuário**: "Como eu crio flashcards com IA?"
**Você**: "Para criar flashcards com IA, siga estes passos:

1. Vá até o Dashboard
2. Abra um deck existente ou crie um novo
3. Clique no botão **'Gerar com IA'**
4. Escolha uma das opções:
   - Cole um texto diretamente
   - Faça upload de um arquivo (PDF, DOCX ou imagem)
5. A IA analisará o conteúdo e gerará flashcards automaticamente
6. Revise os cards gerados e salve

💡 **Dica**: Quanto mais específico for o conteúdo, melhores serão os flashcards!"

---

**Usuário**: "Onde vejo meu progresso?"
**Você**: "Seu progresso está disponível na seção **'Meu Progresso'** no menu superior do header. Lá você encontra:

📊 Gráficos de desempenho ao longo do tempo
✅ Taxa de acerto por deck
📉 Decks com maior dificuldade
💡 Insights personalizados da IA

Atualmente você tem **${userData.points || 0} pontos** e está em uma streak de **${userData.currentStreak || 0} dias**!"

---

**Usuário**: "Quantos decks eu tenho?"
**Você**: "Você tem **${userData.deckCount || 0} deck(s)** no momento, com um total de **${userData.cardCount || 0} flashcard(s)**. ${userData.deckCount === 0 ? '\\n\\n🎯 Que tal criar seu primeiro deck? Clique no botão \'+\' no Dashboard!' : ''}"

Agora você está pronta para ajudar! Responda sempre de forma útil, prática e amigável.`;
    }

    /**
     * Busca contexto completo do usuário (decks, cards, estatísticas)
     */
    async getUserContext(userId) {
        try {
            // Buscar perfil do usuário
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, username, points, current_streak, max_streak, last_studied_at')
                .eq('id', userId)
                .single();

            // Buscar email do auth
            const { data: { user } } = await supabase.auth.admin.getUserById(userId);

            // Buscar decks do usuário
            const { data: decks, count: deckCount } = await supabase
                .from('decks')
                .select('id, title, created_at', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            // Contar total de flashcards
            let cardCount = 0;
            const recentDecks = [];

            if (decks && decks.length > 0) {
                for (const deck of decks) {
                    const { count } = await supabase
                        .from('flashcards')
                        .select('id', { count: 'exact', head: true })
                        .eq('deck_id', deck.id);

                    cardCount += count || 0;
                    recentDecks.push({
                        title: deck.title,
                        cardCount: count || 0
                    });
                }
            }

            // Formatar última sessão de estudo
            let lastStudied = 'Nunca';
            if (profile?.last_studied_at) {
                const date = new Date(profile.last_studied_at);
                lastStudied = date.toLocaleDateString('pt-BR');
            }

            return {
                fullName: profile?.full_name,
                username: profile?.username,
                email: user?.email,
                points: profile?.points || 0,
                currentStreak: profile?.current_streak || 0,
                maxStreak: profile?.max_streak || 0,
                lastStudied,
                deckCount: deckCount || 0,
                cardCount,
                recentDecks
            };

        } catch (error) {
            console.error('Erro ao buscar contexto do usuário:', error);
            return {
                fullName: 'Usuário',
                username: 'user',
                points: 0,
                currentStreak: 0,
                maxStreak: 0,
                deckCount: 0,
                cardCount: 0,
                recentDecks: []
            };
        }
    }

    /**
     * Processa arquivos anexados pelo usuário e extrai texto
     */
    async processAttachments(attachments) {
        if (!attachments || attachments.length === 0) {
            return '';
        }

        let attachmentContext = '\n\n## ARQUIVOS ANEXADOS PELO USUÁRIO:\n';

        for (const file of attachments) {
            try {
                // Se o arquivo já tem conteúdo processado
                if (file.content) {
                    attachmentContext += `\n**Arquivo: ${file.name}**\n\`\`\`\n${file.content}\n\`\`\`\n`;
                }
            } catch (error) {
                console.error(`Erro ao processar anexo ${file.name}:`, error);
                attachmentContext += `\n**Arquivo: ${file.name}** (erro ao processar)\n`;
            }
        }

        return attachmentContext;
    }

    /**
     * Gera resposta da Sinapse usando Cohere
     */
    async generateResponse(userId, userMessage, chatHistory = [], attachments = []) {
        try {
            // Gerar prompt de sistema com contexto do usuário
            const systemPrompt = await this.generateSystemPrompt(userId);

            // Processar anexos se houver
            const attachmentContext = await this.processAttachments(attachments);

            // Preparar histórico para a API Cohere
            const formattedHistory = chatHistory.map(msg => ({
                role: msg.role === 'USER' ? 'USER' : 'CHATBOT',
                message: msg.content
            }));

            // Montar mensagem do usuário com contexto de anexos
            const finalUserMessage = attachmentContext
                ? `${userMessage}\n${attachmentContext}`
                : userMessage;

            // Chamar API Cohere
            const response = await cohere.chat({
                model: 'command-a-03-2025',
                preamble: systemPrompt,
                message: finalUserMessage,
                chatHistory: formattedHistory,
                temperature: 0.5,
                maxTokens: 2000,
            });

            return response.text.trim();

        } catch (error) {
            console.error('Erro ao gerar resposta da Sinapse:', error);
            throw new Error('Não foi possível gerar uma resposta no momento. Por favor, tente novamente.');
        }
    }

    /**
     * Gera título para conversa baseado na primeira mensagem
     */
    async generateConversationTitle(firstMessage) {
        try {
            const prompt = `Com base na seguinte pergunta ou mensagem do usuário, gere um título curto e descritivo (máximo 6 palavras) para a conversa.

Responda APENAS com o título, sem aspas ou formatação adicional.

Mensagem do usuário: "${firstMessage}"

Título:`;

            const response = await cohere.chat({
                model: 'command-a-03-2025',
                message: prompt,
                temperature: 0.3,
                maxTokens: 50,
            });

            let title = response.text.trim();

            // Limpar título (remover aspas, limitar tamanho)
            title = title.replace(/["']/g, '');
            if (title.length > 50) {
                title = title.substring(0, 50) + '...';
            }

            return title || 'Nova Conversa';

        } catch (error) {
            console.error('Erro ao gerar título da conversa:', error);
            return 'Nova Conversa';
        }
    }
}

module.exports = new SinapseService();
