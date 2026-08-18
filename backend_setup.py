# DSA Mentor AI - FastAPI Backend Setup
# This file demonstrates the core backend structure and key components

# ============================================================================
# 1. DEPENDENCIES AND REQUIREMENTS
# ============================================================================

"""
requirements.txt

# Core
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.1
redis==5.0.1

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
email-validator==2.1.0

# AI/ML
google-generativeai==0.3.0
groq==0.4.1
chromadb==0.4.21
sentence-transformers==2.2.2
numpy==1.24.3

# Utilities
httpx==0.25.2
requests==2.31.0
cloudinary==1.36.0
python-multipart==0.0.6
python-slugify==8.0.1

# Monitoring
python-json-logger==2.0.7
sentry-sdk==1.40.0

# Testing
pytest==7.4.4
pytest-asyncio==0.23.0
httpx-mock==0.29.0

# API Documentation
swagger-ui-py==24.1.1
"""

# ============================================================================
# 2. CORE CONFIGURATION
# ============================================================================

from typing import Optional, List
from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    """Application configuration from environment variables"""
    
    # API Config
    api_title: str = "DSA Mentor AI"
    api_version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dsa_mentor")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # JWT
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # AI/ML
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    preferred_llm: str = os.getenv("PREFERRED_LLM", "gemini")  # 'gemini' or 'groq'
    embedding_model: str = "BAAI/bge-small-en-v1.5"
    
    # Storage
    cloudinary_url: str = os.getenv("CLOUDINARY_URL", "")
    aws_access_key: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    aws_secret_key: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    s3_bucket: str = os.getenv("S3_BUCKET", "")
    
    # Vector DB
    chroma_db_path: str = os.getenv("CHROMA_DB_PATH", "./chroma_data")
    
    # Email
    smtp_server: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port: int = 587
    sender_email: str = os.getenv("SENDER_EMAIL", "")
    sender_password: str = os.getenv("SENDER_PASSWORD", "")
    
    # CORS
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://yourdomain.com"
    ]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_period: int = 3600  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    return Settings()

# ============================================================================
# 3. DATABASE MODELS (SQLAlchemy)
# ============================================================================

from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, 
    ForeignKey, UUID, ARRAY, JSON, Text, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
import enum

Base = declarative_base()

class UserExperienceLevel(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"

class ProblemDifficulty(str, enum.Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"

class SubmissionStatus(str, enum.Enum):
    PENDING = "Pending"
    RUNNING = "Running"
    ACCEPTED = "Accepted"
    WRONG_ANSWER = "Wrong Answer"
    RUNTIME_ERROR = "Runtime Error"

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    company = Column(String(100), nullable=True)
    experience_level = Column(
        SQLEnum(UserExperienceLevel), 
        default=UserExperienceLevel.BEGINNER
    )
    preferred_languages = Column(ARRAY(String), default=["Python"])
    is_active = Column(Boolean, default=True, index=True)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    theme = Column(String(20), default="dark")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")

class Problem(Base):
    __tablename__ = "problems"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    difficulty = Column(SQLEnum(ProblemDifficulty), nullable=False, index=True)
    topic = Column(String(100), nullable=False, index=True)
    tags = Column(ARRAY(String), default=[])
    company_tags = Column(ARRAY(String), default=[])
    examples = Column(JSON, nullable=True)
    constraints = Column(Text, nullable=True)
    function_signatures = Column(JSON, nullable=True)
    editorial_content = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    attempt_count = Column(Integer, default=0)
    solve_count = Column(Integer, default=0)
    acceptance_rate = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    submissions = relationship("Submission", back_populates="problem")

class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.PENDING, index=True)
    runtime_ms = Column(Integer, nullable=True)
    memory_mb = Column(Float, nullable=True)
    test_cases_passed = Column(Integer, nullable=True)
    test_cases_total = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    is_accepted = Column(Boolean, default=False)
    submitted_at = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="submissions")
    problem = relationship("Problem", back_populates="submissions")

class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    total_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)
    accuracy_percentage = Column(Float, default=0.0)
    total_time_minutes = Column(Integer, default=0)
    global_rank = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="progress")

class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(UUID(as_uuid=True), ForeignKey("problems.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=True)
    messages = Column(JSON, default=[])
    current_hint_level = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="conversations")

# ============================================================================
# 4. PYDANTIC SCHEMAS (Request/Response)
# ============================================================================

from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Any

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    experience_level: UserExperienceLevel
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class ProblemCreate(BaseModel):
    title: str
    description: str
    difficulty: ProblemDifficulty
    topic: str
    tags: List[str] = []
    company_tags: List[str] = []
    examples: Optional[List[Dict[str, Any]]] = None
    constraints: Optional[str] = None

class ProblemResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    difficulty: ProblemDifficulty
    topic: str
    tags: List[str]
    company_tags: List[str]
    solve_count: int
    acceptance_rate: float
    
    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    problem_id: uuid.UUID
    code: str
    language: str

class SubmissionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    problem_id: uuid.UUID
    language: str
    status: SubmissionStatus
    runtime_ms: Optional[int]
    memory_mb: Optional[float]
    test_cases_passed: Optional[int]
    test_cases_total: Optional[int]
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class ProgressResponse(BaseModel):
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    current_streak: int
    accuracy_percentage: float
    global_rank: Optional[int]
    
    class Config:
        from_attributes = True

class TutorMessageRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    problem_id: Optional[uuid.UUID] = None
    message: str
    request_type: str = "chat"  # 'chat', 'hint', 'explain', 'code_review'

class TutorMessageResponse(BaseModel):
    conversation_id: uuid.UUID
    response: str
    hint_level: int
    suggestions: Optional[List[str]] = None

# ============================================================================
# 5. AUTHENTICATION & SECURITY
# ============================================================================

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str) -> str:
    return password_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, settings: Settings, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def create_refresh_token(data: dict, settings: Settings) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), settings: Settings = Depends(get_settings)):
    """Dependency to get current authenticated user from JWT token"""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    return user_id

# ============================================================================
# 6. REPOSITORY PATTERN
# ============================================================================

from sqlalchemy.orm import Session
from sqlalchemy import select

class BaseRepository:
    """Base repository for common CRUD operations"""
    
    def __init__(self, session: Session, model):
        self.session = session
        self.model = model
    
    async def create(self, obj_in: dict) -> Any:
        db_obj = self.model(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj
    
    async def get_by_id(self, id: Any) -> Optional[Any]:
        return await self.session.get(self.model, id)
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Any]:
        query = select(self.model).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update(self, id: Any, obj_in: dict) -> Optional[Any]:
        db_obj = await self.get_by_id(id)
        if db_obj:
            for key, value in obj_in.items():
                setattr(db_obj, key, value)
            await self.session.commit()
            await self.session.refresh(db_obj)
        return db_obj
    
    async def delete(self, id: Any) -> bool:
        db_obj = await self.get_by_id(id)
        if db_obj:
            await self.session.delete(db_obj)
            await self.session.commit()
            return True
        return False

class UserRepository(BaseRepository):
    """Repository for user-related database operations"""
    
    async def get_by_email(self, email: str) -> Optional[User]:
        query = select(User).where(User.email == email)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str) -> Optional[User]:
        query = select(User).where(User.username == username)
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

class ProblemRepository(BaseRepository):
    """Repository for problem-related database operations"""
    
    async def get_by_topic(self, topic: str, skip: int = 0, limit: int = 20) -> List[Problem]:
        query = select(Problem).where(Problem.topic == topic).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_by_difficulty(self, difficulty: ProblemDifficulty, skip: int = 0, limit: int = 20) -> List[Problem]:
        query = select(Problem).where(Problem.difficulty == difficulty).offset(skip).limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

# ============================================================================
# 7. SERVICE LAYER
# ============================================================================

class AuthService:
    """Business logic for authentication"""
    
    def __init__(self, user_repo: UserRepository, settings: Settings):
        self.user_repo = user_repo
        self.settings = settings
    
    async def register_user(self, session: Session, user_data: UserCreate) -> User:
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_dict = user_data.model_dump()
        user_dict["password_hash"] = hash_password(user_data.password)
        del user_dict["password"]
        
        user = await self.user_repo.create(user_dict)
        return user
    
    async def authenticate_user(self, session: Session, email: str, password: str) -> Optional[User]:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            return None
        return user
    
    def generate_tokens(self, user_id: str) -> TokenResponse:
        access_token = create_access_token({"sub": str(user_id)}, self.settings)
        refresh_token = create_refresh_token({"sub": str(user_id)}, self.settings)
        return TokenResponse(access_token=access_token, refresh_token=refresh_token)

class ProblemService:
    """Business logic for problems"""
    
    def __init__(self, problem_repo: ProblemRepository):
        self.problem_repo = problem_repo
    
    async def get_recommended_problems(self, user_id: str, limit: int = 5) -> List[Problem]:
        # Logic to recommend problems based on user's progress
        # This would use user's topic_accuracy to recommend weak areas
        pass
    
    async def get_problems_by_filters(self, difficulty: Optional[str] = None, topic: Optional[str] = None, tags: Optional[List[str]] = None) -> List[Problem]:
        # Complex filtering logic
        pass

class ProgressService:
    """Business logic for progress tracking"""
    
    async def update_progress_after_submission(self, user_id: str, problem_id: str, is_accepted: bool) -> Progress:
        # Update user progress metrics
        pass
    
    async def calculate_accuracy(self, user_id: str) -> float:
        # Calculate overall accuracy
        pass

# ============================================================================
# 8. FASTAPI APPLICATION SETUP
# ============================================================================

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

def create_app() -> FastAPI:
    app = FastAPI(
        title="DSA Mentor AI",
        description="AI-powered learning platform for Data Structures and Algorithms",
        version="1.0.0"
    )
    
    settings = get_settings()
    
    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Health Check
    @app.get("/health")
    async def health_check():
        return {"status": "healthy"}
    
    # API Routes would be included here
    # @app.include_router(auth_router, prefix="/api/v1")
    # @app.include_router(problems_router, prefix="/api/v1")
    # @app.include_router(submissions_router, prefix="/api/v1")
    # etc.
    
    return app

# ============================================================================
# 9. DATABASE CONNECTION
# ============================================================================

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

async def get_db_session(settings: Settings = Depends(get_settings)) -> AsyncSession:
    """Dependency to get database session"""
    engine = create_async_engine(settings.database_url, echo=settings.debug)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session

# ============================================================================
# 10. EXAMPLE ROUTE
# ============================================================================

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1", tags=["auth"])

@router.post("/auth/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings)
):
    """Register a new user"""
    user_repo = UserRepository(db, User)
    auth_service = AuthService(user_repo, settings)
    user = await auth_service.register_user(db, user_data)
    return user

@router.post("/auth/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings)
):
    """Login with email and password"""
    user_repo = UserRepository(db, User)
    auth_service = AuthService(user_repo, settings)
    user = await auth_service.authenticate_user(db, credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    tokens = auth_service.generate_tokens(user.id)
    return tokens

@router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db_session)
):
    """Get current user's profile"""
    user_repo = UserRepository(db, User)
    user = await user_repo.get_by_id(current_user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.post("/problems", response_model=ProblemResponse)
async def create_problem(
    problem_data: ProblemCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db_session),
    settings: Settings = Depends(get_settings)
):
    """Create a new problem (admin only)"""
    # Verify admin
    user_repo = UserRepository(db, User)
    user = await user_repo.get_by_id(current_user_id)
    
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can create problems")
    
    problem_repo = ProblemRepository(db, Problem)
    problem_dict = problem_data.model_dump()
    problem_dict["created_by"] = current_user_id
    
    problem = await problem_repo.create(problem_dict)
    return problem

@router.get("/problems", response_model=List[ProblemResponse])
async def get_problems(
    difficulty: Optional[str] = None,
    topic: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db_session)
):
    """Get problems with optional filters"""
    problem_repo = ProblemRepository(db, Problem)
    
    if difficulty:
        problems = await problem_repo.get_by_difficulty(ProblemDifficulty(difficulty), skip, limit)
    elif topic:
        problems = await problem_repo.get_by_topic(topic, skip, limit)
    else:
        problems = await problem_repo.get_all(skip, limit)
    
    return problems

# ============================================================================
# 11. MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    app = create_app()
    app.include_router(router)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )

# Run: python backend_setup.py
# Or: uvicorn backend_setup:app --reload
