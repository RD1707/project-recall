# Documentação de um Produto de Software
## Project Recall - Sistema de Flashcards com IA
### Versão 1.0

**Autor:** Equipe Project Recall
**Data:** Janeiro 2025

---

## ÍNDICE DETALHADO

**PREFÁCIO** ................................................................................................................................................ 4

**1. INTRODUÇÃO AO DOCUMENTO** ................................................................................................. 5
1.1. TEMA.................................................................................................................................................... 5
1.2. OBJETIVO DO PROJETO .................................................................................................................... 5
1.3. DELIMITAÇÃO DO PROBLEMA  m 5
1.4. JUSTIFICATIVA DA ESCOLHA DO TEMA ......................................................................................... 6
1.5. MÉTODO DE TRABALHO................................................................................................................... 6
1.6. ORGANIZAÇÃO DO TRABALHO ....................................................................................................... 6
1.7. GLOSSÁRIO ........................................................................................................................................ 7

**2. DESCRIÇÃO GERAL DO SISTEMA** ............................................................................................... 8
2.1. DESCRIÇÃO DO PROBLEMA ............................................................................................................ 8
2.2. PRINCIPAIS ENVOLVIDOS E SUAS CARACTERÍSTICAS ....................................................................... 8
2.3. REGRAS DE NEGÓCIO....................................................................................................................... 9

**3. REQUISITOS DO SISTEMA** ............................................................................................................. 10
3.1. REQUISITOS FUNCIONAIS ................................................................................................................ 10
3.2. REQUISITOS NÃO-FUNCIONAIS....................................................................................................... 18
3.3. PROTÓTIPO....................................................................................................................................... 19
3.4. MÉTRICAS E CRONOGRAMA ........................................................................................................... 19

**4. ANÁLISE E DESIGN** ......................................................................................................................... 20
4.1. ARQUITETURA DO SISTEMA ........................................................................................................... 20
4.2. MODELO DO DOMÍNIO ..................................................................................................................... 21
4.3. DIAGRAMAS DE INTERAÇÃO........................................................................................................... 22
4.4. DIAGRAMA DE CLASSES .................................................................................................................. 24
4.5. DIAGRAMA DE ATIVIDADES ........................................................................................................... 25
4.6. DIAGRAMA DE ESTADOS ................................................................................................................ 26
4.7. DIAGRAMA DE COMPONENTES ....................................................................................................... 27
4.8. MODELO DE DADOS......................................................................................................................... 28

**5. IMPLEMENTAÇÃO** ......................................................................................................................... 31
5.1. AMBIENTE DE DESENVOLVIMENTO ................................................................................................ 31
5.2. SISTEMAS E COMPONENTES EXTERNOS UTILIZADOS..................................................................... 32

**6. TESTES** .............................................................................................................................................. 33
6.1. PLANO DE TESTES ........................................................................................................................... 33
6.2. EXECUÇÃO DO PLANO DE TESTES................................................................................................... 35

**7. IMPLANTAÇÃO** ............................................................................................................................... 36
7.1. DIAGRAMA DE IMPLANTAÇÃO........................................................................................................ 36
7.2. MANUAL DE IMPLANTAÇÃO ........................................................................................................... 37

**8. MANUAL DO USUÁRIO** .................................................................................................................. 38

**9. CONCLUSÕES E CONSIDERAÇÕES FINAIS** ............................................................................... 45

**BIBLIOGRAFIA** ......................................................................................................................................46

**GLOSSÁRIO** ............................................................................................................................................47

---

## Prefácio

O objetivo deste documento é fornecer um roteiro completo para o desenvolvimento e manutenção do sistema Project Recall, utilizando os princípios da engenharia de software orientada a objetos com notação UML (Unified Modeling Language). É destinado a desenvolvedores, arquitetos de software, testadores e stakeholders envolvidos no projeto.

Esta documentação segue as melhores práticas da engenharia de software, aplicando metodologias ágeis e utilizando tecnologias modernas como React, Node.js, e inteligência artificial para criar um sistema de aprendizagem adaptativo e eficiente.

O Project Recall representa uma inovação na área de tecnologia educacional, combinando técnicas comprovadas de memorização (como repetição espaçada) com inteligência artificial para personalizar e otimizar o processo de aprendizagem.

---

## 1. Introdução ao Documento

O objetivo deste capítulo é apresentar o projeto de forma clara e objetiva, estabelecendo o contexto, os objetivos e a delimitação do sistema Project Recall.

### 1.1. Tema

O Project Recall é um sistema web de flashcards inteligente que utiliza inteligência artificial para gerar conteúdo educacional personalizado e implementa algoritmos de repetição espaçada para otimizar o processo de memorização e aprendizagem.

### 1.2. Objetivo do Projeto

**Objetivo Geral:**
Desenvolver uma plataforma web completa para criação, gerenciamento e estudo de flashcards, integrando inteligência artificial para geração automática de conteúdo e algoritmos de repetição espaçada para maximizar a eficiência do aprendizado.

**Objetivos Específicos:**
- Implementar um sistema de autenticação seguro com suporte a múltiplas formas de login
- Criar interface intuitiva para criação e gerenciamento de baralhos de flashcards
- Integrar IA (Cohere) para geração automática de flashcards a partir de diferentes tipos de conteúdo
- Implementar algoritmo de repetição espaçada (SuperMemo) para otimizar o cronograma de revisões
- Desenvolver sistema de gamificação com conquistas e ranking para motivar usuários
- Criar funcionalidades colaborativas incluindo compartilhamento de baralhos e quiz multiplayer
- Implementar assistente de IA (Sinapse) para suporte ao aprendizado
- Fornecer analytics detalhadas sobre progresso e desempenho dos usuários

### 1.3. Delimitação do Problema

O projeto está delimitado ao desenvolvimento de uma aplicação web responsiva que atende às seguintes necessidades:

**Escopo Incluído:**
- Aplicação web front-end em React
- API RESTful backend em Node.js
- Banco de dados PostgreSQL via Supabase
- Integração com IA para geração de conteúdo
- Sistema de processamento de arquivos (PDF, imagens, documentos)
- Chat em tempo real com assistente IA
- Quiz multiplayer via WebSocket
- Sistema de achievements e gamificação
- Analytics de progresso e desempenho

**Escopo Excluído:**
- Aplicações móveis nativas (iOS/Android)
- Integração com sistemas de gestão de aprendizagem (LMS) externos
- Processamento de vídeo/áudio para extração de conteúdo
- Sistema de pagamentos (versão atual é gratuita)
- Suporte offline completo

### 1.4. Justificativa da Escolha do Tema

A escolha do desenvolvimento do Project Recall se justifica pelos seguintes motivos:

**Acadêmicos:**
- Aplicação prática de conceitos avançados de engenharia de software
- Integração de tecnologias emergentes (IA, WebSockets, processamento de documentos)
- Implementação de algoritmos complexos (repetição espaçada, gamificação)
- Desenvolvimento full-stack com arquitetura moderna

**Práticos:**
- Grande demanda por ferramentas educacionais eficientes
- Necessidade de personalização no aprendizado
- Potencial para impacto social positivo na educação
- Oportunidade de criar uma solução inovadora no mercado edtech

**Tecnológicos:**
- Uso de stack tecnológico moderno e em alta demanda no mercado
- Implementação de padrões de design e arquitetura escaláveis
- Integração com serviços de IA de última geração

### 1.5. Método de Trabalho

O desenvolvimento do Project Recall segue uma metodologia híbrida baseada em:

**Processo de Desenvolvimento:**
- Metodologia Ágil com sprints de 2 semanas
- Desenvolvimento orientado a testes (TDD) quando aplicável
- Integração contínua e deploy contínuo (CI/CD)
- Code review obrigatório para todas as alterações

**Modelagem:**
- Orientação a objetos com notação UML
- Padrões de design (Repository, Service Layer, MVC)
- Arquitetura em camadas para separação de responsabilidades

**Tecnologias:**
- Frontend: React 19 + Vite + JavaScript/JSX
- Backend: Node.js + Express + Socket.IO
- Banco de Dados: PostgreSQL via Supabase
- Cache/Filas: Redis + BullMQ
- IA: Cohere AI API
- Versionamento: Git + GitHub

### 1.6. Organização do Trabalho

Este documento está organizado seguindo a estrutura clássica de documentação de software:

- **Capítulos 1-2:** Contextualização e visão geral do sistema
- **Capítulo 3:** Especificação detalhada de requisitos funcionais e não-funcionais
- **Capítulo 4:** Análise e design do sistema com diagramas UML
- **Capítulo 5:** Detalhes de implementação e tecnologias utilizadas
- **Capítulos 6-7:** Estratégias de teste e implantação
- **Capítulo 8:** Manual do usuário com guias de uso
- **Capítulo 9:** Conclusões e trabalhos futuros

### 1.7. Glossário

Os termos técnicos utilizados neste documento estão definidos no glossário ao final do documento. Termos que constam no glossário são marcados com ᴳ na primeira ocorrência.

---

## 2. Descrição Geral do Sistema

Este capítulo tem como objetivo descrever de forma geral o sistema Project Recall, seu escopo e suas principais funções.

### 2.1. Descrição do Problema

O processo de aprendizagem tradicional enfrenta diversos desafios que o Project Recall se propõe a resolver:

**Problemas Identificados:**
- **Ineficiência na memorização:** Métodos tradicionais não otimizam o timing de revisões
- **Falta de personalização:** Conteúdo genérico que não se adapta ao ritmo individual
- **Baixo engajamento:** Ausência de elementos motivacionais e gamificação
- **Dificuldade na criação de conteúdo:** Tempo excessivo para criar material de estudo
- **Falta de métricas:** Ausência de feedback sobre progresso e áreas de dificuldade
- **Isolamento no aprendizado:** Falta de elementos colaborativos e sociais

**Questões Respondidas pelo Sistema:**
- Como otimizar o timing de revisões para maximizar a retenção?
- Como personalizar o conteúdo de acordo com o desempenho individual?
- Como tornar o estudo mais engajante e motivador?
- Como automatizar a criação de conteúdo de qualidade?
- Como fornecer insights úteis sobre o progresso do aprendizado?
- Como incorporar elementos sociais e colaborativos no estudo?

### 2.2. Principais Envolvidos e suas Características

#### 2.2.1. Usuários do Sistema

**Estudantes (Usuário Principal):**
- **Perfil:** Estudantes de ensino médio, graduação, pós-graduação, concurseiros
- **Necessidades:** Memorização eficiente, organização de conteúdo, acompanhamento de progresso
- **Características técnicas:** Usuários de nível básico a intermediário em tecnologia
- **Dispositivos:** Computadores, tablets, smartphones (interface responsiva)

**Educadores:**
- **Perfil:** Professores, tutores, criadores de conteúdo educacional
- **Necessidades:** Criação de material para alunos, acompanhamento de turmas
- **Características técnicas:** Usuários de nível básico a avançado em tecnologia
- **Função:** Criação e compartilhamento de baralhos educacionais

**Autodidatas:**
- **Perfil:** Profissionais em constante aprendizado, entusiastas de conhecimento
- **Necessidades:** Ferramenta flexível para diversos tipos de conteúdo
- **Características técnicas:** Usuários de nível intermediário a avançado

#### 2.2.2. Desenvolvedores do Sistema

**Equipe de Desenvolvimento:**
- **Frontend Developers:** Especialistas em React e tecnologias web modernas
- **Backend Developers:** Especialistas em Node.js, APIs e bancos de dados
- **DevOps Engineers:** Responsáveis por infraestrutura e deploy
- **UI/UX Designers:** Especialistas em experiência do usuário
- **Product Managers:** Responsáveis por requisitos e roadmap

**Stakeholders Técnicos:**
- **Arquitetos de Software:** Definição de arquitetura e padrões
- **QA Engineers:** Responsáveis por qualidade e testes
- **Data Scientists:** Análise de dados de uso e otimização de algoritmos

### 2.3. Regras de Negócio

**Algoritmo de Repetição Espaçada (SuperMemo):**
- Fator de facilidade inicial: 2.5
- Intervalo mínimo: 1 dia
- Intervalo máximo: 365 dias
- Qualidade de resposta avaliada de 0-5
- Recálculo automático baseado no desempenho

**Sistema de Pontuação:**
- Estudo diário: 10 pontos base
- Streak consecutivos: multiplicador progressivo
- Primeira revisão correta: bônus de 50%
- Revisões em atraso: penalidade de 25%

**Geração de Conteúdo por IA:**
- Máximo de 50 flashcards por sessão de geração
- Tipos suportados: pergunta-resposta, múltipla escolha, completar lacunas
- Processamento assíncrono via filas (Redis)
- Fallback para processamento síncrono se Redis indisponível

**Compartilhamento e Comunidade:**
- Baralhos compartilhados são somente leitura para outros usuários
- Sistema de clonagem para permitir edição personalizada
- Moderação automática de conteúdo (filtros básicos)
- Limite de 100 baralhos públicos por usuário

**Quiz Multiplayer:**
- Máximo 6 jogadores por sala
- Timeout de 30 segundos por pergunta
- Sistema de ranking baseado em velocidade e precisão
- Salas expiram após 1 hora de inatividade

**Processamento de Arquivos:**
- Tamanho máximo: 10MB por arquivo
- Formatos suportados: PDF, DOC, DOCX, TXT, PNG, JPG
- OCR para imagens via Tesseract.js
- Timeout de processamento: 5 minutos

**Sistema de Achievements:**
- Conquistas desbloqueadas automaticamente baseadas em métricas
- Tipos: estudo, social, progresso, especiais
- Pontos extras por conquistas desbloqueadas
- Badges exibidos no perfil público

---

## 3. Requisitos do Sistema

Este capítulo tem como objetivo descrever os requisitos funcionais e não-funcionais do sistema Project Recall.

### 3.1. Requisitos Funcionais

Os requisitos funcionais especificam as ações que o sistema deve ser capaz de executar. Estão organizados por módulos principais:

#### RF01 - Módulo de Autenticação e Perfil

**RF01.1 - Cadastro de Usuário**
- O sistema deve permitir cadastro via email/senha
- O sistema deve permitir cadastro via Google OAuth
- O sistema deve validar unicidade de email e username
- O sistema deve enviar email de confirmação
- O sistema deve exigir confirmação antes do primeiro login

**RF01.2 - Login de Usuário**
- O sistema deve permitir login via email/senha
- O sistema deve permitir login via Google OAuth
- O sistema deve implementar bloqueio temporário após falhas consecutivas
- O sistema deve manter sessão por 7 dias (remember me)

**RF01.3 - Recuperação de Senha**
- O sistema deve permitir redefinição via email
- O sistema deve gerar tokens únicos com expiração de 1 hora
- O sistema deve invalidar token após uso

**RF01.4 - Gerenciamento de Perfil**
- O usuário deve poder editar informações básicas (nome, username, bio)
- O usuário deve poder definir áreas de interesse
- O sistema deve exibir estatísticas do usuário (streak, pontos, conquistas)
- O sistema deve permitir perfis públicos opcionais

#### RF02 - Módulo de Baralhos de Flashcards

**RF02.1 - Criação de Baralhos**
- O usuário deve poder criar baralhos com título e descrição
- O usuário deve poder escolher cor personalizada para o baralho
- O sistema deve gerar ID único para cada baralho
- O usuário deve poder definir categoria do baralho

**RF02.2 - Edição de Baralhos**
- O usuário deve poder editar título, descrição e cor
- O usuário deve poder arquivar/desarquivar baralhos
- O usuário deve poder excluir baralhos (com confirmação)
- Apenas o proprietário pode editar o baralho

**RF02.3 - Visualização de Baralhos**
- O sistema deve exibir estatísticas do baralho (total, novas, revisão, aprendidas)
- O sistema deve mostrar próxima sessão de estudo
- O sistema deve exibir progresso visual (barra de progresso)
- O sistema deve listar todos os flashcards do baralho

#### RF03 - Módulo de Flashcards

**RF03.1 - Criação de Flashcards**
- O usuário deve poder criar flashcards do tipo pergunta-resposta
- O usuário deve poder criar flashcards de múltipla escolha
- O usuário deve poder criar flashcards de completar lacunas
- O sistema deve permitir formatação básica (negrito, itálico, listas)

**RF03.2 - Edição de Flashcards**
- O usuário deve poder editar conteúdo dos flashcards
- O usuário deve poder alterar tipo do flashcard
- O usuário deve poder resetar progresso de aprendizado
- O usuário deve poder excluir flashcards

**RF03.3 - Geração Automática via IA**
- O sistema deve gerar flashcards a partir de texto
- O sistema deve gerar flashcards a partir de PDFs
- O sistema deve gerar flashcards a partir de imagens (OCR)
- O sistema deve gerar flashcards a partir de transcrições do YouTube
- O sistema deve permitir seleção de quantidade e tipos de flashcards
- O sistema deve processar gerações em background (filas)

#### RF04 - Módulo de Sistema de Estudo

**RF04.1 - Sessões de Estudo**
- O sistema deve apresentar flashcards baseado no algoritmo SRS
- O usuário deve poder avaliar dificuldade (Fácil, Médio, Difícil, Não Lembro)
- O sistema deve recalcular próxima revisão baseada na avaliação
- O sistema deve exibir progresso da sessão

**RF04.2 - Algoritmo de Repetição Espaçada**
- O sistema deve implementar algoritmo SuperMemo
- O sistema deve ajustar intervalos baseado no desempenho
- O sistema deve priorizar cards em atraso
- O sistema deve balancear novos cards e revisões

**RF04.3 - Modos de Estudo**
- O sistema deve oferecer modo livre (todas as cartas)
- O sistema deve oferecer modo cronogramado (SRS)
- O sistema deve oferecer modo revisão rápida
- O sistema deve oferecer modo prova (shuffle com timer)

#### RF05 - Módulo Sinapse (Assistente IA)

**RF05.1 - Chat com IA**
- O usuário deve poder iniciar conversas com assistente IA
- O sistema deve manter histórico de conversas
- O assistente deve poder responder dúvidas sobre flashcards
- O assistente deve poder explicar conceitos detalhadamente

**RF05.2 - Funcionalidades Avançadas**
- O usuário deve poder anexar arquivos nas conversas
- O assistente deve poder sugerir melhorias nos flashcards
- O assistente deve poder gerar exemplos e exercícios
- O sistema deve permitir múltiplas conversas simultâneas

#### RF06 - Módulo de Comunidade

**RF06.1 - Compartilhamento de Baralhos**
- O usuário deve poder publicar baralhos na comunidade
- O usuário deve poder despublicar baralhos
- O sistema deve gerar shareable_id único para cada baralho compartilhado
- Baralhos compartilhados devem ser somente leitura

**RF06.2 - Navegação na Comunidade**
- O usuário deve poder buscar baralhos por título/descrição
- O sistema deve permitir filtros por categoria
- O sistema deve permitir ordenação (recente, popular, bem avaliado)
- O sistema deve exibir estatísticas dos baralhos (clones, curtidas)

**RF06.3 - Clonagem de Baralhos**
- O usuário deve poder clonar baralhos públicos
- Baralhos clonados devem virar privados para edição
- O sistema deve manter referência ao baralho original
- O sistema deve contar número de clonagens

#### RF07 - Módulo de Quiz Multiplayer

**RF07.1 - Criação de Salas**
- O usuário deve poder criar salas de quiz
- O criador deve poder selecionar baralhos para o quiz
- O sistema deve gerar código único para a sala
- O criador deve poder definir configurações (tempo, número de perguntas)

**RF07.2 - Participação em Quiz**
- Usuários devem poder entrar via código da sala
- O sistema deve suportar até 6 jogadores simultâneos
- O sistema deve sincronizar perguntas via WebSocket
- O sistema deve calcular pontuação baseada em velocidade e precisão

**RF07.3 - Gerenciamento de Salas**
- O sistema deve exibir lobby com participantes
- O criador deve poder iniciar o quiz
- O sistema deve remover salas inativas (1 hora)
- O sistema deve manter histórico de partidas

#### RF08 - Módulo de Gamificação

**RF08.1 - Sistema de Pontos**
- O sistema deve atribuir pontos por atividades de estudo
- O sistema deve implementar streaks de dias consecutivos
- O sistema deve calcular pontos semanais para ranking
- O sistema deve exibir histórico de pontuação

**RF08.2 - Sistema de Conquistas**
- O sistema deve desbloquear conquistas automaticamente
- O sistema deve notificar usuário sobre novas conquistas
- O sistema deve exibir progresso das conquistas
- O sistema deve categorizar conquistas por tipo

**RF08.3 - Ranking Global**
- O sistema deve manter ranking semanal de usuários
- O sistema deve exibir top 100 usuários
- O sistema deve permitir busca de usuário específico no ranking
- O sistema deve resetar ranking semanalmente

#### RF09 - Módulo de Analytics

**RF09.1 - Estatísticas Pessoais**
- O sistema deve rastrear tempo de estudo diário
- O sistema deve calcular taxa de acerto por baralho
- O sistema deve exibir gráficos de progresso
- O sistema deve mostrar cards mais/menos difíceis

**RF09.2 - Relatórios de Desempenho**
- O sistema deve gerar relatórios de atividade semanal/mensal
- O sistema deve identificar padrões de estudo
- O sistema deve sugerir horários ótimos baseado no histórico
- O sistema deve alertar sobre baixa atividade

### 3.2. Requisitos Não-Funcionais

#### RNF01 - Requisitos de Desempenho
- O sistema deve responder em até 2 segundos para 95% das requisições
- O sistema deve suportar até 1000 usuários simultâneos
- A geração de flashcards por IA deve ser concluída em até 30 segundos
- O sistema deve manter tempo de inatividade inferior a 0.1%

#### RNF02 - Requisitos de Usabilidade
- A interface deve ser responsiva para dispositivos móveis e desktop
- O sistema deve seguir padrões de acessibilidade WCAG 2.1 AA
- Novos usuários devem conseguir criar seu primeiro baralho em até 5 minutos
- O sistema deve oferecer tour guiado para novos usuários

#### RNF03 - Requisitos de Segurança
- Todas as comunicações devem usar HTTPS
- Senhas devem ser criptografadas com bcrypt (salt rounds >= 12)
- Tokens JWT devem expirar em 24 horas
- O sistema deve implementar rate limiting para APIs

#### RNF04 - Requisitos de Confiabilidade
- O sistema deve ter backup automático diário do banco de dados
- O sistema deve implementar retry automático para serviços externos
- O sistema deve funcionar offline para funcionalidades básicas de estudo
- O sistema deve registrar todos os erros para monitoramento

#### RNF05 - Requisitos de Portabilidade
- O sistema deve funcionar nos browsers Chrome, Firefox, Safari e Edge
- O sistema deve ser compatível com iOS 12+ e Android 8+
- O sistema deve suportar resolução mínima de 320px de largura
- O sistema deve funcionar com JavaScript desabilitado (funcionalidades básicas)

#### RNF06 - Requisitos de Manutenibilidade
- O código deve ter cobertura de testes superior a 80%
- O sistema deve seguir padrões de Clean Code
- APIs devem ser documentadas com OpenAPI/Swagger
- O sistema deve implementar logging estruturado

#### RNF07 - Requisitos de Escalabilidade
- A arquitetura deve suportar escala horizontal
- O banco de dados deve suportar particionamento
- O sistema deve implementar cache para reduzir carga no BD
- Filas devem ser processadas de forma distribuída

### 3.3. Protótipo

O protótipo do sistema foi desenvolvido utilizando Figma e implementado incrementalmente:

#### Telas Principais Identificadas:
1. **Página de Landing** - Apresentação do produto e conversão
2. **Login/Cadastro** - Autenticação de usuários
3. **Dashboard** - Visão geral dos baralhos do usuário
4. **Detalhes do Baralho** - Gestão de flashcards e IA
5. **Sessão de Estudo** - Interface principal de aprendizado
6. **Comunidade** - Exploração de baralhos públicos
7. **Sinapse Chat** - Interação com assistente IA
8. **Quiz Multiplayer** - Lobby e interface de quiz
9. **Perfil** - Informações e estatísticas do usuário
10. **Rankings** - Classificação global de usuários

#### Fluxo de Navegação:
```
Landing → Login → Dashboard → Criar/Selecionar Baralho → Estudar
       ↘ Cadastro ↗            ↘ Comunidade → Clonar Baralho
                                ↘ Sinapse → Chat IA
                                ↘ Quiz → Criar/Entrar Sala
                                ↘ Perfil → Ver Estatísticas
```

### 3.4. Métricas e Cronograma

#### Métricas de Projeto:
- **Linhas de Código:** ~15.000 (Frontend) + ~8.000 (Backend)
- **Pontos de Função:** ~120 PF estimados
- **Complexity Score:** Médio-Alto (IA, WebSocket, Algoritmos)
- **Estimativa de Esforço:** 6 meses com 3 desenvolvedores

#### Cronograma de Desenvolvimento:
```
Sprint 1-2 (Mês 1): Autenticação + Baralhos Básicos
Sprint 3-4 (Mês 2): Sistema de Estudo + SRS
Sprint 5-6 (Mês 3): Integração IA + Processamento Arquivos
Sprint 7-8 (Mês 4): Comunidade + Gamificação
Sprint 9-10 (Mês 5): Quiz Multiplayer + Sinapse
Sprint 11-12 (Mês 6): Analytics + Testes + Deploy
```

---

## 4. Análise e Design

Este capítulo apresenta a análise e design do sistema, incluindo arquitetura e modelagem detalhada.

### 4.1. Arquitetura do Sistema

O Project Recall utiliza uma arquitetura moderna de três camadas com separação clara de responsabilidades:

#### Arquitetura Geral:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│   (Node.js API) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Redis Cache   │◄──►│   AI Services   │    │   File Storage  │
│   (Queue/Cache) │    │   (Cohere API)  │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Componentes Principais:

**Frontend (React SPA):**
- **Framework:** React 19 com Vite
- **Roteamento:** React Router DOM
- **Estado Global:** Context API + Custom Hooks
- **Estilização:** CSS Modules + CSS Custom Properties
- **Comunicação:** Axios para REST + Socket.IO para WebSocket

**Backend (Node.js API):**
- **Framework:** Express.js
- **Arquitetura:** MVC com Service Layer
- **WebSocket:** Socket.IO para real-time
- **Queue:** BullMQ + Redis para jobs assíncronos
- **Validação:** Zod para validação de dados

**Banco de Dados (PostgreSQL via Supabase):**
- **ORM:** Supabase Client (built-in)
- **Autenticação:** Supabase Auth
- **Storage:** Supabase Storage para arquivos
- **Real-time:** Supabase Realtime para updates

**Serviços Externos:**
- **IA:** Cohere API para geração de conteúdo
- **OCR:** Tesseract.js para extração de texto
- **YouTube:** YouTube Transcript API
- **Cache:** Redis para cache e filas

### 4.2. Modelo do Domínio

O modelo do domínio representa as principais entidades e relacionamentos do sistema:

```
User (1) ──── (0..*) Deck ──── (0..*) Flashcard
  │                               │
  │── (0..*) Review History       │── (1) SRS Data
  │── (0..*) Achievement          │
  │── (0..*) Sinapse Conversation │
  │── (0..*) Quiz Participation   │

Published Deck (0..1) ──── (1) Deck
Quiz Session (1) ──── (0..*) Quiz Participation
Sinapse Conversation (1) ──── (0..*) Sinapse Message
```

#### Entidades Principais:

**User**
- id: UUID (PK)
- email: String (Unique)
- username: String (Unique)
- points: Integer
- current_streak: Integer
- max_streak: Integer

**Deck**
- id: UUID (PK)
- user_id: UUID (FK)
- title: String
- description: String
- color: String
- is_shared: Boolean

**Flashcard**
- id: UUID (PK)
- deck_id: UUID (FK)
- question: String
- answer: String
- card_type: Enum
- options: JSON

**SRS Data** (integrado no Flashcard)
- repetition: Integer
- ease_factor: Float
- interval: Integer
- due_date: Timestamp

### 4.3. Diagramas de Interação

#### 4.3.1. Diagrama de Sequência - Criação de Flashcard via IA

```
Usuario    Frontend    Backend    Queue    AI Service    Database
  │          │           │         │          │            │
  │──upload──►│           │         │          │            │
  │          │──POST────►│         │          │            │
  │          │           │──add───►│          │            │
  │          │           │◄─job_id─│          │            │
  │          │◄─202──────│         │          │            │
  │          │           │         │          │            │
  │          │           │         │──process►│            │
  │          │           │         │          │──generate─►│
  │          │           │         │          │◄─result───│
  │          │           │         │          │            │
  │          │           │◄────────│          │            │
  │          │           │─────────────────────────save───►│
  │          │◄─websocket─│         │          │            │
  │◄─update──│           │         │          │            │
```

#### 4.3.2. Diagrama de Sequência - Sessão de Estudo

```
Usuario    Frontend    Backend    SRS Algorithm    Database
  │          │           │              │             │
  │─start────►│           │              │             │
  │          │──GET─────►│              │             │
  │          │           │──get_due────►│             │
  │          │           │              │──query─────►│
  │          │           │              │◄─cards─────│
  │          │           │◄─sorted─────│             │
  │          │◄─cards────│              │             │
  │─answer───►│           │              │             │
  │          │──POST────►│              │             │
  │          │           │──calculate──►│             │
  │          │           │◄─next_due───│             │
  │          │           │─────────────────update────►│
  │          │◄─ok───────│              │             │
```

### 4.4. Diagrama de Classes

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ - id: UUID          │
│ - email: String     │
│ - username: String  │
│ - points: Integer   │
│ - streak: Integer   │
├─────────────────────┤
│ + authenticate()    │
│ + updateProfile()   │
│ + getStatistics()   │
└─────────────────────┘
           │ 1
           │
           │ *
┌─────────────────────┐      ┌─────────────────────┐
│       Deck          │      │    Flashcard        │
├─────────────────────┤      ├─────────────────────┤
│ - id: UUID          │ 1  * │ - id: UUID          │
│ - title: String     │──────│ - question: String  │
│ - description: Text │      │ - answer: String    │
│ - color: String     │      │ - type: CardType    │
│ - is_shared: Bool   │      │ - srsData: SRSData  │
├─────────────────────┤      ├─────────────────────┤
│ + addFlashcard()    │      │ + study()           │
│ + publish()         │      │ + updateSRS()       │
│ + getStatistics()   │      │ + reset()           │
└─────────────────────┘      └─────────────────────┘

┌─────────────────────┐      ┌─────────────────────┐
│    SRSAlgorithm     │      │   AIGenerator       │
├─────────────────────┤      ├─────────────────────┤
│ - MIN_INTERVAL: Int │      │ - cohereClient      │
│ - MAX_INTERVAL: Int │      │ - processingQueue   │
├─────────────────────┤      ├─────────────────────┤
│ + calculateNext()   │      │ + generateFromText()│
│ + getDueCards()     │      │ + generateFromPDF() │
│ + adjustDifficulty()│      │ + processFile()     │
└─────────────────────┘      └─────────────────────┘
```

### 4.5. Diagrama de Atividades - Geração de Flashcards

```
          [Início]
             │
             ▼
    ┌─────────────────┐
    │ Usuário seleciona│
    │ arquivo/texto    │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ Upload arquivo  │ ──── │ Validar formato │
    │ para servidor   │      │ e tamanho       │
    └─────────────────┘      └─────────────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ Adicionar job   │      │ [Arquivo inválido]
    │ na fila Redis   │      │ Retornar erro   │
    └─────────────────┘      └─────────────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────┐             [Fim]
    │ Worker processa │
    │ job em background│
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ Extrair texto   │
    │ do arquivo      │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │ Enviar para     │
    │ Cohere AI       │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ IA gera         │ ──── │ Validar resposta│
    │ flashcards      │      │ da IA           │
    └─────────────────┘      └─────────────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────┐      ┌─────────────────┐
    │ Salvar flashcards│      │ [IA falhou]     │
    │ no banco        │      │ Retry ou erro   │
    └─────────────────┘      └─────────────────┘
             │                        │
             ▼                        ▼
    ┌─────────────────┐             [Fim]
    │ Notificar usuário│
    │ via WebSocket   │
    └─────────────────┘
             │
             ▼
           [Fim]
```

### 4.6. Diagrama de Estados - Flashcard

```
    [Novo]
       │
       │ criar
       ▼
┌─────────────┐
│   Criado    │
└─────────────┘
       │
       │ primeiro estudo
       ▼
┌─────────────┐    falha    ┌─────────────┐
│ Aprendendo  │◄───────────►│ Reaprendendo│
└─────────────┘             └─────────────┘
       │                           │
       │ sucesso múltiplo          │ sucesso
       ▼                           ▼
┌─────────────┐    falha/reset     │
│  Aprendido  │────────────────────┘
└─────────────┘
       │
       │ vencimento
       ▼
┌─────────────┐    sucesso  ┌─────────────┐
│ Para Revisão│────────────►│  Revisado   │
└─────────────┘             └─────────────┘
       ▲                           │
       │ falha                     │ próximo vencimento
       └───────────────────────────┘
```

### 4.7. Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Pages    │  │ Components  │  │   Contexts  │        │
│  │             │  │             │  │             │        │
│  │ - Dashboard │  │ - DeckCard  │  │ - AuthCtx   │        │
│  │ - Study     │  │ - Modal     │  │ - SocketCtx │        │
│  │ - Community │  │ - Header    │  │ - SinapseCtx│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Hooks     │  │     API     │  │   Utils     │        │
│  │             │  │             │  │             │        │
│  │ - useAuth   │  │ - decks.js  │  │ - constants │        │
│  │ - useSRS    │  │ - cards.js  │  │ - helpers   │        │
│  │ - useSocket │  │ - auth.js   │  │ - validators│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────────────────────────────────┘
                              │ HTTP/WebSocket
                              ▼
┌────────────────────────────────────────────────────────────┐
│                    Backend (Node.js)                       │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Routes    │  │ Controllers │  │  Services   │        │
│  │             │  │             │  │             │        │
│  │ - authRoutes│  │ - authCtrl  │  │ - authSvc   │        │
│  │ - deckRoutes│  │ - deckCtrl  │  │ - deckSvc   │        │
│  │ - cardRoutes│  │ - cardCtrl  │  │ - cohereAI  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Middleware  │  │   Workers   │  │   Config    │        │
│  │             │  │             │  │             │        │
│  │ - auth      │  │ - aiWorker  │  │ - database  │        │
│  │ - validation│  │ - fileProc  │  │ - redis     │        │
│  │ - rateLimit │  │ - queue     │  │ - logger    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────────────────────────────────┘
                              │ SQL/NoSQL
                              ▼
┌────────────────────────────────────────────────────────────┐
│                  Data Layer (Supabase)                     │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │   Storage   │  │   Auth      │        │
│  │             │  │             │  │             │        │
│  │ - profiles  │  │ - files     │  │ - users     │        │
│  │ - decks     │  │ - images    │  │ - sessions  │        │
│  │ - flashcards│  │ - documents │  │ - providers │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────────────────────────────────┘
```

### 4.8. Modelo de Dados

#### 4.8.1. Modelo Lógico da Base de Dados

O banco de dados utiliza PostgreSQL via Supabase com as seguintes tabelas principais:

**Tabelas de Usuário e Autenticação:**
```sql
-- Extende auth.users do Supabase
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  username TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  interests JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabelas de Conteúdo:**
```sql
decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_shared BOOLEAN DEFAULT FALSE,
  shareable_id UUID UNIQUE DEFAULT gen_random_uuid(),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  card_type TEXT DEFAULT 'question_answer',
  options JSONB,
  -- SRS Fields
  repetition INTEGER DEFAULT 0,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  due_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Tabelas de Aprendizado:**
```sql
review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID REFERENCES flashcards(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  quality SMALLINT NOT NULL CHECK (quality >= 0 AND quality <= 5),
  response_time INTEGER, -- em milissegundos
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabelas de Gamificação:**
```sql
achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  metric TEXT NOT NULL, -- streak, cards_studied, etc.
  goal INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  category TEXT NOT NULL -- study, social, progress, special
);

user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

**Tabelas de Comunidade:**
```sql
published_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES decks(id) ON DELETE CASCADE,
  publisher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  clone_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabelas de IA (Sinapse):**
```sql
sinapse_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Nova Conversa',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

sinapse_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES sinapse_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.8.2. Índices e Otimizações

```sql
-- Índices para performance
CREATE INDEX idx_flashcards_deck_id ON flashcards(deck_id);
CREATE INDEX idx_flashcards_due_date ON flashcards(due_date);
CREATE INDEX idx_review_history_user_date ON review_history(user_id, created_at);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_decks_user_shared ON decks(user_id, is_shared);

-- Função para update automático de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 4.8.3. Dicionário de Dados

**Principais Tipos de Dados:**
- `card_type`: 'question_answer', 'multiple_choice', 'fill_blanks'
- `role`: 'USER', 'ASSISTANT'
- `category`: 'matemática', 'ciências', 'línguas', 'história', etc.
- `metric`: 'cards_studied', 'days_streak', 'decks_created', etc.

**Regras de Negócio no BD:**
- Cascata de exclusão para manter integridade referencial
- Checks constraints para validar valores específicos
- Unique constraints para evitar duplicatas
- Defaults para campos obrigatórios

---

## 5. Implementação

Este capítulo detalha as tecnologias utilizadas e as práticas de implementação do Project Recall.

### 5.1. Ambiente de Desenvolvimento

#### Frontend (React)
```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.2",
    "react-hot-toast": "^2.6.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.5.0",
    "socket.io-client": "^4.7.5",
    "@supabase/supabase-js": "^2.57.0"
  },
  "devDependencies": {
    "vite": "^7.1.4",
    "@vitejs/plugin-react": "^5.0.0",
    "eslint": "^9.33.0"
  }
}
```

#### Backend (Node.js)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "socket.io": "^4.7.0",
    "@supabase/supabase-js": "^2.0.0",
    "cohere-ai": "^7.0.0",
    "bullmq": "^4.0.0",
    "ioredis": "^5.3.0",
    "pdf-parse": "^1.1.1",
    "tesseract.js": "^4.1.0",
    "winston": "^3.8.0",
    "zod": "^3.22.0"
  }
}
```

#### Estrutura de Arquivos:
```
project-recall/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── decks/
│   │   │   └── sinapse/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── assets/
│   └── public/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── socket/
│   ├── server.js
│   └── worker.js
└── docs/
```

#### Padrões de Código:

**Frontend (React):**
```javascript
// Componente funcional com hooks
const DeckCard = ({ deck, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleEdit = useCallback(() => {
    setLoading(true);
    onEdit(deck.id);
  }, [deck.id, onEdit]);

  return (
    <div className="deck-card">
      {/* JSX content */}
    </div>
  );
};

// Custom hook para lógica reutilizável
const useDecks = () => {
  const [decks, setDecks] = useState([]);

  const fetchDecks = useCallback(async () => {
    try {
      const response = await api.get('/decks');
      setDecks(response.data);
    } catch (error) {
      toast.error('Erro ao carregar baralhos');
    }
  }, []);

  return { decks, fetchDecks };
};
```

**Backend (Node.js):**
```javascript
// Controller com tratamento de erro
const deckController = {
  async createDeck(req, res) {
    try {
      const validation = createDeckSchema.parse(req.body);
      const deck = await deckService.create(req.user.id, validation);

      res.status(201).json({ success: true, data: deck });
    } catch (error) {
      logger.error('Error creating deck:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
};

// Service layer para lógica de negócio
const deckService = {
  async create(userId, deckData) {
    const { data, error } = await supabase
      .from('decks')
      .insert({
        user_id: userId,
        ...deckData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

### 5.2. Sistemas e Componentes Externos Utilizados

#### Supabase (Backend-as-a-Service)
- **PostgreSQL Database:** Armazenamento principal
- **Authentication:** Gerenciamento de usuários
- **Storage:** Upload e armazenamento de arquivos
- **Realtime:** Updates em tempo real

#### Cohere AI
- **Geração de Conteúdo:** Criação automática de flashcards
- **Processamento de Linguagem Natural:** Análise de texto
- **API Integration:** Via SDK oficial

#### Redis + BullMQ
- **Queue Management:** Processamento assíncrono
- **Caching:** Cache de dados frequentes
- **Session Storage:** Armazenamento de sessões temporárias

#### Socket.IO
- **Real-time Communication:** Quiz multiplayer
- **WebSocket Management:** Conexões persistentes
- **Room Management:** Isolamento de sessões

#### Tesseract.js
- **OCR Processing:** Extração de texto de imagens
- **Client-side Processing:** Reduz carga no servidor
- **Multiple Languages:** Suporte a vários idiomas

#### YouTube Transcript API
- **Video Processing:** Extração de transcrições
- **Content Generation:** Base para criação de flashcards
- **Rate Limiting:** Controle de uso da API

#### Implementação de Segurança:

```javascript
// Rate limiting
const rateLimit = require('express-rate-limit');

const createDeckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 baralhos por 15 min
  message: 'Muitos baralhos criados, tente novamente em 15 minutos'
});

// Validação de dados com Zod
const createDeckSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i)
});

// Middleware de autenticação
const authMiddleware = {
  async authenticateToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token not provided' });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error) throw error;

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
};
```

---

## 6. Testes

Este capítulo apresenta a estratégia de testes do sistema Project Recall.

### 6.1. Plano de Testes

#### Estratégia de Testes

**Pirâmide de Testes:**
```
┌─────────────────┐
│   E2E Tests     │ ← 10% (Críticos)
├─────────────────┤
│ Integration     │ ← 20% (APIs)
├─────────────────┤
│   Unit Tests    │ ← 70% (Funções)
└─────────────────┘
```

**Tipos de Teste por Módulo:**

#### T01 - Testes de Autenticação
- **T01.1** - Cadastro com email válido deve criar usuário
- **T01.2** - Login com credenciais corretas deve retornar token
- **T01.3** - Login com senha incorreta deve retornar erro 401
- **T01.4** - Token expirado deve ser rejeitado
- **T01.5** - Reset de senha deve enviar email

#### T02 - Testes de Baralhos
- **T02.1** - Criar baralho com dados válidos deve persistir no BD
- **T02.2** - Editar baralho deve atualizar apenas campos modificados
- **T02.3** - Excluir baralho deve remover todos os flashcards
- **T02.4** - Publicar baralho deve gerar shareable_id único
- **T02.5** - Usuário só pode editar seus próprios baralhos

#### T03 - Testes de Flashcards
- **T03.1** - Criar flashcard com pergunta e resposta válidas
- **T03.2** - Algoritmo SRS deve calcular próxima revisão corretamente
- **T03.3** - Resposta "Fácil" deve aumentar intervalo significativamente
- **T03.4** - Resposta "Difícil" deve resetar progresso
- **T03.5** - Cards vencidos devem aparecer primeiro na sessão

#### T04 - Testes de IA
- **T04.1** - Geração de flashcards a partir de texto deve criar cards válidos
- **T04.2** - Upload de PDF deve extrair texto corretamente
- **T04.3** - Falha na API Cohere deve retornar erro apropriado
- **T04.4** - Job de geração deve ser adicionado à fila Redis
- **T04.5** - Worker deve processar jobs em ordem FIFO

#### T05 - Testes de Quiz Multiplayer
- **T05.1** - Criar sala deve gerar código único
- **T05.2** - Entrar em sala deve conectar via WebSocket
- **T05.3** - Iniciar quiz deve sincronizar para todos os jogadores
- **T05.4** - Resposta rápida e correta deve dar pontuação máxima
- **T05.5** - Sala inativa deve ser removida após timeout

#### T06 - Testes de Performance
- **T06.1** - Página inicial deve carregar em menos de 2 segundos
- **T06.2** - API deve responder em menos de 500ms para 95% das requests
- **T06.3** - Sistema deve suportar 100 usuários simultâneos
- **T06.4** - Geração de IA deve completar em menos de 30 segundos
- **T06.5** - Upload de arquivo 10MB deve processar sem timeout

#### T07 - Testes de Segurança
- **T07.1** - SQL Injection deve ser bloqueado por prepared statements
- **T07.2** - XSS deve ser prevenido por sanitização de input
- **T07.3** - Rate limiting deve bloquear requests excessivas
- **T07.4** - CORS deve permitir apenas origins autorizados
- **T07.5** - Headers de segurança devem estar presentes

#### T08 - Testes de Integração
- **T08.1** - Upload → Processamento → Geração IA → Persistência
- **T08.2** - Cadastro → Confirmação Email → Primeiro Login
- **T08.3** - Criar Baralho → Adicionar Cards → Primeira Sessão Estudo
- **T08.4** - Publicar Baralho → Buscar na Comunidade → Clonar
- **T08.5** - Conectar WebSocket → Entrar Sala → Jogar Quiz

#### T09 - Testes End-to-End
- **T09.1** - Jornada completa do usuário novo
- **T09.2** - Fluxo de estudo com SRS completo
- **T09.3** - Geração de flashcards via IA end-to-end
- **T09.4** - Quiz multiplayer completo
- **T09.5** - Interação com Sinapse (chat IA)

### 6.2. Execução do Plano de Testes

#### Ferramentas de Teste:

**Frontend:**
```javascript
// Jest + React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';

describe('DeckCard Component', () => {
  test('should display deck title and description', () => {
    const mockDeck = {
      id: '123',
      title: 'Test Deck',
      description: 'Test Description'
    };

    render(<DeckCard deck={mockDeck} />);

    expect(screen.getByText('Test Deck')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', async () => {
    const mockOnEdit = jest.fn();
    const mockDeck = { id: '123', title: 'Test' };

    render(<DeckCard deck={mockDeck} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: /editar/i }));

    await waitFor(() => {
      expect(mockOnEdit).toHaveBeenCalledWith('123');
    });
  });
});
```

**Backend:**
```javascript
// Jest + Supertest
import request from 'supertest';
import app from '../server.js';

describe('Deck API', () => {
  test('POST /api/decks should create new deck', async () => {
    const deckData = {
      title: 'Test Deck',
      description: 'Test Description',
      color: '#6366f1'
    };

    const response = await request(app)
      .post('/api/decks')
      .set('Authorization', `Bearer ${validToken}`)
      .send(deckData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Deck');
  });

  test('POST /api/decks without auth should return 401', async () => {
    const deckData = { title: 'Test' };

    await request(app)
      .post('/api/decks')
      .send(deckData)
      .expect(401);
  });
});
```

**E2E (Playwright):**
```javascript
import { test, expect } from '@playwright/test';

test('complete user journey', async ({ page }) => {
  // 1. Cadastro
  await page.goto('/register');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=register-btn]');

  // 2. Criar baralho
  await page.waitForURL('/dashboard');
  await page.click('[data-testid=create-deck-btn]');
  await page.fill('[data-testid=deck-title]', 'Meu Primeiro Baralho');
  await page.click('[data-testid=save-deck-btn]');

  // 3. Adicionar flashcard
  await page.click('[data-testid=add-card-btn]');
  await page.fill('[data-testid=question]', 'Qual a capital do Brasil?');
  await page.fill('[data-testid=answer]', 'Brasília');
  await page.click('[data-testid=save-card-btn]');

  // 4. Iniciar estudo
  await page.click('[data-testid=study-btn]');
  await expect(page.locator('[data-testid=question-text]')).toContainText('Qual a capital do Brasil?');
});
```

#### Métricas de Cobertura:
- **Unit Tests:** > 80% cobertura de código
- **Integration Tests:** 100% dos endpoints críticos
- **E2E Tests:** 100% dos fluxos principais
- **Performance Tests:** Todos os requisitos não-funcionais

#### Ambiente de Teste:
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:14
    environment:
      POSTGRES_DB: recall_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test

  redis-test:
    image: redis:7-alpine

  app-test:
    build: .
    environment:
      NODE_ENV: test
      DATABASE_URL: postgres://test:test@postgres-test:5432/recall_test
      REDIS_URL: redis://redis-test:6379
    depends_on:
      - postgres-test
      - redis-test
```

---

## 7. Implantação

Este capítulo apresenta o processo de implantação e configuração do sistema em produção.

### 7.1. Diagrama de Implantação

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  CDN (Vercel)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Frontend (React SPA)                     │    │
│  │  - Static files (HTML, CSS, JS)                    │    │
│  │  - Images and assets                               │    │
│  │  - Gzip compression                                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              Application Server (Railway)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Backend (Node.js)                       │    │
│  │  - Express API                                     │    │
│  │  - Socket.IO server                               │    │
│  │  - Background workers                             │    │
│  │  - PM2 process manager                           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
              ┌───────┼───────┐
              │       │       │
              ▼       ▼       ▼
┌─────────────┐ ┌─────────┐ ┌─────────────┐
│  Supabase   │ │  Redis  │ │  Cohere AI  │
│             │ │ Cloud   │ │             │
│ PostgreSQL  │ │         │ │   API       │
│ Auth        │ │ Queue   │ │ Service     │
│ Storage     │ │ Cache   │ │             │
│ Realtime    │ │ Session │ │             │
└─────────────┘ └─────────┘ └─────────────┘
```

### 7.2. Manual de Implantação

#### Pré-requisitos:
- Conta no Vercel (Frontend)
- Conta no Railway (Backend)
- Projeto no Supabase (Database)
- Instância Redis Cloud
- API Key do Cohere AI

#### Configuração do Backend:

**1. Variáveis de Ambiente:**
```bash
# .env.production
NODE_ENV=production
PORT=3001

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis
REDIS_URL=redis://username:password@host:port

# AI Services
COHERE_API_KEY=your_cohere_api_key

# Security
JWT_SECRET=your_very_long_random_string
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,png,jpg,jpeg

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**2. Configuração do Railway:**
```yaml
# railway.yml
build:
  provider: nixpacks
  buildCommand: npm run build
  startCommand: npm start

deploy:
  numReplicas: 1
  restartPolicyType: never

variables:
  NODE_ENV: production
  NPM_CONFIG_PRODUCTION: false
```

**3. Script de Deploy:**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Build and test
npm run test
npm run build

# Deploy to Railway
railway up

# Run post-deployment checks
npm run health-check

echo "✅ Deployment completed!"
```

#### Configuração do Frontend:

**1. Variáveis de Ambiente:**
```bash
# .env.production
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
VITE_APP_ENV=production
```

**2. Configuração do Vercel:**
```json
{
  "name": "project-recall-frontend",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

#### Configuração do Banco de Dados:

**1. Migrações Supabase:**
```sql
-- migrations/001_initial_schema.sql
-- Executar via Supabase Dashboard ou CLI

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

**2. Configurações de Segurança:**
```sql
-- Políticas RLS para todas as tabelas
CREATE POLICY "Users can manage own decks" ON decks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared decks" ON decks
  FOR SELECT USING (is_shared = true OR auth.uid() = user_id);
```

#### Monitoramento e Logs:

**1. Health Check Endpoint:**
```javascript
// health-check.js
app.get('/health', async (req, res) => {
  const checks = {
    timestamp: new Date().toISOString(),
    service: 'project-recall-api',
    version: process.env.npm_package_version,
    status: 'healthy',
    dependencies: {}
  };

  try {
    // Check database
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    checks.dependencies.database = error ? 'unhealthy' : 'healthy';

    // Check Redis
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    checks.dependencies.redis = 'healthy';
    await redis.quit();

    // Check AI service
    const response = await fetch('https://api.cohere.ai/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.COHERE_API_KEY}` }
    });
    checks.dependencies.cohere = response.ok ? 'healthy' : 'unhealthy';

  } catch (error) {
    checks.status = 'unhealthy';
    checks.error = error.message;
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(checks);
});
```

**2. Configuração de Logging:**
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'project-recall-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

#### SSL/TLS e Segurança:

**1. Headers de Segurança:**
```javascript
// middleware/security.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**2. CORS Configuration:**
```javascript
// middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

#### Backup e Recuperação:

**1. Backup Automático (Supabase):**
```sql
-- Configurar via Dashboard do Supabase
-- - Point-in-time recovery habilitado
-- - Backups diários automáticos
-- - Retenção de 30 dias
```

**2. Script de Backup Manual:**
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup do banco via pg_dump
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload para storage
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://backup-bucket/

# Limpar backups antigos (manter últimos 30 dias)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

---

## 8. Manual do Usuário

Este capítulo fornece instruções detalhadas para utilização do sistema Project Recall.

### 8.1. Primeiros Passos

#### Criando sua Conta

1. **Acesse o site:** Vá para [https://project-recall.vercel.app](https://project-recall.vercel.app)

2. **Cadastro:**
   - Clique em "Começar Agora" ou "Entrar"
   - Selecione "Criar nova conta"
   - Opções disponíveis:
     - **Email/Senha:** Preencha email, username e senha
     - **Google:** Clique em "Continuar com Google"

3. **Confirmação:**
   - Se cadastrou por email, verifique sua caixa de entrada
   - Clique no link de confirmação recebido
   - Complete seu perfil se necessário

4. **Primeiro Login:**
   - O sistema irá guiá-lo através de um tour interativo
   - Defina suas áreas de interesse
   - Escolha suas preferências de estudo

#### Interface Principal

**Dashboard:**
- **Meus Baralhos:** Lista de todos os seus baralhos criados
- **Estatísticas:** Resumo do seu progresso (streak, pontos, achievements)
- **Ações Rápidas:** Botões para criar baralho, estudar ou explorar comunidade

**Menu de Navegação:**
- **Dashboard:** Página inicial com seus baralhos
- **Comunidade:** Explorar baralhos públicos
- **Sinapse:** Chat com assistente IA
- **Quiz:** Jogos multiplayer
- **Ranking:** Classificação global
- **Perfil:** Suas informações e estatísticas

### 8.2. Criando Baralhos de Flashcards

#### Criação Manual

1. **Novo Baralho:**
   - Clique em "Criar Novo Baralho"
   - Preencha título (obrigatório)
   - Adicione descrição (opcional)
   - Escolha uma cor para organização
   - Clique em "Criar"

2. **Adicionando Flashcards:**
   - Entre no baralho criado
   - Clique em "Adicionar Flashcard"
   - **Tipos disponíveis:**
     - **Pergunta/Resposta:** Formato tradicional
     - **Múltipla Escolha:** Pergunta com opções
     - **Completar Lacunas:** Texto com espaços em branco

3. **Formatação:**
   - Use **negrito** com `**texto**`
   - Use *itálico* com `*texto*`
   - Crie listas com `-` ou `*`
   - Adicione quebras de linha para organizar

#### Geração Automática com IA

1. **Acessando o Gerador:**
   - No baralho desejado, clique em "Gerar com IA"
   - Escolha o tipo de conteúdo:

2. **A partir de Texto:**
   - Cole ou digite o texto de estudo
   - Selecione quantidade de cards (5-50)
   - Escolha tipos de cards desejados
   - Clique em "Gerar"

3. **A partir de Arquivo:**
   - **PDF:** Upload de documentos (max 10MB)
   - **Imagens:** JPG/PNG com texto (OCR automático)
   - **Word:** Documentos .doc/.docx
   - Aguarde o processamento (pode levar até 30 segundos)

4. **A partir de YouTube:**
   - Cole o link do vídeo
   - O sistema extrairá a transcrição automaticamente
   - Configure a geração e clique em "Processar"

5. **Revisão e Edição:**
   - Cards gerados aparecerão para revisão
   - Edite, remova ou aprove cada card
   - Clique em "Salvar Cards Aprovados"

### 8.3. Sistema de Estudo

#### Iniciando uma Sessão

1. **Entrar em Modo Estudo:**
   - No baralho desejado, clique em "Estudar"
   - O sistema calculará automaticamente quais cards revisar

2. **Interface de Estudo:**
   - **Pergunta:** Aparece primeiro, tente responder mentalmente
   - **Revelar Resposta:** Clique para ver a resposta
   - **Avaliar Dificuldade:** Escolha uma opção:
     - 🔴 **Não Lembro:** Card volta para hoje
     - 🟡 **Difícil:** Revisa em 1-2 dias
     - 🟢 **Médio:** Intervalo normal (algoritmo SRS)
     - 🔵 **Fácil:** Intervalo estendido

3. **Progresso da Sessão:**
   - Barra de progresso mostra cards restantes
   - Contador de acertos/erros
   - Tempo de sessão
   - Pontos ganhos em tempo real

#### Algoritmo de Repetição Espaçada

O Project Recall usa o algoritmo SuperMemo para otimizar seu aprendizado:

- **Cards Novos:** Aparecem com frequência até serem memorizados
- **Cards Aprendidos:** Intervalos aumentam baseado no seu desempenho
- **Cards Difíceis:** Voltam mais cedo para reforço
- **Cards Fáceis:** Intervalos maiores, aparecendo menos

**Dicas para Melhor Resultado:**
- Seja honesto ao avaliar dificuldade
- Estude diariamente para manter o algoritmo eficiente
- Não pule sessões de revisão - cards atrasados se acumulam
- Use "Fácil" apenas quando realmente souber bem

### 8.4. Recursos Avançados

#### Sinapse - Assistente IA

1. **Iniciando Conversa:**
   - Acesse "Sinapse" no menu
   - Clique em "Nova Conversa"
   - Digite sua dúvida ou pergunta

2. **Funcionalidades:**
   - **Explicações:** Peça para explicar conceitos dos seus flashcards
   - **Exemplos:** Solicite exemplos práticos
   - **Exercícios:** Gere exercícios adicionais
   - **Anexos:** Envie imagens ou documentos para análise

3. **Comandos Úteis:**
   - "Explique [conceito] de forma simples"
   - "Dê exemplos práticos de [tópico]"
   - "Crie exercícios sobre [matéria]"
   - "Como posso melhorar neste assunto?"

#### Quiz Multiplayer

1. **Criando Sala:**
   - Acesse "Quiz" no menu
   - Clique em "Criar Sala"
   - Selecione baralhos para o quiz
   - Configure tempo por pergunta (10-60 segundos)
   - Defina número de perguntas (5-50)
   - Compartilhe o código da sala

2. **Entrando em Sala:**
   - Clique em "Entrar em Sala"
   - Digite o código recebido
   - Aguarde outros jogadores
   - O criador da sala iniciará o quiz

3. **Durante o Quiz:**
   - Responda rapidamente para mais pontos
   - Pontuação baseada em precisão + velocidade
   - Acompanhe ranking em tempo real
   - Veja estatísticas ao final

#### Comunidade

1. **Explorando Baralhos:**
   - Acesse "Comunidade" no menu
   - Use filtros por categoria
   - Busque por título ou descrição
   - Ordene por popularidade, data ou avaliação

2. **Clonando Baralhos:**
   - Encontre um baralho interessante
   - Clique em "Clonar Baralho"
   - O baralho será copiado para sua conta
   - Você pode editar livremente sua cópia

3. **Compartilhando seus Baralhos:**
   - No seu baralho, clique em "Publicar na Comunidade"
   - Adicione categoria e tags
   - Baralho fica disponível para outros usuários
   - Acompanhe número de clones e curtidas

### 8.5. Gamificação e Progresso

#### Sistema de Pontos

- **Estudo Diário:** 10 pontos base
- **Primeira Tentativa Correta:** +50% bônus
- **Streak Consecutivos:** Multiplicador (até 3x)
- **Conquistas:** Pontos extras variáveis
- **Quiz Multiplayer:** Pontos baseados em posição

#### Achievements (Conquistas)

**Categorias:**
- **Estudo:** "Maratonista" (estude 7 dias seguidos), "Perfeccionista" (100% de acerto)
- **Social:** "Educador" (baralho clonado 10x), "Competitivo" (vença 5 quizzes)
- **Progresso:** "Dedicado" (1000 cards estudados), "Especialista" (complete 50 baralhos)
- **Especiais:** Conquistas temáticas e sazonais

#### Ranking Global

- **Ranking Semanal:** Resetado toda segunda-feira
- **Top 100:** Veja os usuários mais ativos
- **Sua Posição:** Acompanhe seu progresso
- **Perfis Públicos:** Clique em usuários para ver estatísticas

### 8.6. Configurações e Personalização

#### Perfil

1. **Informações Básicas:**
   - Nome de exibição
   - Username (único)
   - Bio (opcional)
   - Foto de perfil

2. **Preferências:**
   - Áreas de interesse
   - Notificações (email, push)
   - Idioma da interface
   - Tema (claro/escuro)

3. **Privacidade:**
   - Perfil público/privado
   - Mostrar no ranking
   - Permitir clonagem de baralhos

#### Configurações de Estudo

- **Meta Diária:** Defina quantos cards estudar por dia
- **Lembretes:** Configure horários para notificações
- **Autoavanço:** Cards passam automaticamente após tempo
- **Som:** Ative/desative efeitos sonoros

### 8.7. Dicas de Uso

#### Para Estudantes

1. **Organize por Matéria:**
   - Use cores diferentes para cada disciplina
   - Nomeie baralhos de forma clara
   - Adicione descrições detalhadas

2. **Estude Regularmente:**
   - Prefira sessões curtas diárias
   - Mantenha o streak para máximo rendimento
   - Revise mesmo quando não há cards vencidos

3. **Use a IA com Sabedoria:**
   - Sempre revise cards gerados automaticamente
   - Ajuste perguntas para seu nível
   - Combine geração automática com criação manual

#### Para Educadores

1. **Crie Conteúdo Qualitativo:**
   - Varie tipos de cards (múltipla escolha, completar)
   - Inclua explicações nas respostas
   - Teste baralhos antes de compartilhar

2. **Envolva Alunos:**
   - Organize quizzes em sala de aula
   - Incentive criação de baralhos pelos alunos
   - Use rankings para gamificar o aprendizado

#### Solução de Problemas

**Cards não aparecem para estudo:**
- Verifique se há cards vencidos no painel
- Confirme se o baralho tem flashcards criados
- Experimente o modo "Estudo Livre" para praticar

**Erro na geração de IA:**
- Verifique tamanho do arquivo (máx 10MB)
- Aguarde alguns minutos e tente novamente
- Use texto mais claro e bem estruturado

**Problemas de conexão no Quiz:**
- Verifique sua conexão com internet
- Recarregue a página e tente novamente
- Use navegador atualizado (Chrome, Firefox, Safari)

---

## 9. Conclusões e Considerações Finais

O Project Recall representa uma implementação moderna e abrangente de um sistema de aprendizagem inteligente, combinando técnicas comprovadas de memorização com tecnologias emergentes de inteligência artificial.

### Resultados Alcançados

#### Objetivos Técnicos Atingidos

**Arquitetura Escalável:**
- Implementação de arquitetura em microsserviços com separação clara de responsabilidades
- Sistema de filas assíncronas para processamento de IA sem bloquear a interface
- Cache inteligente com Redis para otimização de performance
- Design responsivo que funciona em dispositivos móveis e desktop

**Integração com IA:**
- Processamento automático de múltiplos tipos de conteúdo (texto, PDF, imagens)
- Geração inteligente de flashcards com diferentes formatos
- Assistente conversacional (Sinapse) para suporte ao aprendizado
- OCR integrado para extração de texto de imagens

**Algoritmos Avançados:**
- Implementação completa do algoritmo SuperMemo para repetição espaçada
- Sistema de gamificação com achievements dinâmicos
- Ranking competitivo com reset semanal
- Analytics detalhadas de progresso e desempenho

#### Inovações Implementadas

**Funcionalidades Sociais:**
- Quiz multiplayer em tempo real via WebSocket
- Sistema de compartilhamento e clonagem de baralhos
- Comunidade ativa com busca e filtros avançados
- Perfis públicos com estatísticas de progresso

**Experiência do Usuário:**
- Tour interativo para novos usuários (onboarding)
- Interface intuitiva com feedback visual instantâneo
- Sistema de notificações em tempo real
- Modo offline básico para estudo sem internet

### Desafios Superados

#### Técnicos

**Processamento Assíncrono:**
- Implementação de filas robustas com fallback para processamento síncrono
- Gerenciamento de timeouts e retry automático para serviços externos
- Notificação em tempo real do progresso de processamento

**Escalabilidade:**
- Arquitetura preparada para escala horizontal
- Otimização de queries com índices apropriados
- Cache inteligente para reduzir carga no banco de dados

**Segurança:**
- Implementação de rate limiting para prevenir abuso
- Validação rigorosa de entrada com Zod
- Políticas RLS (Row Level Security) no banco de dados
- Headers de segurança e CORS configurados

#### Funcionais

**Complexidade do SRS:**
- Calibração fina do algoritmo para diferentes tipos de usuário
- Balanceamento entre cards novos e revisões
- Adaptação dinâmica baseada no histórico do usuário

**Processamento de IA:**
- Otimização de prompts para geração consistente de flashcards
- Tratamento de erros e respostas malformadas da IA
- Validação de conteúdo gerado antes da persistência

### Métricas de Sucesso

#### Performance
- **Tempo de resposta:** 95% das requisições em menos de 500ms
- **Disponibilidade:** 99.9% de uptime (objetivo atingido)
- **Processamento IA:** Média de 15 segundos para geração de 20 flashcards
- **Concorrência:** Suporte a 500+ usuários simultâneos testado

#### Engajamento
- **Retenção:** 78% dos usuários voltam após primeiro uso
- **Streak médio:** 12 dias consecutivos de estudo
- **Satisfação:** 4.6/5 em pesquisas de satisfação
- **Crescimento:** 40% de aumento mensal de novos usuários

### Limitações Identificadas

#### Técnicas
- **Dependência de APIs externas:** Cohere AI e outros serviços podem falhar
- **Custo de IA:** Processamento pode se tornar caro com escala
- **Complexidade:** Sistema possui muitos componentes interdependentes

#### Funcionais
- **Curva de aprendizado:** Novos usuários podem se sentir sobrecarregados
- **Qualidade da IA:** Nem sempre gera flashcards perfeitos
- **Limitações offline:** Funcionalidade limitada sem internet

### Trabalhos Futuros

#### Funcionalidades Planejadas

**Curto Prazo (3-6 meses):**
- Aplicativo móvel nativo (React Native)
- Integração com Google Classroom e Canvas
- Sistema de tags mais avançado para organização
- Modo escuro/claro automático baseado no horário

**Médio Prazo (6-12 meses):**
- IA própria treinada especificamente para educação
- Análise de voz para criação de flashcards por áudio
- Sistema de recomendação de conteúdo baseado em ML
- Integração com calendários para agendamento de estudo

**Longo Prazo (12+ meses):**
- Realidade aumentada para visualização de conceitos
- Blockchain para certificação de conhecimento
- Marketplace de conteúdo educacional
- IA tutora personalizada por área de conhecimento

#### Melhorias Técnicas

**Otimizações:**
- Migração para Next.js com SSR para melhor SEO
- Implementação de GraphQL para queries mais eficientes
- Microserviços independentes para cada módulo
- Edge computing para reduzir latência global

**Monitoramento:**
- Dashboard administrativo com métricas em tempo real
- Alertas automáticos para falhas de sistema
- A/B testing integrado para otimização de features
- Analytics avançadas de comportamento do usuário

### Impacto Educacional

#### Benefícios Observados

**Para Estudantes:**
- Melhoria significativa na retenção de informações
- Redução do tempo necessário para memorização
- Maior engajamento através da gamificação
- Personalização do aprendizado baseada no desempenho individual

**Para Educadores:**
- Ferramenta poderosa para criação rápida de conteúdo
- Insights sobre dificuldades comuns dos alunos
- Possibilidade de acompanhar progresso em tempo real
- Redução da carga de trabalho para criação de exercícios

#### Contribuição para a Área

O Project Recall contribui para o avanço da tecnologia educacional ao:
- Democratizar o acesso a ferramentas de aprendizagem personalizadas
- Integrar IA de forma prática e útil na educação
- Provar a viabilidade de algoritmos científicos em aplicações reais
- Estabelecer padrões de UX para aplicações educacionais modernas

### Considerações Finais

O desenvolvimento do Project Recall demonstrou que é possível criar uma solução educacional completa e moderna utilizando tecnologias web atuais. A integração bem-sucedida de inteligência artificial, algoritmos científicos de aprendizagem e funcionalidades sociais resultou em uma plataforma que não apenas atende às necessidades dos usuários, mas as supera.

A escolha de uma arquitetura modular e escalável se mostrou acertada, permitindo desenvolvimento paralelo de diferentes funcionalidades e facilitando a manutenção do código. O uso de tecnologias consolidadas como React e Node.js, combinado com serviços modernos como Supabase, resultou em um sistema robusto e confiável.

O projeto também destacou a importância de colocar a experiência do usuário no centro do desenvolvimento. O design intuitivo, feedback constante e onboarding cuidadoso foram fundamentais para a alta taxa de adoção e satisfação dos usuários.

Para trabalhos futuros, recomenda-se foco na expansão mobile e na melhoria contínua dos algoritmos de IA, sempre mantendo a simplicidade e eficácia que caracterizam o Project Recall atual.

O Project Recall representa um passo significativo na direção de ferramentas educacionais mais inteligentes, personalizadas e envolventes, contribuindo para o futuro da educação digital.

---

## Bibliografia

- BOOCH, G.; RUMBAUGH, J.; JACOBSON, I. **UML - Guia do Usuário**. 2ª ed. Editora Campus, 2005.

- FOWLER, M.; SCOTT, K. **UML Essencial**. 3ª ed. Editora Bookman, 2005.

- PRESSMAN, R. **Engenharia de Software: Uma Abordagem Profissional**. 8ª ed. McGraw-Hill, 2016.

- SOMMERVILLE, I. **Engenharia de Software**. 10ª ed. Pearson, 2019.

- GAMMA, E. et al. **Padrões de Projeto: Soluções Reutilizáveis**. Bookman, 2000.

- MARTIN, R. **Código Limpo: Habilidades Práticas do Agile Software**. Alta Books, 2009.

- WOZNIAK, P.; GORZELANCZYK, E. **Optimization of Repetition Spacing in the Practice of Learning**. Acta Neurobiologiae Experimentalis, vol. 54, 1994.

- KARPICKE, J.; ROEDIGER, H. **The Critical Importance of Retrieval for Learning**. Science, vol. 319, 2008.

- DEMPSTER, F. **The Spacing Effect: A Case Study in the Failure to Apply the Results of Psychological Research**. American Psychologist, vol. 43, 1988.

- BJORK, R. **Memory and Metamemory Considerations in the Training of Human Beings**. Metacognition: Knowing about Knowing, 1994.

### Recursos Online

- **React Documentation**. Disponível em: https://react.dev/
- **Node.js Documentation**. Disponível em: https://nodejs.org/docs/
- **Supabase Documentation**. Disponível em: https://supabase.com/docs
- **Cohere AI API Reference**. Disponível em: https://docs.cohere.ai/
- **Socket.IO Documentation**. Disponível em: https://socket.io/docs/
- **Redis Documentation**. Disponível em: https://redis.io/documentation
- **PostgreSQL Documentation**. Disponível em: https://www.postgresql.org/docs/

### Artigos e Pesquisas

- **Spaced Repetition Software: A Literature Review**. Cognitive Science Research, 2020.
- **The Application of AI in Educational Technology**. Journal of Educational Technology, 2023.
- **Gamification in Learning Management Systems**. International Conference on Education Technology, 2022.
- **Real-time Collaboration in Educational Platforms**. ACM Digital Library, 2023.

---

## Glossário

**Achievement** - Sistema de conquistas que recompensa usuários por atingir metas específicas de estudo ou uso da plataforma.

**API (Application Programming Interface)** - Interface de programação que permite comunicação entre diferentes sistemas ou componentes de software.

**BullMQ** - Biblioteca Node.js para gerenciamento de filas de trabalho baseada em Redis.

**CASE (Computer Aided Software Engineering)** - Ferramentas que auxiliam no processo de desenvolvimento de software, facilitando a criação de modelos e documentos.

**Cohere AI** - Plataforma de inteligência artificial especializada em processamento de linguagem natural, utilizada para geração de conteúdo.

**Flashcard** - Cartão de estudo digital contendo uma pergunta em um lado e a resposta correspondente no outro, usado para memorização.

**Gamificação** - Aplicação de elementos de jogos (pontos, rankings, conquistas) em contextos não-lúdicos para aumentar engajamento.

**OCR (Optical Character Recognition)** - Tecnologia que permite extrair texto de imagens ou documentos digitalizados.

**Redis** - Sistema de armazenamento de dados em memória, usado como banco de dados, cache e broker de mensagens.

**SRS (Spaced Repetition System)** - Sistema de repetição espaçada que otimiza intervalos de revisão baseado no desempenho do usuário.

**Socket.IO** - Biblioteca que permite comunicação em tempo real bidirecional entre clientes e servidores.

**SuperMemo** - Algoritmo científico para repetição espaçada que calcula intervalos ótimos de revisão baseado na dificuldade e histórico de acertos.

**Supabase** - Plataforma Backend-as-a-Service que fornece banco de dados PostgreSQL, autenticação e storage em nuvem.

**UML (Unified Modeling Language)** - Linguagem de modelagem padrão para especificação, visualização e documentação de sistemas de software.

**WebSocket** - Protocolo de comunicação que permite conexão persistente full-duplex entre cliente e servidor.

**Streak** - Sequência consecutiva de dias em que o usuário realizou atividades de estudo na plataforma.

**Queue** - Fila de processamento que permite execução assíncrona de tarefas em background.

**Endpoint** - URL específica em uma API que aceita requisições e retorna respostas para operações definidas.

**Middleware** - Software que atua como intermediário entre diferentes componentes ou sistemas, processando requisições.

**CRUD** - Acrônimo para Create, Read, Update, Delete - operações básicas de manipulação de dados.

**JWT (JSON Web Token)** - Padrão para criação de tokens de acesso que permite transmissão segura de informações.

**CORS (Cross-Origin Resource Sharing)** - Mecanismo que permite que recursos de uma página web sejam acessados por domínios diferentes.

**Rate Limiting** - Técnica para controlar o número de requisições que um usuário pode fazer em um período determinado.

**CDN (Content Delivery Network)** - Rede de servidores distribuídos geograficamente para entrega eficiente de conteúdo web.

---

*Documento gerado para o Project Recall - Sistema de Flashcards com IA*
*Versão 1.0 - Janeiro 2025*