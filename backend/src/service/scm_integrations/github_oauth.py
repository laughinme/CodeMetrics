from __future__ import annotations

import json
import secrets
from dataclasses import dataclass
from datetime import datetime, timezone
from urllib.parse import urlencode

import httpx
from redis.asyncio import Redis

from core.config import config
from core.secrets import encrypt_str


class OAuthError(RuntimeError):
    pass


@dataclass(frozen=True, slots=True)
class GitHubOAuthTokens:
    access_token: str
    scope: list[str]
    token_type: str


@dataclass(frozen=True, slots=True)
class GitHubUser:
    id: str
    login: str


class GitHubOAuthService:
    AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
    TOKEN_URL = "https://github.com/login/oauth/access_token"
    API_BASE = "https://api.github.com"

    def __init__(self, redis: Redis) -> None:
        self._redis = redis

    async def make_authorize_url(
        self,
        *,
        user_id: str,
        return_to: str | None,
        redirect_uri: str | None,
    ) -> str:
        if not config.GITHUB_OAUTH_CLIENT_ID:
            raise OAuthError("GITHUB_OAUTH_CLIENT_ID is not set")
        if not config.GITHUB_OAUTH_CLIENT_SECRET.get_secret_value():
            raise OAuthError("GITHUB_OAUTH_CLIENT_SECRET is not set")

        state = secrets.token_urlsafe(32)
        payload = {
            "uid": user_id,
            "rt": return_to or "",
            # Store redirect_uri used for this flow to reuse during token exchange.
            "ru": redirect_uri or "",
            "iat": datetime.now(timezone.utc).isoformat(),
        }
        key = f"oauth:github:{state}"
        await self._redis.set(key, json.dumps(payload), ex=config.OAUTH_STATE_TTL_SECONDS)

        scopes = [s for s in (config.GITHUB_OAUTH_SCOPES or "").split() if s.strip()]
        params = {
            "client_id": config.GITHUB_OAUTH_CLIENT_ID,
            "scope": " ".join(scopes),
            "state": state,
            "allow_signup": "false",
        }
        if redirect_uri:
            params["redirect_uri"] = redirect_uri
        return f"{self.AUTHORIZE_URL}?{urlencode(params)}"

    async def consume_state(self, state: str) -> dict[str, str] | None:
        key = f"oauth:github:{state}"
        raw = await self._redis.get(key)
        if not raw:
            return None
        await self._redis.delete(key)
        try:
            data = json.loads(raw)
        except Exception:
            return None
        if not isinstance(data, dict) or "uid" not in data:
            return None
        return {
            "uid": str(data.get("uid", "")),
            "rt": str(data.get("rt", "")),
            "ru": str(data.get("ru", "")),
        }

    async def exchange_code(self, *, code: str, redirect_uri: str | None) -> GitHubOAuthTokens:
        if not code:
            raise OAuthError("Missing code")

        data_payload = {
            "client_id": config.GITHUB_OAUTH_CLIENT_ID,
            "client_secret": config.GITHUB_OAUTH_CLIENT_SECRET.get_secret_value(),
            "code": code,
        }
        if redirect_uri:
            data_payload["redirect_uri"] = redirect_uri

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                self.TOKEN_URL,
                headers={"Accept": "application/json"},
                data=data_payload,
            )
            resp.raise_for_status()
            data = resp.json()

        if "error" in data:
            raise OAuthError(f"GitHub token exchange failed: {data.get('error')}")
        access_token = data.get("access_token")
        if not access_token:
            raise OAuthError("GitHub token exchange did not return access_token")

        scope_str = data.get("scope") or ""
        scopes = [s.strip() for s in scope_str.split(",") if s.strip()]
        return GitHubOAuthTokens(
            access_token=access_token,
            scope=scopes,
            token_type=data.get("token_type") or "bearer",
        )

    async def fetch_user(self, access_token: str) -> GitHubUser:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.API_BASE}/user",
                headers={
                    "Accept": "application/vnd.github+json",
                    "Authorization": f"Bearer {access_token}",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            )
            resp.raise_for_status()
            data = resp.json()

        user_id = data.get("id")
        login = data.get("login")
        if user_id is None or not login:
            raise OAuthError("Failed to fetch GitHub user profile")
        return GitHubUser(id=str(user_id), login=str(login))

    @staticmethod
    def encrypt_access_token(access_token: str) -> str:
        return encrypt_str(access_token)
