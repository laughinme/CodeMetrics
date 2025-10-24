export const projectFilters = {
  scope: {
    label: "All projects",
  },
  period: {
    label: "30 days",
  },
} satisfies Record<
  "scope" | "period",
  {
    label: string
  }
>
