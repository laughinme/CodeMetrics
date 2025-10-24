from typing import Optional
from datetime import datetime

from pydantic import BaseModel

class RepositoryDTO(BaseModel):
    id: str                  # UUID
    projectKey: str
    name: str
    defaultBranch: Optional[str]
    description: Optional[str]
    lastActivityAt: Optional[datetime] = None
