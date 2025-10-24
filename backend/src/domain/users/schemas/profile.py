from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field, EmailStr, HttpUrl, constr
from datetime import date
from uuid import UUID

from domain.common import TimestampModel

class UserModel(TimestampModel):
    """User account representation."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: UUID = Field(...)
    email: EmailStr = Field(..., description="User e-mail")
    
    username: str | None = Field(None, description="User's display name")
    profile_pic_url: HttpUrl | None = Field(None)
    bio: str | None = Field(None)
    birth_date: date | None = Field(None)
    age: int | None = Field(None)
    language_code: Annotated[str, constr(min_length=2, max_length=2)] | None = Field(None)
    
    is_onboarded: bool
    banned: bool
    roles: list[str] = Field(default_factory=list, alias="role_slugs")
    permissions: list[str] = Field(default_factory=list, alias="permission_slugs")


class UserPatch(BaseModel):
    username: str | None = Field(None, description="User's display name")
    profile_pic_url: str | None = Field(None)
    bio: str | None = Field(None)
    birth_date: date | None = Field(None)
    language_code: Annotated[str, constr(min_length=2, max_length=2)] | None = Field(None)


class UserRolesUpdate(BaseModel):
    roles: list[str] = Field(default_factory=list, description="Role slugs to assign")
