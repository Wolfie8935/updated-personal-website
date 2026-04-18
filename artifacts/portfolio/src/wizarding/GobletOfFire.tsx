import { CSSProperties, FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";
import { useToast } from "@/hooks/use-toast";
import "./goblet-of-fire.css";

type SlipKind = "ambient" | "chosen";

interface Slip {
  id: number;
  kind: SlipKind;
  name: string;
  variant: number;
  lane: number;
}

/** All predefined Goblet names — ambient slips and non-player ejects pick at random from here. */
const GOBLET_NAME_POOL = [
  "Viktor Krum",
  "Cedric Diggory",
  "Fleur Delacour",
  "Aman Goel",
  "Dumbledore",
  "Harry Potter",
  "Snape",
  "Hermione Granger",
  "Ron Weasley",
  "Neville Longbottom",
  "Luna Lovegood",
  "Draco Malfoy",
] as const;

const MAX_AMBIENT_SLIPS = 3;
const MAX_TOTAL_SLIPS = 8;

/** Chance the ejected slip shows what you typed instead of a random pool name. */
const CHOSEN_PLAYER_NAME_CHANCE = 0.2;

function pickRandomPoolName(excludeNormalized?: string) {
  const ex = excludeNormalized?.trim().toLowerCase();
  const candidates = ex
    ? GOBLET_NAME_POOL.filter((n) => n.toLowerCase() !== ex)
    : [...GOBLET_NAME_POOL];
  const pool = candidates.length > 0 ? candidates : [...GOBLET_NAME_POOL];
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function BurntSlip({
  name,
  variant,
  className,
  style,
}: {
  name: string;
  variant: number;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`${className} gof-clip-${variant}`} style={style}>
      <span className="gof-slip-name">{name}</span>
    </div>
  );
}

export function GobletOfFire() {
  const reducedMotion = useReducedMotion();
  const { toast } = useToast();
  const inputId = useId();
  const [paperClipVariant] = useState(() => Math.floor(Math.random() * 5));
  const [slips, setSlips] = useState<Slip[]>([]);
  const [inputName, setInputName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState<{ name: string; variant: number } | null>(null);

  const idRef = useRef(0);
  const removalTimersRef = useRef<Map<number, number>>(new Map());
  const submitTimerRef = useRef<number | null>(null);

  const clearRemovalTimer = useCallback((id: number) => {
    const timerId = removalTimersRef.current.get(id);
    if (!timerId) return;
    window.clearTimeout(timerId);
    removalTimersRef.current.delete(id);
  }, []);

  const removeSlip = useCallback(
    (id: number) => {
      clearRemovalTimer(id);
      setSlips((prev) => prev.filter((slip) => slip.id !== id));
    },
    [clearRemovalTimer],
  );

  const pushSlip = useCallback(
    (kind: SlipKind, name: string) => {
      const newSlip: Slip = {
        id: ++idRef.current,
        kind,
        name,
        variant: idRef.current % 5,
        lane: idRef.current % 4,
      };

      const removedIds: number[] = [];
      setSlips((prev) => {
        const next = [...prev, newSlip];

        if (kind === "ambient") {
          while (next.filter((slip) => slip.kind === "ambient").length > MAX_AMBIENT_SLIPS) {
            const oldestAmbientIndex = next.findIndex((slip) => slip.kind === "ambient");
            if (oldestAmbientIndex < 0) break;
            removedIds.push(next[oldestAmbientIndex].id);
            next.splice(oldestAmbientIndex, 1);
          }
        }

        while (next.length > MAX_TOTAL_SLIPS) {
          removedIds.push(next[0].id);
          next.shift();
        }

        return next;
      });

      removedIds.forEach((id) => clearRemovalTimer(id));

      const ttl = kind === "chosen" ? (reducedMotion ? 2600 : 4200) : reducedMotion ? 3600 : 6200;
      const timerId = window.setTimeout(() => removeSlip(newSlip.id), ttl);
      removalTimersRef.current.set(newSlip.id, timerId);
    },
    [clearRemovalTimer, reducedMotion, removeSlip],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmed = inputName.trim();
    if (!trimmed) return;

    const submittedName = trimmed;

    setIsSubmitting(true);
    setInputName("");
    setActiveSubmission({ name: submittedName, variant: idRef.current % 5 });

    if (submitTimerRef.current) {
      window.clearTimeout(submitTimerRef.current);
    }

    submitTimerRef.current = window.setTimeout(() => {
      setActiveSubmission(null);

      const usePlayerName =
        submittedName.length >= 2 && Math.random() < CHOSEN_PLAYER_NAME_CHANCE;

      const chosenName = usePlayerName
        ? submittedName
        : pickRandomPoolName(submittedName);

      pushSlip("chosen", chosenName);
      if (chosenName === "Aman Goel") {
        toast({ title: "⚡ Aman Goel — Triwizard Champion!" });
      } else if (usePlayerName) {
        toast({
          title: "The Goblet chooses you",
          description: `${chosenName} rises from the fire.`,
        });
      }

      setIsSubmitting(false);
    }, reducedMotion ? 180 : 980);
  };

  useEffect(() => {
    if (reducedMotion) return;

    const intervalId = window.setInterval(() => {
      pushSlip("ambient", pickRandomPoolName());
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [pushSlip, reducedMotion]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) {
        window.clearTimeout(submitTimerRef.current);
        submitTimerRef.current = null;
      }

      removalTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      removalTimersRef.current.clear();
    };
  }, []);

  return (
    <section className="gof-shell" aria-label="Goblet of Fire submission">
      <div className={`gof-stage ${isSubmitting ? "is-casting" : ""} ${reducedMotion ? "is-reduced" : ""}`}>
        <div className="gof-slips-layer" aria-hidden="true">
          {slips.map((slip) => (
            <BurntSlip
              key={slip.id}
              name={slip.name}
              variant={slip.variant}
              className={`gof-slip gof-slip--${slip.kind} ${reducedMotion ? "is-reduced" : ""}`}
              style={
                {
                  "--gof-lane": String(slip.lane),
                  "--gof-id": String(slip.id),
                } as CSSProperties
              }
            />
          ))}
        </div>

        {activeSubmission && (
          <BurntSlip
            name={activeSubmission.name}
            variant={activeSubmission.variant}
            className={`gof-slip gof-slip--submitted ${reducedMotion ? "is-reduced" : ""}`}
            style={{ "--gof-id": String(idRef.current + 1) } as CSSProperties}
          />
        )}

        <div className="gof-goblet-wrap" aria-hidden="true">
          <div className="gof-flames">
            <span className="gof-flame gof-flame--outer" />
            <span className="gof-flame gof-flame--mid" />
            <span className="gof-flame gof-flame--core" />
          </div>
          <div className="gof-goblet">
            <div className="gof-goblet-rim" />
            <div className="gof-goblet-cup" />
            <div className="gof-goblet-stem" />
            <div className="gof-goblet-base" />
          </div>
        </div>
      </div>

      <form className="gof-form" onSubmit={handleSubmit}>
        <label htmlFor={inputId} className="gof-label">
          Enter your name for the Goblet
        </label>
        <div className={`gof-slip-paper gof-clip-${paperClipVariant}`}>
          <input
            id={inputId}
            type="text"
            className="gof-slip-input"
            value={inputName}
            onChange={(event) => setInputName(event.target.value)}
            placeholder="Write your name on the burnt slip…"
            maxLength={40}
            autoComplete="off"
            spellCheck={false}
            disabled={isSubmitting}
            aria-describedby={`${inputId}-hint`}
            enterKeyHint="send"
          />
        </div>
        <p id={`${inputId}-hint`} className="gof-slip-hint">
          {isSubmitting ? "Casting into the fire…" : "Press Enter to cast your name into the Goblet"}
        </p>
      </form>
    </section>
  );
}
