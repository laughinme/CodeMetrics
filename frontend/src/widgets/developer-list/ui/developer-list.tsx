"use client"

import { memo, useCallback } from "react"
import { useNavigate } from "react-router-dom"

import { DeveloperTable, type DeveloperRow } from "@/entities/developer"

type DeveloperListWidgetProps = {
  data?: DeveloperRow[]
  title?: string
  className?: string
}

function DeveloperListWidgetComponent({
  data = [],
  title,
  className,
}: DeveloperListWidgetProps) {
  const navigate = useNavigate()

  const handleSelect = useCallback(
    (developer: DeveloperRow) => {
      navigate(`/developers/${developer.id}`, {
        state: { name: developer.name, email: developer.email },
      })
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
