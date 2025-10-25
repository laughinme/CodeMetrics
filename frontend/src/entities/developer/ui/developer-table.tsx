"use client"

import { memo, type KeyboardEvent } from "react"

import { cn } from "@/shared/lib/utils"
import { Badge, badgeVariants } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

import type {
  DeveloperActivityLevel,
  DeveloperMetricRow,
} from "../model/types"

const activityVariantStyles: Record<DeveloperActivityLevel, string> = {
  high: badgeVariants({
    variant: "outline",
    className: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300",
  }),
  medium: badgeVariants({
    variant: "outline",
    className: "border-amber-400/30 bg-amber-500/15 text-amber-300",
  }),
  low: badgeVariants({
    variant: "outline",
    className: "border-muted-foreground/30 bg-muted/20 text-muted-foreground/80",
  }),
}

type DeveloperTableProps = {
  data: DeveloperMetricRow[]
  title?: string
  className?: string
  onSelect?: (developer: DeveloperMetricRow) => void
}

function DeveloperTableComponent({
  data,
  title = "Обзор производительности разработчиков",
  className,
  onSelect,
}: DeveloperTableProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, developer: DeveloperMetricRow) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect?.(developer)
    }
  }

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur",
        className
      )}
    >
      <CardHeader className="border-border/10 border-b pb-4">
        <CardTitle className="text-base font-semibold text-foreground/90">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-4 sm:px-4">
        <Table className="min-w-full text-sm">
          <TableHeader className="bg-background/40 border-border/20 text-muted-foreground">
            <TableRow className="border-border/20">
              <TableHead className="pl-2 pr-4 font-semibold">Имя</TableHead>
              <TableHead className="pr-4 font-semibold">Email</TableHead>
              <TableHead className="pr-4 text-right font-semibold">Коммитов</TableHead>
              <TableHead className="pr-4 text-right font-semibold">Строк</TableHead>
              <TableHead className="pr-4 text-right font-semibold">Активность</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((developer) => (
              <TableRow
                key={developer.id}
                className={cn(
                  "border-border/10 hover:bg-background/40",
                  onSelect ? "cursor-pointer transition" : undefined
                )}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={onSelect ? () => onSelect(developer) : undefined}
                onKeyDown={
                  onSelect
                    ? (event) => handleKeyDown(event, developer)
                    : undefined
                }
              >
                <TableCell className="pl-2 pr-4 text-foreground/90">
                  {developer.name}
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground">
                  {developer.email}
                </TableCell>
                <TableCell className="pr-4 text-right font-medium text-foreground/90 tabular-nums">
                  {developer.commits}
                </TableCell>
                <TableCell className="pr-4 text-right font-medium text-foreground/90 tabular-nums">
                  {developer.lines}
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <Badge className={activityVariantStyles[developer.activity] ?? activityVariantStyles.medium}>
                    {developer.activity}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export const DeveloperTable = memo(DeveloperTableComponent)
