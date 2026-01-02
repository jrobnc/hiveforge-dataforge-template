from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from app.services.supabase import get_supabase_client
from supabase import Client

router = APIRouter()


async def get_current_user(
    authorization: Optional[str] = Header(None),
    supabase: Client = Depends(get_supabase_client),
):
    """Verify JWT token and return current user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    try:
        # Extract token from "Bearer <token>"
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
async def get_current_user_profile(user = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at,
    }
