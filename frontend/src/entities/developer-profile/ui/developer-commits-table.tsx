"use client"

import { memo, useMemo } from "react"

import { cn } from "@/shared/lib/utils"
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

import type { DeveloperCommitItem } from "../model/types"

type DeveloperCommitsTableProps = {
  commits: DeveloperCommitItem[]
  className?: string
}

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

const formatDate = (value: string) => dateTimeFormatter.format(new Date(value))

function DeveloperCommitsTableComponent({
  commits,
  className,
}: DeveloperCommitsTableProps) {
  const sortedCommits = useMemo(
    () =>
      [...commits].sort(
        (a, b) =>
          new Date(b.committedAt).getTime() - new Date(a.committedAt).getTime(),
      ),
    [commits],
  )

  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur",
        className,
      )}
    >
      <CardHeader className="border-border/10 border-b pb-4">
        <CardTitle className="text-base font-semibold text-foreground/90">
          Последние коммиты пользователя
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 py-4 sm:px-4">
        <Table className="min-w-full text-sm">
          <TableHeader className="border-border/20 text-muted-foreground">
            <TableRow className="border-border/20">
              <TableHead className="pl-2 pr-4 font-semibold">SHA</TableHead>
              <TableHead className="pr-4 font-semibold">Сообщение</TableHead>
              <TableHead className="pr-4 font-semibold">Repo</TableHead>
              <TableHead className="pr-4 font-semibold">Автор</TableHead>
              <TableHead className="pr-4 text-right font-semibold">+ / -</TableHead>
              <TableHead className="pr-2 text-right font-semibold">Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCommits.map((commit) => (
              <TableRow
                key={`${commit.sha}-${commit.committedAt}-${commit.repo}`}
                className="border-border/10 hover:bg-background/40"
              >
                <TableCell className="pl-2 pr-4 font-mono text-xs uppercase text-muted-foreground">
                  {commit.sha}
                </TableCell>
                <TableCell className="pr-4 text-foreground/90">
                  {commit.message}
                </TableCell>
                <TableCell className="pr-4 text-muted-foreground/80">
                  {commit.repo}
                </TableCell>
                <TableCell className="pr-4 text-foreground/90">
                  {commit.author}
                </TableCell>
                <TableCell className="pr-4 text-right tabular-nums">
                  <span className="font-medium text-emerald-400">+{commit.additions}</span>{" "}
                  <span className="font-medium text-rose-400">-{commit.deletions}</span>
                </TableCell>
                <TableCell className="pr-2 text-right text-muted-foreground/80 tabular-nums">
                  {formatDate(commit.committedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export const DeveloperCommitsTable = memo(DeveloperCommitsTableComponent)
