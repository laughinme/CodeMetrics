from pydantic import BaseModel, Field

from ...common.timestamps import TimestampModel


class CloneLinksModel(BaseModel):
    """Represents repository clone links info."""

    https: str | None = Field(None, description="URL for cloning repository via HTTPS")
    ssh: str | None = Field(None, description="URL for cloning repository via SSH")


class RepoSlugModel(BaseModel):
    name: str = Field(..., description="Repository name")
    owner: str = Field(..., description="Repository owner (project key)")


class RepoStructureModel(BaseModel):
    id: str | None = Field(None, description="Identifier of the structure rule")
    name: str | None = Field(None, description="Display name of the structure rule")
    description: str | None = Field(None, description="Structure rule description")
    mask: str | None = Field(None, description="Glob/regexp mask of the rule")
    is_default: bool = Field(False, description="True when rule is default")


class RepositoryModel(TimestampModel):
    """
    Matches Swagger `Repository` schema.
    """

    model_config = {"populate_by_name": True}

    key: str = Field(..., alias="name", description="Repository name")
    project_key: str = Field(..., alias="owner_name", description="Project key")
    description: str | None = Field(
        None, description="Description provided by repository owner"
    )
    default_branch: str | None = Field(
        None,
        description="Default branch name reported by Source Code",
    )
    is_fork: bool = Field(False, description="Flag indicating repository is a fork")
    fork_slug: RepoSlugModel | None = Field(
        None, description="Reference to upstream repository when forked"
    )
    enable_paths_restrictions: bool = Field(
        False, description="Path restrictions flag"
    )
    topics: list[str] = Field(
        default_factory=list, description="Topics/tags assigned to repository"
    )
    permissions: dict[str, bool] = Field(
        default_factory=dict, description="Repository permission flags"
    )
    clone_links: CloneLinksModel | None = Field(
        None, description="Clone links for SSH/HTTPS protocols"
    )
    repo_structure_paths_include: list[RepoStructureModel] = Field(
        default_factory=list,
        alias="repo_structure_paths_include",
        description="Structure include rules",
    )
    repo_structure_paths_exclude: list[RepoStructureModel] = Field(
        default_factory=list,
        alias="repo_structure_paths_exclude",
        description="Structure exclude rules",
    )
