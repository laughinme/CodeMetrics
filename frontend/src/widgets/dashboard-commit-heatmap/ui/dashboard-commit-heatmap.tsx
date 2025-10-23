"use client"

import { Fragment, useMemo } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type HeatmapCell = {
  day: DayIndex
  hour: number
  value: number
}

type DashboardCommitHeatmapProps = {
  data: HeatmapCell[]
  maxValueHint?: number
  className?: string
}

const HOURS = Array.from({ length: 24 }, (_, index) => index)

export function DashboardCommitHeatmap({
  data,
  maxValueHint,
  className,
}: DashboardCommitHeatmapProps) {
  const lookup = useMemo(() => {
    const map = new Map<string, number>()
    data.forEach((cell) => {
      map.set(`${cell.day}-${cell.hour}`, cell.value)
    })
    return map
  }, [data])

  const maxValue =
    maxValueHint ??
    data.reduce((acc, cell) => (cell.value > acc ? cell.value : acc), 0)

  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle>Активность по времени</CardTitle>
        <CardDescription>
          Распределение коммитов по дням недели и часам
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="min-w-[960px] space-y-3">
            <div className="grid grid-cols-[60px_repeat(24,minmax(0,1fr))] gap-1 text-xs text-muted-foreground">
              <div />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="text-center font-medium"
                  aria-hidden="true"
                >
                  {hour.toString().padStart(2, "0")}
                </div>
              ))}
              {WEEK_DAYS.map((dayLabel, dayIndex) => (
                <Fragment key={dayLabel}>
                  <div className="flex h-10 items-center justify-center rounded-md bg-muted/40 font-medium text-foreground/80">
                    {dayLabel}
                  </div>
                  {HOURS.map((hour) => {
                    const value = lookup.get(`${dayIndex}-${hour}`) ?? 0
                    const intensity = maxValue
                      ? Math.min(1, value / maxValue)
                      : 0
                    const opacity = intensity === 0 ? 0.08 : 0.18 + intensity * 0.72
                    const fg =
                      intensity > 0.7 ? "text-white" : "text-foreground/80"
                    return (
                      <Tooltip key={`${dayIndex}-${hour}`}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "group relative flex h-10 w-full items-center justify-center rounded-md border border-border/40 transition",
                              fg
                            )}
                            style={{
                              backgroundColor: `rgba(59,130,246,${opacity.toFixed(
                                2
                              )})`,
                              boxShadow:
                                intensity > 0.8
                                  ? "0 6px 18px rgba(59,130,246,0.2)"
                                  : undefined,
                            }}
                          >
                            <span className="text-[11px] font-semibold opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              {value}
                            </span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1 text-xs">
                            <div className="font-semibold text-sm text-background">
                              {dayLabel}, {hour.toString().padStart(2, "0")}:
                              00
                            </div>
                            <div className="text-background/80">
                              {value} коммит(ов)
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        <Legend />
      </CardContent>
    </Card>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span>Менее</span>
      <div className="flex h-4 w-8 items-center justify-center rounded bg-primary/10" />
      <span>Больше</span>
      <div className="flex h-4 w-8 items-center justify-center rounded bg-primary/80" />
    </div>
  )
}
