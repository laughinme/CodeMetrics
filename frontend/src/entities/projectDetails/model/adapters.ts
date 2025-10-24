import type { ProjectDetailDto } from "@/shared/api/projects";
import type { ProjectDetail, ProjectDetailVM } from "./types";

const fmt = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(d);

export const mapProjectDetailDto = (d: ProjectDetailDto): ProjectDetail => ({
  id: d.id,
  name: d.name,
  description: d.description ?? null,
  isPublic: d.is_public,
  repoCount: d.repo_count,
  lastActivityAt: new Date(d.last_activity_at),
});

export const toProjectDetailVM = (p: ProjectDetail): ProjectDetailVM => ({
  id: p.id,
  title: p.name,
  badge: p.isPublic ? "Public" : "Private",
  repos: p.repoCount,
  lastActivity: fmt(p.lastActivityAt),
  description: p.description,
});