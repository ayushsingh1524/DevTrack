import json
import random
from typing import Any, Dict
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.models.user import User
from app.models.task import Task
from app.models.project import Project
from app.core.redis import redis_client

router = APIRouter()

def get_deterministic_random(seed: int, index: int, max_val: int) -> int:
    """Simple deterministic random number generator for realistic mock data."""
    random.seed(seed + index)
    return random.randint(0, max_val)

@router.get("/overview")
async def get_overview(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Get high-level analytics overview.
    Blends real database metrics with deterministic aesthetic mocks.
    """
    cache_key = f"user:{current_user.id}:analytics:overview"
    
    if redis_client.redis:
        cached_data = await redis_client.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    # Real Metrics
    query_completed_tasks = select(func.count(Task.id)).where(
        Task.owner_id == current_user.id, 
        Task.status == "completed"
    )
    completed_tasks_res = await db.execute(query_completed_tasks)
    total_completed = completed_tasks_res.scalar() or 0

    query_active_projects = select(func.count(Project.id)).where(
        Project.user_id == current_user.id,
        Project.status == "active"
    )
    active_projects_res = await db.execute(query_active_projects)
    active_projects = active_projects_res.scalar() or 0

    # Deterministic Aesthetics
    streak = get_deterministic_random(current_user.id, 999, 45)
    coding_hours = get_deterministic_random(current_user.id, 888, 120) + (total_completed * 1.5)

    data = {
        "total_completed_tasks": total_completed,
        "active_projects": active_projects,
        "current_streak_days": streak,
        "total_coding_hours": int(coding_hours),
    }

    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 1800, json.dumps(data)) # 30 min cache

    return data


@router.get("/streaks")
async def get_streaks(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Returns daily intensity data for the past 90 days for the Activity Heatmap.
    """
    cache_key = f"user:{current_user.id}:analytics:streaks"
    
    if redis_client.redis:
        cached_data = await redis_client.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    today = datetime.now(timezone.utc)
    heatmap_data = []

    # Generate 90 days of deterministic data
    for i in range(90):
        target_date = today - timedelta(days=90 - i - 1)
        
        # Base intensity: weekends lower, weekdays higher
        is_weekend = target_date.weekday() >= 5
        max_intensity = 2 if is_weekend else 5
        
        commits = get_deterministic_random(current_user.id, i, max_intensity)
        hours = commits * 1.2
        tasks = get_deterministic_random(current_user.id, i + 100, max_intensity - 1)
        
        heatmap_data.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "commits": commits,
            "hours": round(hours, 1),
            "tasks_completed": tasks
        })

    data = {"heatmap": heatmap_data}

    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 1800, json.dumps(data))

    return data


@router.get("/productivity")
async def get_productivity(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Returns week-over-week distribution charts and project progress analytics.
    """
    cache_key = f"user:{current_user.id}:analytics:productivity"
    
    if redis_client.redis:
        cached_data = await redis_client.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    # 1. Weekly Distribution (Mock Deterministic)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_chart = []
    for i, day in enumerate(days):
        weekly_chart.append({
            "day": day,
            "hours": get_deterministic_random(current_user.id, i + 200, 8),
            "tasks": get_deterministic_random(current_user.id, i + 300, 5)
        })

    # 2. Real Project Progress
    query = select(Project).where(Project.user_id == current_user.id).limit(5)
    projects_res = await db.execute(query)
    projects = projects_res.scalars().all()

    project_stats = []
    for p in projects:
        # Get tasks for this project
        t_query = select(Task.status).where(Task.project_id == p.id)
        t_res = await db.execute(t_query)
        task_statuses = t_res.scalars().all()
        
        total = len(task_statuses)
        completed = sum(1 for s in task_statuses if s == "completed")
        progress = int((completed / total) * 100) if total > 0 else 0
        
        project_stats.append({
            "name": p.title,
            "progress": progress,
            "total_tasks": total
        })

    data = {
        "weekly_chart": weekly_chart,
        "project_stats": project_stats
    }

    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 1800, json.dumps(data))

    return data
