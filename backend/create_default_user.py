#!/usr/bin/env python3
"""
Script to create a default user for testing
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.database.session import SessionLocal
from app.services.auth import get_password_hash, get_user_by_email, create_user

def create_default_user():
    db = SessionLocal()
    
    try:
        # Check if default user already exists
        existing_user = get_user_by_email(db, "user@finplan.in")
        if existing_user:
            print("✓ Default user already exists!")
            print(f"  Email: user@finplan.in")
            print(f"  Password: Test@123456")
            return
        
        # Create default individual user
        user_data = {
            "email": "user@finplan.in",
            "password": "Test@123456",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+91 9876543210",
            "role": "user"
        }
        
        user = create_user(db, user_data)
        
        print("✓ Default individual user created successfully!")
        print(f"\nLogin Credentials:")
        print(f"  Email: user@finplan.in")
        print(f"  Password: Test@123456")
        
        # Create default advisor user
        advisor_data = {
            "email": "advisor@finplan.in",
            "password": "Advisor@123456",
            "first_name": "Demo",
            "last_name": "Advisor",
            "phone": "+91 9876543211",
            "role": "advisor"
        }
        
        advisor = create_user(db, advisor_data)
        
        print(f"\n✓ Default advisor user created successfully!")
        print(f"\nAdvisor Login Credentials:")
        print(f"  Email: advisor@finplan.in")
        print(f"  Password: Advisor@123456")
        print(f"\nYou can now login with these credentials at http://localhost:3000/login")
        
    except Exception as e:
        print(f"✗ Error creating default user: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_default_user()