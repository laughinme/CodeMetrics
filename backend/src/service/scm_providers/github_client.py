from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, AsyncIterator

import httpx


class GitHubAPIError(RuntimeError):
    pass


def _parse_github_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    # GitHub timestamps are usually ISO8601 with trailing "Z"
    v = value.strip()
    if v.endswith("Z"):
        v = v[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(v)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


_LINK_RE = re.compile(r'<([^>]+)>;\s*rel="([^"]+)"')


def _next_link(link_header: str | None) -> str | None:
    if not link_header:
        return None
    links = {}
    for part in link_header.split(","):
        m = _LINK_RE.search(part)
        if not m:
            continue
        url, rel = m.group(1), m.group(2)
        links[rel] = url
    return links.get("next")


@dataclass(frozen=True, slots=True)
class GitHubOrg:
    id: int
    login: str
    name: str | None
    description: str | None
    created_at: datetime | None
    updated_at: datetime | None


@dataclass(frozen=True, slots=True)
class GitHubRepo:
    id: int
    name: str
    full_name: str
    owner_login: str
    description: str | None
    default_branch: str | None
    topics: list[str]
    is_fork: bool
    created_at: datetime | None
    updated_at: datetime | None


@dataclass(frozen=True, slots=True)
class GitHubBranch:
    name: str
    protected: bool


@dataclass(frozen=True, slots=True)
class GitHubCommit:
    sha: str
    author_name: str | None
    author_email: str | None
    committer_name: str | None
    committer_email: str | None
    created_at: datetime | None
    message: str | None
    parents: list[str]


class GitHubClient:
    API_BASE = "https://api.github.com"

    def __init__(self, access_token: str) -> None:
        self._access_token = access_token
        self._headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {access_token}",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    async def _get(self, url: str, *, params: dict[str, Any] | None = None, accept: str | None = None) -> httpx.Response:
        headers = dict(self._headers)
        if accept:
            headers["Accept"] = accept
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, headers=headers, params=params)
        if resp.status_code >= 400:
            raise GitHubAPIError(f"GitHub API {url} returned {resp.status_code}: {resp.text[:200]}")
        return resp

    async def _paginate_json(self, url: str, *, params: dict[str, Any] | None = None) -> AsyncIterator[list[dict[str, Any]]]:
        next_url: str | None = url
        next_params = params or {}
        while next_url:
            resp = await self._get(next_url, params=next_params)
            data = resp.json()
            if not isinstance(data, list):
                raise GitHubAPIError(f"Expected list response from {next_url}")
            yield data
            next_url = _next_link(resp.headers.get("link"))
            next_params = {}

    async def list_orgs(self) -> list[GitHubOrg]:
        orgs: list[GitHubOrg] = []
        async for page in self._paginate_json(f"{self.API_BASE}/user/orgs", params={"per_page": 100}):
            for raw in page:
                orgs.append(
                    GitHubOrg(
                        id=int(raw.get("id")),
                        login=str(raw.get("login")),
                        name=raw.get("name"),
                        description=raw.get("description"),
                        created_at=_parse_github_dt(raw.get("created_at")),
                        updated_at=_parse_github_dt(raw.get("updated_at")),
                    )
                )
        return orgs

    async def list_org_repos(self, org_login: str) -> list[GitHubRepo]:
        repos: list[GitHubRepo] = []
        async for page in self._paginate_json(
            f"{self.API_BASE}/orgs/{org_login}/repos",
            params={"per_page": 100, "type": "all", "sort": "pushed", "direction": "desc"},
        ):
            for raw in page:
                owner = raw.get("owner") or {}
                repos.append(
                    GitHubRepo(
                        id=int(raw.get("id")),
                        name=str(raw.get("name")),
                        full_name=str(raw.get("full_name")),
                        owner_login=str(owner.get("login") or org_login),
                        description=raw.get("description"),
                        default_branch=raw.get("default_branch"),
                        topics=list(raw.get("topics") or []),
                        is_fork=bool(raw.get("fork")),
                        created_at=_parse_github_dt(raw.get("created_at")),
                        updated_at=_parse_github_dt(raw.get("pushed_at") or raw.get("updated_at")),
                    )
                )
        return repos

    async def list_branches(self, owner: str, repo: str) -> list[GitHubBranch]:
        branches: list[GitHubBranch] = []
        async for page in self._paginate_json(
            f"{self.API_BASE}/repos/{owner}/{repo}/branches",
            params={"per_page": 100},
        ):
            for raw in page:
                branches.append(
                    GitHubBranch(
                        name=str(raw.get("name")),
                        protected=bool(raw.get("protected")),
                    )
                )
        return branches

    async def list_commits(
        self,
        owner: str,
        repo: str,
        *,
        since: datetime | None,
        per_page: int = 100,
        max_pages: int | None = None,
    ) -> list[GitHubCommit]:
        commits: list[GitHubCommit] = []
        params: dict[str, Any] = {"per_page": per_page}
        if since is not None:
            since_utc = since.astimezone(UTC)
            params["since"] = since_utc.isoformat().replace("+00:00", "Z")

        page_count = 0
        async for page in self._paginate_json(
            f"{self.API_BASE}/repos/{owner}/{repo}/commits",
            params=params,
        ):
            page_count += 1
            for raw in page:
                commit_obj = raw.get("commit") or {}
                author_obj = commit_obj.get("author") or {}
                committer_obj = commit_obj.get("committer") or {}
                commits.append(
                    GitHubCommit(
                        sha=str(raw.get("sha")),
                        author_name=author_obj.get("name"),
                        author_email=author_obj.get("email"),
                        committer_name=committer_obj.get("name"),
                        committer_email=committer_obj.get("email"),
                        created_at=_parse_github_dt(committer_obj.get("date") or author_obj.get("date")),
                        message=commit_obj.get("message"),
                        parents=[str(p.get("sha")) for p in (raw.get("parents") or []) if p.get("sha")],
                    )
                )
            if max_pages and page_count >= max_pages:
                break

        return commits

    async def get_commit_diff_text(self, owner: str, repo: str, sha: str) -> str:
        resp = await self._get(
            f"{self.API_BASE}/repos/{owner}/{repo}/commits/{sha}",
            accept="application/vnd.github.v3.diff",
        )
        return resp.text or ""

