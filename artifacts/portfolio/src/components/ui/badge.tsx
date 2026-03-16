import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "glow"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary/20 text-primary hover:bg-primary/30",
    secondary: "border-transparent bg-secondary-bg text-secondary-foreground hover:bg-secondary-bg/80",
    outline: "text-foreground",
    glow: "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
