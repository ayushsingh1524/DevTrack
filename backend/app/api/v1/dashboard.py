import json
from fastapi import APIRouter, Depends, Request
from redis.asyncio import Redis

from app.api import deps
from app.core.config import settings
from app.models.user import User

router = APIRouter()

# Setup Redis client for simple caching
redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_cached_or_set(key: str, data_func, expire: int = 60):
    cached = await redis_client.get(key)
    if cached:
        return json.loads(cached)
    
    data = await data_func()
    await redis_client.set(key, json.dumps(data), ex=expire)
    return data

@router.get("/overview")
async def get_overview(
    current_user: User = Depends(deps.get_current_user)
):
    async def fetch_overview():
        # Mock overview data
        return {
            "active_projects": 4,
            "pending_tasks": 12,
            "daily_streak": 7,
            "total_coding_hours": 142
        }
        
    cache_key = f"user:{current_user.id}:dashboard:overview"
    return await get_cached_or_set(cache_key, fetch_overview)


@router.get("/activity")
async def get_activity(
    current_user: User = Depends(deps.get_current_user)
):
    async def fetch_activity():
        return [
            {
                "id": 1,
                "type": "commit",
                "message": "feat: Implemented new authentication flow",
                "repo": "DevTrack",
                "timestamp": "2 hours ago"
            },
            {
                "id": 2,
                "type": "pr_merged",
                "message": "Fix layout shift in dashboard",
                "repo": "DevTrack",
                "timestamp": "4 hours ago"
            },
            {
                "id": 3,
                "type": "issue_closed",
                "message": "Update dependencies",
                "repo": "Internal-Tools",
                "timestamp": "1 day ago"
            }
        ]
        
    cache_key = f"user:{current_user.id}:dashboard:activity"
    return await get_cached_or_set(cache_key, fetch_activity)


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(deps.get_current_user)
):
    async def fetch_stats():
        # Weekly productivity data for Recharts
        return {
            "weekly_productivity": [
                {"name": "Mon", "hours": 4, "tasks": 5},
                {"name": "Tue", "hours": 6, "tasks": 8},
                {"name": "Wed", "hours": 5, "tasks": 6},
                {"name": "Thu", "hours": 8, "tasks": 12},
                {"name": "Fri", "hours": 7, "tasks": 10},
                {"name": "Sat", "hours": 2, "tasks": 2},
                {"name": "Sun", "hours": 3, "tasks": 4},
            ],
            "language_stats": [
                {"name": "TypeScript", "value": 65},
                {"name": "Python", "value": 25},
                {"name": "CSS", "value": 10},
            ]
        }

    cache_key = f"user:{current_user.id}:dashboard:stats"
    return await get_cached_or_set(cache_key, fetch_stats)
