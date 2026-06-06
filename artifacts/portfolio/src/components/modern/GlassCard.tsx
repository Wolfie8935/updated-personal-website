import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useTilt } from "@/components/modern/hooks/useTilt";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable pointer-driven 3D tilt + sheen. Default true. */
  tilt?: boolean;
  /** Max tilt angle in degrees. */
  tiltMax?: number;
}

/**
 * Liquid-glass surface with optional 3D tilt and a pointer-tracking sheen.
 * Pure dark/light (modern) component — never used in the wizarding theme.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ tilt = true, tiltMax = 8, className, children, ...props }, ref) => {
    const tiltHandlers = useTilt(tiltMax);
    const handlers = tilt ? tiltHandlers : {};

    return (
      <div
        ref={ref}
        className={cn("glass-card", tilt && "tilt", className)}
        {...handlers}
        {...props}
      >
        {children}
      </div>
    );
  },
);

GlassCard.displayName = "GlassCard";
