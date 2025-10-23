from typing import Generic, Optional, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel


T = TypeVar("T")


class ResponsePageMeta(BaseModel):
    next_cursor: str | None = None
    prev_cursor: str | None = None


class APIResponse(GenericModel, Generic[T]):
    """
    Envelope returned by Source Code API for single-object responses.
    """

    data: T
    status: str
    request_id: str | None = None


class APIListResponse(GenericModel, Generic[T]):
    """
    Envelope returned by Source Code API for list responses.
    """

    data: list[T]
    status: str
    request_id: str | None = None
    page: ResponsePageMeta | None = None
