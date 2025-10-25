from pydantic import BaseModel, Field

class HotFile(BaseModel):
    file_path: str
    churn: int = Field(..., description="Суммарное количество изменений в файле")
    change_frequency: int = Field(..., description="Количество изменений файла")