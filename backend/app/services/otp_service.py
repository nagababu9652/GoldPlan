import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException

from ..models.otp import OTP
from ..core.config import settings

OTP_EXPIRY_MINUTES = 10
OTP_LENGTH = 6
MAX_OTP_PER_HOUR = 3  # Rate limiting: max 3 OTPs per hour per email


def generate_otp() -> str:
    """Generate a 6-digit OTP code."""
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


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


def create_otp(db: Session, email: str, purpose: str = "registration", background_tasks: BackgroundTasks = None) -> OTP:
    """Create a new OTP record and send it via email."""
    # Rate limiting: Check if user has exceeded max OTPs per hour
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_otp_count = db.query(OTP).filter(
        OTP.email == email,
        OTP.created_at > one_hour_ago
    ).count()
    
    if recent_otp_count >= MAX_OTP_PER_HOUR:
        raise HTTPException(
            status_code=429,
            detail=f"Too many OTP requests. Please wait before requesting another OTP. Maximum {MAX_OTP_PER_HOUR} OTPs per hour."
        )
    
    # Invalidate any existing unused OTPs for this email/purpose
    existing_otps = db.query(OTP).filter(
        OTP.email == email,
        OTP.purpose == purpose,
        OTP.is_used == False,
        OTP.expires_at > datetime.utcnow()
    ).all()
    
    for otp in existing_otps:
        otp.is_used = True
        otp.used_at = datetime.utcnow()
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    
    otp_record = OTP(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at,
        created_at=datetime.utcnow()
    )
    
    db.add(otp_record)
    db.commit()
    db.refresh(otp_record)
    
    # Send OTP via email in background if background_tasks is provided
    if background_tasks:
        background_tasks.add_task(send_otp_email, email, otp_code, purpose)
    else:
        # Fallback to synchronous sending
        send_otp_email(email, otp_code, purpose)
    
    return otp_record


def verify_otp(db: Session, email: str, otp_code: str, purpose: str = "registration") -> bool:
    """Verify an OTP code. Returns True if valid, False otherwise."""
    now = datetime.utcnow()
    
    # Find the OTP record
    otp_record = db.query(OTP).filter(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.purpose == purpose,
        OTP.is_used == False,
        OTP.expires_at > now
    ).first()
    
    if not otp_record:
        return False
    
    # Mark as used
    otp_record.is_used = True
    otp_record.used_at = now
    db.commit()
    
    return True


def cleanup_expired_otps(db: Session) -> int:
    """Cleanup expired OTP records. Returns count of deleted records."""
    now = datetime.utcnow()
    expired = db.query(OTP).filter(OTP.expires_at <= now).all()
    count = len(expired)
    for otp in expired:
        db.delete(otp)
    db.commit()
    return count