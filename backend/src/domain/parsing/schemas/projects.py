from pydantic import Field

from ...common.timestamps import TimestampModel


class ProjectModel(TimestampModel):
    """
    Matches Swagger `Project` schema.
    """

    model_config = {"populate_by_name": True}

    id: int = Field(..., description="Project identifier on Source Code platform")
    name: str = Field(..., description="Unique project key used in API paths")
    full_name: str = Field(..., description="Human readable project name")
    description: str | None = Field(None, description="Description set by the user.")
    is_favorite: bool = Field(
        False,
        description="Whether the project is marked as favorite for the current user",
    )
    is_public: bool = Field(
        False, description="True if the project is publicly visible"
    )
    lfs_allow: bool = Field(
        False, description="True if Git LFS support is enabled for the project"
    )
    parent_id: int | None = Field(
        None,
        description="Identifier of parent project/group when project is nested",
    )
    permissions: dict[str, bool] = Field(
        default_factory=dict,
        description="Project permissions built from `ProjectPermissions` schema",
    )
