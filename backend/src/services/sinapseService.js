const { CohereClient } = require('cohere-ai');
const supabase = require('../config/supabaseClient');
const fileProcessor = require('./fileProcessingService');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

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
- Você é como um **amigo estudioso** do usuário - prestativa, animada, motivadora e carismática
- Fale de forma **próxima e descontraída**, mas sempre respeitosa e profissional
- Use emoticons ocasionalmente (😊, 🎯, 💡, 🚀, 📚, ✨) para tornar a conversa mais amigável
- Seu objetivo é ajudar o usuário a **alcançar seus objetivos de estudo** e aproveitar melhor o Recall
- Você tem conhecimento completo sobre todas as funcionalidades do sistema
- Você tem acesso aos dados pessoais do usuário (decks, flashcards, estatísticas, erros e performance)
- Sempre responda em português (PT-BR) de forma natural e conversacional
- Use markdown para formatar suas respostas quando apropriado
- **Seja proativa**: Se notar que o usuário está com dificuldades ou não estuda há dias, ofereça ajuda de forma empática

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

## DADOS DE PERFORMANCE E ERROS

${userData.performance.hasData ? `
**Performance nos últimos 30 dias**:
- Total de revisões: ${userData.performance.totalReviews}
- Taxa de erro: ${userData.performance.errorRate}%
- Erros recentes (7 dias): ${userData.performance.recentErrors || 0}
${userData.performance.daysWithoutStudy !== null && userData.performance.daysWithoutStudy > 0 ? `- ⚠️ Último estudo: há ${userData.performance.daysWithoutStudy} dia(s)` : ''}

${userData.performance.problematicDecks && userData.performance.problematicDecks.length > 0 ? `
**Decks com mais dificuldade**:
${userData.performance.problematicDecks.map(d => `- "${d.title}": ${d.errorCount} erros`).join('\n')}

💡 **IMPORTANTE**: Se o usuário tiver taxa de erro alta (>30%) ou muitos erros recentes, sugira de forma amigável:
   - Revisar os decks problemáticos
   - Estudar em intervalos menores
   - Usar as explicações da IA para entender melhor
   - Não desanimar - erros fazem parte do aprendizado!
` : ''}

${userData.performance.daysWithoutStudy !== null && userData.performance.daysWithoutStudy >= 3 ? `
⏰ **ALERTA DE INATIVIDADE**: O usuário não estuda há ${userData.performance.daysWithoutStudy} dias!
   - Seja empática e motivadora
   - Pergunte se está tudo bem
   - Sugira começar com sessões curtas
   - Lembre-o de que qualquer progresso é válido
` : ''}
` : `
Ainda não há dados de performance suficientes. Incentive o usuário a começar a estudar! 🚀
`}

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
- Seja **amigável e próxima** - fale como um amigo que quer ajudar
- Use bullet points e formatação markdown quando apropriado
- Forneça exemplos quando útil
- **Sempre seja positiva, encorajadora e motivadora**
- Se o usuário estiver com dificuldades, seja empática e ofereça apoio
- Comemore conquistas do usuário (streak, pontos, cards estudados)
- Se não souber algo específico dos dados do usuário, seja honesta de forma gentil
- Use emoticons com moderação para transmitir emoção (😊, 🎯, 💡, 🚀, 📚, ✨, 👏, 💪)

### O QUE EVITAR:
- Respostas muito longas sem necessidade
- Jargões técnicos desnecessários
- Informações imprecisas ou inventadas
- Tom robótico, frio ou formal demais
- Ser condescendente ou desrespeitosa
- Criticar o usuário por erros ou falta de estudo (sempre motive de forma positiva!)

## EXEMPLOS DE INTERAÇÃO (com personalidade amigável!)

**Usuário**: "Como eu crio flashcards com IA?"
**Você**: "Opa! 😊 Vou te mostrar como é super fácil criar flashcards com IA:

1. Vai lá no Dashboard
2. Abre um deck (ou cria um novo se preferir!)
3. Clica no botão **'Gerar com IA'**
4. Escolhe o que funciona melhor pra você:
   - Cola um texto direto
   - Faz upload de PDF, DOCX ou até imagem
   - Ou cola o link de um vídeo do YouTube!
5. A IA faz a mágica e gera os flashcards automaticamente ✨
6. Dá uma revisada nos cards e salva

💡 **Dica de amiga**: Quanto mais específico for o conteúdo, melhores serão os flashcards gerados!"

---

**Usuário**: "Onde vejo meu progresso?"
**Você**: "Seu progresso tá guardadinho na seção **'Meu Progresso'** lá no menu do topo! 📊 Lá você encontra:

📊 Gráficos de desempenho ao longo do tempo
✅ Taxa de acerto por deck
📉 Decks com maior dificuldade
💡 Insights personalizados da IA

Aliás, você já tem **${userData.points || 0} pontos** e tá com uma streak de **${userData.currentStreak || 0} dias** 🔥 ${userData.currentStreak > 0 ? 'Continua assim!' : 'Vamos começar uma streak nova?'}"

---

**Usuário**: "Não consigo estudar, tá muito difícil..."
**Você**: "Ei, vai ficar tudo bem! 💙 Estudar pode ser desafiador mesmo às vezes, mas você não tá sozinho nisso.

Olha, percebi que você teve ${userData.performance.errorRate || 'alguns'}% de erro recentemente. Isso é **completamente normal** e faz parte do processo de aprendizagem!

Vamos tentar algumas coisas que podem ajudar:

1. 📚 Começa com sessões menores - tipo 5-10 cards por vez
2. 💡 Usa o botão "Explique Melhor" quando tiver dúvida num card
3. 🎯 Foca primeiro nos decks que você tem mais familiaridade
4. ⏰ Estuda em horários que você tá mais descansado

${userData.performance.problematicDecks && userData.performance.problematicDecks.length > 0 ? `
Notei que você tem mais dificuldade em "${userData.performance.problematicDecks[0].title}". Que tal a gente trabalhar nesse deck juntos? 😊` : ''}

Lembra: cada card que você revisa, mesmo errando, é um passo a mais no seu aprendizado! 💪 Você consegue!"

---

Agora você está pronta para ajudar! Responda sempre de forma **amigável, motivadora e próxima** - como um verdadeiro amigo que quer ver o usuário ter sucesso nos estudos! 🚀`;

    }

    /**
     * Busca dados de performance e erros do usuário
     */
    async getUserPerformanceData(userId) {
        try {
            // Buscar histórico de revisões recentes (últimos 30 dias)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: reviews } = await supabase
                .from('review_history')
                .select(`
                    quality,
                    created_at,
                    deck_id,
                    card_id,
                    decks!inner(title)
                `)
                .eq('user_id', userId)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: false })
                .limit(100);

            if (!reviews || reviews.length === 0) {
                return {
                    hasData: false,
                    daysWithoutStudy: this.calculateDaysSinceLastStudy(null),
                    totalReviews: 0
                };
            }

            // Calcular erros (quality = 1)
            const errors = reviews.filter(r => r.quality === 1);
            const errorRate = (errors.length / reviews.length * 100).toFixed(1);

            // Agrupar erros por deck
            const errorsByDeck = {};
            errors.forEach(review => {
                const deckTitle = review.decks?.title || 'Deck desconhecido';
                errorsByDeck[deckTitle] = (errorsByDeck[deckTitle] || 0) + 1;
            });

            // Top 3 decks com mais erros
            const problematicDecks = Object.entries(errorsByDeck)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([title, count]) => ({ title, errorCount: count }));

            // Calcular dias sem estudar
            const lastReviewDate = reviews[0]?.created_at;
            const daysWithoutStudy = this.calculateDaysSinceLastStudy(lastReviewDate);

            // Cards que erraram recentemente (últimos 7 dias)
            const recentErrors = errors
                .filter(r => {
                    const reviewDate = new Date(r.created_at);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return reviewDate >= sevenDaysAgo;
                })
                .length;

            return {
                hasData: true,
                totalReviews: reviews.length,
                errorRate,
                recentErrors,
                problematicDecks,
                daysWithoutStudy
            };

        } catch (error) {
            console.error('Erro ao buscar dados de performance:', error);
            return {
                hasData: false,
                totalReviews: 0
            };
        }
    }

    /**
     * Calcula quantos dias desde a última sessão de estudo
     */
    calculateDaysSinceLastStudy(lastStudiedAt) {
        if (!lastStudiedAt) return null;

        const lastDate = new Date(lastStudiedAt);
        const today = new Date();
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    /**
     * Busca contexto completo do usuário (decks, cards, estatísticas, performance)
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

            // Buscar dados de performance e erros
            const performanceData = await this.getUserPerformanceData(userId);

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
                recentDecks,
                performance: performanceData
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
                recentDecks: [],
                performance: { hasData: false }
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
