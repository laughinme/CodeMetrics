import type { CursorPageDto, RepoCommitDto } from "@/shared/api/repoCommits";
import type { Commit, CommitPage } from "./types";

export const toCommit = (dto: RepoCommitDto): Commit => ({
  sha: dto.sha,
  repoName: dto.repo.name,
  projectKey: dto.repo.project_key,
  authorName: dto.author.name,
  authorEmail: dto.author.email,
  committerName: dto.committer.name,
  committerEmail: dto.committer.email,
  committedAt: new Date(dto.committed_at),
  message: dto.message,
  isMerge: dto.is_merge,
  added: dto.added_lines,
  deleted: dto.deleted_lines,
  filesChanged: dto.files_changed,
});

export const toCommitPage = (page: CursorPageDto<RepoCommitDto>): CommitPage => ({
  items: page.items.map(toCommit),
  nextCursor: page.next_cursor ?? null,
});