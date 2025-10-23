"use client"

import { Lightbulb, Sparkles } from "lucide-react"

import {
  Badge,
} from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

type Impact = "high" | "medium" | "low"

export type Recommendation = {
  id: string
  title: string
  description: string
  impact: Impact
  tags?: string[]
  action?: string
}

type DashboardRecommendationsProps = {
  recommendations: Recommendation[]
  className?: string
}

const impactTone: Record<
  Impact,
  { label: string; className: string }
> = {
  high: {
    label: "Высокий эффект",
    className: "bg-emerald-500/15 text-emerald-500",
  },
  medium: {
    label: "Средний эффект",
    className: "bg-amber-500/15 text-amber-500",
  },
  low: {
    label: "Низкий эффект",
    className: "bg-muted text-muted-foreground",
  },
}

export function DashboardRecommendations({
  recommendations,
  className,
}: DashboardRecommendationsProps) {
  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Рекомендации</CardTitle>
          <CardDescription>
            Эвристики на основе текущих метрик
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Идеи улучшений
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((item) => {
          const tone = impactTone[item.impact]

          return (
            <div
              key={item.id}
              className="group rounded-xl border border-border/60 bg-muted/30 p-4 transition hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2 text-primary shadow-sm">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    tone.className
                  )}
                >
                  {tone.label}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {item.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-dashed px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
                {item.action ? (
                  <span className="ml-auto text-xs font-medium text-primary">
                    {item.action}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
