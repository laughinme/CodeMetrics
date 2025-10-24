"use client"

import { memo } from "react"

import { GitBranch } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

import type { ProjectOverview } from "../model/types"

type ProjectCardProps = {
  project: ProjectOverview
  className?: string
}

const visibilityLabel: Record<ProjectOverview["visibility"], string> = {
  public: "public",
  private: "private",
}

function ProjectCardComponent({ project, className }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col justify-between rounded-3xl border-border/30 bg-card/80 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur",
        "transition hover:border-border/40 hover:bg-card/90",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full border border-border/30 bg-background/60 p-2 text-muted-foreground">
            <GitBranch className="h-4 w-4" />
          </span>
          <CardTitle className="text-lg font-semibold text-foreground">
            {project.name}
          </CardTitle>
        </div>
        <Badge variant="outline" className="rounded-full border-border/30 bg-background/40 text-xs capitalize">
          {visibilityLabel[project.visibility]}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted-foreground">
        <StatItem label="Коммитов" value={project.commits} />
        <StatItem label="Dev" value={project.developers} />
        <StatItem label="Repos" value={project.repositories} />
        <StatItem label="Avg size" value={project.averageCommitSize} />
      </CardContent>
    </Card>
  )
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground/70">
        {label}
      </span>
      <span className="text-foreground text-xl font-semibold tabular-nums">
        {value}
      </span>
    </div>
  )
}

export const ProjectCard = memo(ProjectCardComponent)
