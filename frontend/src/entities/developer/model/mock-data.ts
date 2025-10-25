import type { SectionCard } from "@/shared/components/section-cards"

import type { DeveloperMetricRow } from "./types"

export const developerMetrics: DeveloperMetricRow[] = [
  { id: "1", name: "Anastasia P.", email: "ana@corp.dev", commits: 116, lines: 442, activity: "high" },
  { id: "2", name: "Dmitry T.", email: "dmitry@corp.dev", commits: 96, lines: 585, activity: "high" },
  { id: "3", name: "Elena G.", email: "elena@corp.dev", commits: 89, lines: 761, activity: "high" },
  { id: "4", name: "Ivan S.", email: "ivan@corp.dev", commits: 85, lines: 1425, activity: "high" },
  { id: "5", name: "Ekaterina M.", email: "ek@corp.dev", commits: 65, lines: 840, activity: "medium" },
  { id: "6", name: "Maria K.", email: "maria@corp.dev", commits: 53, lines: 157, activity: "medium" },
  { id: "7", name: "Sergey L.", email: "sergey@corp.dev", commits: 48, lines: 293, activity: "medium" },
  { id: "8", name: "Pavel R.", email: "pavel@corp.dev", commits: 47, lines: 1070, activity: "medium" },
  { id: "9", name: "Olga Z.", email: "olga@corp.dev", commits: 46, lines: 706, activity: "medium" },
  { id: "10", name: "Alex V.", email: "alex@corp.dev", commits: 38, lines: 1190, activity: "medium" },
]

export const developerKpiCards: SectionCard[] = [
  { id: "commits-total", label: "Всего коммитов", value: "189" },
  { id: "developers-active", label: "Активных разработчиков", value: "9" },
  { id: "commit-avg-size", label: "Средний размер коммита", value: "73" },
  { id: "short-messages", label: "Short Msg %", value: "27%" },
  { id: "active-repos", label: "Активных репо", value: "6" },
]

export const developerFilters = {
  project: {
    label: "All projects",
  },
  period: {
    label: "1 month",
  },
} satisfies Record<
  "project" | "period",
  {
    label: string
  }
>
