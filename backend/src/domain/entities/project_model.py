from datetime import datetime

from pydantic import BaseModel


class ProjectOut(BaseModel):
    id: int
    name: str
    full_name: str
    description: str | None = None

    is_public: bool
    repo_count: int
    last_activity_at: datetime | None = None
