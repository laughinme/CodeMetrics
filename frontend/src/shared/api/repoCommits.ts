
import apiProtected from "./axiosInstance";

export type RepoCommitsParams = {
  limit?: number; 
  cursor?: string | null;
  after?: string | Date | null;
};


export type RepoCommitDto = {
  sha: string;
  repo: { project_key: string; name: string };
  author: { id: string; name: string; email: string };
  committer: { id: string; name: string; email: string };
  committed_at: string;
  message: string;
  is_merge: boolean;
  added_lines: number;
  deleted_lines: number;
  files_changed: number;
};

export type CursorPageDto<T> = {
  items: T[];
  next_cursor: string | null;
};

function toIso(v: RepoCommitsParams["after"]) {
  if (!v) return undefined;
  return typeof v === "string" ? v : v.toISOString();
}

export async function getRepoCommits(
  repoId: string,
  { limit = 50, cursor, after }: RepoCommitsParams = {}
) {
  const { data } = await apiProtected.get<CursorPageDto<RepoCommitDto>>(
    `/entities/repos/${repoId}/commits`,
    { params: { limit, cursor: cursor ?? undefined, after: toIso(after) } }
  );
  return data;
}