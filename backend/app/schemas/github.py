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
    code: str

class GithubStatusResponse(BaseModel):
    is_connected: bool
    username: Optional[str] = None
    last_synced: Optional[datetime] = None
