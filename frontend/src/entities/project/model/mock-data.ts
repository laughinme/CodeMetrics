export const projectFilters = {
  scope: {
    label: "All projects",
  },
  period: {
    label: "1 month",
  },
} satisfies Record<
  "scope" | "period",
  {
    label: string
  }
>
