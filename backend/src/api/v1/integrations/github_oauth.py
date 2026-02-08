from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from starlette.responses import RedirectResponse
from urllib.parse import quote_plus

from core.config import config
from core.security import auth_user, auth_user_web
from database.redis import get_redis
from database.relational_db import UoW, User, get_uow
from database.relational_db.tables.scm_integrations import ScmIntegrationInterface
from service.scm_integrations import GitHubOAuthService, OAuthError
from core.secrets import SecretEncryptionError


router = APIRouter(prefix="/github")


def _derive_redirect_uri(request: Request) -> str:
    if config.GITHUB_OAUTH_REDIRECT_URI:
        return config.GITHUB_OAUTH_REDIRECT_URI
    base = str(request.base_url).rstrip("/")
    return f"{base}/api/v1/integrations/github/callback"


def _safe_return_to(value: str | None) -> str:
    if not value:
        return "/integrations"
    v = value.strip()
    if not v.startswith("/"):
        return "/integrations"
    if "://" in v:
        return "/integrations"
    return v


@router.get("/authorize")
async def github_authorize(
    request: Request,
    user: Annotated[User, Depends(auth_user_web)],
    return_to: str | None = Query(None, description="Frontend path to return to after OAuth"),
    redis=Depends(get_redis),
):
    svc = GitHubOAuthService(redis)
    redirect_uri = _derive_redirect_uri(request)
    try:
        url = await svc.make_authorize_url(
            user_id=str(user.id),
            return_to=_safe_return_to(return_to),
            redirect_uri=redirect_uri,
        )
    except OAuthError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return RedirectResponse(url=url, status_code=302)


@router.get("/authorize-url")
async def github_authorize_url(
    request: Request,
    user: Annotated[User, Depends(auth_user)],
    return_to: str | None = Query(None, description="Frontend path to return to after OAuth"),
    redis=Depends(get_redis),
):
    """
    Returns the GitHub authorize URL as JSON.

    Browser navigations can't attach Authorization headers, so the frontend should call this
    endpoint via XHR (with Bearer token) and then redirect to the returned URL.
    """
    svc = GitHubOAuthService(redis)
    redirect_uri = _derive_redirect_uri(request)
    try:
        url = await svc.make_authorize_url(
            user_id=str(user.id),
            return_to=_safe_return_to(return_to),
            redirect_uri=redirect_uri,
        )
    except OAuthError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return {"url": url}


@router.get("/callback", name="github_oauth_callback")
async def github_callback(
    request: Request,
    uow: UoW = Depends(get_uow),
    redis=Depends(get_redis),
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
):
    front_base = (config.SITE_URL or "http://localhost").rstrip("/")

    if error:
        detail = (error_description or error).strip()
        return RedirectResponse(
            url=f"{front_base}/integrations?status=error&reason={quote_plus(detail)}",
            status_code=302,
        )

    if not code or not state:
        return RedirectResponse(url=f"{front_base}/integrations?status=error&reason=missing_code_state", status_code=302)

    svc = GitHubOAuthService(redis)
    st = await svc.consume_state(state)
    if not st:
        return RedirectResponse(url=f"{front_base}/integrations?status=error&reason=bad_state", status_code=302)

    # Callback is public; we rely on state saved during /authorize call.
    redirect_uri = st.get("ru") or None

    try:
        tokens = await svc.exchange_code(code=code, redirect_uri=redirect_uri)
        gh_user = await svc.fetch_user(tokens.access_token)
    except OAuthError as exc:
        return RedirectResponse(
            url=f"{front_base}/integrations?status=error&reason={quote_plus(str(exc))}",
            status_code=302,
        )

    try:
        user_id = UUID(st["uid"])
    except Exception:
        return RedirectResponse(url=f"{front_base}/integrations?status=error&reason=bad_user", status_code=302)

    # Persist integration
    repo = ScmIntegrationInterface(uow.session)
    try:
        await repo.upsert(
            user_id=user_id,
            provider="github",
            external_id=gh_user.id,
            external_login=gh_user.login,
            access_token_enc=svc.encrypt_access_token(tokens.access_token),
            refresh_token_enc=None,
            token_expires_at=None,
            scopes=tokens.scope,
        )
    except SecretEncryptionError as exc:
        return RedirectResponse(
            url=f"{front_base}/integrations?status=error&reason={quote_plus(str(exc))}",
            status_code=302,
        )
    await uow.commit()

    return_to = _safe_return_to(st.get("rt"))
    return RedirectResponse(url=f"{front_base}{return_to}?status=connected&provider=github", status_code=302)
