export type DevSummaryFilters = {
  since: Date
  until: Date
  project_id?: number | null
  repoIds?: string[] | null
}

export type DevSummaryRange = "7d" | "30d" | "90d" | "1y"

export type DevSummaryRangeOption = {
  value: DevSummaryRange
  label: string
}
