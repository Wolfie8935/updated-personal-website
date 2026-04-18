import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  HorcruxHuntContext,
  type HorcruxId,
  type HorcruxInkId,
} from "@/wizarding/horcruxHuntContext";
import "./horcrux-hunt.css";

type FloatingText = {
  id: number;
  x: number;
  y: number;
  text: string;
  variant: "discover" | "collect" | "victory";
};

interface HorcruxHuntProps {
  enabled: boolean;
  children: ReactNode;
}

const HORCRUX_STORAGE_KEY = "hp_horcruxes_found";
const DEFEATED_STORAGE_KEY = "hp_voldemort_defeated";
const HINT_DONE_STORAGE_KEY = "hp_horcrux_toggle_hint_done";
const HINT_START_STORAGE_KEY = "hp_horcrux_toggle_hint_started_at";
const HINT_DURATION_MS = 5 * 60 * 1000;

const INK_META: Record<HorcruxInkId, { collectText: string; senseLabel: string }> = {
  about: { collectText: "Diary Fragment destroyed", senseLabel: "Diary Fragment" },
  skills: { collectText: "Ring Fragment destroyed", senseLabel: "Ring Fragment" },
  experience: { collectText: "Locket Fragment destroyed", senseLabel: "Locket Fragment" },
  projects: { collectText: "Cup Fragment destroyed", senseLabel: "Cup Fragment" },
  research: { collectText: "Diadem Fragment destroyed", senseLabel: "Diadem Fragment" },
  achievements: { collectText: "Nagini Fragment destroyed", senseLabel: "Nagini Fragment" },
};

const ALL_HORCRUX_IDS: HorcruxId[] = [
  "about",
  "skills",
  "experience",
  "projects",
  "research",
  "achievements",
  "toggle",
];

const HORCRUX_LABELS: Record<HorcruxId, string> = {
  about: "Diary",
  skills: "Ring",
  experience: "Locket",
  projects: "Cup",
  research: "Diadem",
  achievements: "Nagini",
  toggle: "Bolt",
};

export function HorcruxHunt({ enabled, children }: HorcruxHuntProps) {
  const [foundHorcruxes, setFoundHorcruxes] = useState<Set<HorcruxId>>(() => new Set());
  const [isVictoryOverlayVisible, setIsVictoryOverlayVisible] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [hasDefeatedVoldemort, setHasDefeatedVoldemort] = useState<boolean>(false);

  const foundRef = useRef(foundHorcruxes);
  const floatingIdRef = useRef(0);
  const floatingTimeoutsRef = useRef<number[]>([]);
  const victoryTimeoutRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<number | null>(null);
  const mapObserverRef = useRef<MutationObserver | null>(null);
  const victoryTriggeredRef = useRef(false);

  useEffect(() => {
    foundRef.current = foundHorcruxes;
  }, [foundHorcruxes]);

  const foundCount = foundHorcruxes.size;

  const createFloatingText = useCallback(
    (text: string, sourceRect: DOMRect | null, variant: FloatingText["variant"]) => {
      if (!enabled) return;
      const id = floatingIdRef.current++;
      const x = sourceRect ? sourceRect.left + sourceRect.width / 2 : window.innerWidth / 2;
      const y = sourceRect ? sourceRect.top + sourceRect.height / 2 : window.innerHeight * 0.35;
      setFloatingTexts((current) => [...current, { id, x, y, text, variant }]);
      const timeoutId = window.setTimeout(() => {
        setFloatingTexts((current) => current.filter((entry) => entry.id !== id));
      }, 1500);
      floatingTimeoutsRef.current.push(timeoutId);
    },
    [enabled],
  );

  const applyChamberUnlock = useCallback((active: boolean) => {
    const body = document.body;
    const html = document.documentElement;
    body.classList.toggle("wizarding-chamber-unlocked", active);
    body.classList.toggle("all-horcruxes-defeated", active);
    body.classList.toggle("horcruxes-defeated", active);
    body.classList.toggle("wizard-horcruxes-defeated", active);
    html.classList.toggle("all-horcruxes-defeated", active);
    html.classList.toggle("horcruxes-defeated", active);
    html.classList.toggle("wizard-horcruxes-defeated", active);
    body.dataset.horcruxesDefeated = active ? "true" : "false";
    html.dataset.horcruxesDefeated = active ? "true" : "false";
    const globalWindow = window as Window & {
      __allHorcruxesDefeated?: boolean;
      __horcruxesDefeated?: boolean;
    };
    globalWindow.__allHorcruxesDefeated = active;
    globalWindow.__horcruxesDefeated = active;

    const mapSection = document.getElementById("marauders-map");
    if (mapSection) {
      mapSection.classList.toggle("wizarding-chamber-unlocked", active);
    }
    if (active) {
      window.dispatchEvent(new CustomEvent("wizarding:chamber-unlocked"));
      window.dispatchEvent(new CustomEvent("wizarding:horcruxes-defeated"));
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem(HORCRUX_STORAGE_KEY);
    localStorage.removeItem(DEFEATED_STORAGE_KEY);
    localStorage.removeItem(HINT_DONE_STORAGE_KEY);
    localStorage.removeItem(HINT_START_STORAGE_KEY);
    victoryTriggeredRef.current = false;
    setFoundHorcruxes(new Set());
    setHasDefeatedVoldemort(false);
    applyChamberUnlock(false);
    document.body.classList.remove("wizarding-victory");
  }, [applyChamberUnlock]);

  const activateVictory = useCallback(() => {
    if (victoryTriggeredRef.current) return;
    victoryTriggeredRef.current = true;
    setHasDefeatedVoldemort(true);
    localStorage.setItem(DEFEATED_STORAGE_KEY, "true");
    document.body.classList.add("wizarding-victory");
    applyChamberUnlock(true);
    setIsVictoryOverlayVisible(true);
    createFloatingText("All Horcruxes destroyed", null, "victory");
    if (victoryTimeoutRef.current !== null) {
      window.clearTimeout(victoryTimeoutRef.current);
    }
    victoryTimeoutRef.current = window.setTimeout(() => {
      setIsVictoryOverlayVisible(false);
      victoryTimeoutRef.current = null;
    }, 6200);
  }, [applyChamberUnlock, createFloatingText]);

  useEffect(() => {
    if (!enabled || foundCount < ALL_HORCRUX_IDS.length) return;
    queueMicrotask(() => {
      activateVictory();
    });
  }, [activateVictory, enabled, foundCount]);

  const collectHorcrux = useCallback(
    (id: HorcruxId, sourceElement: HTMLElement | null, customText?: string) => {
      if (!enabled || foundRef.current.has(id)) return;

      sourceElement?.classList.add("is-destroying");
      window.setTimeout(() => {
        sourceElement?.classList.remove("is-destroying");
        sourceElement?.classList.add("is-destroyed");
      }, 420);

      const sourceRect = sourceElement?.getBoundingClientRect() ?? null;
      createFloatingText(customText ?? `${HORCRUX_LABELS[id]} destroyed`, sourceRect, "collect");

      setFoundHorcruxes((current) => {
        if (current.has(id)) return current;
        const next = new Set(current);
        next.add(id);
        localStorage.setItem(HORCRUX_STORAGE_KEY, JSON.stringify(Array.from(next)));
        if (next.size === ALL_HORCRUX_IDS.length) {
          queueMicrotask(() => {
            activateVictory();
          });
        }
        return next;
      });

      if (id === "toggle") {
        localStorage.setItem(HINT_DONE_STORAGE_KEY, "true");
        localStorage.removeItem(HINT_START_STORAGE_KEY);
      }
    },
    [activateVictory, createFloatingText, enabled],
  );

  const tryDiscoverInk = useCallback(
    (id: HorcruxInkId, el: HTMLElement | null) => {
      if (!enabled || foundRef.current.has(id) || !el || el.dataset.inkSense === "1") return;
      el.dataset.inkSense = "1";
      el.classList.add("is-discovered");
      createFloatingText(`${INK_META[id].senseLabel} sensed`, el.getBoundingClientRect(), "discover");
    },
    [createFloatingText, enabled],
  );

  const collectInk = useCallback(
    (id: HorcruxInkId, el: HTMLElement | null) => {
      collectHorcrux(id, el, INK_META[id].collectText);
    },
    [collectHorcrux],
  );

  const huntApi = useMemo(() => {
    if (!enabled) return null;
    return {
      tryDiscoverInk,
      collectInk,
      isFound: (id: HorcruxInkId) => foundHorcruxes.has(id),
    };
  }, [collectInk, enabled, foundHorcruxes, tryDiscoverInk]);

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("wizarding-victory");
      document.body.classList.remove("wizarding-chamber-unlocked");
      setIsVictoryOverlayVisible(false);
      return;
    }

    if (hasDefeatedVoldemort) {
      document.body.classList.add("wizarding-victory");
      applyChamberUnlock(true);
    } else {
      document.body.classList.remove("wizarding-victory");
      applyChamberUnlock(false);
    }

    return () => {
      document.body.classList.remove("wizarding-victory");
      applyChamberUnlock(false);
    };
  }, [applyChamberUnlock, enabled, hasDefeatedVoldemort]);

  useEffect(() => {
    if (!enabled || !hasDefeatedVoldemort) {
      mapObserverRef.current?.disconnect();
      mapObserverRef.current = null;
      return;
    }

    const observer = new MutationObserver(() => applyChamberUnlock(true));
    observer.observe(document.body, { childList: true, subtree: true });
    mapObserverRef.current = observer;
    applyChamberUnlock(true);

    return () => {
      observer.disconnect();
      mapObserverRef.current = null;
    };
  }, [applyChamberUnlock, enabled, hasDefeatedVoldemort]);

  useEffect(() => {
    if (!enabled) return;

    const toggleButtons = Array.from(document.querySelectorAll<HTMLElement>(".theme-toggle-btn"));
    if (toggleButtons.length === 0) return;

    let discovered = false;

    const markToggleHintAsDone = () => {
      localStorage.setItem(HINT_DONE_STORAGE_KEY, "true");
      localStorage.removeItem(HINT_START_STORAGE_KEY);
      toggleButtons.forEach((button) => button.classList.remove("wizarding-toggle-hint"));
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };

    if (!foundRef.current.has("toggle") && localStorage.getItem(HINT_DONE_STORAGE_KEY) !== "true") {
      const now = Date.now();
      const startedAt = Number(localStorage.getItem(HINT_START_STORAGE_KEY) ?? "0");
      const effectiveStart = Number.isFinite(startedAt) && startedAt > 0 ? startedAt : now;
      if (!startedAt) {
        localStorage.setItem(HINT_START_STORAGE_KEY, String(now));
      }
      const elapsed = now - effectiveStart;
      const remaining = HINT_DURATION_MS - elapsed;
      if (remaining > 0) {
        toggleButtons.forEach((button) => button.classList.add("wizarding-toggle-hint"));
        hintTimeoutRef.current = window.setTimeout(() => {
          markToggleHintAsDone();
        }, remaining);
      } else {
        markToggleHintAsDone();
      }
    }

    const onContextMenu = (event: Event) => {
      if (!enabled || foundRef.current.has("toggle")) return;
      event.preventDefault();
      collectHorcrux("toggle", event.currentTarget as HTMLElement, "Bolt fragment destroyed");
      markToggleHintAsDone();
    };

    const onMouseEnter = (event: Event) => {
      if (foundRef.current.has("toggle") || discovered) return;
      discovered = true;
      const element = event.currentTarget as HTMLElement;
      element.classList.add("wizarding-toggle-discovered");
      createFloatingText("Dark magic in the bolt", element.getBoundingClientRect(), "discover");
    };

    toggleButtons.forEach((button) => {
      if (foundRef.current.has("toggle")) {
        button.classList.add("wizarding-toggle-destroyed");
      }
      button.addEventListener("contextmenu", onContextMenu);
      button.addEventListener("mouseenter", onMouseEnter, { once: true });
    });

    return () => {
      toggleButtons.forEach((button) => {
        button.removeEventListener("contextmenu", onContextMenu);
        button.removeEventListener("mouseenter", onMouseEnter);
        button.classList.remove("wizarding-toggle-hint", "wizarding-toggle-discovered", "wizarding-toggle-destroyed");
      });
      if (hintTimeoutRef.current !== null) {
        window.clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
    };
  }, [collectHorcrux, createFloatingText, enabled]);

  useEffect(() => {
    if (enabled) return;
    victoryTriggeredRef.current = false;
    setFloatingTexts([]);
    floatingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    floatingTimeoutsRef.current = [];
    if (victoryTimeoutRef.current !== null) {
      window.clearTimeout(victoryTimeoutRef.current);
      victoryTimeoutRef.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      floatingTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      if (hintTimeoutRef.current !== null) window.clearTimeout(hintTimeoutRef.current);
      if (victoryTimeoutRef.current !== null) window.clearTimeout(victoryTimeoutRef.current);
      mapObserverRef.current?.disconnect();
    };
  }, []);

  const trackerItems = useMemo(
    () =>
      ALL_HORCRUX_IDS.map((id) => ({
        id,
        label: HORCRUX_LABELS[id],
        found: foundHorcruxes.has(id),
      })),
    [foundHorcruxes],
  );

  return (
    <HorcruxHuntContext.Provider value={huntApi}>
      {children}
      {enabled && foundCount > 0 && (
        <aside className="wizarding-horcrux-hud" aria-live="polite" aria-label="Horcrux tracker">
          <p className="wizarding-horcrux-hud-title">Horcrux Hunt</p>
          <p className="wizarding-horcrux-hud-count">
            {foundCount} / {ALL_HORCRUX_IDS.length} destroyed
          </p>
          <div className="wizarding-horcrux-hud-grid">
            {trackerItems.map((item) => (
              <span
                key={item.id}
                className={`wizarding-horcrux-hud-item ${item.found ? "is-found" : ""}`}
                title={item.label}
              >
                {item.found ? "✦" : "·"}
              </span>
            ))}
          </div>
        </aside>
      )}

      {enabled &&
        floatingTexts.map((entry) => (
          <div
            key={entry.id}
            className={`wizarding-horcrux-floating wizarding-horcrux-floating-${entry.variant}`}
            style={{ left: entry.x, top: entry.y }}
          >
            {entry.text}
          </div>
        ))}

      {enabled && isVictoryOverlayVisible && (
        <div className="wizarding-horcrux-victory-overlay" role="status" aria-live="polite">
          <div className="wizarding-horcrux-victory-panel">
            <p className="wizarding-horcrux-victory-kicker">The Dark Lord Has Fallen</p>
            <h3>All Seven Horcruxes Are Gone</h3>
            <p>
              Lord Voldemort is defeated — every shard of his soul is destroyed. The war is won; you are marked as the
              Chosen One.
            </p>
          </div>
        </div>
      )}
    </HorcruxHuntContext.Provider>
  );
}
