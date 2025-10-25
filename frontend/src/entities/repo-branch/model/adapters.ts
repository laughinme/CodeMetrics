import type {
  RepoBranchDto,
  RepoBranchesPageDto,
} from "@/shared/api/repoBranches";

import type { RepoBranch, RepoBranchPage } from "./types";

export const toRepoBranch = (dto: RepoBranchDto): RepoBranch => ({
  id: dto.id,
  name: dto.name,
  isDefault: dto.is_default,
  isProtected: dto.is_protected,
  latestCommit:
    dto.latest_commit && dto.latest_commit.committed_at
      ? {
          sha: dto.latest_commit.sha,
          message: dto.latest_commit.message,
          committedAt: new Date(dto.latest_commit.committed_at),
          authorName: dto.latest_commit.author.name,
          authorEmail: dto.latest_commit.author.email,
        }
      : null,
});

export const toRepoBranchPage = (
  page: RepoBranchesPageDto
): RepoBranchPage => ({
  items: page.items.map(toRepoBranch),
  nextCursor: page.next_cursor ?? null,
});
