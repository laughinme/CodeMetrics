import type { ProjectOverview } from "./types"

export const projectOverviews: ProjectOverview[] = [
  {
    id: "public-project",
    name: "Public Project",
    visibility: "public",
    commits: 122,
    developers: 9,
    repositories: 3,
    averageCommitSize: 64,
  },
  {
    id: "team-3",
    name: "Team 3 Project",
    visibility: "private",
    commits: 215,
    developers: 9,
    repositories: 3,
    averageCommitSize: 62,
  },
  {
    id: "ml-platform",
    name: "ML Platform",
    visibility: "private",
    commits: 184,
    developers: 7,
    repositories: 4,
    averageCommitSize: 71,
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    visibility: "public",
    commits: 138,
    developers: 6,
    repositories: 2,
    averageCommitSize: 58,
  },
] satisfies ProjectOverview[]

export const projectFilters = {
  scope: {
    label: "All projects",
  },
  period: {
    label: "30 days",
  },
} satisfies Record<
  "scope" | "period",
  {
    label: string
  }
>
