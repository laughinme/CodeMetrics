"use client"

import type { ComponentType } from "react"

import { AlertTriangle, Flame, GitCommit, Users2 } from "lucide-react"

import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

type RiskLevel = "high" | "medium" | "low"

export type HotFileMetric = {
  path: string
  churn: number
  commits: number
  authors: number
  lastTouched: string
  risk: RiskLevel
}

type DashboardHotFilesProps = {
  files: HotFileMetric[]
  className?: string
}

const riskToneMap: Record<
  RiskLevel,
  { label: string; className: string; icon: ComponentType<{ className?: string }> }
> = {
  high: {
    label: "Высокий риск",
    className: "bg-rose-500/15 text-rose-500",
    icon: AlertTriangle,
  },
  medium: {
    label: "Средний риск",
    className: "bg-amber-500/15 text-amber-500",
    icon: Flame,
  },
  low: {
    label: "Низкий риск",
    className: "bg-emerald-500/15 text-emerald-500",
    icon: Flame,
  },
}

export function DashboardHotFiles({
  files,
  className,
}: DashboardHotFilesProps) {
  const maxChurn = files.reduce(
    (acc, file) => (file.churn > acc ? file.churn : acc),
    0
  )

  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>Горячие файлы</CardTitle>
          <CardDescription>
            Высокий churn = много изменений и коммитов
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        >
          <Flame className="h-3.5 w-3.5 text-primary" />
          {files.length} файлов
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.map((file) => {
          const normalized =
            maxChurn > 0 ? Math.max(0.12, file.churn / maxChurn) : 0.12
          const riskTone = riskToneMap[file.risk]
          const RiskIcon = riskTone.icon

          return (
            <div
              key={file.path}
              className="rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {file.path}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Активность за период: {file.lastTouched}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                    riskTone.className
                  )}
                >
                  <RiskIcon className="h-3.5 w-3.5" />
                  {riskTone.label}
                </Badge>
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-border/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${normalized * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <GitCommit className="h-3.5 w-3.5 text-primary" />
                    {file.commits.toLocaleString("ru-RU")} коммитов
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users2 className="h-3.5 w-3.5 text-primary" />
                    {file.authors} автор(ов)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    Σ изменений:{" "}
                    <span className="font-semibold text-foreground">
                      {file.churn.toLocaleString("ru-RU")}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
