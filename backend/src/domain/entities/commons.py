from typing import Generic, TypeVar

from pydantic import BaseModel, EmailStr


class ProjectRef(BaseModel):
    key: str


class RepoRef(BaseModel):
    project_key: str
    name: str


class AuthorRef(BaseModel):
    id: str
    name: str
    email: EmailStr | None = None


T = TypeVar("T")

class Page(BaseModel, Generic[T]):
    items: list[T]
    next_cursor: str | None = None
