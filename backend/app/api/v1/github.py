import os
import json
import asyncio
import random
from typing import Any, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
from app.db.session import AsyncSessionLocal

from app.api import deps
from app.models.user import User
from app.models.github import GithubStat, ProjectGithubRepo, GithubActivity
from app.models.task import Task
from app.schemas.github import GithubStatusResponse, GithubStatResponse, GithubConnectRequest
from app.core.redis import redis_client
from app.core.config import settings
import re
from fastapi import Request

router = APIRouter()

# Simple deterministic random for mock fallback
def get_mock_random(seed: int, index: int, min_val: int, max_val: int) -> int:
    random.seed(seed + index)
    return random.randint(min_val, max_val)

async def sync_github_data(user_id: int, access_token: str):
    """
    Background task to sync Github data.
    If real access_token is 'mock_token', generates deterministic mock data.
    Otherwise, it would call real Github APIs using httpx.
    """
    try:
        # Simulate network delay for sync
        await asyncio.sleep(2)
        
        commits = 0
        repos = 0
        prs = 0
        top_langs = {}

        if access_token == "mock_token":
            # Generate deterministic mock data
            commits = get_mock_random(user_id, 1, 500, 2500)
            repos = get_mock_random(user_id, 2, 10, 45)
            prs = get_mock_random(user_id, 3, 20, 150)
            
            languages = ["TypeScript", "Python", "Rust", "Go", "HTML"]
            for i, lang in enumerate(languages):
                top_langs[lang] = get_mock_random(user_id, 4+i, 5, 40)
        else:
            # Real Github API logic
            async with httpx.AsyncClient() as client:
                headers = {
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
                
                # Fetch repos
                repos_resp = await client.get("https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator", headers=headers)
                if repos_resp.status_code == 200:
                    repos_data = repos_resp.json()
                    repos = len(repos_data)
                    
                    # Aggregate languages from top 10 recently updated repos
                    sorted_repos = sorted(repos_data, key=lambda x: x.get('updated_at', ''), reverse=True)[:10]
                    lang_freq = {}
                    for r in sorted_repos:
                        lang = r.get("language")
                        if lang:
                            lang_freq[lang] = lang_freq.get(lang, 0) + 1
                            
                    # Calculate percentage (approximate)
                    total_lang_repos = sum(lang_freq.values())
                    if total_lang_repos > 0:
                        for l, c in lang_freq.items():
                            top_langs[l] = int((c / total_lang_repos) * 100)
                            
                # For commits and PRs, we can use search API (approximate for user)
                # Fetching total commits authored by user
                user_resp = await client.get("https://api.github.com/user", headers=headers)
                username = user_resp.json().get("login", "")
                
                if username:
                    # NOTE: search/commits is sometimes preview or requires specific headers.
                    # As an alternative, let's just fetch events for the user to count recent commits and PRs
                    events_resp = await client.get(f"https://api.github.com/users/{username}/events?per_page=100", headers=headers)
                    if events_resp.status_code == 200:
                        events = events_resp.json()
                        for ev in events:
                            if ev["type"] == "PushEvent":
                                commits += len(ev.get("payload", {}).get("commits", []))
                            elif ev["type"] == "PullRequestEvent":
                                prs += 1
            
        # Update Database
        async with AsyncSessionLocal() as db:
            query = select(GithubStat).where(GithubStat.user_id == user_id)
            result = await db.execute(query)
            stat = result.scalars().first()

            if not stat:
                stat = GithubStat(user_id=user_id)
                db.add(stat)
                
            stat.commits = commits
            stat.repositories = repos
            stat.pull_requests = prs
            stat.top_languages = top_langs
            stat.updated_at = datetime.now(timezone.utc)

            await db.commit()
        
        # Invalidate cache
        if redis_client.redis:
            await redis_client.redis.delete(f"user:{user_id}:github:stats")

    except Exception as e:
        print(f"Background Sync Error: {e}")
        # In a real app, log error or mark sync as failed

@router.get("/status", response_model=GithubStatusResponse)
async def get_status(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Check if the user is connected to GitHub."""
    query = select(GithubStat.updated_at).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    last_synced = result.scalar()
    
    return GithubStatusResponse(
        is_connected=bool(current_user.github_access_token),
        username=current_user.github_username,
        last_synced=last_synced
    )

@router.post("/connect")
async def connect_github(
    *,
    payload: GithubConnectRequest,
    db: AsyncSession = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Connects GitHub account using PAT.
    """
    if not payload.token:
        raise HTTPException(status_code=400, detail="Token is required")
        
    # Verify token and get username
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://api.github.com/user", headers={
            "Authorization": f"Bearer {payload.token}",
            "Accept": "application/vnd.github.v3+json"
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid GitHub Token")
            
        username = resp.json().get("login")

    current_user.github_access_token = payload.token
    current_user.github_username = username
    await db.commit()
    
    # Trigger initial sync
    background_tasks.add_task(sync_github_data, current_user.id, payload.token)
    
    return {"status": "success", "message": "Connected to GitHub"}

@router.post("/disconnect")
async def disconnect_github(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Removes Github connection."""
    current_user.github_access_token = None
    current_user.github_username = None
    
    # Remove stats
    query = select(GithubStat).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    stat = result.scalars().first()
    if stat:
        await db.delete(stat)
        
    await db.commit()
    
    if redis_client.redis:
        await redis_client.redis.delete(f"user:{current_user.id}:github:stats")
        
    return {"status": "success"}

@router.post("/sync")
async def trigger_sync(
    *,
    db: AsyncSession = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Manually trigger a background sync job."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")
        
    background_tasks.add_task(sync_github_data, current_user.id, current_user.github_access_token)
    return {"status": "sync_started"}

@router.get("/stats", response_model=GithubStatResponse)
async def get_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get aggregated GitHub stats from the database."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")

    cache_key = f"user:{current_user.id}:github:stats"
    if redis_client.redis:
        cached = await redis_client.redis.get(cache_key)
        if cached:
            return json.loads(cached)

    query = select(GithubStat).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    stat = result.scalars().first()

    if not stat:
        # Fallback empty response if sync hasn't finished
        return {
            "id": 0,
            "user_id": current_user.id,
            "commits": 0,
            "repositories": 0,
            "pull_requests": 0,
            "top_languages": {},
            "updated_at": datetime.now(timezone.utc)
        }

    response_data = GithubStatResponse.model_validate(stat).model_dump(mode='json')
    
    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 3600, json.dumps(response_data))

    return response_data

@router.post("/webhook")
async def github_webhook(request: Request, db: AsyncSession = Depends(deps.get_db)):
    """
    Receive GitHub webhook payloads.
    Parses pushes to extract commits, creates GithubActivity, and auto-updates task status.
    """
    event = request.headers.get("x-github-event")
    
    if event != "push":
        # We only care about push events right now
        return {"status": "ignored", "reason": f"unsupported event type: {event}"}
        
    payload = await request.json()
    repo_full_name = payload.get("repository", {}).get("full_name")
    commits = payload.get("commits", [])
    
    if not repo_full_name or not commits:
        return {"status": "ignored", "reason": "missing repo or commits"}
        
    # Find all projects that have this repo linked
    query = select(ProjectGithubRepo).where(ProjectGithubRepo.repo_full_name == repo_full_name)
    result = await db.execute(query)
    linked_repos = result.scalars().all()
    
    if not linked_repos:
        return {"status": "ignored", "reason": "repo not linked to any project"}
        
    task_regex = re.compile(r"Fixes #(\d+)", re.IGNORECASE)
    
    for linked_repo in linked_repos:
        project_id = linked_repo.project_id
        
        for commit in commits:
            # Create GithubActivity
            activity = GithubActivity(
                project_id=project_id,
                activity_type="commit",
                ref_id=commit.get("id", "")[:7],
                title=commit.get("message", "No message").split("\n")[0],
                author=commit.get("author", {}).get("name", "Unknown"),
                url=commit.get("url", ""),
                timestamp=datetime.fromisoformat(commit.get("timestamp", datetime.now(timezone.utc).isoformat()).replace("Z", "+00:00"))
            )
            db.add(activity)
            
            # Parse commit message for "Fixes #123"
            msg = commit.get("message", "")
            matches = task_regex.findall(msg)
            
            for task_id_str in matches:
                try:
                    task_id = int(task_id_str)
                    # Check if task belongs to this project
                    task_query = select(Task).where(Task.id == task_id, Task.project_id == project_id)
                    task_result = await db.execute(task_query)
                    task = task_result.scalars().first()
                    
                    if task and task.status != "completed":
                        task.status = "completed"
                except ValueError:
                    pass
                    
    await db.commit()
    return {"status": "success"}
