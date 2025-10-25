import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import type { InsightObservation, InsightTone } from "../model/types"

const iconToneClass: Record<InsightTone, string> = {
  default: "border-border/40 bg-muted/40 text-muted-foreground",
  positive: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
  warning: "border-amber-500/30 bg-amber-500/12 text-amber-500",
  danger: "border-rose-500/30 bg-rose-500/12 text-rose-400",
  info: "border-sky-500/30 bg-sky-500/12 text-sky-400",
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

type InsightObservationCardProps = {
  observation: InsightObservation
  className?: string
}

export function InsightObservationCard({
  observation,
  className,
}: InsightObservationCardProps) {
  const Icon = observation.icon
  const iconClasses = iconToneClass[observation.tone ?? "default"]
  const badgeTone = observation.badge?.tone ?? observation.tone ?? "default"
  const badgeClasses = badgeToneClass[badgeTone]

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/40 bg-card/90 p-6 shadow-[0_32px_90px_-70px_rgba(124,132,255,0.5)] backdrop-blur transition hover:border-border/60 hover:bg-card/95 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
        "gap-5 md:gap-6 md:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-3xl border",
                iconClasses
              )}
            >
              <Icon className="size-6" strokeWidth={1.7} />
            </span>
          ) : null}
          <h2 className="text-lg font-semibold tracking-tight md:text-xl">
            {observation.title}
          </h2>
        </div>
        {observation.badge ? (
          <Badge
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-medium uppercase tracking-wide shadow-sm",
              badgeClasses
            )}
          >
            {observation.badge.label}
          </Badge>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground/85 md:text-base">
        {observation.summary}
      </p>
      {observation.recommendations.length ? (
        <ul className="flex flex-col gap-2 text-sm text-muted-foreground/85 md:text-base">
          {observation.recommendations.map((item) => (
            <li
              key={item}
              className="relative rounded-2xl border border-border/40 bg-muted/20 px-4 py-2.5 pl-7 text-foreground/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:bg-white/[0.02]"
            >
              <span className="absolute left-3 top-3 inline-flex h-2 w-2 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  )
}
