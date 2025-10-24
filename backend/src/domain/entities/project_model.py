from typing import Optional
from datetime import datetime

from pydantic import BaseModel

class ProjectDTO(BaseModel):
    id: int                  # внешний числовой id
    key: str                 # projects.name  (ключ)
    name: str                # projects.full_name (человеческое имя)
    description: Optional[str]
    isPublic: bool = False
    repoCount: int = 0
    lastActivityAt: Optional[datetime] = None
