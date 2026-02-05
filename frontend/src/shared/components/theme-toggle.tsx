import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = resolvedTheme === "dark"
  const nextTheme = isDark ? "light" : "dark"
  const label = isDark ? "Switch to light" : "Switch to dark"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      onClick={() => setTheme(nextTheme)}
      className={cn("shrink-0", className)}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}
