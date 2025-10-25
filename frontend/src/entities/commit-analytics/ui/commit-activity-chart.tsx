"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
import {
  metricsRangeOptions,
  type MetricsRangeOption,
  type MetricsRangeValue,
} from "@/shared/lib/metrics-range"
import { cn } from "@/shared/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
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
import type { DailyCommitsDatum } from "../model/types"

const dailyCommitsChartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

export type ActivityRange = MetricsRangeValue

export type ActivityRangeOption = MetricsRangeOption

export const activityRangeOptions: ActivityRangeOption[] = metricsRangeOptions

type CommitActivityChartProps = {
  data: DailyCommitsDatum[]
  range: ActivityRange
  rangeLabel: string
  onRangeChange: (range: ActivityRange) => void
  rangeOptions: ActivityRangeOption[]
}

export function CommitActivityChart({
  data,
  range,
  rangeLabel,
  onRangeChange,
  rangeOptions,
}: CommitActivityChartProps) {
  const gradient = useId()
  const gradientId = gradient.replace(/:/g, "")
  const displayLabel =
    rangeLabel || rangeOptions.find((option) => option.value === range)?.label || "Selected period"

  return (
    <Card className="h-full rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur">
      <CardHeader className="pb-0">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              Total Commit Frequency
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground/80">
              Total for {displayLabel.toLowerCase()}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={(value) => {
                if (value) {
                  onRangeChange(value as ActivityRange)
                }
              }}
              variant="outline"
              className="hidden h-12 items-center gap-0 rounded-full border border-border/30 bg-background/60 p-1 text-sm shadow-inner md:flex"
            >
              {rangeOptions.map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className={cn(
                    "px-5 py-2 font-medium transition",
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
              onValueChange={(value) => onRangeChange(value as ActivityRange)}
            >
              <SelectTrigger
                className="flex h-11 w-48 items-center justify-between rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/80 shadow-inner md:hidden"
                size="sm"
                aria-label="Select a period"
              >
                <SelectValue placeholder={displayLabel} />
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
        <ChartContainer
          config={dailyCommitsChartConfig}
          className="mt-4 aspect-auto h-[340px] w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(143,149,173,0.45)" />
                <stop offset="60%" stopColor="rgba(143,149,173,0.12)" />
                <stop offset="100%" stopColor="rgba(143,149,173,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(148, 163, 184, 0.25)"
              strokeDasharray="4 8"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value as string)
                return date.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "short",
                })
              }}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              allowDecimals={false}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ stroke: "rgba(226,232,240,0.25)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                    })
                  }
                  formatter={(value) => {
                    const numericValue =
                      typeof value === "number"
                        ? value
                        : Array.isArray(value)
                          ? value.reduce<number>(
                              (total, current) => total + Number(current),
                              0,
                            )
                          : Number(value)
                    const commits = Number.isFinite(numericValue) ? numericValue : 0

                    return (
                      <span className="font-semibold text-foreground">
                        {commits} коммитов
                      </span>
                    )
                  }}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="rgba(148,163,184,0.9)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
