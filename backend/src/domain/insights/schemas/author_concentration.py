from pydantic import BaseModel, Field

class AuthorConcentration(BaseModel):
    top1_percentage: float = Field(..., description="Доля топ-1 автора")
    top3_percentage: float = Field(..., description="Суммарная доля топ-3 авторов")
    top_authors_count: int = Field(..., description="Количество авторов в топе")