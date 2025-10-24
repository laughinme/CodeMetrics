"use client"

import { memo } from "react"

import { cn } from "@/shared/lib/utils"

import type { Project } from "../model/types"
import { ProjectCard } from "./project-card"

type ProjectCardListProps = {
  projects: Project[]
  className?: string
}

function ProjectCardListComponent({ projects, className }: ProjectCardListProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
        className
      )}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
        />
      ))}
    </div>
  )
}

export const ProjectCardList = memo(ProjectCardListComponent)
