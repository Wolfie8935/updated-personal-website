import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

const CHARS = "!<>-_\\/[]{}—=+*^?#абвdef0123456789";

function scramble(
  from: string,
  to: string,
  onUpdate: (s: string) => void,
  onDone: () => void,
) {
  const length = Math.max(from.length, to.length);
  const queue = Array.from({ length }, (_, i) => {
    const start = Math.floor(Math.random() * 18);
    return {
      fromC: from[i] ?? "",
      toC: to[i] ?? "",
      start,
      end: start + Math.floor(Math.random() * 18) + 8,
      char: "",
    };
  });

  let frame = 0;
  let raf = 0;
  const update = () => {
    let out = "";
    let complete = 0;
    for (const q of queue) {
      if (frame >= q.end) {
        complete++;
        out += q.toC;
      } else if (frame >= q.start) {
        if (!q.char || Math.random() < 0.3) {
          q.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        out += q.char;
      } else {
        out += q.fromC;
      }
    }
    onUpdate(out);
    if (complete === queue.length) {
      onDone();
      return;
    }
    frame++;
    raf = requestAnimationFrame(update);
  };
  update();
  return () => cancelAnimationFrame(raf);
}

/**
 * Cycles through `phrases`, decrypting from one to the next with a scramble effect.
 * Under prefers-reduced-motion it cycles plainly without the scramble churn.
 */
export function useTextScramble(phrases: string[], holdMs = 2000) {
  const reduced = useReducedMotion();
  const [text, setText] = useState(phrases[0] ?? "");
  const current = useRef(phrases[0] ?? "");

  useEffect(() => {
    let idx = 0;
    let timer = 0;
    let cleanup = () => {};
    let cancelled = false;

    const next = () => {
      if (cancelled) return;
      const from = current.current;
      idx = (idx + 1) % phrases.length;
      const to = phrases[idx];

      if (reduced) {
        current.current = to;
        setText(to);
        timer = window.setTimeout(next, holdMs + 600);
        return;
      }

      cleanup = scramble(
        from,
        to,
        (s) => {
          current.current = s;
          setText(s);
        },
        () => {
          current.current = to;
          timer = window.setTimeout(next, holdMs);
        },
      );
    };

    timer = window.setTimeout(next, holdMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return text;
}
