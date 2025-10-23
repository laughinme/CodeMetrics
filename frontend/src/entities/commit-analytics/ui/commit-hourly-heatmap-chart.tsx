"use client"

import * as React from "react"

import { cn } from "@/shared/lib/utils"
import {
  Card,
  CardAction,
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
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/components/ui/tooltip"

import {
  commitDayLabels,
  commitDayOrder,
} from "../model/mock-data"
import type {
  CommitTimeRange,
  HourlyActivityDatum,
  TimeRangeOption,
} from "../model/types"

const hours = Array.from({ length: 24 }, (_, index) => index)
const legendLevels = [0, 1, 2, 3, 4] as const

const heatmapPaletteStyles = {
  "--heatmap-color-0": "#ebedf0",
  "--heatmap-color-1": "#9be9a8",
  "--heatmap-color-2": "#40c463",
  "--heatmap-color-3": "#30a14e",
  "--heatmap-color-4": "#216e39",
} as React.CSSProperties

type CommitHourlyHeatmapChartProps = {
  data: HourlyActivityDatum[]
  range: CommitTimeRange
  rangeLabel: string
  onRangeChange: (range: CommitTimeRange) => void
  rangeOptions: TimeRangeOption[]
}

const HEATMAP_CELL_CLASS =
  "h-7 w-full rounded-md border border-transparent transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"

export function CommitHourlyHeatmapChart({
  data,
  range,
  rangeLabel,
  onRangeChange,
  rangeOptions,
}: CommitHourlyHeatmapChartProps) {
  const maxCommits = React.useMemo(
    () => data.reduce((max, item) => Math.max(max, item.commits), 0),
    [data]
  )

  const dataMap = React.useMemo(() => {
    const map = new Map<string, HourlyActivityDatum>()
    data.forEach((item) => {
      map.set(`${item.day}-${item.hour}`, item)
    })
    return map
  }, [data])

  const getIntensity = React.useCallback(
    (value: number) => {
      if (!maxCommits) {
        return 0
      }
      return value / maxCommits
    },
    [maxCommits]
  )

  return (
    <Card
      className={cn(
        "h-full",
        "dark:[--heatmap-color-0:#161b22] dark:[--heatmap-color-1:#0e4429] dark:[--heatmap-color-2:#006d32] dark:[--heatmap-color-3:#26a641] dark:[--heatmap-color-4:#39d353]"
      )}
      style={heatmapPaletteStyles}
    >
      <CardHeader>
        <CardTitle>Активность по часам × дням недели</CardTitle>
        <CardDescription>Коммиты за период: {rangeLabel}</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(value) => {
              if (value) {
                onRangeChange(value as CommitTimeRange)
              }
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            {rangeOptions.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Select
            value={range}
            onValueChange={(value) => onRangeChange(value as CommitTimeRange)}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Выберите период"
            >
              <SelectValue placeholder="Выберите период" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="w-10 flex-none text-[11px] font-medium">Дни</span>
            <div className="min-w-[720px] flex-1">
              <div className="grid grid-cols-[repeat(24,minmax(20px,1fr))] gap-1 text-center">
                {hours.map((hour) => (
                  <span key={hour} className="font-medium">
                    {hour}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <TooltipProvider>
            <div className="flex gap-3">
              <div className="flex w-10 flex-col justify-between gap-1 py-0.5 text-xs font-medium text-muted-foreground">
                {commitDayOrder.map((day) => (
                  <span
                    key={day}
                    className="h-7 leading-7"
                  >
                    {commitDayLabels[day]}
                  </span>
                ))}
              </div>
              <div className="min-w-[720px] flex-1 overflow-x-auto">
                <div className="grid grid-rows-7 gap-1">
                  {commitDayOrder.map((day) => (
                    <div
                      key={day}
                      className="grid grid-cols-[repeat(24,minmax(20px,1fr))] gap-1"
                    >
                      {hours.map((hour) => {
                        const datum = dataMap.get(`${day}-${hour}`)
                        const commits = datum?.commits ?? 0
                        const intensity = getIntensity(commits)
                        const level =
                          maxCommits === 0 || commits === 0
                            ? 0
                            : Math.min(4, Math.ceil(intensity * 4))
                        const style: React.CSSProperties = {
                          backgroundColor: `var(--heatmap-color-${level})`,
                        }

                        return (
                          <Tooltip key={hour}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  HEATMAP_CELL_CLASS,
                                  level === 0 &&
                                    "border-border/40 bg-[var(--heatmap-color-0)] dark:border-white/10"
                                )}
                                style={style}
                                aria-label={`${commitDayLabels[day]}, ${hour}:00 — ${commits} коммитов`}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <div className="flex flex-col gap-0.5 text-left text-xs">
                                <span className="font-medium text-muted-foreground">
                                  {commitDayLabels[day]}, {hour}:00
                                </span>
                                <span className="font-semibold text-background">
                                  {commits} коммитов
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
          </TooltipProvider>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Меньше</span>
            <div className="flex items-center gap-1">
              {legendLevels.map((level) => (
                <span
                  key={level}
                  className="h-2.5 w-2.5 rounded-sm border border-border/40 dark:border-white/10"
                  style={{
                    backgroundColor: `var(--heatmap-color-${level})`,
                  }}
                />
              ))}
            </div>
            <span>Больше</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
