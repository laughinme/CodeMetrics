from datetime import datetime

from pydantic import BaseModel


class DailyCommitPoint(BaseModel):
    date: datetime  # 00:00:00 UTC дня
    count: int