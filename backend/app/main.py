import time
from fastapi import FastAPI, Request
from fastapi.middleware.gzip import GZipMiddleware

from .core.config import settings
from .database.base import Base
from .database.session import engine
from .middleware.cors import setup_cors
from .models.otp import OTP  # Import OTP model to register it with Base
from .models.user import User  # Import User model to register it with Base
from .models.item import Item  # Import Item model to register it with Base
from .routers.items import router as items_router
from .routers.market import router as market_router
from .routers.auth import router as auth_router
from .routers.advisors import router as advisors_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    
    # Add middleware for response timing
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Add gzip compression for better performance
    # Minimum size 1KB to avoid overhead on small responses
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    setup_cors(app)
    app.include_router(items_router)
    app.include_router(market_router)
    app.include_router(auth_router)
    app.include_router(advisors_router)

    # Create all tables
    Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    return app


app = create_app()