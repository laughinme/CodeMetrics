from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, data: Any, **kwargs) -> Dict[str, Any]:
        pass

    def _validate_data(self, data: Any) -> bool:
        return data is not None