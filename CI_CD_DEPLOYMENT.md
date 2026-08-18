# DSA Mentor AI - CI/CD & Deployment Guide

## 🔄 CI/CD Pipeline Overview

Automated testing, building, and deployment using GitHub Actions.

### Pipeline Stages
1. **Trigger** - On push/PR to main/dev branches
2. **Lint & Type Check** - Code quality verification
3. **Test** - Unit and integration tests
4. **Build** - Create Docker images
5. **Deploy** - Push to registries and deploy

---

## 📝 GitHub Actions Workflows

### Backend CI Workflow

**File**: `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, dev]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci.yml'
  pull_request:
    branches: [main, dev]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Lint with flake8
        run: |
          cd backend
          flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
          flake8 app/ --count --exit-zero --max-complexity=10 --max-line-length=88

      - name: Type check with mypy
        run: |
          cd backend
          mypy app/ --ignore-missing-imports || true

      - name: Format check with black
        run: |
          cd backend
          black --check app/ || true

      - name: Run tests
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost/test_db
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test_secret_key
        run: |
          cd backend
          pytest app/tests/ -v --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.xml
          flags: backend

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push backend image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/dsa-mentor-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/dsa-mentor-backend:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/dsa-mentor-backend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/dsa-mentor-backend:buildcache,mode=max
```

### Frontend CI Workflow

**File**: `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, dev]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci.yml'
  pull_request:
    branches: [main, dev]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Lint
        run: |
          cd frontend
          npm run lint

      - name: Type check
        run: |
          cd frontend
          npm run type-check

      - name: Run tests
        run: |
          cd frontend
          npm run test -- --coverage

      - name: Build
        run: |
          cd frontend
          npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/coverage-final.json
          flags: frontend

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push frontend image
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/dsa-mentor-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/dsa-mentor-frontend:${{ github.sha }}
          cache-from: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/dsa-mentor-frontend:buildcache
          cache-to: type=registry,ref=${{ secrets.DOCKER_USERNAME }}/dsa-mentor-frontend:buildcache,mode=max
```

### Deployment Workflow

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
          RENDER_BACKEND_SERVICE_ID: ${{ secrets.RENDER_BACKEND_SERVICE_ID }}
        run: |
          curl -X POST https://api.render.com/v1/services/$RENDER_BACKEND_SERVICE_ID/deploys \
            -H "Authorization: Bearer $RENDER_API_KEY" \
            -H "Content-Type: application/json" \
            -d '{"clearCache": "clear"}'

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  notify:
    needs: [deploy-backend, deploy-frontend]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Notify Slack
        uses: slackapi/slack-github-action@v1.24.0
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Deployment Status",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "Backend: ${{ needs.deploy-backend.result }}\nFrontend: ${{ needs.deploy-frontend.result }}"
                  }
                }
              ]
            }
```

---

## 🌐 Deployment Instructions

### Prerequisites
- GitHub repository with Actions enabled
- Docker Hub account
- Render account (backend)
- Vercel account (frontend)
- Neon account (PostgreSQL)
- Upstash account (Redis)

### Step 1: Setup Secrets

Add to GitHub Secrets (Settings → Secrets and variables → Actions):

```
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
RENDER_API_KEY=your_render_api_key
RENDER_BACKEND_SERVICE_ID=your_backend_service_id
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_project_id
SLACK_WEBHOOK=your_slack_webhook_url
```

### Step 2: Create Render Service

1. Go to Render.com
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   ```
   Name: dsa-mentor-backend
   Environment: Docker
   Instance Type: Standard
   Auto-Deploy: Yes
   ```

5. Add Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   GEMINI_API_KEY=...
   SECRET_KEY=...
   ```

### Step 3: Create Vercel Project

1. Go to Vercel.com
2. Import GitHub repository
3. Configure:
   ```
   Framework: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

4. Add Environment Variables:
   ```
   VITE_API_URL=https://dsa-mentor-backend.onrender.com
   ```

### Step 4: Configure Database

Using Neon (Serverless PostgreSQL):

1. Create account at neon.tech
2. Create project
3. Copy connection string to `DATABASE_URL`
4. Run migrations:
   ```bash
   DATABASE_URL=your_neon_url alembic upgrade head
   ```

### Step 5: Setup Redis

Using Upstash (Serverless Redis):

1. Create account at upstash.com
2. Create Redis database
3. Copy connection URL to `REDIS_URL`

### Step 6: Deploy

```bash
# Commit and push to main branch
git add .
git commit -m "Deploy DSA Mentor AI"
git push origin main

# GitHub Actions will automatically:
# 1. Run tests
# 2. Build Docker images
# 3. Push to Docker Hub
# 4. Deploy to Render and Vercel
```

---

## 📊 Monitoring & Logging

### Render Logs
```bash
# View logs in dashboard or CLI
render logs -service dsa-mentor-backend

# Stream logs
render logs -service dsa-mentor-backend -follow
```

### Application Monitoring

**Backend Monitoring** (Add to `app/main.py`):

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("ENV", "production")
)
```

**Frontend Monitoring** (Add to `src/main.tsx`):

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENV,
  tracesSampleRate: 1.0,
});
```

### Health Checks

Backend health endpoint:

```bash
curl https://dsa-mentor-backend.onrender.com/health
```

Configure Render to ping health endpoint every 60 seconds.

---

## 🔄 Blue-Green Deployment

For zero-downtime deployments:

1. Create two identical environments
2. Deploy to inactive environment
3. Run tests against new version
4. Switch traffic to new version
5. Keep old version as rollback

### Render Implementation

```yaml
# .github/workflows/blue-green-deploy.yml
name: Blue-Green Deployment

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          
      - name: Run smoke tests
        run: |
          # Test against staging
          
      - name: Switch traffic
        run: |
          # Switch to new version
          
      - name: Monitor
        run: |
          # Monitor for errors
```

---

## 🔐 Security in CI/CD

### Secrets Management
- Use GitHub Secrets (not in code)
- Rotate secrets quarterly
- Use specific tokens, not user credentials
- Implement secret scanning

### Code Security
```yaml
# Add code scanning
- name: Run security checks
  run: |
    cd backend
    pip install bandit
    bandit -r app/ -f json -o bandit-report.json || true
```

### Dependency Scanning
```bash
# Backend
pip install safety
safety check -r requirements.txt

# Frontend
npm audit
npm audit fix
```

---

## 📈 Performance Optimization

### Build Optimization

**Frontend**:
```bash
# Enable minification
npm run build -- --minify

# Analyze bundle size
npm run build -- --analyze

# Use dynamic imports
import { lazy } from 'react';
const Dashboard = lazy(() => import('./pages/DashboardPage'));
```

**Backend**:
```bash
# Multi-stage Docker build
# Install only production dependencies
pip install --no-cache-dir -r requirements.txt
```

### Caching Strategy

```yaml
# GitHub Actions cache
- uses: actions/cache@v3
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

---

## 🔄 Rollback Procedures

### If deployment fails:

```bash
# Render
render rollback -service dsa-mentor-backend

# Vercel
vercel rollback

# Manual rollback
git revert <commit-hash>
git push origin main
```

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Frontend builds without errors
- [ ] Performance tests passed
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## 🚨 Incident Response

### If Production Issue Occurs:

1. **Immediate Actions**:
   ```bash
   # Check service status
   curl https://dsa-mentor-backend.onrender.com/health
   
   # View logs
   render logs -service dsa-mentor-backend -follow
   ```

2. **Rollback if Critical**:
   ```bash
   render rollback -service dsa-mentor-backend
   ```

3. **Investigation**:
   - Check Sentry for errors
   - Review metrics in Datadog
   - Check database connections
   - Monitor resource usage

4. **Communication**:
   - Notify team on Slack
   - Update status page
   - Send user notification if needed

5. **Post-Incident**:
   - Conduct root cause analysis
   - Create issue for fix
   - Document lessons learned
   - Implement prevention measures

---

## 📚 Additional Resources

- [Render Deployment Guide](https://render.com/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [PostgreSQL Neon Docs](https://neon.tech/docs)

---

**Last Updated**: January 2024
**Version**: 1.0.0
