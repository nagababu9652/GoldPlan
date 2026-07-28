"""Fix role column to use proper enum type."""
from app.database.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Drop the existing role column
    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS role"))
    conn.commit()
    print('Dropped role column')
    
    # Add role column with proper enum type
    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL"))
    conn.commit()
    print('Added role column with VARCHAR type')