"use client"

import { memo } from "react"

import { useProjectCardsList, ProjectCardList } from "@/entities/project"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"

type ProjectListWidgetProps = {
  className?: string
}

function ProjectListWidgetComponent({ className }: ProjectListWidgetProps) {
  const { data, isLoading, isError } = useProjectCardsList()
  const projects = data ?? []

  if (isLoading) {
    return (
      <div className={className}>
        <ProjectListSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="rounded-3xl border-border/30 bg-destructive/10 p-6 text-sm text-destructive">
        Не удалось загрузить список проектов. Попробуйте обновить страницу позже.
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="rounded-3xl border-border/30 bg-card/80 p-6 text-center text-sm text-muted-foreground">
        Проекты не найдены.
      </Card>
    )
  }

  return <ProjectCardList projects={projects} className={className} />
}

function ProjectListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="flex h-full flex-col gap-4 rounded-3xl border-border/30 bg-card/60 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <div className="mt-auto grid grid-cols-2 gap-4">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export const ProjectListWidget = memo(ProjectListWidgetComponent)
