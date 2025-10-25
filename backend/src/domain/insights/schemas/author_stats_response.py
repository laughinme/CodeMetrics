from uuid import UUID
from datetime import datetime

from pydantic import BaseModel

class AuthorStatsResponse(BaseModel):
    author_id: UUID
    author_name: str
    commit_count: int
    percentage: float
    off_hours_commits: int
    most_active_day: datetime