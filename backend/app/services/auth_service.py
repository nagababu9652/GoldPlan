"""
Authentication Service - handles user creation, authentication, JWT tokens,
session management, and password operations using the new identity schema.
"""
from datetime import datetime, timedelta
from typing import Optional
import ipaddress
import uuid

import bcrypt
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.foundation.party import Party, PartyAddress, PartyContact
from ..models.identity.auth import (
    User, AuthenticationMethod, PasswordHistory,
    UserSession, RefreshToken, LoginHistory
)
from ..models.identity.authorization import Role, UserRole
from ..schemas.auth import TokenPayload
from .onboarding_service import create_organization_onboarding


# ============================================================================
# Password Utilities
# ============================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    password = plain_password[:72] if len(plain_password.encode('utf-8')) > 72 else plain_password
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt with 12 rounds."""
    truncated = password[:72] if len(password.encode('utf-8')) > 72 else password
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(truncated.encode('utf-8'), salt).decode('utf-8')


# ============================================================================
# JWT Token Utilities
# ============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token with 7-day expiry."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate a JWT token. Returns TokenPayload or None."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return TokenPayload(**payload)
    except JWTError:
        return None


# ============================================================================
# User Queries
# ============================================================================

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    return db.query(User).filter(User.email == email, User.is_active == True).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get a user by ID."""
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get a user by username."""
    return db.query(User).filter(User.username == username, User.is_active == True).first()


# ============================================================================
# Authentication
# ============================================================================

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    Verifies against identity.authentication_methods table.
    """
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    # Check account status
    if user.account_status != "ACTIVE":
        return None
    
    # Find primary password authentication method
    auth_method = db.query(AuthenticationMethod).filter(
        AuthenticationMethod.user_id == user.id,
        AuthenticationMethod.is_primary == True,
        AuthenticationMethod.authentication_type == "PASSWORD",
        AuthenticationMethod.is_enabled == True
    ).first()
    
    if not auth_method or not auth_method.credential_hash:
        return None
    
    if not verify_password(password, auth_method.credential_hash):
        return None
    
    return user


# ============================================================================
# User Creation
# ============================================================================

def resolve_role_code(db: Session, role_input: Optional[str]) -> Optional[str]:
    """Resolve a requested role to a persisted role code for identity.user_roles."""
    if not role_input:
        return None

    normalized = role_input.strip().lower()
    if normalized in {"user", "advisor", "employee", "org_admin"}:
        return {
            "user": "USER",
            "advisor": "ADVISOR",
            "employee": "EMPLOYEE",
            "org_admin": "ORG_ADMIN",
        }[normalized]

    return normalized.upper()


def get_lookup_id(db: Session, table: str, column: str, value_code: str) -> Optional[int]:
    """Return the first matching lookup id from a schema table when available."""
    query = text(
        f"SELECT id FROM {table} WHERE {column} = :value_code LIMIT 1"
    )
    return db.execute(query, {"value_code": value_code}).scalar()


def create_party_profile(db: Session, party: Party, user_data: dict) -> None:
    """Attach supporting party address and contact records from the registration payload."""
    address_line1 = user_data.get("address_line1")
    city = user_data.get("city")
    state = user_data.get("state")
    pincode = user_data.get("pincode")

    if address_line1 or city or state or pincode:
        address_type_id = get_lookup_id(db, "foundation.lookup_values", "value_code", "PERMANENT")
        city_id = db.execute(text("SELECT id FROM foundation.cities LIMIT 1")).scalar()
        state_id = db.execute(text("SELECT id FROM foundation.states LIMIT 1")).scalar()
        country_id = db.execute(text("SELECT id FROM foundation.countries LIMIT 1")).scalar()

        if address_type_id and city_id and state_id and country_id:
            address = PartyAddress(
                party_id=party.id,
                address_type_id=address_type_id,
                address_line1=address_line1 or "",
                address_line2=user_data.get("address_line2"),
                city_id=city_id,
                state_id=state_id,
                country_id=country_id,
                postal_code=pincode,
                is_primary=True,
            )
            db.add(address)

    mobile_number = user_data.get("mobile_number")
    if mobile_number:
        contact_type_id = get_lookup_id(db, "foundation.lookup_values", "value_code", "MOBILE")
        if contact_type_id:
            db.add(PartyContact(
                party_id=party.id,
                contact_type_id=contact_type_id,
                contact_value=mobile_number,
                is_primary=True,
                is_verified=False,
            ))

    email = user_data.get("email")
    if email:
        contact_type_id = get_lookup_id(db, "foundation.lookup_values", "value_code", "EMAIL")
        if contact_type_id:
            db.add(PartyContact(
                party_id=party.id,
                contact_type_id=contact_type_id,
                contact_value=email,
                is_primary=False,
                is_verified=False,
            ))


def create_user(db: Session, user_data: dict) -> User:
    """
    Create a new user with authentication method.
    Expects user_data to contain at minimum: email, password
    Optional: party_id, username, mobile_number, first_name, last_name
    """
    password = user_data.pop("password")
    hashed_password = get_password_hash(password)

    try:
        party_type_id = db.execute(
            text("SELECT id FROM foundation.lookup_values WHERE value_code = 'INDIVIDUAL' LIMIT 1")
        ).scalar()
        if not party_type_id:
            raise ValueError("No party type lookup available for registration")

        party = Party(
            organization_id=user_data.get("organization_id"),
            party_code=f"P{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            party_type_id=party_type_id,
            title=user_data.get("title"),
            first_name=user_data.get("first_name"),
            middle_name=user_data.get("middle_name"),
            last_name=user_data.get("last_name"),
            display_name=user_data.get(
                "display_name",
                f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip()
            ),
            legal_name=user_data.get("legal_name"),
            date_of_birth=user_data.get("date_of_birth"),
            gender_id=user_data.get("gender_id"),
            marital_status_id=user_data.get("marital_status_id"),
            pan_number=user_data.get("pan_number"),
            aadhaar_number=user_data.get("aadhaar_number"),
            gst_number=user_data.get("gst_number"),
            cin_number=user_data.get("cin_number"),
            email=user_data.get("email"),
            mobile_number=user_data.get("mobile_number"),
            alternate_mobile=user_data.get("alternate_mobile"),
            website=user_data.get("website"),
            remarks=user_data.get("remarks"),
        )
        db.add(party)
        db.flush()
        create_party_profile(db, party, user_data)

        user = User(
            party_id=party.id,
            username=user_data.get("username", user_data.get("email")),
            email=user_data["email"],
            mobile_number=user_data.get("mobile_number"),
            display_name=party.display_name,
            preferred_language="en",
            timezone="Asia/Kolkata",
            email_verified=user_data.get("email_verified", False),
            account_status="ACTIVE",
        )
        db.add(user)
        db.flush()

        role_code = resolve_role_code(db, user_data.get("role"))
        if role_code:
            role = db.query(Role).filter(Role.role_code == role_code).first()
            if role is None:
                role = Role(
                    organization_id=user_data.get("organization_id"),
                    role_code=role_code,
                    role_name=role_code.replace("_", " ").title(),
                    description=f"Auto-created role for {role_code}",
                    is_system=True,
                    is_default=True,
                )
                db.add(role)
                db.flush()

            db.add(UserRole(
                user_id=user.id,
                role_id=role.id,
                is_primary=True,
            ))
        
        # Create primary password authentication method
        auth_method = AuthenticationMethod(
            user_id=user.id,
            authentication_type="PASSWORD",
            credential_hash=hashed_password,
            password_algorithm="bcrypt",
            is_primary=True,
            is_enabled=True
        )
        db.add(auth_method)
        
        # Add to password history
        password_history = PasswordHistory(
            user_id=user.id,
            password_hash=hashed_password,
            changed_at=datetime.utcnow()
        )
        db.add(password_history)
        
        if user_data.get("organization_name") or user_data.get("branch_name"):
            organization_name = user_data.get("organization_name") or (user_data.get("firm_name") or "Default Organization")
            branch_name = user_data.get("branch_name") or "Primary Branch"
            create_organization_onboarding(
                db=db,
                organization_name=organization_name,
                branch_name=branch_name,
                party=party,
                user_id=user.id,
            )

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise


# ============================================================================
# Session Management
# ============================================================================

def normalize_ip_address(ip_address: Optional[str]) -> Optional[str]:
    """Normalize a user-supplied IP string for PostgreSQL inet columns."""
    if not ip_address:
        return None

    value = ip_address.strip()
    if not value:
        return None

    try:
        return str(ipaddress.ip_address(value))
    except ValueError:
        return None


def create_session(
    db: Session,
    user: User,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    device_name: Optional[str] = None,
    operating_system: Optional[str] = None,
    browser: Optional[str] = None
) -> tuple[UserSession, str, str]:
    """
    Create a new user session with access and refresh tokens.
    Returns (session, access_token, refresh_token).
    """
    normalized_ip = normalize_ip_address(ip_address)

    # Create session
    session = UserSession(
        user_id=user.id,
        session_uuid=uuid.uuid4(),
        login_time=datetime.utcnow(),
        last_activity_at=datetime.utcnow(),
        ip_address=normalized_ip,
        user_agent=user_agent,
        device_name=device_name,
        operating_system=operating_system,
        browser=browser,
        is_active=True
    )
    db.add(session)
    db.flush()
    
    # Create tokens
    role_code = None
    if user.roles:
        role_code = user.roles[0].role.role_code if hasattr(user.roles[0], "role") and user.roles[0].role else None

    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "party_id": str(user.party_id),
        "role": role_code,
        "session_uuid": str(session.session_uuid)
    }
    
    access_token = create_access_token(data=token_data)
    refresh_token_str = create_refresh_token(data=token_data)
    
    # Hash refresh token for storage
    refresh_token_bytes = refresh_token_str.encode('utf-8')
    if len(refresh_token_bytes) > 72:
        refresh_token_bytes = refresh_token_bytes[:72]
    refresh_token_hash = bcrypt.hashpw(
        refresh_token_bytes,
        bcrypt.gensalt(rounds=10)
    ).decode('utf-8')
    
    # Store refresh token
    refresh_token = RefreshToken(
        session_id=session.id,
        token_hash=refresh_token_hash,
        expires_at=datetime.utcnow() + timedelta(days=7),
        created_at=datetime.utcnow()
    )
    db.add(refresh_token)
    
    # Update last login
    user.last_login_at = datetime.utcnow()
    
    # Record login history
    login_history = LoginHistory(
        user_id=user.id,
        login_timestamp=datetime.utcnow(),
        login_result="SUCCESS",
        ip_address=normalized_ip,
        user_agent=user_agent,
        device_name=device_name,
        browser=browser,
        operating_system=operating_system
    )
    db.add(login_history)
    
    db.commit()
    db.refresh(session)
    
    return session, access_token, refresh_token_str


def refresh_session(db: Session, refresh_token_str: str) -> Optional[tuple[str, str]]:
    """
    Refresh an access token using a valid refresh token.
    Returns (new_access_token, new_refresh_token) or None.
    """
    # Decode the refresh token JWT
    payload = decode_token(refresh_token_str)
    if not payload or not payload.sub:
        return None
    
    # Find the session
    user_id = int(payload.sub)
    session_uuid = payload.session_uuid
    
    session = db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.session_uuid == str(session_uuid),
        UserSession.is_active == True,
        UserSession.logout_time.is_(None)
    ).first()
    
    if not session:
        return None
    
    # Find the stored refresh token
    stored_token = db.query(RefreshToken).filter(
        RefreshToken.session_id == session.id,
        RefreshToken.revoked_at.is_(None),
        RefreshToken.expires_at > datetime.utcnow()
    ).first()
    
    if not stored_token:
        return None
    
    # Verify the refresh token against stored hash
    if not bcrypt.checkpw(refresh_token_str.encode('utf-8'), stored_token.token_hash.encode('utf-8')):
        return None
    
    # Revoke old refresh token (rotation)
    stored_token.revoked_at = datetime.utcnow()
    
    # Create new tokens
    token_data = {
        "sub": str(user_id),
        "email": payload.email,
        "session_uuid": str(session.session_uuid)
    }
    
    new_access_token = create_access_token(data=token_data)
    new_refresh_token_str = create_refresh_token(data=token_data)
    
    # Hash and store new refresh token
    new_refresh_hash = bcrypt.hashpw(
        new_refresh_token_str.encode('utf-8'),
        bcrypt.gensalt(rounds=10)
    ).decode('utf-8')
    
    new_token = RefreshToken(
        session_id=session.id,
        token_hash=new_refresh_hash,
        expires_at=datetime.utcnow() + timedelta(days=7),
        created_at=datetime.utcnow()
    )
    db.add(new_token)
    
    # Update session activity
    session.last_activity_at = datetime.utcnow()
    
    db.commit()
    
    return new_access_token, new_refresh_token_str


def logout_session(db: Session, session_uuid: str) -> bool:
    """Logout a session by UUID. Returns True if successful."""
    session = db.query(UserSession).filter(
        UserSession.session_uuid == session_uuid,
        UserSession.is_active == True
    ).first()
    
    if not session:
        return False
    
    session.is_active = False
    session.logout_time = datetime.utcnow()
    
    # Revoke all refresh tokens for this session
    db.query(RefreshToken).filter(
        RefreshToken.session_id == session.id,
        RefreshToken.revoked_at.is_(None)
    ).update({"revoked_at": datetime.utcnow()})
    
    db.commit()
    return True


def get_active_sessions(db: Session, user_id: int) -> list[UserSession]:
    """Get all active sessions for a user."""
    return db.query(UserSession).filter(
        UserSession.user_id == user_id,
        UserSession.is_active == True,
        UserSession.logout_time.is_(None)
    ).all()


# ============================================================================
# Password Management
# ============================================================================

def change_password(
    db: Session,
    user: User,
    old_password: str,
    new_password: str
) -> bool:
    """Change user password with history check."""
    # Verify old password
    auth_method = db.query(AuthenticationMethod).filter(
        AuthenticationMethod.user_id == user.id,
        AuthenticationMethod.is_primary == True,
        AuthenticationMethod.authentication_type == "PASSWORD"
    ).first()
    
    if not auth_method or not verify_password(old_password, auth_method.credential_hash):
        return False
    
    # Check password history (last 5 passwords)
    recent_passwords = db.query(PasswordHistory).filter(
        PasswordHistory.user_id == user.id
    ).order_by(PasswordHistory.changed_at.desc()).limit(5).all()
    
    for history in recent_passwords:
        if verify_password(new_password, history.password_hash):
            return False  # Password was used recently
    
    # Hash new password
    new_hash = get_password_hash(new_password)
    
    # Update authentication method
    auth_method.credential_hash = new_hash
    
    # Add to password history
    password_history = PasswordHistory(
        user_id=user.id,
        password_hash=new_hash,
        changed_at=datetime.utcnow()
    )
    db.add(password_history)
    
    user.last_password_change_at = datetime.utcnow()
    
    db.commit()
    return True


def reset_password(db: Session, user: User, new_password: str) -> bool:
    """Reset password (for forgot-password flow)."""
    new_hash = get_password_hash(new_password)
    
    # Update authentication method
    auth_method = db.query(AuthenticationMethod).filter(
        AuthenticationMethod.user_id == user.id,
        AuthenticationMethod.is_primary == True,
        AuthenticationMethod.authentication_type == "PASSWORD"
    ).first()
    
    if auth_method:
        auth_method.credential_hash = new_hash
    
    # Add to password history
    password_history = PasswordHistory(
        user_id=user.id,
        password_hash=new_hash,
        changed_at=datetime.utcnow()
    )
    db.add(password_history)
    
    user.last_password_change_at = datetime.utcnow()
    
    db.commit()
    return True


def update_last_login(db: Session, user: User) -> User:
    """Update the last_login_at timestamp for a user."""
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user