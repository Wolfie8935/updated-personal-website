type SpeechSubscriber = {
  id: string;
  isActive: () => boolean;
  onTranscript: (rawTranscript: string, normalizedTranscript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onError?: (error: string) => void;
};

const subscribers = new Map<string, SpeechSubscriber>();
let recognition: SpeechRecognition | null = null;
let isListening = false;
let pendingTranscript = "";
let restartTimer: number | null = null;

function getSpeechRecognitionConstructor(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function normalizeTranscript(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
}

function notifyListeningState() {
  subscribers.forEach((subscriber) => {
    subscriber.onListeningChange?.(isListening);
  });
}

function clearRestartTimer() {
  if (restartTimer !== null) {
    window.clearTimeout(restartTimer);
    restartTimer = null;
  }
}

function stopEngine() {
  clearRestartTimer();
  if (!recognition) return;
  try {
    recognition.abort();
  } catch {
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  }
  recognition = null;
  isListening = false;
  pendingTranscript = "";
  notifyListeningState();
}

function emitTranscriptIfAny() {
  const raw = pendingTranscript.trim();
  pendingTranscript = "";
  if (!raw) return;
  const normalized = normalizeTranscript(raw);
  subscribers.forEach((subscriber) => {
    let active = false;
    try {
      active = subscriber.isActive();
    } catch {
      active = false;
    }
    if (active) {
      subscriber.onTranscript(raw, normalized);
    }
  });
}

function scheduleRestart() {
  clearRestartTimer();
  restartTimer = window.setTimeout(() => {
    restartTimer = null;
    if (!recognition || subscribers.size === 0) return;
    try {
      recognition.start();
    } catch {
      recognition = null;
      ensureEngineRunning();
    }
  }, 260);
}

function wireRecognition(r: SpeechRecognition) {
  r.continuous = false;
  r.interimResults = true;
  r.lang = typeof navigator !== "undefined" && /^en/i.test(navigator.language) ? navigator.language : "en-US";

  r.onresult = (event: SpeechRecognitionEvent) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i += 1) {
      transcript += event.results[i]![0]!.transcript;
    }
    pendingTranscript = transcript;
  };

  r.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error !== "aborted") {
      subscribers.forEach((subscriber) => subscriber.onError?.(event.error));
    }
  };

  r.onend = () => {
    isListening = false;
    notifyListeningState();
    emitTranscriptIfAny();
    if (subscribers.size > 0) scheduleRestart();
  };
}

function ensureEngineRunning() {
  if (subscribers.size === 0) {
    stopEngine();
    return;
  }

  const SR = getSpeechRecognitionConstructor();
  if (!SR) {
    subscribers.forEach((subscriber) => subscriber.onError?.("unsupported"));
    return;
  }

  if (!recognition) {
    recognition = new SR();
    wireRecognition(recognition);
  }

  if (isListening) return;
  try {
    isListening = true;
    notifyListeningState();
    recognition.start();
  } catch {
    recognition = null;
    try {
      recognition = new SR();
      wireRecognition(recognition);
      isListening = true;
      notifyListeningState();
      recognition.start();
    } catch {
      recognition = null;
      isListening = false;
      notifyListeningState();
    }
  }
}

export function speechRecognitionSupported() {
  return getSpeechRecognitionConstructor() !== null;
}

export function subscribeWizardingSpeech(subscriber: SpeechSubscriber) {
  subscribers.set(subscriber.id, subscriber);
  ensureEngineRunning();
  subscriber.onListeningChange?.(isListening);
  return () => {
    subscribers.delete(subscriber.id);
    if (subscribers.size === 0) stopEngine();
  };
}
