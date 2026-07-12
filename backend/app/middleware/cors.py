from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware


def setup_cors(app: FastAPI) -> None:
    # Allow specific origins for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
