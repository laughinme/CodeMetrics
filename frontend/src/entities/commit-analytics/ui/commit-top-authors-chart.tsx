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
  AuthorDatum,
  CommitTimeRange,
  TimeRangeOption,
} from "../model/types"

const topAuthorsChartConfig = {
  commits: {
    label: "Commits",
    color: "hsl(var(--primary))",
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
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ТОП авторов по числу коммитов</CardTitle>
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
          config={topAuthorsChartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              horizontal={false}
              opacity={0.6}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="author"
              type="category"
              axisLine={false}
              tickLine={false}
              width={140}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
              content={
                <ChartTooltipContent
                  labelKey="author"
                  nameKey="commits"
                  formatter={(value: number) => (
                    <span className="font-semibold text-foreground">
                      {value} коммитов
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="commits"
              fill="var(--color-commits)"
              radius={[0, 6, 6, 0]}
              barSize={18}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
