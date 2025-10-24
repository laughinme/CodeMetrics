from pydantic import BaseModel, Field


class DiffModel(BaseModel):
    """
    Mirrors Swagger `Diff` schema.
    """

    content: str | None = Field(
        None, description="Base64 encoded diff content returned by API"
    )
    excluded_files: list[str] = Field(
        default_factory=list,
        description="Files excluded from diff according to settings",
    )
    large_files: list[str] = Field(
        default_factory=list,
        description="List of large files truncated in diff response",
    )
    source_head_id: str | None = Field(
        None, description="SHA of the head commit used to build diff"
    )
