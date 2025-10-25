from uuid import UUID
from datetime import datetime

from pydantic import BaseModel

class FileChurnResponse(BaseModel):
    file_path: str
    churn: int
    change_frequency: int
    authors: list[UUID]
    first_seen: datetime
    last_seen: datetime