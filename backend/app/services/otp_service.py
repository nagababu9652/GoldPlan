"""
OTP Service - handles OTP generation, hashing, sending, and verification.
Uses identity.otp_requests table with bcrypt-hashed OTP codes.
"""
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException

from ..models.identity.auth import OTPRequest
from ..core.config import settings

OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6
MAX_OTP_PER_HOUR = 3  # Rate limiting: max 3 OTPs per hour per destination


def generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def hash_otp(otp_code: str) -> str:
    """Hash OTP code using bcrypt before storage."""
    return bcrypt.hashpw(otp_code.encode('utf-8'), bcrypt.gensalt(rounds=10)).decode('utf-8')


def verify_otp_hash(otp_code: str, otp_code_hash: str) -> bool:
    """Verify OTP code against stored hash."""
    return bcrypt.checkpw(otp_code.encode('utf-8'), otp_code_hash.encode('utf-8'))


def send_otp_email(email: str, otp_code: str, purpose: str) -> bool:
    """Send OTP via email using SMTP."""
    try:
        purpose_label = "Registration" if purpose == "registration" else "Password Reset"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Your FinPlan {purpose_label} OTP'
        msg['From'] = settings.smtp_from
        msg['To'] = email
        
        # HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; }}
                .header {{ text-align: center; margin-bottom: 30px; }}
                .logo {{ font-size: 32px; font-weight: bold; color: #C9A227; }}
                .otp-box {{ background-color: #f8f6f0; border: 2px dashed #C9A227; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }}
                .otp-code {{ font-size: 36px; font-weight: bold; color: #0C0B0A; letter-spacing: 8px; }}
                .message {{ color: #666; line-height: 1.6; }}
                .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">FinPlan</div>
                </div>
                <h2>Your One-Time Password</h2>
                <p class="message">Use the following OTP to complete your {purpose_label.lower()}. This OTP is valid for {OTP_EXPIRY_MINUTES} minutes.</p>
                <div class="otp-box">
                    <div class="otp-code">{otp_code}</div>
                </div>
                <p class="message">If you didn't request this OTP, please ignore this email.</p>
                <div class="footer">
                    <p>FinPlan India Research Pvt. Ltd.</p>
                    <p>Financial District, Gachibowli, Hyderabad</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_content = f"""
        FinPlan - Your One-Time Password
        
        Your OTP for {purpose_label} is: {otp_code}
        
        This OTP is valid for {OTP_EXPIRY_MINUTES} minutes.
        
        If you didn't request this OTP, please ignore this email.
        
        FinPlan India Research Pvt. Ltd.
        Financial District, Gachibowli, Hyderabad
        """
        
        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        print(f"✅ OTP email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        # For development, still print the OTP to console
        print(f"""
        ========================================
        📧 OTP EMAIL (Console Fallback)
        To: {email}
        Purpose: {purpose_label}
        OTP Code: {otp_code}
        Expires: {OTP_EXPIRY_MINUTES} minutes
        ========================================
        """)
        return False


def create_otp(
    db: Session,
    destination: str,
    purpose: str = "registration",
    user_id: Optional[int] = None,
    background_tasks: Optional[BackgroundTasks] = None
) -> OTPRequest:
    """Create a new OTP record, hash the code, and send via email."""
    # Rate limiting: Check if user has exceeded max OTPs per hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_otp_count = db.query(OTPRequest).filter(
        OTPRequest.destination == destination,
        OTPRequest.created_at > one_hour_ago
    ).count()
    
    if recent_otp_count >= MAX_OTP_PER_HOUR:
        raise HTTPException(
            status_code=429,
            detail=f"Too many OTP requests. Please wait before requesting another OTP. Maximum {MAX_OTP_PER_HOUR} OTPs per hour."
        )
    
    # Invalidate any existing unused OTPs for this destination/purpose
    existing_otps = db.query(OTPRequest).filter(
        OTPRequest.destination == destination,
        OTPRequest.purpose == purpose,
        OTPRequest.is_used == False,
        OTPRequest.expires_at > datetime.utcnow()
    ).all()
    
    for otp in existing_otps:
        otp.is_used = True
    
    # Generate new OTP
    otp_code = generate_otp()
    otp_code_hash = hash_otp(otp_code)
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    otp_record = OTPRequest(
        user_id=user_id,
        destination=destination,
        otp_code_hash=otp_code_hash,
        purpose=purpose,
        expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    # Store plain OTP temporarily for email sending
    otp_record._plain_otp = otp_code
    
    # Send OTP via email
    if background_tasks:
        background_tasks.add_task(send_otp_email, destination, otp_code, purpose)
    else:
        send_otp_email(destination, otp_code, purpose)
    
    return otp_record


def verify_otp(db: Session, destination: str, otp_code: str, purpose: str = "registration") -> bool:
    """Verify an OTP code against stored hash. Returns True if valid."""
    now = datetime.utcnow()
    
    # Find the OTP record
    otp_record = db.query(OTPRequest).filter(
        OTPRequest.destination == destination,
        OTPRequest.purpose == purpose,
        OTPRequest.is_used == False,
        OTPRequest.expires_at > now
    ).order_by(OTPRequest.created_at.desc()).first()
    
    if not otp_record:
        return False
    
    # Verify the OTP code against stored hash
    if verify_otp_hash(otp_code, otp_record.otp_code_hash):
        otp_record.is_used = True
        otp_record.verified_at = now
        db.commit()
        return True
    
    # Increment failed attempts
    otp_record.failed_attempts += 1
    db.commit()
    return False


def cleanup_expired_otps(db: Session) -> int:
    """Mark expired OTP records as used. Returns count of expired records."""
    now = datetime.utcnow()
    expired = db.query(OTPRequest).filter(
        OTPRequest.expires_at <= now,
        OTPRequest.is_used == False
    ).all()
    count = len(expired)
    for otp in expired:
        otp.is_used = True
    db.commit()
    return count