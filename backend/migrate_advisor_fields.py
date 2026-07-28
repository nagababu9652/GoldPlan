#!/usr/bin/env python3
"""
Script to add advisor-specific fields to existing users table.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.database.session import engine
from sqlalchemy import text

def migrate():
    print("Adding advisor-specific fields to users table...")
    
    with engine.connect() as conn:
        # Check if column exists first
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='firm_name'
        """))
        
        if result.fetchone():
            print("✓ Columns already exist!")
        else:
            # Add new columns
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN firm_name VARCHAR(100) NULL,
                ADD COLUMN registration_number VARCHAR(50) NULL,
                ADD COLUMN experience_years INTEGER NULL
            """))
            conn.commit()
            print("✓ Advisor fields added successfully!")
        
        # Verify columns
        result = conn.execute(text("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name='users'
            ORDER BY ordinal_position
        """))
        
        print("\nUsers table columns:")
        for row in result:
            print(f"  - {row.column_name}: {row.data_type} (nullable: {row.is_nullable})")

if __name__ == "__main__":
    migrate()