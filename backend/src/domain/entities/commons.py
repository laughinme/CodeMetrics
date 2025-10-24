from pydantic import BaseModel, EmailStr
from typing import Optional, List

# Ссылки/идентификаторы
class ProjectRef(BaseModel):
    key: str  # из projects.name
class RepoRef(BaseModel):
    projectKey: str
    name: str

# Автор
class AuthorRef(BaseModel):
    id: str
    name: str
    email: EmailStr

# Пагинация
class Page[T](BaseModel):
    items: List[T]
    nextCursor: Optional[str] = None
