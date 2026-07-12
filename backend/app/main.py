from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware

from .core.config import settings
from .database.base import Base
from .database.session import engine
from .middleware.cors import setup_cors
from .models.otp import OTP  # Import OTP model to register it with Base
from .routers.items import router as items_router
from .routers.market import router as market_router
from .routers.auth import router as auth_router
from .routers.advisors import router as advisors_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    
    # Add gzip compression for better performance
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    setup_cors(app)
    app.include_router(items_router)
    app.include_router(market_router)
    app.include_router(auth_router)
    app.include_router(advisors_router)

    Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
