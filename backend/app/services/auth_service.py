from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.identity.auth import User, AuthenticationMethod
from ..models.identity.otp_request import OTPRequest
from ..schemas.auth import TokenPayload


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password = plain_password[:72] if len(plain_password.encode('utf-8')) > 72 else plain_password
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    truncated = password[:72] if len(password.encode('utf-8')) > 72 else password
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(truncated.encode('utf-8'), salt).decode('utf-8')


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> Optional[TokenPayload]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return TokenPayload(**payload)
    except JWTError:
        return None


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    auth_method = db.query(AuthenticationMethod).filter(
        AuthenticationMethod.user_id == user.id,
        AuthenticationMethod.is_primary == True,
        AuthenticationMethod.authentication_type == "PASSWORD"
    ).first()
    
    if not auth_method or not auth_method.credential_hash:
        return None
    
    if not verify_password(password, auth_method.credential_hash):
        return None
    
    return user


def create_user(db: Session, user_data: dict) -> User:
    password = user_data.pop("password")
    hashed_password = get_password_hash(password)
    
    try:
        user = User(
            party_id=user_data.get("party_id"),
            username=user_data.get("email"),
            email=user_data["email"],
            mobile_number=user_data.get("mobile_number"),
            display_name=f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
            preferred_language="en",
            timezone="Asia/Kolkata",
            email_verified=False,
            account_status="ACTIVE",
        )
        db.add(user)
        db.flush()
        
        auth_method = AuthenticationMethod(
            user_id=user.id,
            authentication_type="PASSWORD",
            credential_hash=hashed_password,
            password_algorithm="bcrypt",
            is_primary=True,
            is_enabled=True
        )
        db.add(auth_method)
        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise


def update_last_login(db: Session, user: User) -> User:
    user.last_login_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def create_otp(db: Session, destination: str, purpose: str = "registration", user_id: Optional[int] = None) -> OTPRequest:
    import random
    import string
    
    otp_code = ''.join(random.choices(string.digits, k=6))
    otp_hash = bcrypt.hashpw(otp_code.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    otp_record = OTPRequest(
        user_id=user_id,
        destination=destination,
        otp_code_hash=otp_hash,
        purpose=purpose,
        expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    # Store plain OTP for email sending
    otp_record._plain_otp = otp_code
    
    return otp_record


def verify_otp(db: Session, destination: str, otp_code: str, purpose: str) -> bool:
    now = datetime.utcnow()
    
    otp_record = db.query(OTPRequest).filter(
        OTPRequest.destination == destination,
        OTPRequest.purpose == purpose,
        OTPRequest.is_used == False,
        OTPRequest.expires_at > now
    ).order_by(OTPRequest.created_at.desc()).first()
    
    if not otp_record:
        return False
    
    if bcrypt.checkpw(otp_code.encode('utf-8'), otp_record.otp_code_hash.encode('utf-8')):
        otp_record.is_used = True
        otp_record.verified_at = now
        db.commit()
        return True
    
    otp_record.failed_attempts += 1
    db.commit()
    return False