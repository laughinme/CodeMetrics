from uuid import UUID
from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr


class AuthorRef(BaseModel):
    id: UUID
    name: str
    email: EmailStr

class RepoRef(BaseModel):
    project_key: str
    name: str

class CommitResponse(BaseModel):
    sha: str
    repo: RepoRef
    author: AuthorRef
    committer: AuthorRef | None = None
    committed_at: datetime
    message: str
    is_merge: bool = False
    added_lines: int
    deleted_lines: int
    files_changed: int

class PaginatedCommits(BaseModel):
    items: List[CommitResponse]
    next_cursor: str | None = None