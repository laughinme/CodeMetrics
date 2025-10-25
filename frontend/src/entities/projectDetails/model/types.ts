export type ProjectDetail = {
  id: number;
  name: string;
  description: string | null;
  isPublic: boolean;
  repoCount: number;
  lastActivityAt: Date;
};

export type ProjectDetailVM = {
  id: number;
  title: string;
  badge: "Public" | "Private";
  repos: number;
  lastActivity: string;
  description: string | null;
};