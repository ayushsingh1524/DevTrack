from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class NoteVersionBase(BaseModel):
    markdown_content: str

class NoteVersionResponse(NoteVersionBase):
    id: int
    note_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NoteBase(BaseModel):
    title: str
    markdown_content: Optional[str] = ""
    tags: Optional[List[str]] = []

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    markdown_content: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NoteDetailResponse(NoteResponse):
    versions: List[NoteVersionResponse] = []

    model_config = ConfigDict(from_attributes=True)
