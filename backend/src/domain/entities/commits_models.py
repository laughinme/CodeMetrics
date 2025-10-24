from typing import Literal, Optional
from datetime import datetime

from pydantic import BaseModel

from .commons import RepoRef, AuthorRef


ChangeStatus = Literal["added", "modified", "deleted", "renamed"]

class CommitFileDTO(BaseModel):
    changeId: str
    path: str
    previousPath: Optional[str] = None
    status: ChangeStatus
    isBinary: bool = False
    addedLines: int
    deletedLines: int

class CommitDTO(BaseModel):
    sha: str
    repo: RepoRef
    author: AuthorRef
    committer: Optional[AuthorRef] = None
    committedAt: datetime
    message: str
    isMerge: bool = False
    addedLines: int
    deletedLines: int
    filesChanged: int
