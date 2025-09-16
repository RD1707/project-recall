# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack flashcard application called "Project Recall" with AI-powered flashcard generation.

### Structure
- **Root**: Monorepo with concurrent development scripts
- **Backend** (`/backend`): Node.js/Express API with Socket.IO for real-time features
- **Frontend** (`/frontend`): React/Vite SPA with TypeScript support

### Key Technologies
- **Database**: Supabase (PostgreSQL) with service role authentication
- **Cache/Queue**: Redis with BullMQ for background processing
- **AI**: Cohere AI for flashcard generation
- **Real-time**: Socket.IO for quiz functionality
- **File Processing**: Supports PDF, Word docs, images (OCR with Tesseract.js)

## Development Commands

### Starting Development
```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend in development
npm run dev

# Start individual services
npm run dev --prefix backend    # Backend only (nodemon on port 3001)
npm run dev --prefix frontend   # Frontend only (Vite on port 5173)
```

### Building and Deployment
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Individual Service Commands
```bash
# Backend
cd backend
npm run dev     # Development with nodemon
npm start       # Production
npm test        # Currently no tests

# Frontend  
cd frontend
npm run dev     # Vite dev server
npm run build   # Production build
npm run lint    # ESLint
npm run preview # Preview production build
```

## Core Architecture Patterns

### Backend Structure (`/backend/src`)
- **Routes**: RESTful API endpoints (`/routes`)
- **Controllers**: Business logic handlers (`/controllers`) 
- **Services**: Reusable business services (`/services`)
- **Middleware**: Authentication and validation (`/middleware`)
- **Config**: Supabase client configuration (`/config`)
- **Socket**: Real-time quiz functionality (`/socket`)
- **Worker**: Background job processing (`worker.js`)

### Frontend Structure (`/frontend/src`)
- **Pages**: Route components for different views
- **Components**: Reusable UI components
- **Context**: React context providers (Socket, Achievements)
- **Hooks**: Custom React hooks
- **API**: Frontend API client utilities

### Database Integration
- Uses Supabase with service role key for backend operations
- Client configured in `/backend/src/config/supabaseClient.js`
- Requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables

### Real-time Features
- Socket.IO server on backend port 3001
- Quiz rooms and real-time gameplay
- Socket context provider wraps React app

### File Processing Pipeline
- Supports PDF, DOCX, images, and YouTube transcripts
- Uses BullMQ for async processing
- OCR with Tesseract.js for images
- AI flashcard generation with Cohere

### Key Routes Structure
- Public: Landing, auth, help pages, shared decks
- Protected: Dashboard, deck management, study sessions, community, quizzes
- API: `/api/auth`, `/api/decks`, `/api/flashcards`, `/api/community`, etc.

## Environment Setup
Backend requires `.env` file with:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` 
- Redis connection details for BullMQ
- Cohere AI API key

## Development Notes
- Frontend uses React Router for SPA navigation
- Backend serves frontend static files in production
- CORS configured for development ports (3000, 5173)
- Authentication uses Supabase auth with custom middleware
- Portuguese language used in some console logs and comments

## Database Schema

The application uses Supabase (PostgreSQL) with the following table structure:

### Core Tables

#### `profiles`
User profiles extending Supabase auth.users:
- `id` (uuid, PK) - References auth.users(id)
- `points` (integer) - Total accumulated points
- `current_streak` (integer) - Current study streak
- `last_studied_at` (timestamp) - Last study session
- `full_name` (text) - User's full name
- `username` (text, unique) - Unique username
- `bio` (text) - User biography
- `avatar_url` (text) - Profile picture URL
- `weekly_points` (integer) - Points earned this week
- `has_completed_onboarding` (boolean) - Onboarding status

#### `decks`
Flashcard deck containers:
- `id` (uuid, PK) - Deck identifier
- `user_id` (uuid, FK) - References profiles(id)
- `title` (text) - Deck title
- `description` (text) - Deck description
- `created_at` (timestamp) - Creation date
- `shareable_id` (uuid, unique) - Public sharing identifier
- `is_shared` (boolean) - Sharing status
- `color` (text) - Theme color
- `published_at` (timestamp) - Publication date

#### `flashcards`
Individual flashcards with spaced repetition algorithm:
- `id` (uuid, PK) - Card identifier
- `deck_id` (uuid, FK) - References decks(id)
- `card_type` (text) - Card type (default: 'question_answer')
- `question` (text) - Card question
- `answer` (text) - Card answer
- `options` (jsonb) - Multiple choice options
- `repetition` (integer) - Repetition count (SM-2 algorithm)
- `ease_factor` (double precision) - Difficulty factor (SM-2 algorithm)
- `interval` (integer) - Days until next review (SM-2 algorithm)
- `due_date` (timestamp) - Next review date
- `created_at` (timestamp) - Creation date

### Community & Gamification

#### `published_decks`
Community-published decks:
- `id` (uuid, PK) - Published deck identifier
- `deck_id` (uuid, FK, unique) - References decks(id)
- `publisher_id` (uuid, FK) - References auth.users(id)
- `category` (text) - Deck category
- `tags` (array) - Searchable tags
- `clone_count` (integer) - Number of clones/downloads
- `publisher_username` (text) - Publisher username (denormalized)
- `publisher_avatar_url` (text) - Publisher avatar (denormalized)
- `created_at` (timestamp) - Publication date
- `updated_at` (timestamp) - Last update

#### `deck_ratings`
User ratings for published decks:
- `id` (bigint, PK) - Rating identifier
- `deck_id` (uuid, FK) - References decks(id)
- `user_id` (uuid, FK) - References profiles(id)
- `rating` (smallint) - Rating value (1-5)
- `created_at` (timestamp) - Rating date

#### `achievements`
Available achievements in the system:
- `id` (integer, PK) - Achievement identifier
- `name` (varchar) - Achievement name
- `description` (text) - Achievement description
- `icon` (varchar) - Icon identifier
- `goal` (integer) - Target value to unlock
- `metric` (varchar, unique) - Metric type being tracked
- `created_at` (timestamp) - Creation date

#### `user_achievements`
User progress on achievements:
- `id` (integer, PK) - Progress identifier
- `user_id` (uuid, FK) - References profiles(id)
- `achievement_id` (integer, FK) - References achievements(id)
- `progress` (integer) - Current progress value
- `unlocked_at` (timestamp) - Unlock timestamp (null if not unlocked)
- `created_at` (timestamp) - Creation date
- `updated_at` (timestamp) - Last update

### Analytics & History

#### `review_history`
Study session history for analytics:
- `id` (bigint, PK) - Review identifier
- `created_at` (timestamp) - Review date
- `user_id` (uuid, FK) - References profiles(id)
- `card_id` (uuid, FK) - References flashcards(id)
- `deck_id` (uuid, FK) - References decks(id)
- `quality` (smallint) - Review quality rating

### Key Relationships
- `profiles.id` → `auth.users.id` (Supabase auth)
- `decks.user_id` → `profiles.id`
- `flashcards.deck_id` → `decks.id`
- `published_decks.deck_id` → `decks.id`
- `published_decks.publisher_id` → `auth.users.id`
- `deck_ratings.deck_id` → `decks.id`
- `deck_ratings.user_id` → `profiles.id`
- `user_achievements.user_id` → `profiles.id`
- `user_achievements.achievement_id` → `achievements.id`
- `review_history.user_id` → `profiles.id`
- `review_history.card_id` → `flashcards.id`
- `review_history.deck_id` → `decks.id`

### Important Notes
- All main entities use UUIDs for primary keys
- Spaced repetition algorithm (SM-2) implemented in flashcards table
- Gamification system with points, streaks, and achievements
- Community features with deck sharing, ratings, and cloning
- Analytics tracking through review_history for progress monitoring