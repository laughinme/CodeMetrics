import {
  type AuthorDatum,
  type CommitTimeRange,
  type DailyCommitsDatum,
  type TimeRangeOption,
} from "./types"

export const commitTimeRangeOptions: TimeRangeOption[] = [
  { value: "1d", label: "1 день" },
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "all", label: "Все время" },
]

const authorDataset: Record<CommitTimeRange, AuthorDatum[]> = {
  "1d": [
    { author: "Anastasia P.", commits: 9 },
    { author: "Ivan S.", commits: 8 },
    { author: "Dmitry T.", commits: 7 },
    { author: "Elena G.", commits: 6 },
    { author: "Maria K.", commits: 5 },
  ],
  "7d": [
    { author: "Anastasia P.", commits: 38 },
    { author: "Ivan S.", commits: 35 },
    { author: "Dmitry T.", commits: 33 },
    { author: "Elena G.", commits: 28 },
    { author: "Maria K.", commits: 27 },
    { author: "Sergey L.", commits: 21 },
    { author: "Alexandr V.", commits: 19 },
  ],
  "30d": [
    { author: "Anastasia P.", commits: 112 },
    { author: "Ivan S.", commits: 105 },
    { author: "Dmitry T.", commits: 97 },
    { author: "Elena G.", commits: 90 },
    { author: "Maria K.", commits: 86 },
    { author: "Sergey L.", commits: 75 },
    { author: "Alexandr V.", commits: 68 },
    { author: "Ekaterina M.", commits: 61 },
    { author: "Pavel R.", commits: 53 },
    { author: "Olga Z.", commits: 49 },
  ],
  all: [
    { author: "Anastasia P.", commits: 420 },
    { author: "Ivan S.", commits: 398 },
    { author: "Dmitry T.", commits: 372 },
    { author: "Elena G.", commits: 345 },
    { author: "Maria K.", commits: 339 },
    { author: "Sergey L.", commits: 307 },
    { author: "Alexandr V.", commits: 292 },
    { author: "Ekaterina M.", commits: 274 },
    { author: "Pavel R.", commits: 245 },
    { author: "Olga Z.", commits: 232 },
  ],
}

const dailyCommitsDataset: DailyCommitsDatum[] = (() => {
  const points = 90
  const endDate = new Date("2024-06-30T00:00:00")

  return Array.from({ length: points }, (_, index) => {
    const date = new Date(endDate)
    date.setDate(date.getDate() - (points - 1 - index))
    const dayIndex = index + 1
    const base = 28 + Math.round(10 * Math.sin(dayIndex / 5))
    const fluctuation = (dayIndex % 6) * 3

    return {
      date: date.toISOString().slice(0, 10),
      commits: base + fluctuation,
    }
  })
})()

export function getMockTopAuthors(
  range: CommitTimeRange
): AuthorDatum[] {
  return [...(authorDataset[range] ?? [])]
}

export function getMockDailyCommits(): DailyCommitsDatum[] {
  return [...dailyCommitsDataset]
}
