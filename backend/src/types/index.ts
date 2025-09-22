// Core application types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  points: number;
  current_streak: number;
  weekly_points: number;
  last_studied_at?: string;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  color?: string;
  shareable_id?: string;
  is_shared: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  card_type: CardType;
  question: string;
  answer: string;
  options?: MultipleChoiceOption[];
  repetition: number;
  ease_factor: number;
  interval: number;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface MultipleChoiceOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface PublishedDeck {
  id: string;
  deck_id: string;
  publisher_id: string;
  category: string;
  tags: string[];
  clone_count: number;
  publisher_username: string;
  publisher_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DeckRating {
  id: string;
  deck_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  goal: number;
  metric: string;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_id: number;
  progress: number;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewHistory {
  id: string;
  user_id: string;
  card_id: string;
  deck_id: string;
  quality: number;
  created_at: string;
}

// Enums
export enum CardType {
  QUESTION_ANSWER = 'question_answer',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
}

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  IMAGE = 'image',
  YOUTUBE = 'youtube',
}

export enum StudySessionResult {
  EASY = 5,
  GOOD = 4,
  HARD = 3,
  AGAIN = 1,
}

// API Request/Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  aud: string;
  exp: number;
  iat: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

// File processing types
export interface FileProcessingJob {
  id: string;
  user_id: string;
  file_path: string;
  file_type: FileType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    flashcards: Partial<Flashcard>[];
    deck_title: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface GenerationRequest {
  content: string;
  type: FileType;
  options?: {
    num_cards?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    language?: string;
    card_type?: CardType;
  };
}

// Socket types
export interface SocketUser {
  id: string;
  username: string;
  avatar_url?: string;
}

export interface QuizRoom {
  id: string;
  deck_id: string;
  host_id: string;
  participants: SocketUser[];
  current_question?: Flashcard;
  question_number: number;
  total_questions: number;
  status: 'waiting' | 'active' | 'finished';
  created_at: string;
}

export interface QuizAnswer {
  user_id: string;
  answer: string;
  time_taken: number;
  is_correct: boolean;
}

// Analytics types
export interface StudyAnalytics {
  total_cards_studied: number;
  total_study_time: number;
  cards_learned: number;
  current_streak: number;
  weekly_stats: {
    day: string;
    cards_studied: number;
    time_spent: number;
  }[];
  difficulty_breakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface DeckAnalytics {
  total_cards: number;
  mastered_cards: number;
  learning_cards: number;
  new_cards: number;
  average_ease_factor: number;
  next_review_counts: {
    today: number;
    tomorrow: number;
    this_week: number;
  };
}

// Error types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  REDIS_URL: string;
  COHERE_API_KEY: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string[];
  CORS_ORIGIN: string[];
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  SENTRY_DSN?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type CreateRequest<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

export type UpdateRequest<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// Express types augmentation
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}