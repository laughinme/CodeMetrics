import {
  CalendarDays,
  Flame,
  GitCommit,
  Lightbulb,
  MoonStar,
  Timer,
  Users,
} from "lucide-react"

import type { InsightMetric, InsightObservation } from "./types"

export const insightFilters = {
  project: {
    label: "Public Project",
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

export const insightMetrics: InsightMetric[] = [
  {
    id: "commits-week",
    title: "Commits (last 7d)",
    value: "29",
    subtitle: "Темп за последнюю неделю vs предыдущая.",
    icon: GitCommit,
    tone: "positive",

  },
  {
    id: "author-concentration",
    title: "Авторская концентрация",
    value: "160% в топ-3",
    subtitle: "Доля коммитов от трёх самых активных авторов.",
    icon: Users,
    tone: "warning",

  },
  
  {
    id: "peak-day",
    title: "Пиковый день",
    value: "2025-10-02",
    subtitle: "Макс 9 коммитов за день.",
    icon: CalendarDays,
    tone: "info",
  },
  {
    id: "streak",
    title: "Серия без перерыва",
    value: "18 дн.",
    subtitle: "Самая длинная непрерывная серия дней с активностью.",
    icon: Timer,
    tone: "positive",

  },
]

export const insightObservation: InsightObservation = {
  id: "momentum",
  title: "Наблюдение",
  summary:
    "За последние 7 дней активность выросла на 222% относительно предыдущей недели. Пиковый день — 2025-10-02 (9 коммитов). Основная активность — в рабочие часы.",
  recommendations: [
    "Закрепить удачный темп: короткие PR и быстрые ревью.",
    "Поддержать рабочее окно: асинхронное ревью днём.",
    "Снизить концентрацию знаний: ротация ревьюеров, парное программирование.",
  ],
  icon: Lightbulb,
  tone: "positive",
  badge: {
    label: "ускорение",
    tone: "positive",
  },
}
