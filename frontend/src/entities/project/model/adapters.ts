import type { ProjectDto } from "@/shared/api/projects"

import type { Project } from "./types"

export const dtoToCardVM = (d: ProjectDto): Project => ({
  id: d.id,
  title: d.name,
  badge: d.is_public ? "Public" : "Private",
  repos: d.repo_count,
  description: d.description ?? null,
  lastActivity: new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d.last_activity_at)),
})

export const dtoListToCardVM = (arr: ProjectDto[]) => arr.map(dtoToCardVM)
