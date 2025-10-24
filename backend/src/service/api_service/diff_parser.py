from __future__ import annotations

import base64

from database.relational_db import CommitFilePayload


def decode_diff_content(content: str | None) -> str:
    if not content:
        return ""

    try:
        decoded = base64.b64decode(content)
    except (ValueError, TypeError):
        return ""

    return decoded.decode("utf-8", errors="replace")


def parse_diff(diff_text: str) -> tuple[list[CommitFilePayload], int, int]:
    if not diff_text:
        return [], 0, 0

    files: list[CommitFilePayload] = []

    class _FileBuffer:
        __slots__ = (
            "path",
            "status",
            "added",
            "deleted",
            "patch_lines",
            "is_binary",
        )

        def __init__(self) -> None:
            self.path = ""
            self.status = "modified"
            self.added = 0
            self.deleted = 0
            self.patch_lines: list[str] = []
            self.is_binary = False

        def finalize(self) -> CommitFilePayload | None:
            if not self.patch_lines:
                return None

            path = self.path or _extract_path_from_diff_header(self.patch_lines[0]) or "unknown"
            patch = "\n".join(self.patch_lines).strip()
            return CommitFilePayload(
                path=path,
                status=self.status,
                added_lines=self.added,
                deleted_lines=self.deleted,
                patch=patch,
                is_binary=self.is_binary,
            )

    def flush(current: _FileBuffer | None) -> None:
        if current is None:
            return
        payload = current.finalize()
        if payload:
            files.append(payload)

    current: _FileBuffer | None = None

    for line in diff_text.splitlines():
        if line.startswith("diff --git "):
            flush(current)
            current = _FileBuffer()
            current.patch_lines.append(line)
            path_hint = _extract_path_from_diff_header(line)
            if path_hint:
                current.path = path_hint
            continue

        if current is None:
            continue

        current.patch_lines.append(line)

        if line.startswith("new file mode"):
            current.status = "added"
        elif line.startswith("deleted file mode"):
            current.status = "deleted"
        elif line.startswith("rename from"):
            current.status = "renamed"
        elif line.startswith("rename to"):
            current.path = line.partition("rename to")[2].strip()

        if line.startswith("Binary files") or line.startswith("GIT binary patch"):
            current.is_binary = True

        if line.startswith("+++ "):
            new_path = _normalize_path_fragment(line[4:].strip())
            if new_path and new_path != "/dev/null":
                current.path = new_path
        elif line.startswith("--- "):
            old_path = _normalize_path_fragment(line[4:].strip())
            if current.status == "deleted" and old_path:
                current.path = old_path

        if current.is_binary:
            continue

        if line.startswith("+") and not line.startswith("+++"):
            current.added += 1
        elif line.startswith("-") and not line.startswith("---"):
            current.deleted += 1

    flush(current)

    total_added = sum(f.added_lines for f in files)
    total_deleted = sum(f.deleted_lines for f in files)
    return files, total_added, total_deleted


def _extract_path_from_diff_header(header: str) -> str | None:
    parts = header.split()
    if len(parts) < 4:
        return None
    candidate = parts[3]
    return _normalize_path_fragment(candidate)


def _normalize_path_fragment(fragment: str) -> str | None:
    fragment = fragment.strip()
    if fragment.startswith("a/") or fragment.startswith("b/"):
        fragment = fragment[2:]
    if fragment in {"a/null", "b/null", "/dev/null"}:
        return None
    return fragment or None
