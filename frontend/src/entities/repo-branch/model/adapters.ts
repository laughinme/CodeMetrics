import type { RepoBranchDto } from "@/shared/api/repoBranches";

import type { RepoBranch } from "./types";

export const toRepoBranch = (dto: RepoBranchDto): RepoBranch => ({
  name: dto.name,
  isDefault: dto.is_default,
  latestCommit: dto.latest_commit
    ? {
        sha: dto.latest_commit.sha,
        message: dto.latest_commit.message,
        committedAt: new Date(dto.latest_commit.committed_at),
        authorName: dto.latest_commit.author.name,
        authorEmail: dto.latest_commit.author.email,
      }
    : null,
});
