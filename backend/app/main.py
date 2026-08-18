from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.problems import router as problems_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.execution import router as execution_router
from app.api.execution_feedback import (
    router as execution_feedback_router,
)
from app.api.problems import router as problems_router

app = FastAPI(
    title="DSA Mentor AI",
    version="1.0.0",
)


# -------------------------------------------------
# CORS Configuration
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Root
# -------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "DSA Mentor AI Backend is running"
    }


# -------------------------------------------------
# Health Check
# -------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# -------------------------------------------------
# API Routers
# -------------------------------------------------

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    problems_router,
    prefix="/api/v1",
)

app.include_router(
    chat_router,
    prefix="/api/v1",
)

app.include_router(
    documents_router,
    prefix="/api/v1",
)
app.include_router(
    execution_router,
    prefix="/api/v1",
)
app.include_router(
    execution_feedback_router,
    prefix="/api/v1",
)
app.include_router(
    problems_router,
    prefix="/api/v1",
)