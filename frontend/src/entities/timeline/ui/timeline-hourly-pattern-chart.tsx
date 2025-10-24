"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { cn } from "@/shared/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/components/ui/chart"

import type { TimelineHourlyDatum } from "../model/types"

type TimelineHourlyPatternChartProps = {
  data: TimelineHourlyDatum[]
  className?: string
}

const hourlyChartConfig = {
  count: {
    label: "Commits",
    color: "#22c55e",
  },
} satisfies ChartConfig

export function TimelineHourlyPatternChart({
  data,
  className,
}: TimelineHourlyPatternChartProps) {
  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-28px_rgba(64,217,108,0.25)] backdrop-blur",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Паттерн по часам
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-5 pt-2 sm:px-4 sm:pt-4">
        <ChartContainer config={hourlyChartConfig} className="aspect-auto h-[260px] w-full">
          <BarChart data={data} margin={{ top: 16, right: 4, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="rgba(148,163,184,0.18)" />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals={false}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(34,197,94,0.12)" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => `${value}:00`}
                  formatter={(value) => (
                    <span className="font-semibold text-foreground">{value} коммитов</span>
                  )}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="url(#hour-gradient)"
              radius={[6, 6, 0, 0]}
              barSize={20}
            />
            <defs>
              <linearGradient id="hour-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.75} />
              </linearGradient>
            </defs>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
