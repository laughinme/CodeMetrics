from typing import Any, Dict, List

from .base import BaseAnalyzer

class BranchAnalyzer(BaseAnalyzer):
    async def analyze(self, data: Any, **kwargs) -> Dict[str, Any]:
        if not self._validate_data(data):
            return {"total_branches": 0, "analysis": {}}

        branches: List[Dict[str, Any]] = data
        default_branches = [b for b in branches if b.get("isDefault")]
        active_branches = [
            b for b in branches 
            if b.get("metadata", {}).get("aheadBehind", {}).get("ahead", 0) > 0
        ]

        return {
            "total_branches": len(branches),
            "default_branches": default_branches,
            "active_branches_count": len(active_branches),
            "analysis": {
                "default_branch_names": [b["displayId"] for b in default_branches],
                "recent_activity_branches": len(active_branches),
                "stale_branches": len(branches) - len(active_branches),
            }
        }