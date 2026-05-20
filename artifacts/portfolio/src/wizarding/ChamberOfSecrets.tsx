import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";
import { applySortingHouse } from "@/wizarding/houseSorting";
import {
  speechRecognitionSupported,
  subscribeWizardingSpeech,
} from "@/wizarding/sharedSpeechRecognition";
import "./chamber-of-secrets.css";

type Trait = "FORCE" | "LOGIC" | "SOCIAL" | "INTUITION";

interface QuizOption {
  id: string;
  label: string;
  weight: Trait;
}

interface QuizQuestion {
  id: "approach" | "subject" | "wand";
  prompt: string;
  options: QuizOption[];
}

interface SpellResult {
  title: string;
  tagline: string;
}

type SortingHouse = "Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff";

interface HouseQuizOption {
  id: string;
  label: string;
  house: SortingHouse;
}

interface HouseQuizQuestion {
  id: string;
  prompt: string;
  options: HouseQuizOption[];
}

interface HouseResult {
  title: string;
  tagline: string;
  houseClass: string;
}

const CHAMBER_HASH = "#chamber";
const KEY_SEQUENCE = ["o", "p", "e", "n"];
const WHISPER_UNLOCK_PHRASES = ["open", "salazar", "sssah vethra nah'shiri salazar ven'thas"];
const HORCRUX_TRIGGER_CLASSES = [
  "all-horcruxes-defeated",
  "horcruxes-defeated",
  "wizard-horcruxes-defeated",
  "wizarding-chamber-unlocked",
  "wizarding-victory",
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "approach",
    prompt: "Your approach to a hard problem?",
    options: [
      { id: "a", label: "Power through until it breaks", weight: "FORCE" },
      { id: "b", label: "Map every edge case first", weight: "LOGIC" },
      { id: "c", label: "Ask someone smarter", weight: "SOCIAL" },
      { id: "d", label: "Sleep on it", weight: "INTUITION" },
    ],
  },
  {
    id: "subject",
    prompt: "Your favourite Hogwarts subject?",
    options: [
      { id: "a", label: "Defense Against the Dark Arts", weight: "FORCE" },
      { id: "b", label: "Potions", weight: "LOGIC" },
      { id: "c", label: "Charms", weight: "SOCIAL" },
      { id: "d", label: "Divination", weight: "INTUITION" },
    ],
  },
  {
    id: "wand",
    prompt: "Your wand core?",
    options: [
      { id: "a", label: "Dragon Heartstring", weight: "FORCE" },
      { id: "b", label: "Phoenix Feather", weight: "LOGIC" },
      { id: "c", label: "Unicorn Hair", weight: "SOCIAL" },
      { id: "d", label: "Veela Hair", weight: "INTUITION" },
    ],
  },
];

const TRAIT_ORDER: Trait[] = ["FORCE", "LOGIC", "SOCIAL", "INTUITION"];

const HOUSE_QUIZ_QUESTIONS: HouseQuizQuestion[] = [
  {
    id: "h_sort_priority",
    prompt: "When the path ahead is unclear, what do you trust first?",
    options: [
      { id: "a", label: "Instinct — step forward and adapt", house: "Gryffindor" },
      { id: "b", label: "Ambition — pick the winning move", house: "Slytherin" },
      { id: "c", label: "Analysis — map it until it makes sense", house: "Ravenclaw" },
      { id: "d", label: "Persistence — keep going with care", house: "Hufflepuff" },
    ],
  },
  {
    id: "h_common_room",
    prompt: "Where would you rather spend a rainy afternoon?",
    options: [
      { id: "a", label: "By the fire, swapping bold stories", house: "Gryffindor" },
      { id: "b", label: "In quiet corners, planning the next leap", house: "Slytherin" },
      { id: "c", label: "In stacks of books and clever puzzles", house: "Ravenclaw" },
      { id: "d", label: "With friends, tea, and steady encouragement", house: "Hufflepuff" },
    ],
  },
  {
    id: "h_challenged",
    prompt: "Someone doubts your work in public. You…",
    options: [
      { id: "a", label: "Answer plainly and stand your ground", house: "Gryffindor" },
      { id: "b", label: "Let results arrive — then smile", house: "Slytherin" },
      { id: "c", label: "Explain the proof until it clicks", house: "Ravenclaw" },
      { id: "d", label: "Offer to help them understand, without heat", house: "Hufflepuff" },
    ],
  },
];

const HOUSE_ORDER: SortingHouse[] = ["Gryffindor", "Slytherin", "Ravenclaw", "Hufflepuff"];

const HOUSE_TAGLINES: Record<SortingHouse, string> = {
  Gryffindor: "Bravery and nerve — you charge where others hesitate.",
  Slytherin: "Resourceful and driven — you play the long game with precision.",
  Ravenclaw: "Wit and wonder — you refine ideas until they shine.",
  Hufflepuff: "Loyal and patient — you outlast the storm with quiet strength.",
};

const emptyTallies = (): Record<Trait, number> => ({
  FORCE: 0,
  LOGIC: 0,
  SOCIAL: 0,
  INTUITION: 0,
});

const normalizeWhisper = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const NORMALIZED_WHISPER_PHRASES = WHISPER_UNLOCK_PHRASES.map(normalizeWhisper);

/** Common STT mis-hearings of the Parseltongue line (already normalized). */
const PARSLETONGUE_TRANSCRIPT_ALIASES = [
  "sssah vethra nahshiri salazar venthhas",
  "sssah vethra nahshiri salazar venthas",
  "sssah vetra nahshiri salazar venthas",
  "ssah vethra nahshiri salazar venthas",
  "ssah vethra nashiri salazar venthas",
  "sah vethra nashiri salazar venthas",
  "sssah vethra na shiri salazar venthas",
];

/**
 * Speech-to-text rarely matches the canonical spelling; accept the line if the
 * transcript clearly contains Salazar, the “vethra” clause, and a nah/shiri chunk.
 */
const parseltongueUnlocksFromSpeech = (n: string) => {
  const compact = n.replace(/\s+/g, "");
  const hasSalazar = n.includes("salazar");
  const hasVethra = compact.includes("vethra") || compact.includes("vetra");
  const hasNahShiri =
    compact.includes("nahshiri") ||
    compact.includes("nashiri") ||
    compact.includes("nahsiri") ||
    compact.includes("nashiree") ||
    n.includes("nah shiri") ||
    n.includes("na shiri");

  return hasSalazar && hasVethra && hasNahShiri;
};

/** “Salazar” is often mangled by STT; accept close spellings (normalized). */
const SALAZAR_SPEECH_ALIASES = [
  "salazar",
  "salazaar",
  "sallazar",
  "cellazar",
  "solazar",
  "selazar",
  "zilazar",
  "celazar",
  "salasar",
];

const speechMentionsSalazar = (n: string) => {
  const compact = n.replace(/\s+/g, "");
  return SALAZAR_SPEECH_ALIASES.some((h) => n.includes(h) || compact.includes(h));
};

/** Speech recognition often returns a full sentence; `includes` matches substrings. */
const transcriptUnlocksChamber = (transcript: string) => {
  const n = normalizeWhisper(transcript);
  if (NORMALIZED_WHISPER_PHRASES.some((phrase) => phrase.length > 0 && n.includes(phrase))) {
    return true;
  }
  if (speechMentionsSalazar(n)) {
    return true;
  }
  if (PARSLETONGUE_TRANSCRIPT_ALIASES.some((phrase) => n.includes(phrase))) {
    return true;
  }
  return parseltongueUnlocksFromSpeech(n);
};

function isElementActivelyVisible(element: Element) {
  const rect = element.getBoundingClientRect();
  const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportH <= 0) return false;
  const activeBandTop = viewportH * 0.2;
  const activeBandBottom = viewportH * 0.8;
  const overlapsActiveBand = rect.bottom > activeBandTop && rect.top < activeBandBottom;
  const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0));
  return overlapsActiveBand && visibleHeight > 24;
}

const hasHorcruxTrigger = () => {
  if (typeof window === "undefined") return false;

  const body = document.body;
  const html = document.documentElement;
  const globalWindow = window as Window & {
    __allHorcruxesDefeated?: boolean;
    __horcruxesDefeated?: boolean;
  };

  const hasClassTrigger = HORCRUX_TRIGGER_CLASSES.some(
    (name) => body.classList.contains(name) || html.classList.contains(name),
  );
  const hasDatasetTrigger =
    body.dataset.horcruxesDefeated === "true" || html.dataset.horcruxesDefeated === "true";
  const hasFlagTrigger =
    Boolean(globalWindow.__allHorcruxesDefeated) || Boolean(globalWindow.__horcruxesDefeated);
  const hasStorageTrigger = localStorage.getItem("hp_voldemort_defeated") === "true";

  return hasClassTrigger || hasDatasetTrigger || hasFlagTrigger || hasStorageTrigger;
};

const computeSpellQuizResult = (selections: Record<string, string>): SpellResult | null => {
  const allAnswered = QUIZ_QUESTIONS.every((q) => selections[q.id]);
  if (!allAnswered) return null;

  const tallies = emptyTallies();
  QUIZ_QUESTIONS.forEach((question) => {
    const opt = question.options.find((o) => o.id === selections[question.id]);
    if (opt) tallies[opt.weight] += 1;
  });

  const max = Math.max(...TRAIT_ORDER.map((t) => tallies[t]));
  const leaders = TRAIT_ORDER.filter((t) => tallies[t] === max);

  if (leaders.length === 1) {
    switch (leaders[0]) {
      case "FORCE":
        return { title: "Expelliarmus", tagline: "You disarm before you destroy." };
      case "LOGIC":
        return { title: "Alohomora", tagline: "Every lock has a solution." };
      case "SOCIAL":
        return { title: "Wingardium Leviosa", tagline: "You lift others higher." };
      case "INTUITION":
        return { title: "Expecto Patronum", tagline: "Your light drives back darkness." };
      default:
        return { title: "Riddikulus", tagline: "You never take yourself too seriously." };
    }
  }

  if (leaders.length === 2) {
    const [x, y] = [...leaders].sort();
    if (x === "FORCE" && y === "LOGIC") {
      return { title: "Avada Kedavra", tagline: "You code with ruthless efficiency." };
    }
    if (x === "FORCE" && y === "SOCIAL") {
      return { title: "Stupefy", tagline: "You stun them with sheer presence." };
    }
    if (x === "LOGIC" && y === "INTUITION") {
      return { title: "Accio", tagline: "You summon exactly what you need." };
    }
  }

  return { title: "Riddikulus", tagline: "You never take yourself too seriously." };
};

const computeHouseQuizResult = (selections: Record<string, string>): HouseResult | null => {
  const allAnswered = HOUSE_QUIZ_QUESTIONS.every((q) => selections[q.id]);
  if (!allAnswered) return null;

  const tallies: Record<SortingHouse, number> = {
    Gryffindor: 0,
    Slytherin: 0,
    Ravenclaw: 0,
    Hufflepuff: 0,
  };

  HOUSE_QUIZ_QUESTIONS.forEach((question) => {
    const opt = question.options.find((o) => o.id === selections[question.id]);
    if (opt) tallies[opt.house] += 1;
  });

  const max = Math.max(...HOUSE_ORDER.map((h) => tallies[h]));
  const leaders = HOUSE_ORDER.filter((h) => tallies[h] === max);
  const winner = leaders.sort()[0];

  return {
    title: winner,
    tagline: HOUSE_TAGLINES[winner],
    houseClass: winner.toLowerCase(),
  };
};

export function ChamberOfSecrets({ enabled }: { enabled: boolean }) {
  const reducedMotion = useReducedMotion();
  const chamberSectionRef = useRef<HTMLElement | null>(null);
  const isUnlockedRef = useRef(false);
  const voiceUnlockConsumedRef = useRef(false);
  const sortedHouseAppliedRef = useRef<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockSource, setUnlockSource] = useState("");
  const [showContent, setShowContent] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [spellStep, setSpellStep] = useState(0);
  const [houseQuizAnswers, setHouseQuizAnswers] = useState<Record<string, string>>({});
  const [houseStep, setHouseStep] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voicePermissionDenied, setVoicePermissionDenied] = useState(false);

  useEffect(() => {
    setSpeechSupported(speechRecognitionSupported());
  }, []);

  useEffect(() => {
    isUnlockedRef.current = isUnlocked;
    if (!isUnlocked) {
      voiceUnlockConsumedRef.current = false;
    }
  }, [isUnlocked]);

  useEffect(() => {
    if (enabled) return;
    setIsUnlocked(false);
    setUnlockSource("");
    setShowContent(false);
    setQuizAnswers({});
    setSpellStep(0);
    setHouseQuizAnswers({});
    setHouseStep(0);
    setVoiceListening(false);
    setVoicePermissionDenied(false);
    sortedHouseAppliedRef.current = null;
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isUnlocked) return;
    if (reducedMotion) {
      setShowContent(true);
      return;
    }

    setShowContent(false);
    const timer = window.setTimeout(() => {
      setShowContent(true);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [enabled, isUnlocked, reducedMotion]);

  useEffect(() => {
    if (!enabled || isUnlocked) return;

    let sequenceIndex = 0;
    let whisperBuffer = "";
    const normalizedPhrases = WHISPER_UNLOCK_PHRASES.map(normalizeWhisper);
    const maxWhisperLength = Math.max(...normalizedPhrases.map((phrase) => phrase.length));
    let mounted = true;

    const unlock = (source: string) => {
      if (!mounted) return;
      setIsUnlocked(true);
      setUnlockSource(source);
    };

    const checkHashUnlock = () => {
      if (window.location.hash.toLowerCase() === CHAMBER_HASH) {
        unlock("Hash sigil invoked");
      }
    };

    const checkHorcruxUnlock = () => {
      if (hasHorcruxTrigger()) {
        unlock("All horcruxes defeated");
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const raw = event.key ?? "";
      const key = raw.length === 1 ? raw.toLowerCase() : raw;
      if (!key) return;

      if (raw.length === 1) {
        whisperBuffer = `${whisperBuffer}${raw.toLowerCase()}`;
      } else if (raw === "Backspace") {
        whisperBuffer = whisperBuffer.slice(0, -1);
      } else if (raw === "Spacebar" || raw === " ") {
        whisperBuffer = `${whisperBuffer} `;
      }

      if (whisperBuffer.length > maxWhisperLength + 24) {
        whisperBuffer = whisperBuffer.slice(-(maxWhisperLength + 24));
      }

      const normalizedBuffer = normalizeWhisper(whisperBuffer);
      const matchedWhisper = normalizedPhrases.find((phrase) =>
        normalizedBuffer.endsWith(phrase),
      );
      if (matchedWhisper) {
        unlock(matchedWhisper === "open" ? "Parseltongue sequence: open" : "Vault whisper accepted");
        sequenceIndex = 0;
        whisperBuffer = "";
        return;
      }
      if (transcriptUnlocksChamber(whisperBuffer)) {
        unlock("Vault whisper accepted");
        sequenceIndex = 0;
        whisperBuffer = "";
        return;
      }

      if (key === KEY_SEQUENCE[sequenceIndex]) {
        sequenceIndex += 1;
        if (sequenceIndex === KEY_SEQUENCE.length) {
          unlock("Parseltongue sequence: open");
          sequenceIndex = 0;
        }
        return;
      }
      sequenceIndex = key === KEY_SEQUENCE[0] ? 1 : 0;
    };

    const onHashChange = () => checkHashUnlock();
    const observer = new MutationObserver(() => checkHorcruxUnlock());

    checkHorcruxUnlock();
    checkHashUnlock();
    if (!hasHorcruxTrigger()) {
      window.addEventListener("keydown", onKeyDown);
    }
    window.addEventListener("hashchange", onHashChange);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-horcruxes-defeated"] });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-horcruxes-defeated"],
    });

    const onHorcruxEvent = () => checkHorcruxUnlock();
    const onChamberEvent = () => unlock("All horcruxes defeated");
    window.addEventListener("wizarding:horcruxes-defeated", onHorcruxEvent as EventListener);
    window.addEventListener("wizarding:chamber-unlocked", onChamberEvent as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("wizarding:horcruxes-defeated", onHorcruxEvent as EventListener);
      window.removeEventListener("wizarding:chamber-unlocked", onChamberEvent as EventListener);
      observer.disconnect();
    };
  }, [enabled, isUnlocked]);

  useEffect(() => {
    if (!enabled || isUnlocked || !speechSupported) {
      setVoiceListening(false);
      return;
    }

    const el = chamberSectionRef.current ?? document.getElementById("chamber");
    if (!el) return;

    return subscribeWizardingSpeech({
      id: "chamber-of-secrets",
      isActive: () => enabled && !isUnlockedRef.current && isElementActivelyVisible(el),
      onTranscript: (rawTranscript) => {
        if (isUnlockedRef.current || voiceUnlockConsumedRef.current) return;
        const wouldUnlock = transcriptUnlocksChamber(rawTranscript);
        if (!wouldUnlock) return;
        voiceUnlockConsumedRef.current = true;
        setIsUnlocked(true);
        setUnlockSource("The stone heard your voice");
      },
      onListeningChange: (listening) => {
        const active = enabled && !isUnlockedRef.current && isElementActivelyVisible(el);
        setVoiceListening(active && listening);
      },
      onError: (error) => {
        if (error === "not-allowed" || error === "service-not-allowed") {
          setVoicePermissionDenied(true);
          setVoiceListening(false);
        }
      },
    });
  }, [enabled, isUnlocked, speechSupported]);

  const spellResult = useMemo(() => computeSpellQuizResult(quizAnswers), [quizAnswers]);
  const houseResult = useMemo(() => computeHouseQuizResult(houseQuizAnswers), [houseQuizAnswers]);

  useEffect(() => {
    if (!enabled || !showContent || !houseResult) return;
    const houseKey = houseResult.houseClass.toLowerCase();
    if (sortedHouseAppliedRef.current === houseKey) return;

    const timer = window.setTimeout(() => {
      applySortingHouse(houseKey);
      sortedHouseAppliedRef.current = houseKey;
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [enabled, showContent, houseResult]);

  const onSpellAnswer = (questionId: QuizQuestion["id"], optionId: string, questionIndex: number) => {
    setQuizAnswers((previous) => ({ ...previous, [questionId]: optionId }));
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setSpellStep(questionIndex + 1);
    } else {
      setSpellStep(QUIZ_QUESTIONS.length);
    }
  };

  const onHouseAnswer = (questionId: string, optionId: string, questionIndex: number) => {
    setHouseQuizAnswers((previous) => ({ ...previous, [questionId]: optionId }));
    if (questionIndex < HOUSE_QUIZ_QUESTIONS.length - 1) {
      setHouseStep(questionIndex + 1);
    } else {
      setHouseStep(HOUSE_QUIZ_QUESTIONS.length);
    }
  };

  if (!enabled) return null;

  return (
    <section
      id="chamber"
      ref={chamberSectionRef}
      className={`chamber-of-secrets ${isUnlocked ? "is-unlocked" : ""}`}
    >
      <div className="chamber-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="chamber-walls" aria-hidden="true">
          <span className="chamber-wall chamber-wall-left" />
          <span className="chamber-wall chamber-wall-right" />
        </div>

        {!isUnlocked && (
          <header className="chamber-header">
            <p className="chamber-kicker">Phase VI - Chamber of Secrets</p>
            <h2 className="section-title text-3xl md:text-4xl font-bold">Hidden Archives of Hogwarts</h2>
            <p className="chamber-description text-muted-foreground">
              The chamber sleeps beneath the castle. Unlock it by conquering every horcrux, whispering
              <span className="chamber-inline-code"> open </span>
              —or use the ancient tongue to reveal what lies within.
            </p>
            {speechSupported && (
              <p className="chamber-voice-hint text-muted-foreground">
                
              </p>
            )}
            {voiceListening && (
              <p className="chamber-voice-status" aria-live="polite">
                Listening…
              </p>
            )}
            {voicePermissionDenied && (
              <p className="chamber-voice-denied" role="status">
                Microphone access was blocked. You can still unlock with horcruxes or by typing.
              </p>
            )}
          </header>
        )}

        {!showContent ? (
          <div className="chamber-parseltongue" role="status" aria-live="polite">
            <p className="parseltongue-script">Sssah vethra nah'shiri... salazar ven'thas...</p>
            <p className="parseltongue-translation">
              The walls are listening. Speak the old tongue and the stone shall move.
            </p>
            {isUnlocked && <p className="parseltongue-source">Unlocked by: {unlockSource}</p>}
          </div>
        ) : (
          <div className="chamber-content">
            <h2 className="chamber-heading">~ The Chamber of Secrets ~</h2>
            <p className="chamber-sub">You have proven yourself worthy, young wizard.</p>

            <div className="chamber-panels">
              <Card className="wizard-card chamber-panel chamber-panel-quiz" id="panel-spell-quiz">
                <CardContent className="p-6 md:p-7">
                  <h3 className="text-2xl font-bold mb-2">Which Spell Are You?</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    One question at a time — your answer replaces it with the next, until the scroll appears.
                  </p>

                  <div className="chamber-quiz-questions">
                    {spellStep < QUIZ_QUESTIONS.length && (
                      <fieldset
                        key={QUIZ_QUESTIONS[spellStep].id}
                        className="chamber-quiz-question chamber-quiz-single chamber-quiz-step-enter"
                      >
                        <legend className="font-semibold mb-2">{QUIZ_QUESTIONS[spellStep].prompt}</legend>
                        <div className="chamber-quiz-options">
                          {QUIZ_QUESTIONS[spellStep].options.map((option) => (
                            <label key={option.id} className="chamber-choice">
                              <input
                                type="radio"
                                name={QUIZ_QUESTIONS[spellStep].id}
                                value={option.id}
                                checked={quizAnswers[QUIZ_QUESTIONS[spellStep].id] === option.id}
                                onChange={() =>
                                  onSpellAnswer(QUIZ_QUESTIONS[spellStep].id, option.id, spellStep)
                                }
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}
                  </div>

                  <div className={`chamber-spell-scroll ${spellResult ? "is-open" : ""}`} aria-live="polite">
                    <div className="chamber-spell-scroll-surface">
                      <div className="chamber-spell-scroll-cap chamber-spell-scroll-cap--left" aria-hidden="true" />
                      <div className="chamber-spell-scroll-body">
                        {spellResult ? (
                          <>
                            <p className="chamber-spell-name">{spellResult.title}</p>
                            <p className="chamber-spell-tagline">{spellResult.tagline}</p>
                          </>
                        ) : (
                          <p className="chamber-spell-pending">Answer all three to unfurl the scroll.</p>
                        )}
                      </div>
                      <div className="chamber-spell-scroll-cap chamber-spell-scroll-cap--right" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="wizard-card chamber-panel chamber-panel-quiz" id="panel-house-quiz">
                <CardContent className="p-6 md:p-7">
                  <h3 className="text-2xl font-bold mb-2">Sorting Hat</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    The Hat asks three things — only one question shows at a time.
                  </p>

                  <div className="chamber-quiz-questions">
                    {houseStep < HOUSE_QUIZ_QUESTIONS.length && (
                      <fieldset
                        key={HOUSE_QUIZ_QUESTIONS[houseStep].id}
                        className="chamber-quiz-question chamber-quiz-single chamber-quiz-step-enter"
                      >
                        <legend className="font-semibold mb-2">{HOUSE_QUIZ_QUESTIONS[houseStep].prompt}</legend>
                        <div className="chamber-quiz-options">
                          {HOUSE_QUIZ_QUESTIONS[houseStep].options.map((option) => (
                            <label key={option.id} className="chamber-choice">
                              <input
                                type="radio"
                                name={HOUSE_QUIZ_QUESTIONS[houseStep].id}
                                value={option.id}
                                checked={houseQuizAnswers[HOUSE_QUIZ_QUESTIONS[houseStep].id] === option.id}
                                onChange={() =>
                                  onHouseAnswer(HOUSE_QUIZ_QUESTIONS[houseStep].id, option.id, houseStep)
                                }
                              />
                              <span>{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    )}
                  </div>

                  <div className={`chamber-spell-scroll chamber-house-scroll ${houseResult ? "is-open" : ""}`} aria-live="polite">
                    <div className="chamber-spell-scroll-surface">
                      <div className="chamber-spell-scroll-cap chamber-spell-scroll-cap--left" aria-hidden="true" />
                      <div className={`chamber-spell-scroll-body chamber-house-scroll-body ${houseResult ? `is-${houseResult.houseClass}` : ""}`}>
                        {houseResult ? (
                          <>
                            <p className={`chamber-house-name is-${houseResult.houseClass}`}>{houseResult.title}</p>
                            <p className="chamber-spell-tagline">{houseResult.tagline}</p>
                          </>
                        ) : (
                          <p className="chamber-spell-pending">Answer all three — the Hat will declare your house.</p>
                        )}
                      </div>
                      <div className="chamber-spell-scroll-cap chamber-spell-scroll-cap--right" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="wizard-card chamber-panel" id="panel-patronus">
                <CardContent className="p-6 md:p-7">
                  <h3 className="text-2xl font-bold mb-4">Patronus Certificate</h3>
                  <div className="certificate-sheet">
                    <p className="certificate-title">Ministry of Magic - Defensive Arts Registry</p>
                    <p className="certificate-line">
                      This certifies that <strong>Aman Goel</strong> has successfully cast a corporeal Patronus.
                    </p>
                    <p className="certificate-line">
                      Patronus Form: <strong>Silver Falcon</strong>
                    </p>
                    <p className="certificate-line">
                      Field Rating: <strong>Outstanding</strong>
                    </p>
                    <p className="certificate-footer">Witnessed beneath the moonlit battlements of Hogwarts.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="wizard-card chamber-panel" id="panel-letter">
                <CardContent className="p-6 md:p-7">
                  <h3 className="text-2xl font-bold mb-4">Hogwarts Acceptance Letter</h3>
                  <article className="letter-sheet">
                    <p className="letter-line">Dear Mr. Goel,</p>
                    <p className="letter-line">
                      We are pleased to inform you that you have been accepted at Hogwarts School of Witchcraft and
                      Wizardry as a Special Scholar of Computational Magic.
                    </p>
                    <p className="letter-line">
                      Your aptitude in magical systems, reasoning engines, and enchanted pipelines has been noted by the
                      Board of Governors.
                    </p>
                    <p className="letter-line">Term begins on the first of September. Owl response is requested.</p>
                    <p className="letter-signoff">Yours sincerely,</p>
                    <p className="letter-signoff">
                      <strong>Minerva McGonagall</strong>
                    </p>
                  </article>
                </CardContent>
              </Card>

            </div>
          </div>
        )}
      </div>
    </section>
  );
}
