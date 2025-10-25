"use client"

import { memo, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import {
  developerMetrics,
  DeveloperTable,
  type DeveloperMetricRow,
} from "@/entities/developer"

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
  const navigate = useNavigate()

  const handleSelect = useCallback(
    (developer: DeveloperMetricRow) => {
      navigate(`/developers/${developer.id}`)
    },
    [navigate],
  )

  return (
    <DeveloperTable
      data={data}
      title={title}
      className={className}
      onSelect={handleSelect}
    />
  )
}

export const DeveloperListWidget = memo(DeveloperListWidgetComponent)
