#!/usr/bin/env python3
"""
Script to create all database tables in PostgreSQL
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
from app.models.user import User
from app.models.item import Item

def create_tables():
    print(f"Creating tables in database: {settings.database_url}")
    print(f"Engine: {engine}")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully!")
        
        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\nTables in database:")
        for table in tables:
            print(f"  - {table}")
            
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    create_tables()