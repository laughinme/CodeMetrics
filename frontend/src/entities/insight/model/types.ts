import type { LucideIcon } from "lucide-react"

export type InsightTone = "default" | "positive" | "warning" | "danger" | "info" | "muted"

export type InsightMetricStatus = {
  label: string
  tone?: InsightTone
  description?: string
}

export type InsightMetric = {
  id: string
  title: string
  value: string
  subtitle?: string
  description?: string
  icon?: LucideIcon
  tone?: InsightTone
  status?: InsightMetricStatus
  valueFormat?: "default" | "mono"
}

export type InsightObservation = {
  id: string
  title: string
  summary: string
  recommendations: string[]
  icon?: LucideIcon
  tone?: InsightTone
  badge?: {
    label: string
    tone?: InsightTone
  }
}
