from fastapi import FastAPI

from .core.config import settings
from .database.base import Base
from .database.session import engine
from .middleware.cors import setup_cors
from .routers.items import router as items_router
from .routers.market import router as market_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    setup_cors(app)
    app.include_router(items_router)
    app.include_router(market_router)

    Base.metadata.create_all(bind=engine)

    @app.get("/health")
    def health_check():
        return {"status": "ok"}

    return app


app = create_app()
