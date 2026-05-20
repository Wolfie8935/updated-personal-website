import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { subscribeWizardingSpeech } from "@/wizarding/sharedSpeechRecognition";
import { speechSaysLumos, speechSaysNox } from "@/wizarding/noxLumosSpeech";
import "./WizardingNoxLumos.css";

type WizardingNoxLumosProps = {
  enabled: boolean;
};

export function WizardingNoxLumos({ enabled }: WizardingNoxLumosProps) {
  const [noxOn, setNoxOn] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const enabledRef = useRef(enabled);
  const noxActiveRef = useRef(false);
  const posRef = useRef({ x: 0, y: 0 });

  noxActiveRef.current = noxOn;

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    posRef.current = { x: cx, y: cy };
    setPointer({ x: cx, y: cy });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setNoxOn(false);
      return;
    }

    return subscribeWizardingSpeech({
      id: "nox-lumos",
      isActive: () => enabledRef.current,
      onTranscript: (_raw, normalized) => {
        if (!normalized.length) return;
        if (speechSaysLumos(normalized)) {
          setNoxOn(false);
          return;
        }
        if (speechSaysNox(normalized)) setNoxOn(true);
      },
    });
  }, [enabled]);

  useLayoutEffect(() => {
    if (noxOn) setPointer(posRef.current);
  }, [noxOn]);

  useEffect(() => {
    document.body.classList.toggle("wizarding-nox-active", noxOn);
    return () => document.body.classList.remove("wizarding-nox-active");
  }, [noxOn]);

  useEffect(() => {
    if (!enabled) return;

    const syncFromEvent = (clientX: number, clientY: number) => {
      posRef.current = { x: clientX, y: clientY };
      if (noxActiveRef.current) setPointer(posRef.current);
    };

    const onMouseMove = (e: MouseEvent) => syncFromEvent(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) syncFromEvent(t.clientX, t.clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) syncFromEvent(t.clientX, t.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      className={`wizarding-nox-overlay ${noxOn ? "is-active" : ""}`}
      aria-hidden
      style={
        {
          "--nox-x": `${pointer.x}px`,
          "--nox-y": `${pointer.y}px`,
        } as CSSProperties
      }
    />
  );
}
