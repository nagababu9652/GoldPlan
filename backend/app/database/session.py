from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool

from ..core.config import settings

# Connection pooling configuration
connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

# Use QueuePool for better connection management
pool_class = QueuePool if not settings.database_url.startswith("sqlite") else None

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    # Connection pooling settings
    poolclass=pool_class,
    pool_size=20,  # Number of connections to keep in the pool
    max_overflow=10,  # Additional connections when pool is exhausted
    pool_timeout=30,  # Timeout for getting a connection from the pool
    pool_recycle=1800,  # Recycle connections after 30 minutes to prevent stale connections
    # Performance settings
    echo=False,  # Set to True for SQL logging in development
    future=True,  # Use SQLAlchemy 2.0 style queries
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,  # Prevent unnecessary lazy-loading after commit
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()