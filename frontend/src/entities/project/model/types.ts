export type Project = {
  id: number
  title: string
  badge: "Public" | "Private"
  repos: number
  lastActivity: string
  description: string | null
}
