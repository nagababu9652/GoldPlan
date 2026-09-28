#!/usr/bin/env python3
"""
Script to create the default auth users used for local testing.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database.session import SessionLocal
from app.services import auth_service as auth


def create_default_user():
    db = SessionLocal()

    try:
        user_password = "Test@123456"
        user_data = {
            "email": "user@finplan.in",
            "password": user_password,
            "first_name": "Test",
            "last_name": "User",
            "mobile_number": "+91 9876543210",
            "role": "user",
            "organization_name": "FinPlan India",
            "branch_name": "Head Office",
        }
        if not auth.get_user_by_email(db, user_data["email"]):
            auth.create_user(db, user_data.copy())
            print(f"✓ Created user: {user_data['email']} / {user_password}")
        else:
            print(f"✓ User already exists: {user_data['email']}")

        advisor_password = "Advisor@123456"
        advisor_data = {
            "email": "advisor@finplan.in",
            "password": advisor_password,
            "first_name": "Demo",
            "last_name": "Advisor",
            "mobile_number": "+91 9876543211",
            "role": "advisor",
        }
        if not auth.get_user_by_email(db, advisor_data["email"]):
            auth.create_user(db, advisor_data.copy())
            print(f"✓ Created advisor: {advisor_data['email']} / {advisor_password}")
        else:
            print(f"✓ User already exists: {advisor_data['email']}")

        print("\nLogin URLs:")
        print("  http://localhost:3000/login")

    except Exception as e:
        print(f"✗ Error creating default user: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    create_default_user()