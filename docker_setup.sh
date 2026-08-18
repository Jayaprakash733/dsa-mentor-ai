#!/bin/bash

# DSA Mentor AI - Docker Setup
# This file contains Docker configuration and setup scripts

# ============================================================================
# 1. BACKEND DOCKERFILE
# ============================================================================

cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# ============================================================================
# 2. FRONTEND DOCKERFILE
# ============================================================================

cat > frontend/Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run static files
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

# ============================================================================
# 3. DOCKER COMPOSE FILE
# ============================================================================

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: dsa_postgres
    environment:
      POSTGRES_USER: ${DB_USER:-dsa_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-dsa_password}
      POSTGRES_DB: ${DB_NAME:-dsa_mentor}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_schema.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-dsa_user}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dsa_network

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: dsa_redis
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dsa_network

  # ChromaDB Vector Database
  chromadb:
    image: ghcr.io/chroma-core/chroma:latest
    container_name: dsa_chromadb
    environment:
      CHROMA_DB_IMPL: duckdb+parquet
      PERSIST_DIRECTORY: /chroma/data
    ports:
      - "${CHROMA_PORT:-8001}:8000"
    volumes:
      - chromadb_data:/chroma/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/api/v1/heartbeat || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - dsa_network

  # FastAPI Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dsa_backend
    environment:
      DATABASE_URL: postgresql://${DB_USER:-dsa_user}:${DB_PASSWORD:-dsa_password}@postgres:5432/${DB_NAME:-dsa_mentor}
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY:-your-secret-key-change-in-production}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
      PREFERRED_LLM: ${PREFERRED_LLM:-gemini}
      DEBUG: ${DEBUG:-false}
      CHROMA_DB_PATH: /app/chroma_data
    ports:
      - "${BACKEND_PORT:-8000}:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      chromadb:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - chroma_app_data:/app/chroma_data
    networks:
      - dsa_network
    command: sh -c "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: dsa_frontend
    environment:
      REACT_APP_API_URL: http://localhost:8000
      REACT_APP_ENV: ${ENV:-development}
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    networks:
      - dsa_network

  # Nginx Reverse Proxy (Optional)
  nginx:
    image: nginx:alpine
    container_name: dsa_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - dsa_network

volumes:
  postgres_data:
  redis_data:
  chromadb_data:
  chroma_app_data:

networks:
  dsa_network:
    driver: bridge
EOF

# ============================================================================
# 4. NGINX CONFIGURATION
# ============================================================================

cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name _;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # CORS Headers
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

        # API Routes
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 300s;
            proxy_connect_timeout 300s;

            # WebSocket Support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Health Check Endpoint
        location /health {
            proxy_pass http://backend;
            access_log off;
        }

        # Frontend Routes
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # SPA routing
            error_page 404 =200 /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

# ============================================================================
# 5. ENVIRONMENT FILE
# ============================================================================

cat > .env.example << 'EOF'
# Environment Configuration for DSA Mentor AI

# Database
DB_USER=dsa_user
DB_PASSWORD=dsa_password
DB_NAME=dsa_mentor
DB_PORT=5432
DATABASE_URL=postgresql://dsa_user:dsa_password@postgres:5432/dsa_mentor

# Redis
REDIS_URL=redis://redis:6379/0
REDIS_PORT=6379

# JWT & Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AI/ML APIs
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
PREFERRED_LLM=gemini
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5

# Storage (Cloudinary or AWS S3)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET=dsa-mentor-bucket

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password

# ChromaDB
CHROMA_DB_PATH=./chroma_data
CHROMA_PORT=8001

# Application
DEBUG=false
ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8000

# Ports
FRONTEND_PORT=3000
BACKEND_PORT=8000
CHROMA_PORT=8001

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600

# Logging
LOG_LEVEL=INFO
EOF

# ============================================================================
# 6. BUILD AND RUN SCRIPTS
# ============================================================================

cat > scripts/build.sh << 'EOF'
#!/bin/bash
set -e

echo "🔨 Building DSA Mentor AI..."

# Build images
docker-compose build --no-cache

echo "✅ Build completed successfully!"
EOF

cat > scripts/up.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting DSA Mentor AI..."

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  .env file created from .env.example. Please configure it!"
fi

# Start services
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Run migrations
docker-compose exec -T backend alembic upgrade head

echo "✅ DSA Mentor AI is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
EOF

cat > scripts/down.sh << 'EOF'
#!/bin/bash
set -e

echo "🛑 Stopping DSA Mentor AI..."

docker-compose down

echo "✅ Services stopped!"
EOF

cat > scripts/logs.sh << 'EOF'
#!/bin/bash

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: ./scripts/logs.sh [backend|frontend|postgres|redis|chromadb]"
    exit 1
fi

docker-compose logs -f $SERVICE
EOF

cat > scripts/reset.sh << 'EOF'
#!/bin/bash
set -e

echo "🗑️  Resetting DSA Mentor AI..."

docker-compose down -v

echo "✅ All data cleared!"
echo "Run './scripts/up.sh' to start fresh"
EOF

# Make scripts executable
chmod +x scripts/*.sh

echo "✅ Docker setup files created successfully!"
echo ""
echo "📝 Files created:"
echo "  - backend/Dockerfile"
echo "  - frontend/Dockerfile"
echo "  - docker-compose.yml"
echo "  - nginx.conf"
echo "  - .env.example"
echo "  - scripts/build.sh"
echo "  - scripts/up.sh"
echo "  - scripts/down.sh"
echo "  - scripts/logs.sh"
echo "  - scripts/reset.sh"
echo ""
echo "🚀 Quick Start:"
echo "  1. cp .env.example .env && nano .env  (configure)"
echo "  2. ./scripts/build.sh                  (build images)"
echo "  3. ./scripts/up.sh                     (start services)"
echo "  4. ./scripts/down.sh                   (stop services)"
