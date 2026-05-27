import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone

from app.api import deps
from app.models.user import User
from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse
from app.core.redis import redis_client

router = APIRouter()

async def invalidate_project_cache(user_id: int):
    """Helper to invalidate Redis cache for project lists."""
    if redis_client.redis:
        keys = await redis_client.redis.keys(f"user:{user_id}:projects:*")
        if keys:
            await redis_client.redis.delete(*keys)

@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve projects for the current user (either owned by them or accessible).
    Currently returns projects created by the user.
    """
    cache_key = f"user:{current_user.id}:projects:list:{skip}:{limit}"
    
    if redis_client.redis:
        cached_data = await redis_client.redis.get(cache_key)
        if cached_data:
            return json.loads(cached_data)

    query = (
        select(Project)
        .options(selectinload(Project.owner))
        .where(Project.user_id == current_user.id)
        .order_by(Project.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    projects = result.scalars().all()

    response_data = [ProjectResponse.model_validate(p).model_dump(mode='json') for p in projects]
    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 300, json.dumps(response_data))

    return response_data


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create a new project.
    """
    project = Project(
        **project_in.model_dump(),
        user_id=current_user.id
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)

    # Invalidate cache
    await invalidate_project_cache(current_user.id)

    # Load owner for response
    query = select(Project).options(selectinload(Project.owner)).where(Project.id == project.id)
    result = await db.execute(query)
    project = result.scalars().first()

    return project


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get project details along with calculated analytics and tasks.
    """
    query = (
        select(Project)
        .options(
            selectinload(Project.owner),
            selectinload(Project.tasks).selectinload(Task.assignee),
            selectinload(Project.tasks).selectinload(Task.owner)
        )
        .where(Project.id == project_id)
    )
    result = await db.execute(query)
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Analytics Calculation
    total_tasks = len(project.tasks)
    completed_tasks = sum(1 for t in project.tasks if t.status == "completed")
    pending_tasks = total_tasks - completed_tasks
    
    now = datetime.now(timezone.utc)
    overdue_tasks = sum(
        1 for t in project.tasks 
        if t.due_date and t.due_date < now and t.status != "completed"
    )

    completion_percentage = 0
    if total_tasks > 0:
        completion_percentage = int((completed_tasks / total_tasks) * 100)

    analytics = {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": completion_percentage,
        "overdue_tasks": overdue_tasks,
        "pending_tasks": pending_tasks
    }

    # Assign analytics manually before response validation
    # Since we are returning a Pydantic model directly
    response = ProjectDetailResponse.model_validate(project)
    response.analytics = analytics
    
    return response


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update a project.
    """
    query = select(Project).options(selectinload(Project.owner)).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)

    await invalidate_project_cache(current_user.id)
    return project


@router.delete("/{project_id}", response_model=ProjectResponse)
async def delete_project(
    *,
    db: AsyncSession = Depends(deps.get_db),
    project_id: int,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Delete a project. Linked tasks will have project_id set to NULL due to SET NULL constraint.
    """
    query = select(Project).options(selectinload(Project.owner)).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(project)
    await db.commit()

    await invalidate_project_cache(current_user.id)
    return project
