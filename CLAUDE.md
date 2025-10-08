# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Recall is an AI-powered flashcard application built with a React frontend, Node.js/Express backend, Supabase (PostgreSQL) database, and Redis for queue management. The app generates flashcards from various content sources using Cohere AI and implements spaced repetition learning.

## Development Commands

### Root Level Commands
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install:all` - Install dependencies for both backend and frontend
- `npm run build` - Build the frontend for production
- `npm start` - Start the backend in production mode

### Backend Commands (run from `/backend`)
- `npm run dev` - Start backend with nodemon (auto-restart on changes)
- `npm start` - Start backend in production mode
- `npm test` - Run tests (currently placeholder)

### Frontend Commands (run from `/frontend`)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

### Backend Structure
- **Express Server** (`server.js`): Main entry point with Socket.IO integration
- **Routes**: RESTful API endpoints organized by feature (`/src/routes/`)
- **Controllers**: Business logic handlers (`/src/controllers/`)
- **Services**: Core business services including AI integration (`/src/services/`)
- **Queue System**: BullMQ with Redis for background flashcard generation (`/src/worker.js`)
- **WebSocket**: Real-time features via Socket.IO for quiz functionality

### Frontend Structure
- **React SPA** with React Router for navigation
- **Context Providers**: Socket, Achievements, and Sinapse contexts for state management
- **Protected Routes**: Authentication-based route protection
- **Vite**: Build tool and development server

### Key Services
- **Cohere AI Integration** (`cohereService.js`): AI-powered flashcard generation
- **File Processing** (`fileProcessingService.js`): Handles PDF, image, and document parsing
- **Spaced Repetition** (`srsService.js`): Learning algorithm implementation
- **Queue Management** (`queue.js`): Redis-based background job processing

### Database & External Services
- **Supabase**: PostgreSQL database with authentication
- **Redis**: Queue management and caching (optional, falls back to synchronous processing)
- **Socket.IO**: Real-time communication for multiplayer quiz features

## Database Schema

### Core Tables

**profiles** - User profiles extending Supabase auth.users
- `id` (uuid, FK to auth.users) - Primary key
- `username` (text, unique) - User's display name
- `points`, `weekly_points` (integer) - Gamification points
- `current_streak`, `max_streak` (integer) - Study streaks
- `has_completed_onboarding` (boolean) - Onboarding status
- `interests` (jsonb) - User interests array

**decks** - Flashcard collections
- `id` (uuid) - Primary key
- `user_id` (uuid, FK to profiles) - Owner
- `title`, `description` (text) - Deck metadata
- `shareable_id` (uuid, unique) - Public sharing identifier
- `is_shared` (boolean) - Sharing status
- `published_at` (timestamp) - Publication timestamp

**flashcards** - Individual study cards
- `id` (uuid) - Primary key
- `deck_id` (uuid, FK to decks) - Parent deck
- `card_type` (text) - Type: 'question_answer', 'multiple_choice', etc.
- `question`, `answer` (text) - Card content
- `options` (jsonb) - Multiple choice options
- SRS fields: `repetition`, `ease_factor`, `interval`, `due_date`

**published_decks** - Community shared decks
- `deck_id` (uuid, FK to decks) - Published deck
- `publisher_id` (uuid, FK to auth.users) - Publisher
- `category` (text), `tags` (array) - Classification
- `clone_count` (integer) - Usage metrics

### Learning & Analytics

**review_history** - Study session records
- `user_id`, `card_id`, `deck_id` - Foreign keys
- `quality` (smallint) - Review quality rating
- `created_at` - Review timestamp

**achievements** & **user_achievements** - Gamification system
- Achievement definitions and user progress tracking
- `metric` (text, unique) - Achievement trigger metric
- `goal` (integer) - Target value

### AI Features

**sinapse_conversations** & **sinapse_messages** - AI chat system
- Conversation management for AI assistant
- `role` - 'USER' or 'ASSISTANT'
- `attachments` (jsonb) - File attachments

## Important Notes

### Queue System
The application uses Redis for background flashcard generation. If Redis is unavailable (REDIS_URL is 'DISABLED' or connection fails), the system gracefully falls back to synchronous processing.

### Environment Configuration
Key environment variables:
- `REDIS_URL`: Redis connection (can be 'DISABLED' for sync processing)
- `PORT`: Backend server port (default: 3001)
- Supabase and Cohere API credentials

### AI Features
- **Sinapse**: AI chat assistant integrated into the application
- **Content Processing**: Supports text, PDF, images, and YouTube transcripts
- **Smart Generation**: Adaptive flashcard creation based on content type and difficulty

### Real-time Features
The application includes multiplayer quiz functionality with WebSocket communication for live game sessions and lobbies.

### Spaced Repetition System
Flashcards use the SuperMemo algorithm with:
- `ease_factor`: Difficulty multiplier (default 2.5)
- `interval`: Days until next review
- `repetition`: Number of successful reviews
- `due_date`: Next scheduled review