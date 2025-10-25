import type { InsightDto } from "@/shared/api/insights"

import type { Insight, InsightSeverity } from "./types"

const severityMap: Record<string, InsightSeverity> = {
  info: "info",
  informational: "info",
  notice: "info",
  warning: "warning",
  warn: "warning",
  caution: "warning",
  danger: "error",
  error: "error",
  critical: "error",
  severe: "error",
  success: "success",
  ok: "success",
  positive: "success",
}

const normalizeSeverity = (value: InsightDto["severity"]): InsightSeverity => {
  if (!value) return "info"
  const normalized = typeof value === "string" ? value.toLowerCase().trim() : ""
  return severityMap[normalized] ?? "info"
}

export function toInsight(dto: InsightDto): Insight {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    severity: normalizeSeverity(dto.severity),
  }
}

export function toInsights(dtoList: InsightDto[]): Insight[] {
  return dtoList.map(toInsight)
}
