import { Card } from "@/shared/components/ui/card"

type SectionCard = {
  id: string
  label: string
  value: string
  secondary?: string
}

type SectionCardsProps = {
  cards: SectionCard[]
}

export function SectionCards({ cards }: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 lg:px-6 @lg/main:grid-cols-2 @2xl/main:grid-cols-3 @4xl/main:grid-cols-4 @5xl/main:grid-cols-5">
      {cards.map(({ id, label, value, secondary }) => (
        <Card
          key={id}
          data-slot="card"
          className="rounded-3xl border-border/30 bg-card/80 p-5 shadow-[0_10px_40px_-24px_rgba(112,118,255,0.45)] backdrop-blur transition hover:border-border/40 hover:bg-card/90 dark:bg-white/[0.04]"
        >
          <div className="flex h-full flex-col justify-between gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {label}
              </span>
              <span className="text-4xl font-semibold leading-none tracking-tight">
                {value}
              </span>
            </div>
            {secondary ? (
              <span className="text-sm text-muted-foreground/80">{secondary}</span>
            ) : null}
          </div>
        </Card>
      ))}
    </div>
  )
}

export type { SectionCard, SectionCardsProps }
