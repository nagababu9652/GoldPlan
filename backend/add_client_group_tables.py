"""Migration script to create client and group tables."""
from app.database.session import engine
from app.database.base import Base
from app.models.crm import Customer, CustomerGroup


def create_tables():
    """Create client and group tables."""
    print("Creating customer and customer group tables...")
    Base.metadata.create_all(
        bind=engine,
        tables=[Customer.__table__, CustomerGroup.__table__],
    )
    print("Tables created successfully!")


if __name__ == "__main__":
    create_tables()