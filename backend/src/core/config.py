import logging
from pathlib import Path
from typing import Literal

from pydantic import field_validator, model_validator, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    """
    Project dependencies config
    """
    model_config = SettingsConfigDict(
        env_file=f'{BASE_DIR}/.env',
        extra='ignore'
    )
    
    # Stage / debug
    APP_STAGE: Literal["dev", "prod"] = "dev"
    DEBUG: bool | None = None

    # API settings
    API_PORT: int = 8080
    API_HOST: str = '0.0.0.0'

    # Public site URL (used for OAuth redirects back to the frontend)
    SITE_URL: str = "http://localhost"
    
    # External API settings
    API_URL: str
    API_USERNAME: str
    API_PASSWORD: SecretStr
    EXTERNAL_API_SYNC_ENABLED: bool = True

    # OAuth / SCM integrations
    TOKEN_ENC_KEY: SecretStr = SecretStr("")  # Fernet key (urlsafe base64); required to store OAuth tokens securely
    OAUTH_STATE_TTL_SECONDS: int = 600

    GITHUB_OAUTH_CLIENT_ID: str = ""
    GITHUB_OAUTH_CLIENT_SECRET: SecretStr = SecretStr("")
    # If empty, callback URL is derived as "{API public base}/api/v1/integrations/github/callback" in runtime/router.
    GITHUB_OAUTH_REDIRECT_URI: str = ""
    # Minimal scopes to read orgs/repos/commits; adjust per product needs.
    GITHUB_OAUTH_SCOPES: str = "read:org repo"

    # Scheduler / auto-sync
    # If unset, defaults to enabled in dev and disabled in prod.
    SCHEDULER_ENABLED: bool | None = None
    # Periodic sync of connected SCM integrations (GitHub/GitLab/etc).
    SCM_SYNC_ENABLED: bool = True
    SCM_SYNC_INTERVAL_SECONDS: int = 15 * 60
    # GitHub sync controls (safe defaults for predictable local sync duration).
    GITHUB_SYNC_COMMIT_WINDOW_DAYS: int = 365
    GITHUB_SYNC_MAX_COMMIT_PAGES: int = 5
    GITHUB_SYNC_RESYNC_OVERLAP_SECONDS: int = 60
    GITHUB_SYNC_INCLUDE_FORKS: bool = False
    GITHUB_SYNC_FLUSH_EVERY_COMMITS: int = 50
    GITHUB_SYNC_MAX_REPOS_PER_OWNER: int = 20
    # Comma-separated GitHub /user/repos affiliation filter:
    # owner, collaborator, organization_member.
    GITHUB_SYNC_USER_REPO_AFFILIATION: str = "owner,collaborator,organization_member"

    # Media settings
    MEDIA_DIR: str = 'media'
    
    # Auth Settings    
    JWT_PRIVATE_KEY: str | None = None
    JWT_PUBLIC_KEY: str | None = None
    JWT_PRIVATE_KEY_PATH: str | None = None
    JWT_PUBLIC_KEY_PATH: str | None = None
    JWT_ALGO: str = 'RS256'
    ACCESS_TTL: int = 60 * 15
    REFRESH_TTL: int = 60 * 60 * 24 * 7
    CSRF_HMAC_KEY: bytes = b"dev-change-me"

    # Cookie settings
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: Literal["lax", "strict", "none"] = "lax"
    COOKIE_DOMAIN: str | None = None
    COOKIE_PATH: str = "/"

    # CORS settings (optional, use only if you call backend directly)
    CORS_ALLOW_ORIGINS: str = ""
    CORS_ALLOW_ORIGIN_REGEX: str = ""
    
    # Database settings
    DATABASE_URL: str
    REDIS_URL: str

    @field_validator("COOKIE_SAMESITE", mode="before")
    @classmethod
    def _normalize_samesite(cls, value: str) -> str:
        if not isinstance(value, str):
            return value
        return value.strip().lower()

    @field_validator("CSRF_HMAC_KEY", mode="before")
    @classmethod
    def _ensure_bytes(cls, value: str | bytes) -> bytes:
        if isinstance(value, bytes):
            return value
        return str(value).encode()

    @model_validator(mode="after")
    def _load_jwt_keys(self) -> "Settings":
        if not self.JWT_PRIVATE_KEY and self.JWT_PRIVATE_KEY_PATH:
            private_path = Path(self.JWT_PRIVATE_KEY_PATH)
            if not private_path.is_absolute():
                private_path = BASE_DIR / private_path
            self.JWT_PRIVATE_KEY = private_path.read_text()
        if not self.JWT_PUBLIC_KEY and self.JWT_PUBLIC_KEY_PATH:
            public_path = Path(self.JWT_PUBLIC_KEY_PATH)
            if not public_path.is_absolute():
                public_path = BASE_DIR / public_path
            self.JWT_PUBLIC_KEY = public_path.read_text()
        if not self.JWT_PRIVATE_KEY or not self.JWT_PUBLIC_KEY:
            raise ValueError(
                "JWT keys are required. Provide JWT_PRIVATE_KEY/JWT_PUBLIC_KEY or JWT_*_PATH."
            )

        if self.SCHEDULER_ENABLED is None:
            self.SCHEDULER_ENABLED = self.APP_STAGE == "dev"
        return self

config = Settings() # pyright: ignore[reportCallIssue]

def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(filename)s:%(lineno)d] %(message)s",
    )
