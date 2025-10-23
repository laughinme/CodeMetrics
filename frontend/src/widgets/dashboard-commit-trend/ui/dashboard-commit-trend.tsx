"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"
import { cn } from "@/shared/lib/utils"

export type CommitTrendDataset = {
  id: string
  label: string
  description: string
  data: {
    date: string
    value: number
    rollingAverage?: number
  }[]
}

type DashboardCommitTrendProps = {
  datasets: CommitTrendDataset[]
  defaultDatasetId?: string
  className?: string
}

const chartConfig = {
  value: {
    label: "Commits",
    color: "var(--primary)",
  },
  rollingAverage: {
    label: "Rolling average",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

const dateFormatter = Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
})

export function DashboardCommitTrend({
  datasets,
  defaultDatasetId,
  className,
}: DashboardCommitTrendProps) {
  const [activeDatasetId, setActiveDatasetId] = React.useState(
    defaultDatasetId || datasets[0]?.id
  )

  const activeDataset =
    datasets.find((dataset) => dataset.id === activeDatasetId) ?? datasets[0]

  const tooltipFormatter: TooltipProps<number, string>["formatter"] = (
    value,
    name,
    payload
  ) => {
    const label =
      name === "rollingAverage" ? "7-day avg" : chartConfig.value.label
    return [
      `${value?.toLocaleString("ru-RU")} commits`,
      label || name,
      payload,
    ]
  }

  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <CardTitle>Коммиты по времени</CardTitle>
            <CardDescription>{activeDataset?.description}</CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={activeDatasetId}
            onValueChange={(value) => value && setActiveDatasetId(value)}
            variant="outline"
            className="*:data-[slot=toggle-group-item]:px-4"
          >
            {datasets.map((dataset) => (
              <ToggleGroupItem key={dataset.id} value={dataset.id}>
                {dataset.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <AreaChart data={activeDataset?.data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => dateFormatter.format(new Date(value))}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
            />
            <YAxis
              tickFormatter={(value) => `${value}`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "4 4", stroke: "var(--border)" }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => tooltipFormatter(value, name)}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            {activeDataset?.data.some((point) => point.rollingAverage) ? (
              <Area
                type="monotone"
                dataKey="rollingAverage"
                stroke="var(--color-rollingAverage)"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="6 6"
                dot={false}
                activeDot={false}
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
