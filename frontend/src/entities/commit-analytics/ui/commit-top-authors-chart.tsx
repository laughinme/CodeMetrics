"use client"

import { useId } from "react"
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
  AuthorDatum,
  CommitTimeRange,
  TimeRangeOption,
} from "../model/types"

const topAuthorsChartConfig = {
  commits: {
    label: "Commits",
    color: "#3bd45c",
  },
} satisfies ChartConfig

type CommitTopAuthorsChartProps = {
  data: AuthorDatum[]
  range: CommitTimeRange
  rangeLabel: string
  onRangeChange: (range: CommitTimeRange) => void
  rangeOptions: TimeRangeOption[]
}

export function CommitTopAuthorsChart({
  data,
  range,
  rangeLabel,
  onRangeChange,
  rangeOptions,
}: CommitTopAuthorsChartProps) {
  const gradient = useId()
  const gradientId = gradient.replace(/:/g, "")

  return (
    <Card className="h-full rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(64,217,108,0.35)] backdrop-blur">
      <CardHeader className="flex flex-col gap-2 pb-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-semibold text-foreground">
            ТОП авторов (по коммитам)
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground/80">
            Период: {rangeLabel}
          </CardDescription>
        </div>
        <CardAction className="mt-2">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(value) => {
              if (value) {
                onRangeChange(value as CommitTimeRange)
              }
            }}
            variant="outline"
            className="hidden rounded-full border border-border/20 bg-muted/30 px-1 py-1 *:data-[slot=toggle-group-item]:!rounded-full *:data-[slot=toggle-group-item]:!px-3 @[767px]/card:flex"
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
              className="flex w-40 rounded-full border-border/20 bg-muted/40 px-3 **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Выберите период"
            >
              <SelectValue placeholder="Выберите период" />
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pb-6 pt-6 sm:px-6">
        <ChartContainer
          config={topAuthorsChartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 24, bottom: 12, left: 24 }}
            barCategoryGap={20}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3bd45c" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.95} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 8"
              horizontal={false}
              stroke="rgba(148, 163, 184, 0.18)"
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 12 }}
            />
            <YAxis
              dataKey="author"
              type="category"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              width={140}
              tick={{ fill: "rgba(226,232,240,0.75)", fontSize: 13 }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(34,197,94,0.12)" }}
              content={
                <ChartTooltipContent
                  labelKey="author"
                  nameKey="commits"
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
              fill={`url(#${gradientId})`}
              radius={[0, 12, 12, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
