# Project Recall - Docker Management
.PHONY: help dev prod stop clean build logs test lint health

# Default environment
ENV ?= dev
COMPOSE_FILES = -f docker-compose.yml

# Set compose files based on environment
ifeq ($(ENV),dev)
	COMPOSE_FILES += -f docker-compose.dev.yml
endif

ifeq ($(ENV),prod)
	COMPOSE_FILES += -f docker-compose.prod.yml
endif

# Default target
help: ## Show this help message
	@echo "🧠 Project Recall - Docker Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	@docker-compose $(COMPOSE_FILES) up --build

dev-d: ## Start development environment in detached mode
	@echo "🚀 Starting development environment (detached)..."
	@docker-compose $(COMPOSE_FILES) up --build -d

prod: ## Start production environment
	@echo "🚀 Starting production environment..."
	@ENV=prod $(MAKE) build
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

stop: ## Stop all services
	@echo "🛑 Stopping all services..."
	@docker-compose $(COMPOSE_FILES) down

clean: ## Stop and remove all containers, networks, and volumes
	@echo "🧹 Cleaning up..."
	@docker-compose $(COMPOSE_FILES) down -v --remove-orphans
	@docker system prune -f

build: ## Build all services
	@echo "🔨 Building services..."
	@docker-compose $(COMPOSE_FILES) build --no-cache

rebuild: ## Rebuild services from scratch
	@echo "🔨 Rebuilding services from scratch..."
	@docker-compose $(COMPOSE_FILES) build --no-cache --pull

logs: ## Show logs for all services
	@docker-compose $(COMPOSE_FILES) logs -f

logs-backend: ## Show backend logs
	@docker-compose $(COMPOSE_FILES) logs -f backend

logs-frontend: ## Show frontend logs
	@docker-compose $(COMPOSE_FILES) logs -f frontend

logs-worker: ## Show worker logs
	@docker-compose $(COMPOSE_FILES) logs -f worker

shell-backend: ## Access backend container shell
	@docker-compose $(COMPOSE_FILES) exec backend sh

shell-frontend: ## Access frontend container shell
	@docker-compose $(COMPOSE_FILES) exec frontend sh

shell-db: ## Access database shell
	@docker-compose $(COMPOSE_FILES) exec postgres psql -U postgres -d recall_db

test: ## Run tests in containers
	@echo "🧪 Running tests..."
	@docker-compose $(COMPOSE_FILES) exec backend npm test
	@docker-compose $(COMPOSE_FILES) exec frontend npm test

lint: ## Run linting in containers
	@echo "🔍 Running linting..."
	@docker-compose $(COMPOSE_FILES) exec backend npm run lint
	@docker-compose $(COMPOSE_FILES) exec frontend npm run lint

health: ## Check health of all services
	@echo "❤️ Checking service health..."
	@docker-compose $(COMPOSE_FILES) ps

stats: ## Show container resource usage
	@echo "📊 Container resource usage:"
	@docker stats --no-stream

backup-db: ## Backup database
	@echo "💾 Backing up database..."
	@mkdir -p ./backups
	@docker-compose $(COMPOSE_FILES) exec postgres pg_dump -U postgres recall_db > ./backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database (specify BACKUP_FILE)
	@echo "📥 Restoring database from $(BACKUP_FILE)..."
	@docker-compose $(COMPOSE_FILES) exec -T postgres psql -U postgres recall_db < $(BACKUP_FILE)

update: ## Update all dependencies and rebuild
	@echo "🔄 Updating dependencies and rebuilding..."
	@docker-compose $(COMPOSE_FILES) down
	@docker-compose $(COMPOSE_FILES) build --no-cache --pull
	@docker-compose $(COMPOSE_FILES) up -d

monitoring: ## Start monitoring stack (Prometheus + Grafana)
	@echo "📊 Starting monitoring stack..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d

monitoring-stop: ## Stop monitoring stack
	@echo "⏹️ Stopping monitoring stack..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring down

# Development shortcuts
install: ## Install dependencies in containers
	@echo "📦 Installing dependencies..."
	@docker-compose $(COMPOSE_FILES) exec backend npm install
	@docker-compose $(COMPOSE_FILES) exec frontend npm install

fresh-start: clean build dev-d ## Complete fresh start (clean + build + dev)

quick-restart: stop dev-d ## Quick restart without rebuilding