#!/usr/bin/env python3
"""Create local development identities using the production onboarding boundary."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database.session import SessionLocal
from app.models.foundation.party import Party
from app.services import auth_service as auth
from app.services.onboarding_service import bootstrap_head_organization


def create_default_user():
    db = SessionLocal()
    try:
        accounts = (
            ("user@finplan.in", "Test@123456", "Test", "User"),
            ("advisor@finplan.in", "Advisor@123456", "Demo", "Advisor"),
        )
        created = {}
        for email, password, first_name, last_name in accounts:
            user = auth.get_user_by_email(db, email)
            if not user:
                user = auth.create_user(db, {
                    "email": email,
                    "password": password,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email_verified": True,
                })
                print(f"Created user: {email} / {password}")
            else:
                print(f"User already exists: {email}")
            created[email] = user

        advisor = created["advisor@finplan.in"]
        party = db.query(Party).filter(Party.id == advisor.party_id).first()
        if party and party.organization_id is None:
            session, _, _ = auth.create_session(db, advisor, device_name="local-seed")
            bootstrap_head_organization(
                db,
                organization_name="FinPlan India",
                branch_name="Head Office",
                party=party,
                user_id=advisor.id,
                session_id=session.id,
            )
            db.commit()
            print("Bootstrapped advisor as the first organization Head")

        print("\nLogin URL: http://localhost:3000/login")
    except Exception as exc:
        db.rollback()
        print(f"Error creating default users: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_default_user()
