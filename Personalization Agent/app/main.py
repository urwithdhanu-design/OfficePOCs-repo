"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.agent_routes import router as agent_router
from app.api.mock_banking import router as banking_router
from app.config import get_settings
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


settings = get_settings()
app = FastAPI(
    title="Credit Card Personalization Agent",
    description="AI Financial Education & Personalization for credit card customers",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(banking_router)
app.include_router(agent_router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "personalization-agent"}


@app.get("/")
async def root():
    return {
        "service": "Credit Card Personalization Agent",
        "docs": "/docs",
        "endpoints": {
            "agent_chat": "POST /api/v1/agent/chat",
            "agent_insights": "POST /api/v1/agent/insights",
            "quick_tips": "GET /api/v1/agent/customers/{code}/quick-tips",
            "mock_banking": "/api/v1/banking/...",
        },
        "demo_customers": ["CUST001", "CUST002", "CUST003"],
    }
