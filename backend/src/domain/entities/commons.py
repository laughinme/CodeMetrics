from typing import Generic, TypeVar

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
    email: EmailStr | None = None


T = TypeVar("T")

class Page(GenericModel, Generic[T]):
    items: list[T]
    next_cursor: str | None = None
