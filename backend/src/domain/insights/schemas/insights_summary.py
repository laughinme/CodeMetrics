from pydantic import BaseModel, Field

class InsightsSummary(BaseModel):
    period_description: str = Field(..., description="Описание анализируемого периода")
    trend: str = Field(..., description="Общий тренд активности")
    recommendations: list[str] = Field(..., description="Рекомендации по улучшению")