"use client"

import type { LucideIcon } from "lucide-react"
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Minus,
} from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

type TrendDirection = "up" | "down" | "neutral"

type TrendMeta = {
  direction: TrendDirection
  value: string
  description?: string
}

type Detail = {
  label: string
  value: string
}

export type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  icon?: LucideIcon
  trend?: TrendMeta
  details?: Detail[]
  tone?: "default" | "warning" | "accent"
}

const trendIconMap: Record<TrendDirection, LucideIcon> = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
}

const trendToneMap: Record<
  TrendDirection,
  { badge: string; icon: string; text: string }
> = {
  up: {
    badge: "bg-emerald-500/10 text-emerald-500",
    icon: "text-emerald-500",
    text: "text-emerald-500",
  },
  down: {
    badge: "bg-rose-500/10 text-rose-500",
    icon: "text-rose-500",
    text: "text-rose-500",
  },
  neutral: {
    badge: "bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
    text: "text-muted-foreground",
  },
}

const toneRingMap: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default:
    "bg-gradient-to-br from-primary/5 via-background to-background border-border/60",
  warning:
    "bg-gradient-to-br from-amber-500/10 via-background to-background border-amber-500/30",
  accent:
    "bg-gradient-to-br from-sky-500/10 via-background to-background border-sky-500/30",
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  details,
  tone = "default",
}: KpiCardProps) {
  const trendIcon = trend ? trendIconMap[trend.direction] : ArrowRight
  const toneStyles = toneRingMap[tone]
  const trendStyles = trend ? trendToneMap[trend.direction] : undefined

  return (
    <Card
      className={cn(
        "relative h-full overflow-hidden border bg-background/80 backdrop-blur-sm",
        toneStyles
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/4 via-transparent to-black/5 dark:from-white/5 dark:via-transparent dark:to-black/30" />
      <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1">
          <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-xl bg-primary/10 p-2 text-primary shadow-sm">
            <Icon className="h-6 w-6" strokeWidth={1.75} />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="relative z-10 flex flex-col gap-4">
        {trend ? (
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                trendStyles?.badge
              )}
            >
              <trendIcon className={cn("h-4 w-4", trendStyles?.icon)} />
              {trend.value}
            </Badge>
            {trend.description ? (
              <span className={cn("text-xs", trendStyles?.text)}>
                {trend.description}
              </span>
            ) : null}
          </div>
        ) : null}
        {details?.length ? (
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground @[420px]:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-2.5 py-2 text-foreground/90 shadow-sm"
              >
                <span className="font-medium text-muted-foreground/80">
                  {detail.label}
                </span>
                <span className="font-semibold text-foreground">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
