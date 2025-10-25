import type {
  DeveloperCommitItem,
  DeveloperDailyActivityDatum,
  DeveloperHourlyPatternDatum,
  DeveloperProfile,
  DeveloperProfileMetric,
  DeveloperWeekdayPatternDatum,
} from "./types"

type DeveloperProfileMock = DeveloperProfile

const ivanSummary: DeveloperProfileMetric[] = [
  {
    id: "commits-period",
    label: "Коммитов (период)",
    value: "6",
  },
  {
    id: "total-lines",
    label: "Всего строк (+/-)",
    value: "522",
  },
  {
    id: "avg-lines",
    label: "Avg строк/коммит",
    value: "87",
  },
  {
    id: "team-share",
    label: "Вклад в команду",
    value: "3%",
    secondary: "доля коммитов",
  },
  {
    id: "off-hours",
    label: "Off-hours",
    value: "0%",
    secondary: "вне 8:00–20:00",
  },
]

const ivanDailyActivity: DeveloperDailyActivityDatum[] = [
  { date: "2025-09-27", commits: 0 },
  { date: "2025-09-30", commits: 0 },
  { date: "2025-10-03", commits: 0 },
  { date: "2025-10-06", commits: 0 },
  { date: "2025-10-09", commits: 0 },
  { date: "2025-10-12", commits: 1 },
  { date: "2025-10-15", commits: 1 },
  { date: "2025-10-18", commits: 1 },
  { date: "2025-10-21", commits: 2 },
  { date: "2025-10-23", commits: 0 },
  { date: "2025-10-25", commits: 1 },
]

const ivanHourlyPattern: DeveloperHourlyPatternDatum[] = Array.from(
  { length: 24 },
  (_, hour) => ({
    hour,
    count: hour === 11 ? 6 : 0,
  }),
)

const ivanWeekdayPattern: DeveloperWeekdayPatternDatum[] = [
  { day: "mon", label: "Пн", count: 1 },
  { day: "tue", label: "Вт", count: 1 },
  { day: "wed", label: "Ср", count: 1 },
  { day: "thu", label: "Чт", count: 2 },
  { day: "fri", label: "Пт", count: 2 },
  { day: "sat", label: "Сб", count: 0 },
  { day: "sun", label: "Вс", count: 0 },
]

const ivanCommits: DeveloperCommitItem[] = [
  {
    sha: "deadbee",
    message: "chore: deps bump",
    repo: "public / elastic",
    author: "Ivan S.",
    additions: 94,
    deletions: 47,
    committedAt: "2025-10-24T12:21:37Z",
  },
  {
    sha: "deadbee",
    message: "ci: tune workflow",
    repo: "team3 / elastic",
    author: "Ivan S.",
    additions: 61,
    deletions: 4,
    committedAt: "2025-10-17T12:21:37Z",
  },
  {
    sha: "deadbee",
    message: "feat: dashboard",
    repo: "team3 / base_repo",
    author: "Ivan S.",
    additions: 37,
    deletions: 40,
    committedAt: "2025-10-22T12:21:37Z",
  },
  {
    sha: "deadbee",
    message: "build: vite cfg",
    repo: "team3 / base_repo",
    author: "Ivan S.",
    additions: 15,
    deletions: 5,
    committedAt: "2025-10-23T12:21:37Z",
  },
  {
    sha: "deadbee",
    message: "feat: trends widget",
    repo: "public / base_repo",
    author: "Ivan S.",
    additions: 21,
    deletions: 64,
    committedAt: "2025-10-23T12:21:37Z",
  },
  {
    sha: "deadbee",
    message: "build: vite cfg",
    repo: "team3 / web",
    author: "Ivan S.",
    additions: 65,
    deletions: 69,
    committedAt: "2025-10-14T12:21:37Z",
  },
]

const developerProfiles: DeveloperProfileMock[] = [
  {
    id: "4",
    name: "Ivan S.",
    email: "ivan@corp.dev",
    summary: ivanSummary,
    dailyActivity: ivanDailyActivity,
    hourlyPattern: ivanHourlyPattern,
    weekdayPattern: ivanWeekdayPattern,
    commits: ivanCommits,
  },
]

const developerProfileMap = new Map(
  developerProfiles.map((profile) => [profile.id, profile]),
)

export function getDeveloperProfileByIdMock(
  id: string,
): DeveloperProfile | null {
  return developerProfileMap.get(id) ?? null
}

export function getAllDeveloperProfilesMock(): DeveloperProfile[] {
  return developerProfiles
}
