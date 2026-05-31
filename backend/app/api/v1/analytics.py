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
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Returns daily intensity data for the past 90 days for the Activity Heatmap.
    Fetches real completed tasks and GitHub commits.
    """
    cache_key = f"user:{current_user.id}:analytics:streaks"
    
    if redis_client.redis:
        cached_data = await redis_client.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=89)
    
    heatmap_data = []
    
    # 1. Fetch completed tasks for the last 90 days
    tasks_query = select(Task.updated_at).where(
        Task.owner_id == current_user.id,
        Task.status == "completed",
        Task.updated_at >= datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
    )
    tasks_res = await db.execute(tasks_query)
    completed_task_dates = [t.date() for t in tasks_res.scalars().all() if t]
    
    # 2. Fetch Github activities for the last 90 days
    # (assuming GithubActivity is linked via project_id which is linked to user, 
    # but for simplicity, since GithubStat has no direct activity per user yet except via project,
    # wait... GithubActivity has project_id. Let's find projects owned by user)
    projects_query = select(Project.id).where(Project.user_id == current_user.id)
    projects_res = await db.execute(projects_query)
    project_ids = projects_res.scalars().all()
    
    github_dates = []
    if project_ids:
        from app.models.github import GithubActivity
        github_query = select(GithubActivity.timestamp).where(
            GithubActivity.project_id.in_(project_ids),
            GithubActivity.timestamp >= datetime.combine(start_date, datetime.min.time()).replace(tzinfo=timezone.utc)
        )
        github_res = await db.execute(github_query)
        github_dates = [g.date() for g in github_res.scalars().all() if g]

    # Map counts per day
    for i in range(90):
        target_date = start_date + timedelta(days=i)
        
        tasks_completed = sum(1 for d in completed_task_dates if d == target_date)
        commits = sum(1 for d in github_dates if d == target_date)
        
        heatmap_data.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "commits": commits,
            "tasks_completed": tasks_completed,
            "hours": round(commits * 0.5 + tasks_completed * 1.0, 1)
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
