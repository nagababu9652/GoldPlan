#!/usr/bin/env python3
"""Drop all tables and recreate them fresh using CASCADE."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.database.session import engine
from app.database.base import Base
from app.models.user import User
from app.models.otp import OTP
from app.models.item import Item

print("Dropping all tables with CASCADE...")
with engine.connect() as conn:
    conn.execute(text("DROP TABLE IF EXISTS otps CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS groups CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS clients CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS items CASCADE"))
    conn.commit()

print("Creating all tables...")
Base.metadata.create_all(bind=engine)

from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"Tables recreated: {tables}")