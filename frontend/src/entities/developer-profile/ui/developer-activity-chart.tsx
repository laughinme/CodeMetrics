"use client"

import { useId } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

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

import type { DeveloperDailyActivityDatum } from "../model/types"

type DeveloperActivityChartProps = {
  data: DeveloperDailyActivityDatum[]
  className?: string
}

const activityChartConfig = {
  commits: {
    label: "Коммиты",
    color: "rgba(129,140,248,0.85)",
  },
} satisfies ChartConfig

export function DeveloperActivityChart({
  data,
  className,
}: DeveloperActivityChartProps) {
  const gradient = useId()
  const gradientId = `${gradient.replace(/:/g, "")}-developer-activity`

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur",
        className,
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-foreground/95">
          Активность по дням
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-6 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer
          config={activityChartConfig}
          className="aspect-auto h-[320px] w-full"
        >
          <AreaChart
            data={data}
            margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(129,140,248,0.35)" />
                <stop offset="70%" stopColor="rgba(129,140,248,0.08)" />
                <stop offset="100%" stopColor="rgba(129,140,248,0)" />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="rgba(148,163,184,0.18)"
              strokeDasharray="4 8"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={24}
              tickFormatter={(value) => {
                const date = new Date(value as string)
                return date.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                })
              }}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 12 }}
            />
            <YAxis
              dataKey="commits"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              allowDecimals={false}
              tick={{ fill: "rgba(226,232,240,0.65)", fontSize: 12 }}
            />
            <ChartTooltip
              cursor={{ stroke: "rgba(129,140,248,0.35)", strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  }
                  formatter={(value) => (
                    <span className="font-semibold text-foreground">
                      {value} коммитов
                    </span>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="rgba(129,140,248,0.85)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
