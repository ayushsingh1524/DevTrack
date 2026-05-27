from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: int
    task_id: int
    user_id: int
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: int
    task_id: int
    user_id: int
    activity_type: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "todo"      # todo, in_progress, review, completed
    due_date: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    project_id: Optional[int] = None
    assignee_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    assignee_id: Optional[int] = None


class TaskResponse(TaskBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    owner: UserResponse
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True
