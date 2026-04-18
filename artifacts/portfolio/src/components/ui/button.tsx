import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "glow"
  size?: "default" | "sm" | "lg" | "icon"
}

const buttonVariantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
  secondary: "bg-secondary-bg text-foreground hover:bg-secondary-bg/80 border border-border",
  outline: "border border-border bg-transparent hover:bg-secondary-bg hover:text-foreground",
  ghost: "hover:bg-secondary-bg hover:text-foreground",
  link: "text-primary underline-offset-4 hover:underline",
  glow: "bg-primary text-primary-foreground border border-primary/80 shadow-[0_0_15px_rgba(99,102,241,0.35)] hover:shadow-[0_0_28px_rgba(99,102,241,0.55)] hover:bg-primary/90 transition-all duration-300",
} as const

const buttonSizeClasses = {
  default: "h-11 px-6 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-12 rounded-lg px-8",
  icon: "h-11 w-11",
} as const

const buttonBaseClassName =
  "wizard-button inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

export function buttonVariants(opts?: { variant?: ButtonProps["variant"]; size?: ButtonProps["size"] }) {
  const variant = opts?.variant ?? "default"
  const size = opts?.size ?? "default"
  return cn(buttonBaseClassName, buttonVariantClasses[variant], buttonSizeClasses[size])
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
