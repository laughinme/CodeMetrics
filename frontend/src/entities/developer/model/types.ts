export type DeveloperActivityLevel = "high" | "medium" | "low"

export type DeveloperMetricRow = {
  id: string
  name: string
  email: string
  commits: number
  lines: number
  activity: DeveloperActivityLevel
}
