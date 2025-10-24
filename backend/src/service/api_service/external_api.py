import logging
from typing import Any
from urllib.parse import urlparse, urlunparse

import httpx

from .exceptions import ExternalAPIError
from core.config import config

logger = logging.getLogger(__name__)

class ExternalAPIClient:
    def __init__(
        self,
        base_url: str,
        *,
        timeout: httpx.Timeout | None = None,
        default_headers: dict[str, str] | None = None,
        auth_path: str = "/api/auth/login",
    ) -> None:
        if not base_url:
            raise ValueError("External API base URL must be provided")

        self._base_url = base_url.rstrip("/")
        self._timeout = timeout or httpx.Timeout(
            connect=5.0,
            read=10.0,
            write=5.0,
            pool=5.0,
        )
        self._default_headers = default_headers or {"Accept": "application/json"}
        self._username = config.API_USERNAME
        self._password = config.API_PASSWORD.get_secret_value()
        self._token: str | None = None
        self._token_type: str = "Bearer"

        parsed = urlparse(self._base_url)
        if not parsed.scheme or not parsed.netloc:
            raise ValueError("API URL must include scheme and hostname")
        self._auth_url = urlunparse((parsed.scheme, parsed.netloc, auth_path, "", "", ""))

    async def _request(
        self,
        method: str,
        path: str,
        *,
        headers: dict[str, str] | None = None,
        **kwargs: Any,
    ) -> httpx.Response:
        url = self._normalize_path(path)
        request_headers = dict(self._default_headers)
        if headers:
            request_headers.update(headers)

        await self._apply_auth(request_headers)

        async with httpx.AsyncClient(
            base_url=self._base_url,
            timeout=self._timeout,
        ) as client:
            try:
                response = await client.request(
                    method,
                    url,
                    headers=request_headers,
                    **kwargs,
                )
                if response.status_code == 401 and self._should_authenticate():
                    await self._authenticate(force=True)
                    if self._token:
                        request_headers["Authorization"] = f"{self._token_type} {self._token}"
                    response = await client.request(
                        method,
                        url,
                        headers=request_headers,
                        **kwargs,
                    )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise ExternalAPIError(
                    f"{method} {exc.request.url} returned {exc.response.status_code}"
                ) from exc
            except httpx.HTTPError as exc:
                raise ExternalAPIError(
                    f"{method} {self._base_url}{url} failed: {exc}"
                ) from exc

        return response

    async def get_json(
        self,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
        **kwargs: Any,
    ) -> dict[str, Any]:
        response = await self._request(
            "GET",
            path,
            headers=headers,
            params=params,
            **kwargs,
        )
        return self._parse_json_response(response)

    async def fetch_test_payload(self) -> str:
        response = await self._request("GET", "/health")
        return response.text

    def _normalize_path(self, path: str) -> str:
        if not path:
            raise ValueError("Request path must be provided")
        return path if path.startswith("/") else f"/{path}"

    @staticmethod
    def _parse_json_response(response: httpx.Response) -> dict[str, Any]:
        content_type = response.headers.get("content-type", "")
        if "application/json" not in content_type.lower():
            raise ExternalAPIError(
                f"Expected JSON response from {response.request.url}, "
                f"got {content_type or 'unknown content-type'}"
            )

        try:
            data = response.json()
        except ValueError as exc:
            raise ExternalAPIError(
                f"Failed to decode JSON from {response.request.url}"
            ) from exc

        if not isinstance(data, dict):
            raise ExternalAPIError(
                f"External API {response.request.url} responded with {type(data).__name__} payload instead of dict"
            )

        return data

    def _should_authenticate(self) -> bool:
        return bool(self._username and self._password)

    async def _apply_auth(self, headers: dict[str, str]) -> None:
        if not self._should_authenticate():
            return

        await self._authenticate()
        if self._token:
            headers["Authorization"] = f"{self._token_type} {self._token}"

    async def _authenticate(self, *, force: bool = False) -> None:
        if not self._should_authenticate():
            return

        if self._token and not force:
            return

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            try:
                response = await client.post(
                    self._auth_url,
                    json={
                        "username": self._username,
                        "password": self._password,
                    },
                    headers={
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                raise ExternalAPIError(
                    f"Authentication failed with status {exc.response.status_code}"
                ) from exc
            except httpx.HTTPError as exc:
                raise ExternalAPIError(f"Authentication request failed: {exc}") from exc

        payload = response.json()
        token = payload.get("access_token")
        if not token:
            raise ExternalAPIError("Authentication response did not include access_token")

        self._token = token
        self._token_type = payload.get("token_type", "Bearer")
