import { memo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  GitCommit,
  Loader2,
} from "lucide-react"

import { cn } from "@/shared/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { formatDateTime, formatRelativeTimeFromNow } from "@/shared/lib/date"

import type { DeveloperCommitItem } from "../model/types"

type DeveloperCommitsTableProps = {
  commits: DeveloperCommitItem[]
  className?: string
  page?: number
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  onNextPage?: () => void
  onPreviousPage?: () => void
  isLoading?: boolean
}

function DeveloperCommitsTableComponent({
  commits,
  className,
  page = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onNextPage,
  onPreviousPage,
  isLoading = false,
}: DeveloperCommitsTableProps) {
  return (
    <Card
      className={cn(
        "rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_60px_-28px_rgba(76,81,255,0.35)] backdrop-blur",
        className,
      )}
    >
      <CardHeader className="border-border/10 border-b pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-foreground/90">
            Последние коммиты
          </CardTitle>
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
            <span className="text-xs font-medium text-muted-foreground/70">
              Страница {page}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border border-transparent text-muted-foreground hover:border-border/40 hover:text-foreground/85"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border border-transparent text-muted-foreground hover:border-border/40 hover:text-foreground/85"
                onClick={onNextPage}
                disabled={!hasNextPage || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-5 sm:px-5">
        <ul className="flex flex-col gap-5">
          {commits.map((commit) => (
            <li
              key={`${commit.sha}-${commit.committedAt}-${commit.repoId}`}
              className="border-border/10 border-b pb-5 last:border-none last:pb-0"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full border border-border/30 bg-background/60 p-2">
                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {commit.message || "Без сообщения"}
                      </span>
                      {commit.isMerge ? (
                        <Badge
                          variant="secondary"
                          className="rounded-full border border-border/40 bg-background/60 px-2 py-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          Merge
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/80">
                      {commit.repoName ? (
                        <span className="font-medium text-foreground/80">
                          {commit.repoName}
                        </span>
                      ) : null}
                      {commit.repoName ? <span>•</span> : null}
                      <span>{formatRelativeTimeFromNow(commit.committedAt)}</span>
                      <span>({formatDateTime(commit.committedAt)})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground/70">
                      <span>{commit.authorName || "Неизвестный автор"}</span>
                      {commit.filesChanged ? (
                        <>
                          <span>•</span>
                          <span>{commit.filesChanged} файлов</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium tabular-nums">
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">
                      +{commit.addedLines}
                    </span>
                    <span className="rounded-full bg-rose-500/10 px-2 py-1 text-rose-400">
                      -{commit.deletedLines}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export const DeveloperCommitsTable = memo(DeveloperCommitsTableComponent)
