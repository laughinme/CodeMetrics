"use client"

import { memo } from "react"

import { projectOverviews, ProjectCardList, type ProjectOverview } from "@/entities/project"

type ProjectListWidgetProps = {
  projects?: ProjectOverview[]
  className?: string
}

function ProjectListWidgetComponent({
  projects = projectOverviews,
  className,
}: ProjectListWidgetProps) {
  return <ProjectCardList projects={projects} className={className} />
}

export const ProjectListWidget = memo(ProjectListWidgetComponent)
