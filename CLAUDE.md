# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `npm run dev` - Start both backend and frontend in development mode concurrently
- `npm run install:all` - Install dependencies for both backend and frontend
- `npm run build` - Build the frontend application
- `npm start` - Start the backend server in production mode

### Backend Commands (run from /backend)
- `npm run dev` - Start backend with nodemon for hot reloading
- `npm start` - Start backend in production mode
- `npm test` - Run tests (currently placeholder)

### Frontend Commands (run from /frontend)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm preview` - Preview production build

## Architecture Overview

Project Recall is a full-stack flashcard application with AI-powered content generation. The architecture follows a clear separation between frontend and backend:

### Backend Architecture
- **Express.js API** with modular route structure in `/backend/src/routes/`
- **MVC Pattern**: Controllers in `/backend/src/controllers/`, Services in `/backend/src/services/`
- **Database**: Supabase (PostgreSQL) configured in `/backend/src/config/supabaseClient.js`
- **Queue System**: BullMQ with Redis for background AI generation tasks (`/backend/src/config/queue.js`)
- **WebSocket**: Socket.io for real-time quiz functionality (`/backend/src/socket/quizSocketHandler.js`)
- **File Processing**: Supports PDF, DOCX, images via OCR (`/backend/src/services/fileProcessingService.js`)
- **AI Integration**: Cohere AI for flashcard generation (`/backend/src/services/cohereService.js`)

### Frontend Architecture
- **React 19** with Vite build system
- **React Router** for navigation
- **Context API**: Used for Socket connections (`/frontend/src/context/SocketContext.jsx`) and Achievements (`/frontend/src/context/AchievementsContext.jsx`)
- **Component Structure**:
  - Common components in `/frontend/src/components/common/`
  - Feature-specific components in respective folders (auth, decks, profile, etc.)
  - Pages in `/frontend/src/pages/`

### Key Features
- **Spaced Repetition System (SRS)**: Implemented in `/backend/src/services/srsService.js`
- **Real-time Multiplayer Quiz**: Socket.io integration for live quiz sessions
- **AI Content Generation**: Background processing with Redis queues
- **File Upload & Processing**: Multi-format support (PDF, DOCX, images, text)
- **Achievement System**: Gamification features
- **Community Features**: Deck sharing and rating system

### Environment Configuration
- Backend runs on port 3001 by default
- Frontend dev server runs on port 5173 (Vite default)
- Redis connection configured via `REDIS_URL` environment variable
- Supabase configuration required for database access
- Cohere AI API key required for content generation

### Development Notes
- The app uses Portuguese language in console logs and user-facing text
- Theme system implemented with localStorage persistence
- Authentication uses JWT with Supabase integration
- File upload size limit: 10MB
- WebSocket CORS configured for localhost development

## Database Schema (Supabase/PostgreSQL)

### Core Tables

#### `profiles`
- `id` (uuid, PK, FK to auth.users) - User profile ID
- `points` (integer, default 0) - User's total points
- `current_streak` (integer, default 0) - Current study streak
- `max_streak` (integer, default 0) - Maximum streak achieved
- `last_studied_at` (timestamp) - Last study session
- `full_name` (text) - User's full name
- `username` (text, unique) - User's username
- `bio` (text) - User biography
- `avatar_url` (text) - Profile picture URL
- `weekly_points` (integer, default 0) - Points earned this week
- `has_completed_onboarding` (boolean, default false) - Onboarding status
- `interests` (jsonb, default []) - User interests array

#### `decks`
- `id` (uuid, PK) - Deck ID
- `user_id` (uuid, FK to profiles) - Owner's ID
- `title` (text) - Deck title
- `description` (text) - Deck description
- `created_at` (timestamp) - Creation date
- `shareable_id` (uuid, unique) - Public sharing ID
- `is_shared` (boolean, default false) - Sharing status
- `color` (text) - Deck color theme
- `published_at` (timestamp) - Publication date

#### `flashcards`
- `id` (uuid, PK) - Card ID
- `deck_id` (uuid, FK to decks) - Parent deck
- `card_type` (text, default 'question_answer') - Card type
- `question` (text) - Card question
- `answer` (text) - Card answer
- `options` (jsonb) - Multiple choice options
- `repetition` (integer, default 0) - SRS repetition count
- `ease_factor` (double, default 2.5) - SRS ease factor
- `interval` (integer, default 1) - SRS interval days
- `due_date` (timestamp, default now()) - Next review date
- `created_at` (timestamp) - Creation date

#### `review_history`
- `id` (bigint, PK) - Review record ID
- `user_id` (uuid, FK to profiles) - Reviewer ID
- `card_id` (uuid, FK to flashcards) - Reviewed card
- `deck_id` (uuid, FK to decks) - Parent deck
- `quality` (smallint) - Review quality score
- `created_at` (timestamp) - Review date

### Community & Gamification

#### `published_decks`
- `id` (uuid, PK) - Published deck ID
- `deck_id` (uuid, unique, FK to decks) - Source deck
- `publisher_id` (uuid, FK to auth.users) - Publisher ID
- `category` (text) - Deck category
- `tags` (array) - Tag array
- `clone_count` (integer, default 0) - Times cloned
- `publisher_username` (text) - Publisher's username
- `publisher_avatar_url` (text) - Publisher's avatar
- `created_at` (timestamp) - Publication date
- `updated_at` (timestamp) - Last update

#### `deck_ratings`
- `id` (bigint, PK) - Rating ID
- `deck_id` (uuid, FK to decks) - Rated deck
- `user_id` (uuid, FK to profiles) - Rating user
- `rating` (smallint, 1-5) - Rating value
- `created_at` (timestamp) - Rating date

#### `achievements`
- `id` (integer, PK) - Achievement ID
- `name` (varchar) - Achievement name
- `description` (text) - Achievement description
- `icon` (varchar) - Icon identifier
- `goal` (integer) - Target value
- `metric` (varchar, unique) - Metric type
- `created_at` (timestamp) - Creation date

#### `user_achievements`
- `id` (integer, PK) - User achievement ID
- `user_id` (uuid, FK to profiles) - User ID
- `achievement_id` (integer, FK to achievements) - Achievement ID
- `progress` (integer, default 0) - Current progress
- `unlocked_at` (timestamp) - Unlock date
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update

## Linting and Type Checking
- Frontend uses ESLint with React-specific rules
- No specific linting command found for backend
- No TypeScript configuration detected (pure JavaScript project)

## Testing
- Backend has placeholder test command
- No frontend testing setup detected