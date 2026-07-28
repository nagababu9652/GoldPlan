#!/usr/bin/env python3
"""
Migration script to drop clients table and recreate as advisors table
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.database.session import engine
from app.database.base import Base
from app.models.advisor import Advisor
from app.models.user import User
from app.models.item import Item
from app.models.otp import OTP

def migrate():
    print("=" * 60)
    print("MIGRATION: Renaming 'clients' table to 'advisors'")
    print("=" * 60)
    
    try:
        # Drop all tables
        print("\n1. Dropping all existing tables...")
        Base.metadata.drop_all(bind=engine)
        print("   ✓ All tables dropped successfully")
        
        # Create all tables with new schema
        print("\n2. Creating new tables with updated schema...")
        Base.metadata.create_all(bind=engine)
        print("   ✓ Tables created successfully")
        
        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"\n3. Tables in database:")
        for table in tables:
            print(f"   ✓ {table}")
        
        print("\n" + "=" * 60)
        print("MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print(f"\nDatabase: {settings.database_url}")
        print(f"Tables created: {', '.join(tables)}")
        print("\nNOTE: All existing data has been removed.")
        print("You can now run create_default_user.py to create test users.")
        
    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    migrate()