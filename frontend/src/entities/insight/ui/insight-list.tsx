"use client"

import { memo } from "react"

import { cn } from "@/shared/lib/utils"

import type { Insight } from "../model/types"
import { InsightCard } from "./insight-card"

type InsightListProps = {
  items: Insight[]
  className?: string
}

function InsightListComponent({ items, className }: InsightListProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {items.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}

export const InsightList = memo(InsightListComponent)
