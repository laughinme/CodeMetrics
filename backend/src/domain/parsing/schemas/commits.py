from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from .author import GitUser


class CommitModel(BaseModel):
    """Represents a commit."""

    model_config = {"populate_by_name": True}
    
    sha: str = Field(..., description="Commit SHA hash (primary key)", alias="hash")
    author: GitUser | None = Field(None)
    committer: GitUser | None = Field(None)
    created_at: datetime = Field(..., description="Commit timestamp")
    message: str | None = Field(None, description="Commit message")
    issues: dict[str, str] = Field(
        default_factory=dict,
        description="Linked issues map as returned by Source Code API",
    )
    parents: list[str] = Field(default_factory=list, description="Parent commit hashes")
    branch_names: list[str] = Field(
        default_factory=list, description="Branches associated with the commit"
    )
    tag_names: list[str] = Field(
        default_factory=list, description="Tag names attached to commit"
    )
    old_tags: list[str] = Field(
        default_factory=list, alias="Tags", description="Deprecated tags array"
    )
