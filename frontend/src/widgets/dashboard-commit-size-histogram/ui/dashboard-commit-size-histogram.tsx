"use client"

import {
  Bar,
  BarChart,
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
import { cn } from "@/shared/lib/utils"

export type CommitSizeBucket = {
  bucket: string
  count: number
  percentage?: number
}

type DashboardCommitSizeHistogramProps = {
  data: CommitSizeBucket[]
  className?: string
}

const chartConfig = {
  count: {
    label: "Commits",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function DashboardCommitSizeHistogram({
  data,
  className,
}: DashboardCommitSizeHistogramProps) {
  const tooltipFormatter: TooltipProps<number, string>["formatter"] = (
    value,
    name,
    { payload }
  ) => {
    const extra = payload?.percentage
      ? ` · ${payload.percentage.toFixed(1)}%`
      : ""
    return [`${value?.toLocaleString("ru-RU")} коммитов${extra}`, name]
  }

  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader>
        <CardTitle>Размеры коммитов</CardTitle>
        <CardDescription>
          Распределение изменений по количеству строк
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px]">
          <BarChart data={data} barSize={28}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 8"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="bucket"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval={0}
            />
            <YAxis
              tickFormatter={(value) => `${value}`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", fillOpacity: 0.2 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) =>
                    tooltipFormatter(value, name, props)
                  }
                />
              }
            />
            <Bar
              dataKey="count"
              radius={[8, 8, 4, 4]}
              fill="var(--color-count)"
              activeBar={{ radius: [12, 12, 6, 6] }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
