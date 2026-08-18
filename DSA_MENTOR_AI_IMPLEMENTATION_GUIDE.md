# DSA Mentor AI - Complete Implementation Guide

## 📋 Table of Contents
1. Project Overview & Architecture
2. Implementation Phases
3. Technology Stack Rationale
4. Folder Structure
5. Database Schema Design
6. API Specification
7. Development Workflow
8. Deployment Strategy

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React + TS)                │
│  Dashboard │ Chat │ Editor │ Analytics │ Admin Panel        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
┌─────────────────────────▼────────────────────────────────────┐
│                   API GATEWAY (FastAPI)                       │
│  Authentication │ Authorization │ Rate Limiting │ Logging    │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼───────┐ ┌─────▼─────┐ ┌──────▼──────────┐
│ Service Layer │ │ RAG Layer  │ │ AI Integration  │
│ • Auth        │ │ • Chunker  │ │ • Gemini API    │
│ • Problem     │ │ • Embedder │ │ • Groq API      │
│ • Learning    │ │ • Vector DB│ │ • LLM           │
│ • Analytics   │ │ • Retriever│ │ • Validators    │
└───────┬───────┘ └─────┬─────┘ └──────┬──────────┘
        │                │              │
┌───────┴────────────────┴──────────────┴──────────────┐
│           DATA ACCESS LAYER (Repository Pattern)     │
│  Problem Repo │ User Repo │ Submission Repo │ ...    │
└───────┬────────────────────────────────────────────┬─┘
        │                                             │
┌───────▼──────────────┐              ┌──────────────▼────┐
│  PostgreSQL (Neon)   │              │  Redis (Cache)    │
│  • Users             │              │  • Sessions       │
│  • Problems          │              │  • Analytics      │
│  • Submissions       │              │  • Embeddings     │
│  • Progress          │              │  • Rate Limits    │
└──────────────────────┘              └───────────────────┘

┌────────────────────────────────────────────────────────────┐
│              External Services                              │
│  ChromaDB/FAISS │ Cloudinary │ AWS S3 │ Sendgrid         │
└────────────────────────────────────────────────────────────┘
```

### Core Components

**Frontend:**
- React SPA with TypeScript
- State management: React Query + Zustand
- Real-time: WebSocket for chat
- Code editor: Monaco Editor
- UI: Shadcn UI + TailwindCSS

**Backend:**
- FastAPI with async handlers
- Service layer for business logic
- Repository pattern for data access
- RAG pipeline for knowledge retrieval
- JWT authentication

**AI/ML:**
- LLM integration (Gemini/Groq)
- Embedding model (BAAI/bge-small-en-v1.5)
- Vector database (ChromaDB/FAISS)
- Prompt engineering templates

**Database:**
- PostgreSQL for transactional data
- Redis for caching & sessions
- Vector DB for embeddings

---

## 2. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1)
**Duration:** 3-5 days
**Focus:** Core infrastructure and authentication

Tasks:
- [ ] Setup project structure & version control
- [ ] Configure development environment
- [ ] Setup FastAPI backend with middleware
- [ ] Implement JWT authentication
- [ ] Setup PostgreSQL schema
- [ ] Create React project & routing
- [ ] Implement login/register UI
- [ ] Write unit tests for auth

Deliverables:
- Working auth system (register, login, JWT refresh)
- Database migrations
- Environment configuration
- Docker setup for local development

---

### Phase 2: Core Features (Week 2-3)
**Duration:** 7-10 days
**Focus:** User management and basic problem features

Tasks:
- [ ] User profile management
- [ ] Problem CRUD operations
- [ ] Submission tracking
- [ ] Dashboard UI
- [ ] Progress tracking tables
- [ ] Basic analytics
- [ ] Repository pattern implementation
- [ ] Service layer for business logic

Deliverables:
- User profile endpoints
- Problem management endpoints
- Dashboard with stats
- Progress analytics
- Integration tests

---

### Phase 3: AI Integration - RAG Pipeline (Week 4)
**Duration:** 5-7 days
**Focus:** RAG system setup

Tasks:
- [ ] Document loader (PDFs, notes)
- [ ] Text chunking strategies
- [ ] Embedding generation
- [ ] Vector DB setup (ChromaDB)
- [ ] Semantic search implementation
- [ ] Hybrid search (keyword + semantic)
- [ ] RAG retriever service
- [ ] LLM prompt templates

Deliverables:
- RAG pipeline working end-to-end
- Document upload & processing
- Semantic search API
- Retrieval quality evaluation

---

### Phase 4: AI Tutor (Week 5)
**Duration:** 5-7 days
**Focus:** Interactive learning features

Tasks:
- [ ] AI DSA Tutor chatbot
- [ ] Human-in-the-Loop implementation
- [ ] Hint system (multi-step)
- [ ] Code explanation generation
- [ ] Complexity analysis
- [ ] WebSocket for real-time chat
- [ ] Conversation history storage
- [ ] Prompt engineering & validation

Deliverables:
- Working AI tutor
- Real-time chat interface
- Hint progression system
- Conversation history

---

### Phase 5: Advanced Features (Week 6-7)
**Duration:** 7-10 days
**Focus:** Analytics, gamification, and specializations

Tasks:
- [ ] Adaptive learning engine
- [ ] Personalized roadmap generation
- [ ] Code review system
- [ ] Interview mode
- [ ] Quiz generator
- [ ] Flashcard generation
- [ ] Gamification (XP, badges, leaderboard)
- [ ] Notifications system
- [ ] Analytics dashboards

Deliverables:
- Recommendation engine
- Code review functionality
- Interview mode working
- Gamification system
- Advanced analytics

---

### Phase 6: Admin & Deployment (Week 8)
**Duration:** 3-5 days
**Focus:** Admin panel and production deployment

Tasks:
- [ ] Admin panel for PDF management
- [ ] User management UI
- [ ] Analytics monitoring
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Environment configuration
- [ ] Load testing
- [ ] Security audit

Deliverables:
- Admin panel fully functional
- Docker images ready
- CI/CD pipeline working
- Deployment documentation
- Production ready

---

## 3. TECHNOLOGY STACK RATIONALE

### Frontend
| Tech | Why |
|------|-----|
| React | Industry standard, large ecosystem, component reusability |
| TypeScript | Type safety, better IDE support, catches errors early |
| TailwindCSS | Utility-first, rapid development, responsive design |
| React Query | Server state management, caching, automatic sync |
| Monaco Editor | Battle-tested, used in VS Code, syntax highlighting |
| Shadcn UI | Accessible, customizable, built on Radix UI |
| Framer Motion | Smooth animations, high performance |

### Backend
| Tech | Why |
|------|-----|
| FastAPI | Async support, automatic docs, fast development |
| Python | Rich ML/AI libraries, fast development |
| SQLAlchemy | ORM, flexible, supports complex queries |
| Pydantic | Data validation, JSON serialization, type hints |
| Alembic | Database migrations, version control for schema |

### AI/ML
| Tech | Why |
|------|-----|
| Gemini API | Free tier, powerful, multimodal (text + code) |
| Groq API | Faster inference, cost-effective |
| BAAI/bge-small | Lightweight, high quality embeddings |
| ChromaDB | Easy setup, Python native, good for RAG |
| FAISS | Scalable, production-ready, by Meta |

### Database
| Tech | Why |
|------|-----|
| PostgreSQL | Reliable, ACID compliant, rich features |
| Neon | Serverless PostgreSQL, auto-scaling, free tier |
| Redis | Fast caching, session management, rate limiting |

### Deployment
| Tech | Why |
|------|-----|
| Docker | Containerization, consistency across environments |
| GitHub Actions | Free CI/CD, integrated with GitHub |
| Render | Easy FastAPI deployment, free tier available |
| Vercel | Optimal for React, automatic deployments, free tier |

---

## 4. FOLDER STRUCTURE

```
dsa-mentor-ai/
├── frontend/                          # React TypeScript Application
│   ├── public/
│   ├── src/
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── auth/                  # Login, Register, PasswordReset
│   │   │   ├── dashboard/             # Dashboard widgets
│   │   │   ├── chat/                  # Chat interface
│   │   │   ├── editor/                # Code editor wrapper
│   │   │   ├── analytics/             # Charts, visualizations
│   │   │   ├── admin/                 # Admin panel
│   │   │   ├── common/                # Button, Card, Modal, etc.
│   │   │   └── visualizer/            # Tree, Graph, DSA visualizations
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProblems.ts
│   │   │   ├── useTutor.ts
│   │   │   └── useAnalytics.ts
│   │   ├── pages/                     # Page components (routing)
│   │   │   ├── HomePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TutorPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── store/                     # Zustand state management
│   │   │   ├── authStore.ts
│   │   │   ├── problemStore.ts
│   │   │   └── uiStore.ts
│   │   ├── services/                  # API client services
│   │   │   ├── api.ts                 # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── problemService.ts
│   │   │   ├── tutorService.ts
│   │   │   ├── analyticsService.ts
│   │   │   └── adminService.ts
│   │   ├── types/                     # TypeScript interfaces
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── problem.ts
│   │   │   ├── chat.ts
│   │   │   └── analytics.ts
│   │   ├── utils/                     # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── App.css
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/                           # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # Entry point
│   │   ├── config.py                  # Configuration
│   │   │
│   │   ├── api/                       # API Routes
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py        # /auth endpoints
│   │   │   │   │   ├── users.py       # /users endpoints
│   │   │   │   │   ├── problems.py    # /problems endpoints
│   │   │   │   │   ├── submissions.py # /submissions endpoints
│   │   │   │   │   ├── tutor.py       # /tutor endpoints (AI)
│   │   │   │   │   ├── rag.py         # /rag endpoints
│   │   │   │   │   ├── analytics.py   # /analytics endpoints
│   │   │   │   │   ├── quiz.py        # /quiz endpoints
│   │   │   │   │   ├── flashcards.py  # /flashcards endpoints
│   │   │   │   │   └── admin.py       # /admin endpoints
│   │   │   │   └── router.py          # API router aggregation
│   │   │
│   │   ├── services/                  # Business Logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── problem_service.py
│   │   │   ├── submission_service.py
│   │   │   ├── tutor_service.py       # AI tutor logic
│   │   │   ├── rag_service.py         # RAG pipeline
│   │   │   ├── embedding_service.py   # Embeddings
│   │   │   ├── analytics_service.py
│   │   │   ├── code_review_service.py
│   │   │   ├── quiz_service.py
│   │   │   ├── flashcard_service.py
│   │   │   └── adaptive_learning_service.py
│   │   │
│   │   ├── models/                    # SQLAlchemy Models (Database Schema)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── problem.py
│   │   │   ├── submission.py
│   │   │   ├── progress.py
│   │   │   ├── conversation.py
│   │   │   ├── document.py
│   │   │   ├── quiz.py
│   │   │   ├── flashcard.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── repositories/              # Data Access Layer
│   │   │   ├── __init__.py
│   │   │   ├── base_repository.py
│   │   │   ├── user_repository.py
│   │   │   ├── problem_repository.py
│   │   │   ├── submission_repository.py
│   │   │   ├── progress_repository.py
│   │   │   ├── conversation_repository.py
│   │   │   └── document_repository.py
│   │   │
│   │   ├── core/                      # Core Utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py            # JWT, Password hashing
│   │   │   ├── exceptions.py          # Custom exceptions
│   │   │   ├── logging.py             # Logging setup
│   │   │   └── constants.py
│   │   │
│   │   ├── ai/                        # AI/ML Integration
│   │   │   ├── __init__.py
│   │   │   ├── llm_client.py          # Gemini/Groq client
│   │   │   ├── prompt_templates.py    # Prompt engineering
│   │   │   ├── rag_pipeline.py        # RAG orchestration
│   │   │   │   ├── document_loader.py
│   │   │   │   ├── chunking.py
│   │   │   │   ├── embedder.py
│   │   │   │   └── retriever.py
│   │   │   ├── validators.py          # Output validation
│   │   │   └── tools.py               # Tool calling
│   │   │
│   │   ├── schemas/                   # Pydantic Models (Request/Response)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── problem.py
│   │   │   ├── submission.py
│   │   │   ├── tutor.py
│   │   │   ├── analytics.py
│   │   │   └── common.py
│   │   │
│   │   ├── middleware/                # Custom middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py
│   │   │   ├── error_handler.py
│   │   │   └── logging_middleware.py
│   │   │
│   │   └── dependencies.py            # Dependency injection
│   │
│   ├── tests/                         # Unit & Integration Tests
│   │   ├── __init__.py
│   │   ├── conftest.py                # Pytest fixtures
│   │   ├── test_auth.py
│   │   ├── test_problems.py
│   │   ├── test_tutor.py
│   │   ├── test_rag.py
│   │   └── test_analytics.py
│   │
│   ├── migrations/                    # Alembic migrations
│   │   ├── versions/
│   │   ├── env.py
│   │   └── script.py.mako
│   │
│   ├── .env.example
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── alembic.ini
│
├── shared/                            # Shared utilities
│   ├── constants.ts/py
│   ├── types.ts/py
│   └── utils.ts/py
│
├── docs/                              # Documentation
│   ├── API.md                         # API documentation
│   ├── ARCHITECTURE.md                # Architecture overview
│   ├── DATABASE.md                    # Database schema
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── ER_DIAGRAM.md                  # Database ER diagram
│   └── README.md
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml            # Frontend CI
│       └── backend-ci.yml             # Backend CI
│
├── docker-compose.yml                 # Local development
├── .gitignore
├── README.md
└── LICENSE
```

---

## 5. DATABASE SCHEMA DESIGN

### Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    bio TEXT,
    avatar_url VARCHAR(255),
    company VARCHAR(100),
    experience_level ENUM('Beginner', 'Intermediate', 'Advanced'),
    preferred_languages TEXT[], -- ['Python', 'Java', ...]
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems Table
CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard') NOT NULL,
    topic VARCHAR(100), -- 'Arrays', 'Trees', 'DP', etc.
    tags TEXT[], -- ['Array', 'Two Pointer', ...]
    examples JSONB, -- [{input, output, explanation}]
    constraints TEXT,
    function_signature JSONB, -- {'python': '...', 'java': '...'}
    editorial_content TEXT,
    video_url VARCHAR(255),
    company_tags TEXT[], -- ['Amazon', 'Google', ...]
    follow_up TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Submissions Table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    problem_id UUID NOT NULL REFERENCES problems(id),
    code TEXT NOT NULL,
    language VARCHAR(20),
    status ENUM('Pending', 'Running', 'Accepted', 'Wrong Answer', 'Runtime Error') DEFAULT 'Pending',
    runtime_ms INTEGER,
    memory_mb FLOAT,
    test_cases_passed INTEGER,
    test_cases_total INTEGER,
    error_message TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, problem_id) -- One submission per user per problem
);

-- Progress Table
CREATE TABLE progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_solved_at TIMESTAMP,
    total_attempts INTEGER DEFAULT 0,
    accuracy_percentage FLOAT DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Topic Accuracy Table
CREATE TABLE topic_accuracy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    topic VARCHAR(100) NOT NULL,
    solved_count INTEGER DEFAULT 0,
    attempted_count INTEGER DEFAULT 0,
    accuracy_percentage FLOAT DEFAULT 0,
    average_time_minutes FLOAT DEFAULT 0,
    last_attempted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversations Table (AI Tutor)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    problem_id UUID REFERENCES problems(id),
    title VARCHAR(255),
    messages JSONB, -- [{role: 'user'|'assistant', content: '...', timestamp}]
    current_hint_level INTEGER DEFAULT 0, -- 0-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents Table (For RAG)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(20), -- 'pdf', 'txt', 'md'
    content TEXT,
    chunks_count INTEGER DEFAULT 0,
    is_indexed BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document Chunks Table (For RAG)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384), -- For ChromaDB integration
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    topic VARCHAR(100) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard'),
    questions JSONB, -- [{id, type, question, options, correct_answer}]
    answers JSONB, -- [{question_id, user_answer}]
    score FLOAT DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Flashcards Table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    topic VARCHAR(100) NOT NULL,
    front TEXT NOT NULL, -- Question/prompt
    back TEXT NOT NULL, -- Answer/explanation
    difficulty ENUM('Easy', 'Medium', 'Hard'),
    last_reviewed_at TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    retention_level FLOAT DEFAULT 0, -- 0-1
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Learning Path Table
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    path_type VARCHAR(50), -- 'Beginner', 'Amazon', 'Google', etc.
    topics JSONB, -- [{name, status: 'Not Started'|'In Progress'|'Completed'}]
    current_topic VARCHAR(100),
    progress_percentage FLOAT DEFAULT 0,
    estimated_completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gamification Table
CREATE TABLE gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    xp_points INTEGER DEFAULT 0,
    badges TEXT[], -- ['First Problem', 'Streak 7', ...]
    leaderboard_rank INTEGER,
    total_challenges_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_topic_accuracy_user_id ON topic_accuracy(user_id);
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
```

### ER Diagram
```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ username        │
│ password_hash   │
│ full_name       │
│ avatar_url      │
│ experience_level│
└─────────────────┘
       │ 1
       │
       ├─────────────────────────┬──────────────────────┬─────────────────┐
       │                         │                      │                 │
       │ N                       │ N                    │ N               │ N
       ▼                         ▼                      ▼                 ▼
┌─────────────────┐    ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐
│  SUBMISSIONS    │    │  CONVERSATIONS   │  │ LEARNING_PATHS   │  │ GAMIFICATION │
├─────────────────┤    ├──────────────────┤  ├──────────────────┤  ├──────────────┤
│ id (PK)         │    │ id (PK)          │  │ id (PK)          │  │ id (PK)      │
│ user_id (FK)    │    │ user_id (FK)     │  │ user_id (FK)     │  │ user_id (FK) │
│ problem_id (FK) │    │ problem_id (FK)  │  │ path_type        │  │ xp_points    │
│ code            │    │ messages         │  │ topics           │  │ badges       │
│ status          │    │ current_hint_lvl │  │ progress_%       │  │ leaderboard_ │
│ test_results    │    │ created_at       │  │ created_at       │  │ rank         │
└─────────────────┘    └──────────────────┘  └──────────────────┘  └──────────────┘
       ▲                        │
       │                        │
       │ N                      │ N (Problem)
       │                        │
       └────────────────────────┤
                      │ 1       │
                      │         │
                  ┌───┴─────────┴────┐
                  │    PROBLEMS      │
                  ├──────────────────┤
                  │ id (PK)          │
                  │ title            │
                  │ description      │
                  │ difficulty       │
                  │ topic            │
                  │ tags             │
                  │ company_tags     │
                  └──────────────────┘

┌─────────────────────┐
│  PROGRESS           │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ total_solved        │
│ easy/medium/hard    │
│ current_streak      │
│ accuracy_%          │
└─────────────────────┘

┌──────────────────────┐
│  TOPIC_ACCURACY      │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ topic                │
│ solved_count         │
│ attempted_count      │
│ accuracy_%           │
│ avg_time_minutes     │
└──────────────────────┘

┌──────────────────────┐
│  DOCUMENTS           │
├──────────────────────┤
│ id (PK)              │
│ title                │
│ file_url             │
│ content              │
│ chunks_count         │
│ is_indexed           │
│ uploaded_by (FK)     │
└──────────────────────┘
       │ 1
       │
       │ N
       ▼
┌─────────────────────────┐
│  DOCUMENT_CHUNKS        │
├─────────────────────────┤
│ id (PK)                 │
│ document_id (FK)        │
│ chunk_index             │
│ content                 │
│ embedding (VECTOR)      │
│ metadata                │
└─────────────────────────┘
```

---

## 6. API SPECIFICATION

### Authentication Endpoints
```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login with email/password
POST   /api/v1/auth/refresh           # Refresh JWT token
POST   /api/v1/auth/logout            # Logout user
POST   /api/v1/auth/forgot-password   # Request password reset
POST   /api/v1/auth/reset-password    # Reset password with token
```

### User Endpoints
```
GET    /api/v1/users/me               # Get current user profile
PUT    /api/v1/users/me               # Update user profile
GET    /api/v1/users/:id              # Get user profile by ID
DELETE /api/v1/users/:id              # Delete user account
```

### Problems Endpoints
```
GET    /api/v1/problems               # List problems (with filters)
GET    /api/v1/problems/:id           # Get problem details
POST   /api/v1/problems               # Create problem (admin)
PUT    /api/v1/problems/:id           # Update problem (admin)
DELETE /api/v1/problems/:id           # Delete problem (admin)
GET    /api/v1/problems/topics        # Get all topics
GET    /api/v1/problems/difficulty/:level # Problems by difficulty
```

### Submissions Endpoints
```
POST   /api/v1/submissions            # Submit code
GET    /api/v1/submissions            # Get user submissions
GET    /api/v1/submissions/:id        # Get submission details
```

### AI Tutor Endpoints
```
POST   /api/v1/tutor/chat             # Send message to AI tutor
GET    /api/v1/tutor/conversations/:id # Get conversation history
POST   /api/v1/tutor/hint             # Get next hint
POST   /api/v1/tutor/explain          # Explain concept
POST   /api/v1/tutor/code-review      # Code review from AI
```

### RAG Endpoints
```
POST   /api/v1/rag/search             # Semantic/hybrid search
POST   /api/v1/rag/upload             # Upload document
GET    /api/v1/rag/documents          # List documents
DELETE /api/v1/rag/documents/:id      # Delete document
```

### Analytics Endpoints
```
GET    /api/v1/analytics/dashboard    # Get dashboard stats
GET    /api/v1/analytics/progress     # Get progress data
GET    /api/v1/analytics/topics       # Get topic-wise analytics
GET    /api/v1/analytics/chart-data   # Data for charts
```

### Quiz Endpoints
```
POST   /api/v1/quiz/generate          # Generate quiz
POST   /api/v1/quiz/submit            # Submit quiz answers
GET    /api/v1/quiz/history           # Get quiz history
```

### Flashcard Endpoints
```
POST   /api/v1/flashcards/generate    # Generate flashcards
GET    /api/v1/flashcards/:topic      # Get flashcards by topic
PUT    /api/v1/flashcards/:id/review  # Mark flashcard as reviewed
```

### Admin Endpoints
```
GET    /api/v1/admin/users            # List all users
POST   /api/v1/admin/documents        # Upload documents
GET    /api/v1/admin/analytics        # Admin analytics
DELETE /api/v1/admin/users/:id        # Delete user (admin)
```

---

## 7. DEVELOPMENT WORKFLOW

### Local Setup
```bash
# Clone repository
git clone https://github.com/yourname/dsa-mentor-ai.git
cd dsa-mentor-ai

# Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# Setup frontend
cd ../frontend
npm install
cp .env.example .env.local

# Run with Docker Compose
docker-compose up -d

# Run migrations
alembic upgrade head
```

### Development Commands
```bash
# Backend
uvicorn app.main:app --reload

# Frontend
npm run dev

# Tests
pytest app/tests/

# Code quality
black app/
flake8 app/
mypy app/
```

---

## 8. DEPLOYMENT STRATEGY

### Frontend (Vercel)
- Connect GitHub repository
- Set environment variables
- Automatic deployment on push to main
- CDN distribution
- Serverless functions for API

### Backend (Render)
- Push to GitHub triggers deployment
- Docker container deployment
- Environment variables configuration
- PostgreSQL database (Neon)
- Redis instance
- Auto-scaling enabled

### CI/CD Pipeline (GitHub Actions)
```yaml
# On push to main/dev
- Run tests
- Code quality checks
- Build Docker images
- Deploy to staging/production
- Run smoke tests
```

---

## 9. SECURITY CONSIDERATIONS

- JWT tokens with refresh mechanism
- Password hashing (bcrypt)
- CORS configuration
- Rate limiting on API endpoints
- Input validation (Pydantic)
- SQL injection prevention (SQLAlchemy ORM)
- HTTPS enforcement
- Environment variables for secrets
- Admin authentication
- User data encryption

---

## 10. MONITORING & LOGGING

- Structured logging (Python logging)
- Error tracking (Sentry)
- Performance monitoring
- User analytics (Mixpanel)
- API response time tracking
- Database query optimization
- Infrastructure monitoring

---

## Next Steps

1. **Start with Phase 1:** Setup project structure and auth
2. **Review database schema:** Understand relationships
3. **Implement core APIs:** Problems, submissions, users
4. **Add RAG pipeline:** Document loading and retrieval
5. **Integrate AI models:** Gemini/Groq API
6. **Build frontend:** Pages and components
7. **Add advanced features:** Analytics, gamification
8. **Deploy:** Docker, CI/CD, production

This comprehensive plan provides the roadmap for building DSA Mentor AI. Each phase builds upon the previous, ensuring a solid foundation for a production-ready application.
