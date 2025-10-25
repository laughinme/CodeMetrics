export type InsightSeverity = "info" | "warning" | "error" | "success"

export type Insight = {
  id: string
  title: string
  description: string
  severity: InsightSeverity
}
