import apiProtected from "./axiosInstance";

export type DevelopersSummaryParams = {
  since: string | Date;
  until: string | Date;
  project_id?: number | null;
  repoIds?: string[] | null;
};

export type DevelopersSummaryDto = {
  kpi: {
    commits: number;
    active_devs: number;
    active_repos: number;
    avg_commit_size: { mean: number; median: number };
    msg_quality: { avg_length: number; short_pct: number };
  };
  authors: Array<{
    author_id: string;
    commits: number;
    lines: number;
    share_pct: number;
    git_name: string;
    git_email: string;
  }>;
};

const toDateOnly = (v: string | Date) =>
  typeof v === "string" ? v : v.toISOString().slice(0, 10);

const stripNil = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null)
  ) as T;

export async function getDevelopersSummary(params: DevelopersSummaryParams) {
  const cleaned = stripNil({
    since: toDateOnly(params.since),
    until: toDateOnly(params.until),
    project_id: params.project_id ?? null,
    repoIds: params.repoIds && params.repoIds.length ? params.repoIds : null,
  });
  const { data } = await apiProtected.get<DevelopersSummaryDto>(
    "/developers/summary",
    { params: cleaned }
  );
  return data;
}