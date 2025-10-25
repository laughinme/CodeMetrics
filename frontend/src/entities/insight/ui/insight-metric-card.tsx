import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import type { InsightMetric, InsightTone } from "../model/types"

const iconToneClass: Record<InsightTone, string> = {
  default: "border-border/40 bg-muted/40 text-muted-foreground",
  positive: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  info: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  muted: "border-border/30 bg-muted/30 text-muted-foreground/80",
}

const badgeToneClass: Record<InsightTone, string> = {
  default: "border-border/40 bg-muted/40 text-muted-foreground",
  positive: "border-emerald-500/20 bg-emerald-500/15 text-emerald-400",
  warning: "border-amber-500/20 bg-amber-500/15 text-amber-500",
  danger: "border-rose-500/20 bg-rose-500/15 text-rose-400",
  info: "border-sky-500/20 bg-sky-500/15 text-sky-400",
  muted: "border-border/40 bg-muted/40 text-muted-foreground/85",
}

const valueFormatClass: Record<
  NonNullable<InsightMetric["valueFormat"]>,
  string
> = {
  default: "text-4xl font-semibold tracking-tight",
  mono: "text-[28px] font-semibold tracking-tight font-mono",
}

type InsightMetricCardProps = {
  metric: InsightMetric
  className?: string
}

export function InsightMetricCard({
  metric,
  className,
}: InsightMetricCardProps) {
  const Icon = metric.icon
  const iconClasses = iconToneClass[metric.tone ?? "default"]
  const badgeClasses = badgeToneClass[metric.status?.tone ?? "default"]
  const valueClasses =
    metric.valueFormat ?
      valueFormatClass[metric.valueFormat]
    : valueFormatClass.default

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/40 bg-card/80 p-6 shadow-[0_28px_80px_-60px_rgba(124,132,255,0.45)] backdrop-blur transition hover:border-border/60 hover:bg-card/90 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
        "gap-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl border",
                iconClasses
              )}
            >
              <Icon className="size-5" strokeWidth={1.8} />
            </span>
          ) : null}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground/80">
              {metric.title}
            </span>
            {metric.description ? (
              <span className="text-xs text-muted-foreground/70">
                {metric.description}
              </span>
            ) : null}
          </div>
        </div>
        {metric.status ? (
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium shadow-sm",
              badgeClasses
            )}
          >
            {metric.status.label}
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <span className={cn(valueClasses, "text-foreground")}>
          {metric.value}
        </span>
        {metric.subtitle ? (
          <p className="text-sm text-muted-foreground/80">{metric.subtitle}</p>
        ) : null}
      </div>
    </Card>
  )
}
