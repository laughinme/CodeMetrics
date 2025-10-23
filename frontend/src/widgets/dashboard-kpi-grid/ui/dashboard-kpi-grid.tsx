"use client"

import { KpiCard, type KpiCardProps } from "@/entities/kpi-card"
import { cn } from "@/shared/lib/utils"

export type DashboardKpiMetric = KpiCardProps & { id: string }

type DashboardKpiGridProps = {
  metrics: DashboardKpiMetric[]
  className?: string
}

export function DashboardKpiGrid({
  metrics,
  className,
}: DashboardKpiGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-3 @[1800px]:grid-cols-4",
        className
      )}
    >
      {metrics.map((metric) => (
        <KpiCard key={metric.id} {...metric} />
      ))}
    </div>
  )
}
