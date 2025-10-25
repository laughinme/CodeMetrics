"use client"

import * as React from "react"

import { cn } from "@/shared/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

import type {
  CommitTimeRange,
  ContributionActivityDatum,
  TimeRangeOption,
} from "../model/types"

const legendLevels = [0, 1, 2, 3, 4] as const
const CELL_SIZE = 14

const heatmapPaletteStyles = {
  "--heatmap-color-0": "#ffffff",
  "--heatmap-color-1": "#0e4429",
  "--heatmap-color-2": "#006d32",
  "--heatmap-color-3": "#26a641",
  "--heatmap-color-4": "#39d353",
  "--heatmap-placeholder": "rgba(148, 163, 184, 0.08)",
  "--heatmap-zero-border": "rgba(148, 163, 184, 0.35)",
} as React.CSSProperties

type CommitHourlyHeatmapChartProps = {
  data: ContributionActivityDatum[]
  range: CommitTimeRange
  rangeLabel: string
  onRangeChange: (range: CommitTimeRange) => void
  rangeOptions: TimeRangeOption[]
}

type CalendarCell = {
  date: string
  commits: number
  isPlaceholder: boolean
}

const weekDayLabels = ["Mon", "", "Wed", "", "Fri", "", ""]

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" })
const tooltipFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

function startOfWeek(date: Date) {
  const day = (date.getDay() + 6) % 7
  const start = new Date(date)
  start.setDate(date.getDate() - day)
  start.setHours(0, 0, 0, 0)
  return start
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(0, 0, 0, 0)
  return end
}

export function CommitHourlyHeatmapChart({
  data,
  range,
  rangeLabel,
  onRangeChange,
  rangeOptions,
}: CommitHourlyHeatmapChartProps) {
  const { weeks, maxCommits, monthLabels } = React.useMemo(() => {
    if (data.length === 0) {
      return { weeks: [] as CalendarCell[][], maxCommits: 0, monthLabels: [] as string[] }
    }

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date))
    const map = new Map(sorted.map((item) => [item.date, item.commits]))
    const firstDate = new Date(sorted[0].date)
    const lastDate = new Date(sorted[sorted.length - 1].date)
    const start = startOfWeek(firstDate)
    const end = endOfWeek(lastDate)

    const weeks: CalendarCell[][] = []
    let cursor = new Date(start)

    while (cursor <= end) {
      const week: CalendarCell[] = []
      for (let i = 0; i < 7; i++) {
        const iso = cursor.toISOString().slice(0, 10)
        const commits = map.get(iso) ?? 0
        const isPlaceholder = cursor < firstDate || cursor > lastDate
        week.push({ date: iso, commits, isPlaceholder })
        cursor.setDate(cursor.getDate() + 1)
      }
      weeks.push(week)
    }

    const maxCommits = sorted.reduce(
      (max, item) => Math.max(max, item.commits),
      0
    )

    let previousMonth = -1
    const monthLabels = weeks.map((week) => {
      const firstRealCell = week.find((cell) => !cell.isPlaceholder) ?? week[0]
      const month = new Date(firstRealCell.date).getMonth()
      if (month !== previousMonth) {
        previousMonth = month
        return monthFormatter.format(new Date(firstRealCell.date))
      }
      return ""
    })

    return { weeks, maxCommits, monthLabels }
  }, [data])

  const getLevel = React.useCallback(
    (commits: number) => {
      if (!maxCommits || commits === 0) {
        return 0
      }
      const ratio = commits / maxCommits
      return Math.min(4, Math.max(1, Math.ceil(ratio * 4)))
    },
    [maxCommits]
  )

  return (
    <Card
      className={cn(
        "h-full rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(34,197,94,0.25)] backdrop-blur"
      )}
      style={heatmapPaletteStyles}
    >
      <CardHeader className="pb-0">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              Commit calendar
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Period: {rangeLabel}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={(value) => {
                if (value) {
                  onRangeChange(value as CommitTimeRange)
                }
              }}
              variant="outline"
              className="hidden h-11 items-center gap-0 rounded-full border border-border/30 bg-background/40 p-1 text-sm shadow-inner md:flex"
            >
              {rangeOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "px-4 py-2 font-medium transition",
                    "rounded-full border border-transparent text-muted-foreground/80",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:border-white/20",
                    "data-[state=off]:hover:bg-background/20 data-[state=off]:hover:text-foreground/80",
                    "focus-visible:ring-0 focus-visible:ring-offset-0"
                  )}
                >
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select
              value={range}
              onValueChange={(value) => onRangeChange(value as CommitTimeRange)}
            >
              <SelectTrigger
                className="flex h-11 w-44 items-center justify-between rounded-full border border-border/30 bg-background/50 px-4 text-sm font-medium text-foreground/80 shadow-inner md:hidden"
                size="sm"
                aria-label="Select period"
              >
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-popover/95 backdrop-blur">
                {rangeOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-6 pt-4 sm:px-6">
        <div className="mt-4 flex flex-col gap-4">
          <TooltipProvider>
            <div className="flex gap-3">
              <div className="flex w-[48px] flex-col gap-[3px] text-xs font-medium text-muted-foreground/80">
                <span
                  aria-hidden
                  style={{ height: CELL_SIZE }}
                />
                {weekDayLabels.map((label, index) => (
                  <span
                    key={`label-${index}`}
                    className={cn(
                      "flex items-center text-[11px]",
                      label ? "opacity-100" : "opacity-0"
                    )}
                    style={{ height: CELL_SIZE }}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex flex-col gap-[6px]">
                  <div className="flex gap-[3px]">
                    {weeks.map((_, index) => (
                      <span
                        key={`month-${index}`}
                        className="text-[11px] font-medium text-muted-foreground/70"
                        style={{ width: CELL_SIZE }}
                      >
                        {monthLabels[index]}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-[3px]">
                    {weeks.map((week, weekIndex) => (
                      <div
                        key={`week-${weekIndex}`}
                        className="flex flex-col gap-[3px]"
                      >
                        {week.map((cell, dayIndex) => {
                          const level = getLevel(cell.commits)
                          const isZero = !cell.isPlaceholder && cell.commits === 0
                          const backgroundColor = cell.isPlaceholder
                            ? "var(--heatmap-placeholder)"
                            : isZero
                              ? "var(--heatmap-color-0)"
                              : `var(--heatmap-color-${level})`
                          const borderColor = cell.isPlaceholder
                            ? "transparent"
                            : isZero
                              ? "var(--heatmap-zero-border)"
                              : "transparent"
                          const cellStyle: React.CSSProperties = {
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            borderRadius: 3,
                            backgroundColor,
                            border: `1px solid ${borderColor}`,
                          }

                          if (cell.isPlaceholder) {
                          return (
                            <div
                              key={`${weekIndex}-${dayIndex}`}
                              className="rounded-[3px]"
                              style={cellStyle}
                            />
                          )
                        }

                        const formattedDate = tooltipFormatter.format(
                          new Date(cell.date)
                        )
                        return (
                          <Tooltip key={cell.date}>
                            <TooltipTrigger asChild>
                              <div
                                role="button"
                                tabIndex={0}
                                className="cursor-pointer rounded-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                                style={cellStyle}
                                aria-label={`${formattedDate}: ${cell.commits} коммитов`}
                              />
                            </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="flex flex-col gap-0.5 text-left text-xs">
                                  <span className="font-medium text-muted-foreground">
                                    {formattedDate}
                                  </span>
                                  <span className="font-semibold text-background">
                                    {cell.commits} коммитов
                                  </span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TooltipProvider>
          <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground/80">
            <span>Less</span>
            <div className="flex items-center gap-1">
              {legendLevels.map((level) => (
                <span
                  key={level}
                  className="h-3 w-3 rounded-[4px] border border-border/30"
                  style={{
                    backgroundColor: `var(--heatmap-color-${level})`,
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
