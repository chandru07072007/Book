from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import db_manager, get_database
from app.services.seed_data import seed_initial_data
from app.routers import auth, resources, requests, schedules, history

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to DB and seed initial dataset
    await db_manager.connect()
    db = get_database()
    await seed_initial_data(db)
    yield
    # Shutdown
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Educational Resource Lending & Donation Platform API",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(resources.router, prefix=settings.API_V1_STR)
app.include_router(requests.router, prefix=settings.API_V1_STR)
app.include_router(schedules.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": "BookBridge - Educational Resource Lending & Donation Platform",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database_type": "in-memory-fallback" if db_manager.is_mock else "mongodb-live"
    }

