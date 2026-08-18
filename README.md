# DSA Mentor AI 🤖📚

> An AI-powered learning platform that teaches Data Structures and Algorithms through personalized guidance, intelligent tutoring, and adaptive learning.

[![Python 3.11](https://img.shields.io/badge/Python-3.11+-blue)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/React-18+-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🎯 Project Overview

DSA Mentor AI is a comprehensive learning platform that revolutionizes how students learn Data Structures and Algorithms. Unlike traditional platforms like LeetCode that only judge solutions, DSA Mentor AI actively teaches through:

- **AI DSA Tutor**: Interactive chatbot that explains concepts, provides hints, and guides problem-solving
- **RAG Pipeline**: Intelligent retrieval system for accessing comprehensive DSA knowledge
- **Adaptive Learning**: Personalized recommendations based on performance metrics
- **Human-in-the-Loop**: Progressive hint system that encourages learning, not just copying
- **Code Review**: AI-powered analysis and improvement suggestions
- **Gamification**: XP, badges, streaks, and leaderboards
- **Progress Analytics**: Comprehensive insights and interview readiness prediction

## 🌟 Key Features

### 1. **User Management**
- Secure registration and authentication (JWT)
- User profiles with experience levels
- Preference management for languages and learning style

### 2. **Problem Library**
- 1000+ DSA problems (Easy, Medium, Hard)
- Company-specific filters (Google, Amazon, Meta, etc.)
- Tags and topic classification
- Video explanations and editorials

### 3. **AI Tutor** 🤖
- Natural language interaction
- Step-by-step explanations
- Progressive hint system (6 levels)
- Complexity analysis
- Code review and suggestions

### 4. **Learning Path** 📖
- Personalized roadmaps
- Beginner → Advanced progression
- Company-specific tracks (Amazon, Google, etc.)
- Topic recommendations

### 5. **RAG Knowledge Base**
- Upload custom learning materials (PDFs, notes)
- Semantic search across documents
- Automatic indexing and chunking
- Vector database integration

### 6. **Code Editor** 💻
- Monaco Editor with syntax highlighting
- Multi-language support (Python, Java, C++, JS, C)
- Real-time testing
- Solution comparison

### 7. **Analytics Dashboard** 📊
- Problems solved by difficulty
- Topic-wise accuracy
- Daily/weekly progress charts
- Interview readiness score
- Global ranking

### 8. **Gamification** 🎮
- XP points for each solved problem
- Badges and achievements
- Daily challenges
- Leaderboard
- Streak tracking

### 9. **Quiz & Flashcards** ✨
- Auto-generated quizzes
- Spaced repetition for flashcards
- MCQs, coding questions, fill-in-the-blanks
- Difficulty levels

### 10. **Interview Mode** 🎤
- Mock interview sessions
- Timed coding challenges
- AI evaluation and feedback
- Score reports

## 🛠️ Technology Stack

### Frontend
- **React 18** + TypeScript for type safety
- **Vite** for fast development
- **TailwindCSS** for styling
- **Monaco Editor** for code editing
- **React Query** for server state
- **Zustand** for client state
- **Framer Motion** for animations
- **Recharts** for analytics

### Backend
- **FastAPI** for async REST APIs
- **Python 3.11** with async/await
- **SQLAlchemy** ORM for database operations
- **Pydantic** for data validation
- **JWT** for authentication

### Database
- **PostgreSQL** (Neon) for relational data
- **Redis** for caching and sessions
- **ChromaDB/FAISS** for vector embeddings

### AI/ML
- **Google Gemini API** or **Groq API** for LLM
- **BAAI/bge-small-en-v1.5** for embeddings
- **Sentence Transformers** for embeddings
- **LangChain** for RAG pipeline

### Deployment
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **Render** or **Railway** for backend
- **Vercel** for frontend
- **Neon** for PostgreSQL
- **Upstash** for Redis

## 📋 Requirements

### System Requirements
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+

### API Keys Needed
- Google Gemini API (free tier available)
- Groq API (free tier available)
- Cloudinary (for file uploads)
- AWS S3 (optional, for large files)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/dsa-mentor-ai.git
cd dsa-mentor-ai
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env

# Required values:
# - GEMINI_API_KEY or GROQ_API_KEY
# - SECRET_KEY (generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")
# - DATABASE_URL (from Neon)
```

### 3. Start with Docker Compose
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed sample data (optional)
docker-compose exec backend python -m app.seed_data
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📁 Project Structure

```
dsa-mentor-ai/
├── frontend/                    # React TypeScript Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client
│   │   ├── store/              # Zustand stores
│   │   └── types/              # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── api/                # API endpoints
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   ├── repositories/       # Data access layer
│   │   ├── ai/                 # AI/ML integration
│   │   ├── core/               # Core utilities
│   │   └── main.py             # Entry point
│   ├── tests/
│   ├── migrations/             # Alembic migrations
│   ├── Dockerfile
│   └── requirements.txt
│
├── docs/                        # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Development Setup

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload

# Run tests
pytest

# Code quality
black .
flake8 .
mypy .
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Linting
npm run lint
```

## 📚 API Documentation

See [API_DOCUMENTATION.md](./docs/API.md) for detailed API reference.

### Quick API Examples

**Register User**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "username",
    "password": "secure_password",
    "full_name": "John Doe"
  }'
```

**Login**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure_password"
  }'
```

**Get Problems**
```bash
curl -X GET "http://localhost:8000/api/v1/problems?difficulty=Medium&topic=Arrays" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Submit Code**
```bash
curl -X POST http://localhost:8000/api/v1/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "problem_id": "550e8400-e29b-41d4-a716-446655440001",
    "code": "def twoSum(nums, target):\n    ...",
    "language": "Python"
  }'
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend bash

# Remove volumes and data
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

## 🔐 Security

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **SQL Injection Prevention** via SQLAlchemy ORM
- **CORS Configuration** for authorized domains
- **Rate Limiting** on API endpoints
- **Input Validation** with Pydantic
- **Environment Variables** for secrets
- **HTTPS** recommended in production

## 🚢 Deployment

### Production Deployment Checklist
- [ ] Set up environment variables in production
- [ ] Configure database backups
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring and logging
- [ ] Configure CDN for static files
- [ ] Setup email service
- [ ] Create database indexes
- [ ] Run load testing
- [ ] Security audit

### Deploy to Render (Backend)
```bash
# Push to GitHub
git push origin main

# Connect repository on Render dashboard
# Configure environment variables
# Deploy automatically on push
```

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Setup automatic deployments on Git push
```

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 📊 Database Schema

The application uses the following main tables:

- **users** - User accounts and profiles
- **problems** - DSA problems
- **submissions** - Code submissions
- **progress** - User progress tracking
- **topic_accuracy** - Performance by topic
- **conversations** - AI tutor chat history
- **documents** - Knowledge base documents
- **document_chunks** - Document chunks for RAG
- **quizzes** - User quizzes
- **flashcards** - Study flashcards
- **learning_paths** - Personalized learning paths
- **gamification** - XP, badges, streaks

See [database_schema.sql](./database_schema.sql) for complete schema.

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest
pytest app/tests/test_auth.py -v
pytest --cov=app app/tests/

# Frontend tests
cd frontend
npm run test
npm run test -- --coverage
```

## 📝 API Examples

### Chat with AI Tutor
```bash
curl -X POST http://localhost:8000/api/v1/tutor/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "conversation_id": "conv_123",
    "problem_id": "prob_456",
    "message": "How do I solve this?",
    "request_type": "chat"
  }'
```

### Generate Quiz
```bash
curl -X POST http://localhost:8000/api/v1/quiz/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "topic": "Arrays",
    "difficulty": "Medium",
    "question_count": 10,
    "question_types": ["mcq", "coding"]
  }'
```

### Search Knowledge Base
```bash
curl -X POST http://localhost:8000/api/v1/rag/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "query": "How to implement binary search?",
    "search_type": "semantic",
    "limit": 5
  }'
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI and SQLAlchemy communities
- React ecosystem
- Google Gemini API documentation
- LeetCode for problem inspiration
- All contributors and users

## 📞 Support

- **Email**: support@dsamenstorai.com
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Twitter**: @DSAMentorAI

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core authentication
- ✅ Problem management
- ✅ Basic AI tutor
- ✅ Code submissions
- ✅ RAG pipeline

### Phase 2 (Planned)
- 🔄 Mobile app (React Native)
- 🔄 Video tutorials
- 🔄 Live coding sessions
- 🔄 Peer review system

### Phase 3 (Future)
- 📋 ML-based problem recommendations
- 📋 Job interview simulator
- 📋 Company-specific interview prep
- 📋 Certification program
- 📋 Multi-language support

## 🔗 Links

- [Live Demo](https://dsamensorai.vercel.app)
- [GitHub Repository](https://github.com/yourusername/dsa-mentor-ai)
- [Documentation](https://dsamensorai.gitbook.io/)
- [Twitter](https://twitter.com/DSAMentorAI)
- [LinkedIn](https://linkedin.com/company/dsamensorai)

---

**Made with ❤️ for the learning community**

**Last Updated**: January 2024  
**Version**: 1.0.0
