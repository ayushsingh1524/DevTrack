import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_reset_password_email(email: str, token: str) -> None:
    """Send a password reset email with a link containing the reset token."""
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Your TaskNest Password"
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USER}>"
    msg["To"] = email

    # Plain text version
    text = f"""Hi,

You requested a password reset for your TaskNest account.

Click this link to reset your password:
{reset_link}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

— TaskNest Team
"""

    # HTML version
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">TaskNest</h1>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 12px;">Reset Your Password</h2>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                You requested a password reset. Click the button below to choose a new password.
            </p>
            <a href="{reset_link}" 
               style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                Reset Password
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin: 24px 0 0;">
                This link expires in 1 hour. If you didn't request this, ignore this email.
            </p>
        </div>
    </div>
    """

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=465,
        use_tls=True,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
    )
