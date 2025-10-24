from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RepositoryOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    id: UUID = Field(..., description="Repository unique identifier")
    project_id: int = Field(..., description="ID of the project this repository belongs to")
    name: str = Field(..., description="Repository name")
    default_branch: str | None = Field(None, description="Default branch name of the repository")
    description: str | None = Field(None, description="Description provided by repository owner")
    last_activity_at: datetime | None = Field(None, description="Timestamp of last activity in repository", alias="updated_at")
