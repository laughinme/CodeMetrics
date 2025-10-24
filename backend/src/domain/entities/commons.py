from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, EmailStr
from pydantic.generics import GenericModel


class ProjectRef(BaseModel):
    key: str


class RepoRef(BaseModel):
    project_key: str
    name: str


class AuthorRef(BaseModel):
    id: str
    name: str
    email: Optional[EmailStr] = None


T = TypeVar("T")

class Page(GenericModel, Generic[T]):
    items: List[T]
    next_cursor: str | None = None
