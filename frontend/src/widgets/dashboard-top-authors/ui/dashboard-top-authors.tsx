"use client"

import type { ComponentType } from "react"

import { Award, Minus, TrendingDown, TrendingUp } from "lucide-react"

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
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
import { cn } from "@/shared/lib/utils"

type Trend = "up" | "down" | "stable"

export type AuthorMetric = {
  id: string
  name: string
  initials: string
  commits: number
  linesChanged: number
  avgCommitSize: number
  activeRepos: number
  trend?: Trend
  trendValue?: string
  highlight?: boolean
}

type DashboardTopAuthorsProps = {
  authors: AuthorMetric[]
  className?: string
}

const trendConfig: Record<
  Trend,
  { icon: ComponentType<{ className?: string }>; color: string }
> = {
  up: { icon: TrendingUp, color: "text-emerald-500" },
  down: { icon: TrendingDown, color: "text-rose-500" },
  stable: { icon: Minus, color: "text-muted-foreground" },
}

export function DashboardTopAuthors({
  authors,
  className,
}: DashboardTopAuthorsProps) {
  return (
    <Card className={cn("bg-background/80 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>ТОП авторов</CardTitle>
          <CardDescription>По количеству коммитов и строк</CardDescription>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
        >
          <Award className="h-3.5 w-3.5" />
          Неделя
        </Badge>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Разработчик</TableHead>
              <TableHead className="text-right">Коммитов</TableHead>
              <TableHead className="text-right">Строк</TableHead>
              <TableHead className="text-right">Ср. размер</TableHead>
              <TableHead className="text-right">Репозиториев</TableHead>
              <TableHead className="text-right">Изменение</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author, index) => {
              const trend = author.trend ?? "stable"
              const TrendIcon = trendConfig[trend].icon
              const trendColor = trendConfig[trend].color

              return (
                <TableRow
                  key={author.id}
                  className={cn(
                    author.highlight &&
                      "border-primary/40 bg-primary/5 shadow-sm"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border/60 bg-background shadow">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {author.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {author.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{(index + 1).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {author.commits.toLocaleString("ru-RU")}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {author.linesChanged.toLocaleString("ru-RU")}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {author.avgCommitSize.toLocaleString("ru-RU")}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {author.activeRepos}
                  </TableCell>
                  <TableCell className="text-right">
                    {author.trendValue ? (
                      <div
                        className={cn(
                          "inline-flex items-center justify-end gap-1 text-xs font-medium",
                          trendColor
                        )}
                      >
                        <TrendIcon className="h-3.5 w-3.5" />
                        {author.trendValue}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        — 
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
