from pydantic import BaseModel, Field

class CommitStats(BaseModel):
    total: int
    percentage_change: float = Field(..., description="WoW изменение в процентах")