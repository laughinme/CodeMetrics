from pydantic import BaseModel, Field

from datetime import datetime

class PeakDay(BaseModel):
    date: datetime
    commit_count: int
    description: str = Field(..., description="Описание пикового дня")