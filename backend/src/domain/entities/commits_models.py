from typing import Literal, Optional
from datetime import datetime

from pydantic import BaseModel

from .commons import RepoRef, AuthorRef


ChangeStatus = Literal["added", "modified", "deleted", "renamed"]

class CommitFileModel(BaseModel):
    change_id: str
    path: str
    previous_path: Optional[str] = None
    status: ChangeStatus
    is_binary: bool = False
    added_lines: int
    deleted_lines: int

class CommitOut(BaseModel):
    sha: str
    repo: RepoRef
    author: AuthorRef
    committer: Optional[AuthorRef] = None
    committed_at: datetime
    message: str
    is_merge: bool = False
    added_lines: int
    deleted_lines: int
    files_changed: int
