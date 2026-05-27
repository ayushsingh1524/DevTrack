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
