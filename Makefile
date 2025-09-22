.PHONY: help dev prod stop clean build logs test lint health

ENV ?= dev
COMPOSE_FILES = -f docker-compose.yml

ifeq ($(ENV),dev)
	COMPOSE_FILES += -f docker-compose.dev.yml
endif

ifeq ($(ENV),prod)
	COMPOSE_FILES += -f docker-compose.prod.yml
endif

help: 
	@echo "🧠 Project Recall - Docker Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: 
	@echo "🚀 Starting development environment..."
	@docker-compose $(COMPOSE_FILES) up --build

dev-d: 
	@echo "🚀 Starting development environment (detached)..."
	@docker-compose $(COMPOSE_FILES) up --build -d

prod:
	@echo "🚀 Starting production environment..."
	@ENV=prod $(MAKE) build
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

stop: 
	@echo "🛑 Stopping all services..."
	@docker-compose $(COMPOSE_FILES) down

clean: 
	@echo "🧹 Cleaning up..."
	@docker-compose $(COMPOSE_FILES) down -v --remove-orphans
	@docker system prune -f

build: 
	@echo "🔨 Building services..."
	@docker-compose $(COMPOSE_FILES) build --no-cache

rebuild: 
	@echo "🔨 Rebuilding services from scratch..."
	@docker-compose $(COMPOSE_FILES) build --no-cache --pull

logs:
	@docker-compose $(COMPOSE_FILES) logs -f

logs-backend: 
	@docker-compose $(COMPOSE_FILES) logs -f backend

logs-frontend: 
	@docker-compose $(COMPOSE_FILES) logs -f frontend

logs-worker: 
	@docker-compose $(COMPOSE_FILES) logs -f worker

shell-backend: 
	@docker-compose $(COMPOSE_FILES) exec backend sh

shell-frontend: 
	@docker-compose $(COMPOSE_FILES) exec frontend sh

shell-db: 
	@docker-compose $(COMPOSE_FILES) exec postgres psql -U postgres -d recall_db

test: 
	@echo "🧪 Running tests..."
	@docker-compose $(COMPOSE_FILES) exec backend npm test
	@docker-compose $(COMPOSE_FILES) exec frontend npm test

lint: 
	@echo "🔍 Running linting..."
	@docker-compose $(COMPOSE_FILES) exec backend npm run lint
	@docker-compose $(COMPOSE_FILES) exec frontend npm run lint

health: 
	@echo "❤️ Checking service health..."
	@docker-compose $(COMPOSE_FILES) ps

stats: 
	@echo "📊 Container resource usage:"
	@docker stats --no-stream

backup-db: 
	@echo "💾 Backing up database..."
	@mkdir -p ./backups
	@docker-compose $(COMPOSE_FILES) exec postgres pg_dump -U postgres recall_db > ./backups/db_backup_$(shell date +%Y%m%d_%H%M%S).sql

restore-db:
	@echo "📥 Restoring database from $(BACKUP_FILE)..."
	@docker-compose $(COMPOSE_FILES) exec -T postgres psql -U postgres recall_db < $(BACKUP_FILE)

update: 
	@echo "🔄 Updating dependencies and rebuilding..."
	@docker-compose $(COMPOSE_FILES) down
	@docker-compose $(COMPOSE_FILES) build --no-cache --pull
	@docker-compose $(COMPOSE_FILES) up -d

monitoring:
	@echo "📊 Starting monitoring stack..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring up -d

monitoring-stop:
	@echo "⏹️ Stopping monitoring stack..."
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile monitoring down

install: 
	@echo "📦 Installing dependencies..."
	@docker-compose $(COMPOSE_FILES) exec backend npm install
	@docker-compose $(COMPOSE_FILES) exec frontend npm install

fresh-start: clean build dev-d 

quick-restart: stop dev-d 