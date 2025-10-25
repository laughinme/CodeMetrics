import { cn } from "@/shared/lib/utils"

import type { InsightMetric } from "../model/types"
import { InsightMetricCard } from "./insight-metric-card"

type InsightMetricsGridProps = {
  items: InsightMetric[]
  className?: string
}

export function InsightMetricsGrid({
  items,
  className,
}: InsightMetricsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @5xl/main:grid-cols-4",
        className
      )}
    >
      {items.map((item) => (
        <InsightMetricCard key={item.id} metric={item} className="h-full" />
      ))}
    </div>
  )
}
