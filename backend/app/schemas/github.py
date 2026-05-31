from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, Optional
from datetime import datetime

class GithubStatBase(BaseModel):
    commits: int = 0
    repositories: int = 0
    pull_requests: int = 0
    top_languages: Dict[str, Any] = {}

class GithubStatResponse(GithubStatBase):
    id: int
    user_id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GithubConnectRequest(BaseModel):
    token: str

class GithubStatusResponse(BaseModel):
    is_connected: bool
    username: Optional[str] = None
    last_synced: Optional[datetime] = None

class ProjectGithubRepoCreate(BaseModel):
    repo_full_name: str

class ProjectGithubRepoResponse(BaseModel):
    id: int
    project_id: int
    repo_full_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GithubActivityResponse(BaseModel):
    id: int
    project_id: int
    activity_type: str
    ref_id: str
    title: str
    author: str
    url: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
