export type ProjectVisibility = "public" | "private"

export type ProjectOverview = {
  id: string
  name: string
  visibility: ProjectVisibility
  commits: number
  developers: number
  repositories: number
  averageCommitSize: number
}
