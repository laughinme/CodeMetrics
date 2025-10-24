import logging

from datetime import datetime, timedelta
from typing import Any, Dict, List
from urllib.parse import quote

from ..api_service.external_api import ExternalAPIClient
from .cache import CacheManager
from .exceptions import MetricsValidationError, MetricsAPIError, MetricsAnalysisError
from .analyzers import BranchAnalyzer, CommitAnalyzer, DiffAnalyzer

logger = logging.getLogger(__name__)

class MetricsService:
    def __init__(self, api_client: ExternalAPIClient) -> None:
        if not api_client:
            raise MetricsValidationError("API client must be provided")
        
        self._api = api_client
        self._cache = CacheManager()
        
        self._branch_analyzer = BranchAnalyzer()
        self._commit_analyzer = CommitAnalyzer()
        self._diff_analyzer = DiffAnalyzer()

    async def get_projects_summary(self) -> Dict[str, Any]:
        try:
            data = await self._api.get_json("/projects")
            projects = data.get("values", [])
            
            return {
                "total_projects": len(projects),
                "projects": projects,
                "pagination": {
                    "is_last_page": data.get("isLastPage", True),
                    "next_page_start": data.get("nextPageStart"),
                }
            }
            
        except Exception as exc:
            logger.error(f"Failed to fetch projects summary: {exc}")
            raise MetricsAPIError(f"Projects summary unavailable: {exc}") from exc

    async def get_project_details(self, project_key: str) -> Dict[str, Any]:
        if not project_key:
            raise MetricsValidationError("Project key must be provided")
            
        cache_key = f"project_{project_key}"
        if cached := self._cache.get(cache_key):
            return cached
        
        encoded_key = quote(project_key, safe="")
        data = await self._api.get_json(f"/projects/{encoded_key}")
        self._cache.set(cache_key, data)
        return data

    async def get_project_repositories(self, project_key: str, limit: int = 100) -> Dict[str, Any]:
        if not project_key:
            raise MetricsValidationError("Project key must be provided")
            
        encoded_key = quote(project_key, safe="")
        data = await self._api.get_json(f"/projects/{encoded_key}/repos", params={"limit": limit})
        repos = data.get("values", [])
        
        return {
            "repositories": repos,
            "total_count": len(repos),
            "pagination": {
                "is_last_page": data.get("isLastPage", True),
                "limit": limit
            }
        }

    async def get_repository_details(self, project_key: str, repo_name: str) -> Dict[str, Any]:
        if not all([project_key, repo_name]):
            raise MetricsValidationError("Project key and repository name must be provided")
            
        cache_key = f"repo_{project_key}_{repo_name}"
        if cached := self._cache.get(cache_key):
            return cached
        
        encoded_key = quote(project_key, safe="")
        encoded_repo = quote(repo_name, safe="")
        data = await self._api.get_json(f"/projects/{encoded_key}/repos/{encoded_repo}")
        self._cache.set(cache_key, data)
        return data

    async def get_repository_branches(self, project_key: str, repo_name: str, include_metadata: bool = False) -> Dict[str, Any]:
        if not all([project_key, repo_name]):
            raise MetricsValidationError("Project key and repository name must be provided")
            
        encoded_key = quote(project_key, safe="")
        encoded_repo = quote(repo_name, safe="")
        branches_data = await self._api.get_json(f"/projects/{encoded_key}/repos/{encoded_repo}/branches")
        
        branches = branches_data.get("values", [])
        analysis = await self._branch_analyzer.analyze(branches)
        
        if include_metadata and branches:
            analysis["branches_with_metadata"] = await self._get_branches_metadata(project_key, repo_name, branches)
        
        return analysis

    async def _get_branches_metadata(self, project_key: str, repo_name: str, branches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        encoded_key = quote(project_key, safe="")
        encoded_repo = quote(repo_name, safe="")
        
        branches_with_metadata = []
        for branch in branches:
            branch_name = branch.get("displayId", "")
            if not branch_name:
                continue
                
            try:
                metadata = await self._api.get_json(
                    f"/projects/{encoded_key}/repos/{encoded_repo}/branches/{quote(branch_name, safe='')}",
                    params={"behindAheadBaseRev": "refs/heads/master"}
                )
                branches_with_metadata.append({**branch, "metadata": metadata})
            except Exception:
                continue
                
        return branches_with_metadata

    async def get_commit_analysis(self, project_key: str, repo_name: str, days_back: int = 30) -> Dict[str, Any]:
        if not all([project_key, repo_name]):
            raise MetricsValidationError("Project key and repository name must be provided")
            
        if days_back <= 0:
            raise MetricsValidationError("Days back must be positive integer")
            
        since_date = (datetime.now() - timedelta(days=days_back)).isoformat()
        encoded_key = quote(project_key, safe="")
        encoded_repo = quote(repo_name, safe="")
        
        commits_data = await self._api.get_json(
            f"/projects/{encoded_key}/repos/{encoded_repo}/commits",
            params={"after": since_date, "limit": 1000}
        )
        
        commits = commits_data.get("values", [])
        return await self._commit_analyzer.analyze(commits, days_back=days_back)

    async def get_commit_diff_analysis(self, project_key: str, repo_name: str, commit_sha: str) -> Dict[str, Any]:
        if not all([project_key, repo_name, commit_sha]):
            raise MetricsValidationError("Project key, repository name and commit SHA must be provided")
            
        encoded_key = quote(project_key, safe="")
        encoded_repo = quote(repo_name, safe="")
        encoded_sha = quote(commit_sha, safe="")
        
        diff_data = await self._api.get_json(
            f"/projects/{encoded_key}/repos/{encoded_repo}/commits/{encoded_sha}/diff"
        )
        
        return await self._diff_analyzer.analyze(diff_data)

    async def get_comparative_analysis(self, project_key: str) -> Dict[str, Any]:
        if not project_key:
            raise MetricsValidationError("Project key must be provided")
            
        repos_data = await self.get_project_repositories(project_key)
        repositories = repos_data["repositories"]
        
        comparative_analysis = {
            "project": project_key,
            "total_repositories": len(repositories),
            "repository_metrics": {},
            "aggregate_metrics": {
                "total_commits_30d": 0,
                "total_branches": 0,
                "active_repositories": 0
            }
        }
        
        for repo in repositories:
            repo_name = repo["slug"]
            try:
                commit_analysis = await self.get_commit_analysis(project_key, repo_name, 30)
                branch_analysis = await self.get_repository_branches(project_key, repo_name)
                
                activity_score = self._calculate_activity_score(commit_analysis, branch_analysis)
                repo_metrics = {
                    "recent_commits": commit_analysis["total_commits"],
                    "branch_count": branch_analysis["total_branches"],
                    "activity_score": activity_score
                }
                
                comparative_analysis["repository_metrics"][repo_name] = repo_metrics
                comparative_analysis["aggregate_metrics"]["total_commits_30d"] += commit_analysis["total_commits"]
                comparative_analysis["aggregate_metrics"]["total_branches"] += branch_analysis["total_branches"]
                
                if activity_score > 0.1:
                    comparative_analysis["aggregate_metrics"]["active_repositories"] += 1
                    
            except Exception:
                continue
        
        return comparative_analysis

    def _calculate_activity_score(self, commit_analysis: Dict[str, Any], branch_analysis: Dict[str, Any]) -> float:
        commits_score = min(commit_analysis["total_commits"] / 50, 1.0)
        branches_score = min(branch_analysis["active_branches_count"] / 10, 1.0)
        return (commits_score * 0.7) + (branches_score * 0.3)

    async def get_service_health(self) -> Dict[str, Any]:
        health_check = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "api_client": "unknown",
                "cache": "healthy",
                "metrics_service": "healthy"
            }
        }
        
        try:
            await self._api.fetch_test_payload()
            health_check["components"]["api_client"] = "healthy"
        except Exception as exc:
            health_check["status"] = "degraded"
            health_check["components"]["api_client"] = f"unhealthy: {exc}"
        
        cache_stats = self._cache.stats
        if cache_stats["total_items"] > 1000:
            health_check["components"]["cache"] = "degraded"
            health_check["cache_warning"] = f"Large cache size: {cache_stats['total_items']}"
        
        return health_check

    def get_cache_stats(self) -> Dict[str, Any]:
        return self._cache.stats

    async def close(self) -> None:
        self._cache.shutdown()