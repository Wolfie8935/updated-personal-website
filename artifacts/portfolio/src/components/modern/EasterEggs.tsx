import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * Modern-theme easter eggs (dark/light only — never mounts in wizarding):
 *  - a soft cursor glow that trails the pointer
 *  - Konami code -> celebratory toast + a tennis "ace" serve
 *  - typing "ace" -> fires a tennis ball across the screen (a nod to the tennis days)
 *
 * All motion is suppressed under prefers-reduced-motion.
 */
export function EasterEggs() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  // Cursor glow
  useEffect(() => {
    if (reduced) return;
    const glow = glowRef.current;
    if (!glow) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        glow.style.setProperty("--cx", `${e.clientX}px`);
        glow.style.setProperty("--cy", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Toast helper
  const toast = (message: string) => {
    const existing = document.getElementById("modern-egg-toast");
    if (existing) existing.remove();
    const el = document.createElement("div");
    el.id = "modern-egg-toast";
    el.className = "modern-toast";
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-shown"));
    window.setTimeout(() => el.classList.remove("is-shown"), 3200);
    window.setTimeout(() => el.remove(), 3700);
  };

  // Tennis "ace" serve — a ball rockets across with a trail + an "ACE!" pop
  const serveAce = () => {
    if (reduced) {
      toast("🎾 ACE! (motion kept calm for you)");
      return;
    }
    const ball = document.createElement("div");
    ball.className = "ace-ball";
    ball.textContent = "🎾";
    document.body.appendChild(ball);

    const pop = document.createElement("div");
    pop.className = "ace-pop";
    pop.textContent = "ACE!";
    document.body.appendChild(pop);

    window.setTimeout(() => ball.remove(), 1300);
    window.setTimeout(() => pop.remove(), 1200);
  };

  // Konami + "ace" word listeners
  useEffect(() => {
    const konami = [
      "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a",
    ];
    let kIndex = 0;
    let typed = "";

    const onKey = (e: KeyboardEvent) => {
      const raw = e.key ?? "";
      const key = raw.length === 1 ? raw.toLowerCase() : raw;
      if (!key) return;

      // konami
      if (key === konami[kIndex]) {
        kIndex += 1;
        if (kIndex === konami.length) {
          toast("🎾 Game, set, match — you found the secret. Now try the ⚡ theme!");
          serveAce();
          kIndex = 0;
        }
      } else {
        kIndex = key === konami[0] ? 1 : 0;
      }

      // "ace" word
      if (raw.length === 1) {
        typed = (typed + key).slice(-3);
        if (typed === "ace") {
          serveAce();
          typed = "";
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
