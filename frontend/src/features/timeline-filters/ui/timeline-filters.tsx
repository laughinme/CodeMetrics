"use client"

import { GitBranch, History } from "lucide-react"

import { useProjectCardsList } from "@/entities/project"
import {
  timelineRangeOptions,
  type TimelineRange,
  type TimelineRangeOption,
} from "@/entities/timeline"
import { cn } from "@/shared/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

type TimelineFiltersProps = {
  range: TimelineRange
  onRangeChange: (range: TimelineRange) => void
  rangeOptions?: TimelineRangeOption[]
  projectId: number | null
  onProjectChange: (projectId: number | null) => void
  className?: string
}

export function TimelineFilters({
  range,
  onRangeChange,
  rangeOptions = timelineRangeOptions,
  projectId,
  onProjectChange,
  className,
}: TimelineFiltersProps) {
  const { data: projects, isLoading: isProjectsLoading } = useProjectCardsList()

  const projectValue = projectId != null ? String(projectId) : "all"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={projectValue}
        onValueChange={(value) => {
          if (value === "all") {
            onProjectChange(null)
            return
          }
          if (value === "loading" || value === "empty") {
            return
          }
          onProjectChange(Number(value))
        }}
      >
        <SelectTrigger className="flex h-11 min-w-[13rem] items-center justify-between gap-3 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <SelectValue
              placeholder={
                isProjectsLoading ? "Загрузка проектов..." : "Все проекты"
              }
            />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl bg-popover/95 backdrop-blur">
          <SelectItem value="all" className="rounded-lg">
            Все проекты
          </SelectItem>
          <SelectSeparator />
          {isProjectsLoading ? (
            <SelectItem value="loading" disabled className="rounded-lg">
              Загрузка проектов…
            </SelectItem>
          ) : projects && projects.length > 0 ? (
            projects.map((project) => (
              <SelectItem key={project.id} value={String(project.id)} className="rounded-lg">
                {project.title}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled className="rounded-lg">
              Проекты недоступны
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      <Select
        value={range}
        onValueChange={(value) => onRangeChange(value as TimelineRange)}
      >
        <SelectTrigger className="flex h-11 min-w-[11rem] items-center justify-between gap-3 rounded-full border border-border/30 bg-background/60 px-4 text-sm font-medium text-foreground/85 shadow-inner transition hover:bg-background/70">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Период" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl bg-popover/95 backdrop-blur">
          {rangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="rounded-lg">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
