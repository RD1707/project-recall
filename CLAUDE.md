# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level Commands
- `npm run dev` - Start both backend and frontend in development mode
- `npm run install:all` - Install dependencies for both backend and frontend
- `npm run build` - Build frontend for production
- `npm start` - Start production server (backend only)

### Backend Commands (from backend/ directory)
- `npm start` - Start Express server (port 3001)
- `npm run worker` - Start BullMQ worker for AI flashcard generation
- `npm run dev` - Start both server and worker concurrently

### Frontend Commands (from frontend/ directory)
- `npm run dev` - Start Vite development server (port 5173)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Architecture Overview

### Full-Stack Structure
This is a monorepo with separate backend and frontend applications:
- **Backend**: Node.js/Express API with WebSocket support
- **Frontend**: React SPA with Vite bundler
- **Database**: Supabase (PostgreSQL)
- **Queue System**: BullMQ with Redis for async AI processing
- **AI Service**: Cohere AI for flashcard generation

### Backend Architecture
- **Entry Point**: `backend/server.js` - Express server with Socket.io
- **Worker Process**: `backend/src/worker.js` - BullMQ worker for AI tasks
- **Routes**: RESTful API endpoints in `backend/src/routes/`
- **Services**: Business logic in `backend/src/services/`
- **Configuration**: Database and queue config in `backend/src/config/`

### Key Backend Components
- **Queue System**: Redis-based job queue for async AI flashcard generation
- **WebSocket**: Real-time features for quiz multiplayer functionality
- **File Processing**: Supports PDF, images, Word docs for AI content extraction
- **Authentication**: JWT-based with Supabase integration

### Frontend Architecture
- **Router**: React Router with protected routes
- **Context Providers**: Socket.io and Achievements contexts
- **Pages**: Main application views in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **API Layer**: Service functions in `src/api/`

### Key Frontend Features
- Protected routes with authentication
- Real-time WebSocket communication
- Achievement system with context management
- Community features and deck sharing
- Quiz multiplayer functionality

## Environment Configuration

### Required Environment Variables
Backend requires:
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` for database
- `COHERE_API_KEY` for AI flashcard generation
- `REDIS_URL` for queue system (can be set to 'DISABLED' for sync mode)
- `JWT_SECRET` for authentication

### Development Setup
1. Run `npm run install:all` from root to install all dependencies
2. Configure backend environment variables in `backend/.env`
3. Start development with `npm run dev` from root

## Deployment
- Configured for Vercel deployment via `vercel.json`
- Backend deployed as serverless functions
- Frontend served as static files
- Worker process requires separate hosting for production

## Key Technical Notes
- The worker process is essential for AI features but runs independently
- Redis is optional - system falls back to synchronous AI generation
- Socket.io handles real-time quiz functionality
- Supabase handles authentication, database, and storage
- File processing supports multiple formats through various npm packages