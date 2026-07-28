"""Migration script to create client and group tables."""
from app.database.session import engine
from app.database.base import Base
from app.models.client import Client
from app.models.group import Group


def create_tables():
    """Create client and group tables."""
    print("Creating client and group tables...")
    Base.metadata.create_all(bind=engine, tables=[Client.__table__, Group.__table__])
    print("Tables created successfully!")


if __name__ == "__main__":
    create_tables()