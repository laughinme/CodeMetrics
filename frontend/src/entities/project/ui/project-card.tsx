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

import type { Project } from "../model/types"

type ProjectCardProps = {
  project: Project
  className?: string
}

const visibilityLabel: Record<Project["badge"], string> = {
  Public: "public",
  Private: "private",
}

function ProjectCardComponent({ project, className }: ProjectCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col gap-4 rounded-3xl border-border/30 bg-card/80 p-5 shadow-[0_10px_50px_-26px_rgba(76,81,255,0.25)] backdrop-blur transition hover:border-border/40 hover:bg-card/90",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border/30 bg-background/60 p-2 text-muted-foreground">
            <GitBranch className="h-4 w-4" />
          </span>
          <CardTitle className="text-lg font-semibold text-foreground">
            {project.title}
          </CardTitle>
        </div>
        <Badge variant="outline" className="rounded-full border-border/30 bg-background/40 text-xs capitalize">
          {visibilityLabel[project.badge]}
        </Badge>
      </div>
      {project.description ? (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground/70">Описание отсутствует</p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/20 bg-background/40 px-4 py-3 text-sm text-muted-foreground/80">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/60">
            Repos
          </span>
          <span className="text-foreground text-xl font-semibold tabular-nums">
            {project.repos}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/60">
            Последняя активность
          </span>
          <span className="text-foreground text-sm font-semibold">
            {project.lastActivity}
          </span>
        </div>
      </div>
    </Card>
  )
}

export const ProjectCard = memo(ProjectCardComponent)
