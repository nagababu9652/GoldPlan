from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from ..core.config import settings


def setup_cors(app: FastAPI) -> None:
    origins = [str(origin) for origin in settings.frontend_origins]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
