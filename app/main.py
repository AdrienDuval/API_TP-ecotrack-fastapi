from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, indicators, zones, stats, sources
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoTrack API",
    description="API for tracking environmental indicators",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(indicators.router, prefix="/indicators", tags=["Indicators"])
app.include_router(zones.router, prefix="/zones", tags=["Zones"])
app.include_router(sources.router, prefix="/sources", tags=["Sources"])
app.include_router(stats.router, prefix="/stats", tags=["Statistics"])

@app.get("/")
def root():
    return {"message": "Welcome to EcoTrack API"}

@app.get("/health")
def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "EcoTrack API",
        "version": "1.0.0"
    }
