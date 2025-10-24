from typing import Optional

from pydantic import BaseModel

class BranchDTO(BaseModel):
    id: str
    name: str
    isDefault: bool
    headCommitSha: Optional[str]
