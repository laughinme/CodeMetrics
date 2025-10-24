from pydantic import BaseModel, Field
from ...common.timestamps import TimestampModel


# class AuthorModel(TimestampModel):
#     """Represents an author."""
    
#     id: int = Field(..., description="Author ID")
#     name: str = Field(..., description="Author name")
#     email: str = Field(..., description="Author email")
    
class GitUser(BaseModel):
    """Represents a Git user."""
    
    name: str = Field(..., description="Git user name")
    email: str = Field(..., description="Git user email")
