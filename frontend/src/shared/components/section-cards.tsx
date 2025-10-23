import { Card } from "@/shared/components/ui/card"

type SectionCard = {
  id: string
  label: string
  value: string
  secondary?: string
  caption?: string
  change?: {
    value: string
    variant?: "positive" | "negative" | "neutral"
  }
}

type SectionCardsProps = {
  cards: SectionCard[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:px-6 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @4xl/main:grid-cols-4 @5xl/main:grid-cols-5">
      {cards.map(({ id, label, value, secondary, caption, change }) => {
        const changeVariant =
          change?.variant === "negative"
            ? "text-destructive"
            : change?.variant === "positive"
              ? "text-emerald-500"
              : "text-muted-foreground"

        return (
          <Card
            key={id}
            data-slot="card"
            className="@container/card border-border/60 bg-background/70 dark:bg-background/40 !py-4 rounded-2xl shadow-none"
          >
            <div className="flex h-full flex-col justify-between gap-3 px-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {label}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl font-semibold tabular-nums tracking-tight @[250px]/card:text-4xl">
                  {value}
                </span>
                {secondary ? (
                  <span className="text-xs text-muted-foreground @[250px]/card:text-sm">
                    {secondary}
                  </span>
                ) : null}
              </div>
              {change || caption ? (
                <div className="flex flex-col gap-1">
                  {change ? (
                    <span className={`text-sm font-semibold ${changeVariant}`}>
                      {change.value}
                    </span>
                  ) : null}
                  {caption ? (
                    <span className="text-xs text-muted-foreground/80 @[250px]/card:text-sm">
                      {caption}
                    </span>
                  ) : null}
                </div>
              ) : (
                <span aria-hidden className="block h-0" />
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export type { SectionCard, SectionCardsProps }
