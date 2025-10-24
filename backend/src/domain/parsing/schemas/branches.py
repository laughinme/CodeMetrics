from pydantic import BaseModel, Field

from .commits import CommitModel


class BranchModel(BaseModel):
    """
    Mirrors Swagger `RepoBranch` schema with extra metadata we compute.
    """

    model_config = {"validate_assignment": False}

    name: str = Field(..., description="Branch name")
    is_protected: bool = Field(
        False, description="True when branch is protected according to settings"
    )
    last_commit: CommitModel | None = Field(
        None, description="Head commit associated with the branch"
    )
    is_default: bool = Field(
        False,
        description="Derived flag showing whether this branch is repository default",
    )
