"use client"

import { memo } from "react"

import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
  CrossCircledIcon,
} from "@radix-ui/react-icons"

import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

import type { Insight, InsightSeverity } from "../model/types"

const severityConfig: Record<
  InsightSeverity,
  {
    label: string
    badgeClass: string
    iconClass: string
    icon: typeof InfoCircledIcon
  }
> = {
  info: {
    label: "Информация",
    badgeClass: "border-sky-500/40 bg-sky-500/10 text-sky-400",
    iconClass: "text-sky-400",
    icon: InfoCircledIcon,
  },
  warning: {
    label: "Предупреждение",
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    iconClass: "text-amber-400",
    icon: ExclamationTriangleIcon,
  },
  error: {
    label: "Важно",
    badgeClass: "border-rose-500/40 bg-rose-500/10 text-rose-400",
    iconClass: "text-rose-400",
    icon: CrossCircledIcon,
  },
  success: {
    label: "Успех",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    iconClass: "text-emerald-400",
    icon: CheckCircledIcon,
  },
}

type InsightCardProps = {
  insight: Insight
  className?: string
}

function InsightCardComponent({ insight, className }: InsightCardProps) {
  const config = severityConfig[insight.severity] ?? severityConfig.info
  const Icon = config.icon

  return (
    <Card
      className={cn(
        "relative flex flex-col gap-4 rounded-3xl border-border/35 bg-card/85 p-6 shadow-[0_32px_90px_-70px_rgba(124,132,255,0.5)] backdrop-blur transition hover:border-border/55 hover:bg-card/95 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-1 inline-flex size-8 items-center justify-center rounded-2xl border border-border/40 bg-muted/10",
            config.iconClass,
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold leading-tight text-foreground">
              {insight.title}
            </h3>
            <Badge
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium tracking-wide",
                config.badgeClass,
              )}
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground/85 md:text-base">
            {insight.description}
          </p>
        </div>
      </div>
    </Card>
  )
}

export const InsightCard = memo(InsightCardComponent)
