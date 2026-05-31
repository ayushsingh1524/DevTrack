from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError

from app.api import deps
from app.core.config import settings
from app.core import security
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin, ForgotPassword, ResetPassword
from app.schemas.token import Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    # Check if username or email exists
    result = await db.execute(
        select(User).where((User.email == user_in.email) | (User.username == user_in.username))
    )
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username or email already exists in the system."
        )

    # Create new user
    db_user = User(
        email=user_in.email,
        username=user_in.username,
        password_hash=security.get_password_hash(user_in.password),
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    user_in: UserLogin,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(User).where(User.email == user_in.email))
    user = result.scalars().first()
    
    if not user or not security.verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = security.create_access_token(subject=user.id)
    refresh_token = security.create_refresh_token(subject=user.id)

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False, # Set to True in production
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    try:
        payload = jwt.decode(
            refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    # verify user exists
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_access_token = security.create_access_token(subject=user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(response: Response) -> Any:
    response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPassword,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    if not user:
        # Don't reveal if user exists or not for security
        return {"message": "If an account exists, a password reset link has been sent."}
    
    # In a real app, generate a reset token and send email
    # For now, we will just print to console
    reset_token = security.create_access_token(subject=user.id, expires_delta=security.timedelta(hours=1))
    print(f"PASSWORD RESET TOKEN FOR {user.email}: {reset_token}")
    
    return {"message": "If an account exists, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(
    data: ResetPassword,
    db: AsyncSession = Depends(deps.get_db)
) -> Any:
    try:
        payload = jwt.decode(
            data.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = security.get_password_hash(data.new_password)
    db.add(user)
    await db.commit()
    
    return {"message": "Password updated successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get current user details."""
    return current_user


# --- OAuth Routes ---

import httpx
from fastapi.responses import RedirectResponse

@router.get("/github/login")
async def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GitHub Client ID not configured")
    
    # Redirect to GitHub authorization page
    url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&scope=read:user user:email&prompt=consent"
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(
    code: str,
    response: Response,
    db: AsyncSession = Depends(deps.get_db)
):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="GitHub OAuth not configured")
        
    async with httpx.AsyncClient() as client:
        # Get access token
        token_res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
            }
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get GitHub access token")
            
        # Get user profile
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_res.json()
        
        # Get user emails
        emails_res = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails_data = emails_res.json()
        primary_email = next((e["email"] for e in emails_data if e["primary"]), emails_data[0]["email"])
        
    github_id = str(user_data.get("id"))
    username = user_data.get("login")
    avatar = user_data.get("avatar_url")
    
    # Check if user exists
    result = await db.execute(select(User).where((User.email == primary_email) | (User.github_id == github_id)))
    user = result.scalars().first()
    
    if user:
        # Link account if not linked
        if not user.github_id:
            user.github_id = github_id
            user.github_username = username
            user.github_access_token = access_token
            db.add(user)
            await db.commit()
    else:
        # Create new user
        user = User(
            email=primary_email,
            username=f"gh_{username}",
            avatar=avatar,
            github_id=github_id,
            github_username=username,
            github_access_token=access_token,
            auth_provider="github"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    # Generate tokens
    jwt_access_token = security.create_access_token(subject=user.id)
    jwt_refresh_token = security.create_refresh_token(subject=user.id)
    
    # We set refresh token in cookie like normal login
    # But because this is a cross-origin redirect sometimes, we might need a frontend callback page
    # to receive the access token. 
    # We redirect to the frontend with the access token in query param.
    redirect_url = f"{settings.FRONTEND_URL}/oauth/callback?token={jwt_access_token}"
    
    res = RedirectResponse(url=redirect_url)
    res.set_cookie(
        key="refresh_token",
        value=jwt_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False, # Set to True in production
    )
    return res


@router.get("/google/login")
async def google_login(request: Request):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
        
    # Redirect to Google authorization page
    redirect_uri = f"{settings.FRONTEND_URL}/api/v1/auth/google/callback"
    url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}&response_type=code&scope=openid email profile&redirect_uri={redirect_uri}&prompt=select_account"
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(
    request: Request,
    code: str,
    response: Response,
    db: AsyncSession = Depends(deps.get_db)
):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
        
    redirect_uri = f"{settings.FRONTEND_URL}/api/v1/auth/google/callback"
        
    async with httpx.AsyncClient() as client:
        # Get access token
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            }
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Failed to get Google access token")
            
        # Get user profile
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_res.json()
        
    google_id = str(user_data.get("id"))
    email = user_data.get("email")
    avatar = user_data.get("picture")
    # Clean username from email if name not available
    raw_name = user_data.get("name") or email.split("@")[0]
    username_base = raw_name.lower().replace(" ", "")
    
    # Check if user exists
    result = await db.execute(select(User).where((User.email == email) | (User.google_id == google_id)))
    user = result.scalars().first()
    
    if user:
        if not user.google_id:
            user.google_id = google_id
            db.add(user)
            await db.commit()
    else:
        # Ensure username uniqueness
        user = User(
            email=email,
            username=f"go_{username_base}",
            avatar=avatar,
            google_id=google_id,
            auth_provider="google"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
    # Generate tokens
    jwt_access_token = security.create_access_token(subject=user.id)
    jwt_refresh_token = security.create_refresh_token(subject=user.id)
    
    redirect_url = f"{settings.FRONTEND_URL}/oauth/callback?token={jwt_access_token}"
    
    res = RedirectResponse(url=redirect_url)
    res.set_cookie(
        key="refresh_token",
        value=jwt_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False,
    )
    return res
