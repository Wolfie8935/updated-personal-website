import { type ReactNode, useEffect, useRef } from "react";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";
import "./mirror-of-erised.css";

interface MirrorOfErisedProps {
  children: ReactNode;
}

const WHISPER_LINES = [
  "I show not your face, but your heart's desire.",
  "Step closer and let your intention surface.",
  "The mirror remembers every unspoken wish.",
];

export function MirrorOfErised({ children }: MirrorOfErisedProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) {
      return;
    }

    const fxLayer = root.querySelector<HTMLElement>(".wizard-mirror__fx");
    const whisperNode = root.querySelector<HTMLElement>(".wizard-mirror__whisper");
    if (!fxLayer || !whisperNode) {
      return;
    }

    let hoverActive = false;
    let whisperIndex = 0;
    let whisperInterval: number | null = null;
    let whisperFadeTimeout: number | null = null;
    let rippleGate = 0;

    const clearFxNodes = () => {
      fxLayer.querySelectorAll(".wizard-mirror__mist, .wizard-mirror__ripple").forEach((node) => {
        node.remove();
      });
    };

    const clearWhisperCycle = () => {
      if (whisperInterval !== null) {
        window.clearInterval(whisperInterval);
        whisperInterval = null;
      }
      if (whisperFadeTimeout !== null) {
        window.clearTimeout(whisperFadeTimeout);
        whisperFadeTimeout = null;
      }
      whisperNode.classList.remove("is-visible");
      whisperNode.textContent = "";
    };

    const injectWhisper = () => {
      whisperNode.textContent = WHISPER_LINES[whisperIndex % WHISPER_LINES.length];
      whisperNode.classList.add("is-visible");
      whisperIndex += 1;

      if (whisperFadeTimeout !== null) {
        window.clearTimeout(whisperFadeTimeout);
      }
      whisperFadeTimeout = window.setTimeout(() => {
        whisperNode.classList.remove("is-visible");
      }, 1600);
    };

    const spawnMist = () => {
      const mist = document.createElement("span");
      mist.className = "wizard-mirror__mist";
      mist.style.left = `${30 + Math.random() * 40}%`;
      mist.style.top = `${56 + Math.random() * 20}%`;
      mist.style.setProperty("--mist-size", `${120 + Math.random() * 70}px`);
      fxLayer.appendChild(mist);
      window.setTimeout(() => mist.remove(), 1800);
    };

    const spawnRipple = (event: MouseEvent) => {
      const now = performance.now();
      if (now - rippleGate < 90) return;
      rippleGate = now;

      const bounds = root.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "wizard-mirror__ripple";
      ripple.style.left = `${event.clientX - bounds.left}px`;
      ripple.style.top = `${event.clientY - bounds.top}px`;
      fxLayer.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 900);
    };

    const onPointerEnter = () => {
      hoverActive = true;
      root.classList.add("is-hovered");
      spawnMist();
      injectWhisper();
      whisperInterval = window.setInterval(() => {
        if (!hoverActive) return;
        spawnMist();
        injectWhisper();
      }, 2400);
    };

    const onPointerMove = (event: MouseEvent) => {
      if (!hoverActive) return;
      spawnRipple(event);
    };

    const onPointerLeave = () => {
      hoverActive = false;
      root.classList.remove("is-hovered");
      clearWhisperCycle();
      clearFxNodes();
    };

    root.addEventListener("mouseenter", onPointerEnter);
    root.addEventListener("mousemove", onPointerMove);
    root.addEventListener("mouseleave", onPointerLeave);

    return () => {
      root.removeEventListener("mouseenter", onPointerEnter);
      root.removeEventListener("mousemove", onPointerMove);
      root.removeEventListener("mouseleave", onPointerLeave);
      clearWhisperCycle();
      clearFxNodes();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className="wizard-mirror"
      data-reduced-motion={reducedMotion ? "true" : "false"}
    >
      <div className="wizard-mirror__frame">
        <p className="wizard-mirror__inscription wizard-mirror__inscription--top">
          Erised stra ehru oyt ube cafru oyt on wohsi
        </p>
        <div className="wizard-mirror__inner">{children}</div>
        <p className="wizard-mirror__inscription wizard-mirror__inscription--bottom">
          Reveal what rests within
        </p>
        <div className="wizard-mirror__whisper" aria-live="polite" />
        <div className="wizard-mirror__fx" aria-hidden />
      </div>
    </div>
  );
}
