"use client"

import { useMemo } from "react"
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

import type { DeveloperWeekdayPatternDatum } from "../model/types"

type DeveloperWeekdayPatternChartProps = {
  data: DeveloperWeekdayPatternDatum[]
  className?: string
}

const percentFormatter = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const weekdayChartConfig = {
  sharePct: {
    label: "Доля коммитов, %",
    color: "#22c55e",
  },
} satisfies ChartConfig

export function DeveloperWeekdayPatternChart({
  data,
  className,
}: DeveloperWeekdayPatternChartProps) {
  const yAxisMax = useMemo(() => {
    const maxShare = data.reduce(
      (max, item) => Math.max(max, item.sharePct ?? 0),
      0,
    )
    if (maxShare <= 0) {
      return 10
    }
    const withMargin = Math.ceil(maxShare * 1.1)
    return Math.min(100, withMargin)
  }, [data])

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-28px_rgba(34,197,94,0.25)] backdrop-blur",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground">
          Паттерн по дням недели
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-5 pt-2 sm:px-4 sm:pt-4">
        <ChartContainer
          config={weekdayChartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <BarChart
            data={data}
            margin={{ top: 16, right: 4, left: -16, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="4 8"
              vertical={false}
              stroke="rgba(148,163,184,0.18)"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals
              tickFormatter={(value: number) =>
                `${percentFormatter.format(value)}%`
              }
              domain={[0, yAxisMax]}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 11 }}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(34,197,94,0.12)" }}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => `День: ${value}`}
                  formatter={(value, _name, entry) => {
                    const payload = entry?.payload as
                      | (DeveloperWeekdayPatternDatum & {
                          [key: string]: unknown
                        })
                      | undefined
                    const commits = payload?.commits ?? 0
                    const share = typeof value === "number" ? value : Number(value)
                    const shareText = `${percentFormatter.format(share)}%`
                    return (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground">
                          Доля: {shareText}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {commits} коммитов
                        </span>
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="sharePct"
              fill="url(#developer-weekday-gradient)"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
            <defs>
              <linearGradient
                id="developer-weekday-gradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
