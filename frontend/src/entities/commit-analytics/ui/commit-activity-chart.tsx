"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
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
import type {
  CommitTimeRange,
  DailyCommitsDatum,
  TimeRangeOption,
} from "../model/types"

const dailyCommitsChartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

type CommitActivityChartProps = {
  data: DailyCommitsDatum[]
  range: CommitTimeRange
  rangeLabel: string
  onRangeChange: (range: CommitTimeRange) => void
  rangeOptions: TimeRangeOption[]
}

export function CommitActivityChart({
  data,
  range,
  rangeLabel,
  onRangeChange,
  rangeOptions,
}: CommitActivityChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Коммиты по времени</CardTitle>
        <CardDescription>Выбранный период: {rangeLabel}</CardDescription>
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
        <ChartContainer
          config={dailyCommitsChartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart data={data} margin={{ top: 20, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.6} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              minTickGap={24}
              tickFormatter={(value) => {
                const date = new Date(value as string)
                return date.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "short",
                })
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
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
            <Bar
              dataKey="commits"
              fill="var(--color-commits)"
              radius={[6, 6, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
