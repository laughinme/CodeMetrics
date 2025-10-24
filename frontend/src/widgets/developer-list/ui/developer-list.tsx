"use client"

import { memo } from "react"

import { developerMetrics, DeveloperTable, type DeveloperMetricRow } from "@/entities/developer"

type DeveloperListWidgetProps = {
  data?: DeveloperMetricRow[]
  title?: string
  className?: string
}

function DeveloperListWidgetComponent({
  data = developerMetrics,
  title,
  className,
}: DeveloperListWidgetProps) {
  return <DeveloperTable data={data} title={title} className={className} />
}

export const DeveloperListWidget = memo(DeveloperListWidgetComponent)
