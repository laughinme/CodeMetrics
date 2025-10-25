from pydantic import BaseModel, Field

class ActivityStreak(BaseModel):
    days_count: int = Field(..., description="Количество дней в серии")
    stability_status: str = Field(..., description="Статус стабильности")