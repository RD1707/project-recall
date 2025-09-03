# Recall - Flashcards Inteligentes com React e IA

\<p align="center"\>
\<strong\>Projeto `recall` migrado para React. Estude menos, memorize mais. IA + repetição espaçada.\</strong\>
\</p\>

-----

##  Sobre o Projeto

Este é o projeto **Recall**, uma plataforma inteligente de flashcards, migrado de sua versão original (HTML, CSS, Vanilla JS) para uma moderna Single-Page Application (SPA) utilizando **React**.

A aplicação permite que usuários transformem textos, arquivos (PDF, DOCX, TXT) e vídeos do YouTube em baralhos de estudo interativos, utilizando um sistema de repetição espaçada (SM-2) e IA generativa (Cohere) para otimizar o aprendizado.

###  Stack Tecnológica

  - **Frontend**: React (Vite), React Router, Chart.js, react-hot-toast
  - **Backend**: Node.js, Express.js
  - **Banco de Dados**: PostgreSQL (via Supabase)
  - **Serviços de IA**: Cohere
  - **Filas e Cache**: Redis + BullMQ (para processamento assíncrono de IA)
  - **Autenticação**: Supabase Auth (Email/Senha e Google OAuth)

-----

##  Funcionalidades Principais

  - **Geração de Flashcards com IA**: Crie flashcards automaticamente a partir de texto, arquivos (`.pdf`, `.docx`, `.txt`, `.md`) ou links de vídeos do YouTube.
  - **Repetição Espaçada**: O sistema calcula o momento ideal para revisar cada card, baseado no algoritmo SM-2, para maximizar a retenção.
  - **Sessões de Estudo Interativas**: Uma interface limpa e focada para revisar seus flashcards.
  - **Dashboard de Progresso**: Acompanhe suas estatísticas, como total de revisões, precisão e sequência de estudos (streak).
  - **Autenticação Segura**: Suporte para cadastro com e-mail/senha e login social com Google.
  - **Compartilhamento de Baralhos**: Gere links públicos para compartilhar seus baralhos com outras pessoas.
  - **Gamificação**: Sistema de pontos e streaks para manter o usuário engajado.
  - **Gerenciamento Completo**: Crie, edite e delete baralhos e flashcards de forma intuitiva.

-----

##  Setup e Execução Local

O projeto é dividido em duas partes: o **frontend** (React) e o **backend** (Node.js). Para rodar localmente, você precisará ter os dois servidores em execução simultaneamente.

### Pré-requisitos

  - Node.js (v18 ou superior)
  - npm ou yarn
  - Uma conta no [Supabase](https://supabase.com/) para o banco de dados.
  - Uma chave de API da [Cohere](https://cohere.com/).
  - (Opcional) Uma instância do [Redis](https://redis.io/) para habilitar o processamento em fila.

### 1\. Configuração do Backend

a. Navegue até a pasta do backend:

```bash
cd backend
```

b. Instale as dependências:

```bash
npm install
```

c. Crie um arquivo `.env` na raiz da pasta `backend` e preencha com suas chaves, usando o `.env.example` como referência:

```env
PORT=3001
SUPABASE_URL=SUA_URL_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SUPABASE
COHERE_API_KEY=SUA_CHAVE_API_COHERE
REDIS_URL=seu_redis_url_ou_deixe_em_branco_para_desabilitar
```

d. Inicie o servidor do backend e o worker da fila:

```bash
npm run dev
```

O servidor da API estará rodando em `http://localhost:3001`.

### 2\. Configuração do Frontend (React)

a. Em um **novo terminal**, navegue até a pasta do frontend:

```bash
cd frontend
```

b. Instale as dependências:

```bash
npm install
```

c. O frontend já está configurado para se comunicar com o backend através de um proxy no arquivo `vite.config.js`.

d. Inicie o servidor de desenvolvimento do Vite:

```bash
npm run dev
```

A aplicação React estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).