from __future__ import annotations

from cryptography.fernet import Fernet, InvalidToken

from core.config import config


class SecretEncryptionError(RuntimeError):
    pass


def _get_fernet() -> Fernet:
    key = (config.TOKEN_ENC_KEY.get_secret_value() or "").strip()
    if not key:
        raise SecretEncryptionError(
            "TOKEN_ENC_KEY is not set; cannot encrypt/decrypt OAuth tokens"
        )
    try:
        return Fernet(key.encode("ascii"))
    except Exception as exc:  # pragma: no cover
        raise SecretEncryptionError("Invalid TOKEN_ENC_KEY format") from exc


def encrypt_str(plaintext: str) -> str:
    if plaintext is None:
        raise SecretEncryptionError("Cannot encrypt null plaintext")
    f = _get_fernet()
    token = f.encrypt(plaintext.encode("utf-8"))
    return token.decode("ascii")


def decrypt_str(ciphertext: str) -> str:
    if ciphertext is None:
        raise SecretEncryptionError("Cannot decrypt null ciphertext")
    f = _get_fernet()
    try:
        raw = f.decrypt(ciphertext.encode("ascii"))
    except InvalidToken as exc:
        raise SecretEncryptionError("Failed to decrypt secret (invalid token/key)") from exc
    return raw.decode("utf-8")

