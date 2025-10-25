from fastapi import Depends

from ..api_service.external_api import ExternalAPIClient
from .service import MetricsService
from core.config import Settings


async def get_entity_service() -> MetricsService:
    api_client = ExternalAPIClient(Settings.API_URL)
    return MetricsService(api_client)