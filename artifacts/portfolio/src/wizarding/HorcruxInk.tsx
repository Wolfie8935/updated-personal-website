import { useRef, type ReactNode } from "react";
import type { HorcruxInkId } from "@/wizarding/horcruxHuntContext";
import { useHorcruxHunt } from "@/wizarding/horcruxHuntContext";

type HorcruxInkProps = {
  id: HorcruxInkId;
  children: ReactNode;
};

export function HorcruxInk({ id, children }: HorcruxInkProps) {
  const ctx = useHorcruxHunt();
  const ref = useRef<HTMLButtonElement>(null);

  if (!ctx) {
    return <>{children}</>;
  }

  const found = ctx.isFound(id);

  return (
    <button
      type="button"
      className={`wizarding-horcrux-ink${found ? " is-destroyed" : ""}`}
      ref={ref}
      aria-label={`Hidden fragment (${id})`}
      onMouseEnter={() => ctx.tryDiscoverInk(id, ref.current)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        ctx.collectInk(id, ref.current);
      }}
    >
      {children}
    </button>
  );
}
