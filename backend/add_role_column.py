"""Add role column to users table."""
from app.database.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' NOT NULL"))
    conn.commit()
    print('Added role column to users table')