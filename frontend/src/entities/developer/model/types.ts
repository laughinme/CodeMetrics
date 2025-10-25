export type DevKpi = {
  commitsCount: number;
  activeDevelopers: number;
  activeRepositories: number;
  avgCommitSize: { mean: number; median: number };
  messageQuality: { avgLength: number; shortPercentage: number };
};

export type DeveloperRow = {
  id: string;
  commits: number;
  lines: number;
  sharePct: number;
  name: string;
  email: string;
};

export type DevelopersSummary = {
  kpi: DevKpi;
  authors: DeveloperRow[];
};