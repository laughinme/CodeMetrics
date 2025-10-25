import type { DevelopersSummaryDto } from "@/shared/api/developersSummary";
import type { DevKpi, DeveloperRow, DevelopersSummary } from "./types";

const toDevKpi = (k: DevelopersSummaryDto["kpi"]): DevKpi => ({
  commitsCount: k.commits,
  activeDevelopers: k.active_devs,
  activeRepositories: k.active_repos,
  avgCommitSize: { mean: k.avg_commit_size.mean, median: k.avg_commit_size.median },
  messageQuality: { avgLength: k.msg_quality.avg_length, shortPercentage: k.msg_quality.short_pct },
});

const toDeveloperRow = (a: DevelopersSummaryDto["authors"][number]): DeveloperRow => ({
  id: a.author_id,
  commits: a.commits,
  lines: a.lines,
  sharePct: a.share_pct,
  name: a.git_name,
  email: a.git_email,
});

export const toDevelopersSummary = (dto: DevelopersSummaryDto): DevelopersSummary => ({
  kpi: toDevKpi(dto.kpi),
  authors: dto.authors.map(toDeveloperRow),
});