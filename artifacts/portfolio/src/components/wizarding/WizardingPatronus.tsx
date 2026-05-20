import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeWizardingSpeech } from "@/wizarding/sharedSpeechRecognition";
import { speechSaysExpectoPatronum } from "@/wizarding/patronusSpeech";
import "./WizardingPatronus.css";

const PATRONUS_MS = 4800;

type WizardingPatronusProps = {
  enabled: boolean;
};

/**
 * Deer outline from Tabler Icons (MIT): outline deer vector.
 * Inlined so stroke/currentColor + filters behave consistently across browsers.
 */
function PatronusDoeSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="wizarding-patronus-svg-art"
      aria-hidden
    >
      <path d="M3 3c0 2 1 3 4 3c2 0 3 1 3 3" />
      <path d="M21 3c0 2 -1 3 -4 3c-2 0 -3 .333 -3 3" />
      <path d="M12 18c-1 0 -4 -3 -4 -6c0 -2 1.333 -3 4 -3s4 1 4 3c0 3 -3 6 -4 6" />
      <path d="M15.185 14.889l.095 -.18a4 4 0 1 1 -6.56 0" />
      <path d="M17 3c0 1.333 -.333 2.333 -1 3" />
      <path d="M7 3c0 1.333 .333 2.333 1 3" />
      <path d="M7 6c-2.667 .667 -4.333 1.667 -5 3" />
      <path d="M17 6c2.667 .667 4.333 1.667 5 3" />
      <path d="M8.5 10l-1.5 -1" />
      <path d="M15.5 10l1.5 -1" />
      <path d="M12 15h.01" />
    </svg>
  );
}

export function WizardingPatronus({ enabled }: WizardingPatronusProps) {
  const [runId, setRunId] = useState(0);
  const enabledRef = useRef(enabled);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const triggerPatronus = useCallback(() => {
    setRunId((id) => id + 1);
    if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setRunId(0);
    }, PATRONUS_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setRunId(0);
      return;
    }

    return subscribeWizardingSpeech({
      id: "expecto-patronus",
      isActive: () => enabledRef.current,
      onTranscript: (_raw, normalized) => {
        if (!normalized.length) return;
        if (speechSaysExpectoPatronum(normalized)) triggerPatronus();
      },
    });
  }, [enabled, triggerPatronus]);

  if (!enabled || runId === 0) return null;

  return (
    <div className="wizarding-patronus-root" aria-hidden>
      <div key={runId} className="wizarding-patronus-doe-wrap">
        <div className="wizarding-patronus-body">
          <PatronusDoeSvg />
        </div>
      </div>
    </div>
  );
}
