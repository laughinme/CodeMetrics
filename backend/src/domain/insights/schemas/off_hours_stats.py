from pydantic import BaseModel, Field

class OffHoursStats(BaseModel):
    share_percentage: float = Field(..., description="Доля активности вне 8:00-20:00")
    balance_status: str = Field(..., description="Статус баланса работы")