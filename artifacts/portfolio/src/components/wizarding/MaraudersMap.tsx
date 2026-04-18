import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import { subscribeWizardingSpeech } from "@/wizarding/sharedSpeechRecognition";
import "./MaraudersMap.css";

type Point = { x: number; y: number };
type Room = {
  id: string;
  label: string;
  description: string;
  quoteLines: string[];
  x: number;
  y: number;
  width: number;
  height: number;
};
type Corridor = {
  id: string;
  d: string;
  dashed?: boolean;
  hiddenUntilReveal?: boolean;
};
type Character = {
  id: string;
  name: string;
  symbol: string;
  speed: number;
  offset: number;
  path: Point[];
};
type CharacterPosition = {
  id: string;
  name: string;
  symbol: string;
  x: number;
  y: number;
};
type Footprint = { id: string; x: number; y: number; createdAt: number };

const MAP_ROOMS: Room[] = [
  { id: "quidditch", label: "QUIDDITCH PITCH", description: "BLUDGERS ACTIVE. HOUSE TRYOUTS AT DAWN.", quoteLines: ["REMEMBER WHAT IS RIGHT", "AND NOT WHAT IS EASY"], x: 72, y: 72, width: 250, height: 120 },
  { id: "library", label: "LIBRARY", description: "RESTRICTED SECTION: ROW 7. PROCEED IN SILENCE.", quoteLines: ["ALL THESE YEARS", "FOR LILY"], x: 370, y: 115, width: 195, height: 130 },
  { id: "astronomy", label: "ASTRONOMY TOWER", description: "STAR CHARTS AND MOONLIGHT ABOVE THE BATTLEMENTS.", quoteLines: ["THE BOY MUST DIE", "THAT IS ESSENTIAL"], x: 690, y: 84, width: 210, height: 140 },
  { id: "great-hall", label: "GREAT HALL", description: "FLOATING CANDLES, WHISPERED OATHS, AND MIDNIGHT FEASTS.", quoteLines: ["GOOD AND KIND AND BRAVE", "REMEMBER CEDRIC DIGGORY"], x: 90, y: 248, width: 220, height: 150 },
  { id: "dungeons", label: "DUNGEONS (SLYTHERIN)", description: "COLD STONE CORRIDORS BY THE BLACK LAKE.", quoteLines: ["YOU HAVE USED ME", "I HAVE SPIED FOR YOU"], x: 360, y: 366, width: 220, height: 126 },
  { id: "gryffindor", label: "GRYFFINDOR TOWER", description: "COMMON ROOM EMBERS STILL GLOWING WARM.", quoteLines: ["EXPECTO PATRONUM", "AFTER ALL THIS TIME"], x: 690, y: 338, width: 220, height: 150 },
  { id: "forest", label: "FORBIDDEN FOREST", description: "HOOFBEATS, SHADOWS, AND OLD MAGIC UNDER LEAVES.", quoteLines: ["ONLY THOSE", "WHOM I COULD NOT SAVE"], x: 970, y: 186, width: 180, height: 210 },
  { id: "hogsmeade", label: "HOGSMEADE GATE", description: "PASSAGE TO HONEYDUKES AND WINTER FOG.", quoteLines: ["DON'T BE SHOCKED", "SEVERUS"], x: 75, y: 520, width: 220, height: 120 },
  { id: "chamber", label: "CHAMBER ENTRANCE", description: "STONE WHISPERS BENEATH THE BATHROOM SINKS.", quoteLines: ["RAISING HIM", "AT THE RIGHT MOMENT"], x: 366, y: 538, width: 190, height: 110 },
  { id: "room-requirement", label: "ROOM OF REQUIREMENT", description: "APPEARS ONLY WHEN TRULY NEEDED.", quoteLines: ["ALWAYS", "AFTER ALL THIS TIME"], x: 675, y: 520, width: 240, height: 120 },
  { id: "hospital-wing", label: "HOSPITAL WING", description: "MADAM POMFREY KEEPS EVERY CURE AND EVERY SECRET.", quoteLines: ["LORD VOLDEMORT", "THE END OF VOLDEMORT"], x: 980, y: 456, width: 170, height: 120 },
];

const ROOM_CENTERS = Object.fromEntries(
  MAP_ROOMS.map((room) => [room.id, { x: room.x + room.width / 2, y: room.y + room.height / 2 }]),
);
const room = (id: string): Point => ROOM_CENTERS[id] ?? { x: 0, y: 0 };

const MAP_CORRIDORS: Corridor[] = [
  { id: "quidditch-greathall", d: "M197 192 L197 248" },
  // { id: "greathall-library", d: "M310 320 L360 320" },
  { id: "greathall-library-diag", d: "M310 248 L370 182" },
  { id: "library-astronomy", d: "M565 182 L690 182 L690 224" },
  { id: "astronomy-gryffindor", d: "M795 224 L800 338" },
  { id: "library-dungeons", d: "M467 245 L467 366", dashed: true },
  { id: "library-gryffindor", d: "M565 240 L690 410" },
  { id: "dungeons-gryff", d: "M580 430 L690 430" },
  // { id: "astronomy-forest", d: "M900 294 L970 294" },
  { id: "great-hall-forest", d: "M310 320 C480 290 780 292 970 294" },
  { id: "forest-hospital", d: "M910 430 L980 500", dashed: true },
  { id: "gryff-roomreq", d: "M790 488 L790 520" },
  { id: "chamber-roomreq", d: "M556 592 L675 580" },
  { id: "hogsmeade-chamber", d: "M300 580 L366 592" },
  { id: "greathall-hogsmeade", d: "M295 580 L295 398", dashed: true },
  { id: "dungeons-chamber", d: "M556 592 L560 492", dashed: true },
  { id: "roomreq-hospital", d: "M915 580 L980 515", hiddenUntilReveal: true },
];

const PATH_QUOTES = [
  "SO THE BOY THE BOY MUST DIE ASKED SNAPE QUITE CALMLY AND VOLDEMORT HIMSELF MUST DO IT SEVERUS THAT IS ESSENTIAL",
  "I THOUGHT ALL THESE YEARS THAT WE WERE PROTECTING HIM FOR HER FOR LILY WE HAVE PROTECTED HIM BECAUSE IT HAS BEEN ESSENTIAL",
  "TO TEACH HIM TO RAISE HIM TO LET HIM TRY HIS STRENGTH MEANWHILE THE CONNECTION BETWEEN THEM GROWS EVER STRONGER",
  "IF I KNOW HIM HE WILL HAVE ARRANGED MATTERS SO THAT WHEN HE DOES SET OUT TO MEET HIS DEATH IT WILL TRULY MEAN THE END OF VOLDEMORT",
  "YOU HAVE KEPT HIM ALIVE SO THAT HE CAN DIE AT THE RIGHT MOMENT DONT BE SHOCKED SEVERUS HOW MANY MEN AND WOMEN HAVE YOU WATCHED DIE",
  "LATELY ONLY THOSE WHOM I COULD NOT SAVE YOU HAVE USED ME I HAVE SPIED FOR YOU AND LIED FOR YOU PUT MYSELF IN MORTAL DANGER FOR YOU",
  "YOU HAVE BEEN RAISING HIM LIKE A PIG FOR SLAUGHTER HAVE YOU GROWN TO CARE FOR THE BOY AFTER ALL FOR HIM EXPECTO PATRONUM",
  "AFTER ALL THIS TIME ALWAYS REMEMBER IF THE TIME SHOULD COME CHOOSE BETWEEN WHAT IS RIGHT AND WHAT IS EASY REMEMBER CEDRIC DIGGORY",
];

const OATH_BACKGROUND_EXTRACT_LEFT = `So the boy . . . the boy must die?” asked Snape quite calmly.
“And Voldemort himself must do it, Severus. That is essential.”
Another long silence. Then Snape said, “I thought . . . all these years . . . that we were protecting him for her. For Lily.”
“We have protected him because it has been essential to teach him, to raise him, to let him try his strength,” said Dumbledore, his eyes still tight shut. “Meanwhile, the connection between them grows ever stronger, a parasitic growth: Sometimes I have thought he suspects it himself. If I know him, he will have arranged matters so that when he does set out to meet his death, it will truly mean the end of Voldemort.”
Dumbledore opened his eyes. Snape looked horrified. “You have kept him alive so that he can die at the right moment?”
“Don’t be shocked, Severus. How many men and women have you watched die?”
“Lately, only those whom I could not save,” said Snape. He stood up. “You have used me.”
“Meaning?”
“I have spied for you and lied for you, put myself in mortal danger for you. Everything was supposed to be to keep Lily Potter’s son safe. Now you tell me you have been raising him like a pig for slaughter —”
“But this is touching, Severus,” said Dumbledore seriously. “Have you grown to care for the boy, after all?”
“For HIM?” shouted Snape. “Expecto Patronum!" From the tip of his wand burst the silver doe: She landed on the office floor, bounded once across the office, and soared out of the window. Dumbledore watched her fly away, and as her silvery glow faded he turned back to Snape, and his eyes were full of tears.
“After all this time?”
“Always,” said Snape.
`;
const OATH_BACKGROUND_EXTRACT_RIGHT = `‘Oh,’ said Slughorn, repressing a large belch. ‘Oh, dear. Yes, that was – was terrible indeed. Terrible ... terrible ...’
He looked quite at a loss for what to say, and resorted to refilling their mugs.
‘I don’t – don’t suppose you remember it, Harry?’ he asked awkwardly.
‘No – well, I was only one when they died,’ said Harry, his eyes on the flame of the candle flickering in Hagrid’s heavy snores. ‘But I’ve found out pretty much what happened since. My dad died first. Did you know that?’
‘I – I didn’t,’ said Slughorn in a hushed voice.
‘Yeah ... Voldemort murdered him and then stepped over his body towards my mum,’ said Harry.
Slughorn gave a great shudder, but he did not seem able to tear his horrified gaze away from Harry’s face.
‘He told her to get out of the way,’ said Harry remorselessly. ‘He told me she needn’t have died. He only wanted me. She could have run.’
‘Oh dear,’ breathed Slughorn. ‘She could have ... she needn’t ... that’s awful ...’
‘It is, isn’t it?’ said Harry, in a voice barely more than a whisper. ‘But she didn’t move. Dad was already dead, but she didn’t want me to go too. She tried to plead with Voldemort ... but he just laughed ...’
‘That’s enough!’ said Slughorn suddenly, raising a shaking hand. ‘Really, my dear boy, enough ... I’m an old man ... I don’t need to hear ... I don’t want to hear ...’
‘I forgot,’ lied Harry, Felix Felicis leading him on. ‘You liked her, didn’t you?’
‘Liked her?’ said Slughorn, his eyes brimming with tears once more. ‘I don’t imagine anyone who met her wouldn’t have liked her ... very brave ... very funny ... it was the most horrible thing ...’
‘But you won’t help her son,’ said Harry. ‘She gave me her life, but you won’t give me a memory.’
Hagrid’s rumbling snores filled the cabin. Harry looked steadily into Slughorn’s tear-filled eyes. The Potions master seemed unable to look away.
‘Don’t say that,’ he whispered. ‘It isn’t a question ... if it were to help you, of course ... but no purpose can be served ...’
‘It can,’ said Harry clearly. ‘Dumbledore needs information. I need information.’
He knew he was safe: Felix was telling him that Slughorn would remember nothing of this in the morning. Looking Slughorn straight in the eye, Harry leant forwards a little.
‘I am the Chosen One. I have to kill him. I need that memory.’
Slughorn turned paler than ever; his shiny forehead gleamed with sweat.
‘You are the Chosen One?’
‘Of course I am,’ said Harry calmly
`;

const CHARACTER_PATHS: Character[] = [
  { id: "harry", name: "Harry", symbol: "⚡", speed: 0.013, offset: 0, path: [room("great-hall"), room("library"), room("astronomy"), room("gryffindor"), room("dungeons"), room("great-hall")] },
  { id: "hermione", name: "Hermione", symbol: "✦", speed: 0.012, offset: 0.22, path: [room("library"), room("astronomy"), room("forest"), room("hospital-wing"), room("gryffindor"), room("library")] },
  { id: "ron", name: "Ron", symbol: "☾", speed: 0.0115, offset: 0.45, path: [room("gryffindor"), room("great-hall"), room("hogsmeade"), room("chamber"), room("dungeons"), room("gryffindor")] },
  { id: "dumbledore", name: "Dumbledore", symbol: "∞", speed: 0.01, offset: 0.64, path: [room("astronomy"), room("library"), room("great-hall"), room("dungeons"), room("room-requirement"), room("astronomy")] },
];

const DEFAULT_POSITIONS: CharacterPosition[] = CHARACTER_PATHS.map((character) => ({
  id: character.id,
  name: character.name,
  symbol: character.symbol,
  x: character.path[0].x,
  y: character.path[0].y,
}));

function normalizeMapPhrase(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
}

const MAP_OATH_OPEN_NORM = normalizeMapPhrase("i solemnly swear that i am up to no good");
const MAP_OATH_OPEN_SHORT_NORM = normalizeMapPhrase("i solemnly swear i am up to no good");
const MAP_OATH_CLOSE_NORM = normalizeMapPhrase("mischief managed");

function mapPhraseOpens(normalized: string) {
  return normalized.includes(MAP_OATH_OPEN_NORM) || normalized.includes(MAP_OATH_OPEN_SHORT_NORM);
}

function mapPhraseCloses(normalized: string) {
  return normalized.includes(MAP_OATH_CLOSE_NORM);
}

/** Levenshtein distance for fuzzy speech matching. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const row = new Uint32Array(n + 1);
  for (let j = 0; j <= n; j += 1) row[j] = j;
  for (let i = 1; i <= m; i += 1) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j += 1) {
      const cur = row[j]!;
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = cur;
    }
  }
  return row[n]!;
}

function phraseSimilarityRatio(utterance: string, target: string): number {
  if (!utterance.length && !target.length) return 1;
  if (!target.length) return 0;
  const d = levenshtein(utterance, target);
  return 1 - d / Math.max(utterance.length, target.length, 1);
}

/** After user stops speaking: match oath / close phrase with tolerance for ASR errors. */
const SPEECH_OPEN_SIMILARITY_MIN = 0.72;
const SPEECH_CLOSE_SIMILARITY_MIN = 0.78;

function mapSpeechOpens(normalized: string): boolean {
  if (mapPhraseOpens(normalized)) return true;
  const best = Math.max(
    phraseSimilarityRatio(normalized, MAP_OATH_OPEN_NORM),
    phraseSimilarityRatio(normalized, MAP_OATH_OPEN_SHORT_NORM),
  );
  if (best >= SPEECH_OPEN_SIMILARITY_MIN) return true;
  if (
    normalized.includes("solemnly") &&
    normalized.includes("swear") &&
    /\bup\s+to\s+no\s+good\b/.test(normalized)
  ) {
    return true;
  }
  return false;
}

function mapSpeechCloses(normalized: string): boolean {
  if (mapPhraseCloses(normalized)) return true;
  if (phraseSimilarityRatio(normalized, MAP_OATH_CLOSE_NORM) >= SPEECH_CLOSE_SIMILARITY_MIN) return true;
  if (normalized.includes("mischief") && /\bmanag/.test(normalized)) return true;
  return false;
}

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

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

function getPathPoint(path: Point[], normalizedProgress: number): Point {
  if (path.length < 2) return path[0] ?? { x: 0, y: 0 };
  const wrapped = ((normalizedProgress % 1) + 1) % 1;
  const scaled = wrapped * path.length;
  const index = Math.floor(scaled);
  const localProgress = scaled - index;
  const current = path[index % path.length];
  const next = path[(index + 1) % path.length];
  return {
    x: current.x + (next.x - current.x) * localProgress,
    y: current.y + (next.y - current.y) * localProgress,
  };
}

export function MaraudersMap() {
  const mapSectionRef = useRef<HTMLElement | null>(null);
  const mapBodyRef = useRef<HTMLDivElement | null>(null);
  const mapVisibleRef = useRef(false);
  const mapPhaseRef = useRef<"hidden" | "opening" | "open" | "closing">("hidden");
  const animationFrameRef = useRef<number | null>(null);
  const animationStartRef = useRef<number | null>(null);
  const lastVisualUpdateRef = useRef<number>(0);
  const phaseTimerRef = useRef<number | null>(null);
  const footprintDropRef = useRef<Record<string, number>>({});

  const [wizardingEnabled, setWizardingEnabled] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapPhase, setMapPhase] = useState<"hidden" | "opening" | "open" | "closing">("hidden");
  const [positions, setPositions] = useState<CharacterPosition[]>(DEFAULT_POSITIONS);
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hiddenRoomRevealed, setHiddenRoomRevealed] = useState(false);

  useEffect(() => {
    mapVisibleRef.current = mapVisible;
  }, [mapVisible]);

  useEffect(() => {
    mapPhaseRef.current = mapPhase;
  }, [mapPhase]);

  useEffect(() => {
    const root = document.documentElement;
    const updateWizardingState = () => setWizardingEnabled(root.classList.contains("theme-wizarding"));
    updateWizardingState();
    const observer = new MutationObserver(updateWizardingState);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!wizardingEnabled) {
      setMapVisible(false);
      setMapPhase("hidden");
      setHiddenRoomRevealed(false);
      setPositions(DEFAULT_POSITIONS);
      setFootprints([]);
      animationStartRef.current = null;
      lastVisualUpdateRef.current = 0;
      footprintDropRef.current = {};
    }
  }, [wizardingEnabled]);

  useEffect(() => {
    if (!wizardingEnabled || !mapVisible || mapPhase === "closing") {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const tick = (timestamp: number) => {
      if (animationStartRef.current === null) {
        animationStartRef.current = timestamp;
        lastVisualUpdateRef.current = timestamp;
      }
      if (timestamp - lastVisualUpdateRef.current < 60) {
        animationFrameRef.current = window.requestAnimationFrame(tick);
        return;
      }
      lastVisualUpdateRef.current = timestamp;

      const elapsedSeconds = (timestamp - animationStartRef.current) / 1000;
      const now = Date.now();
      const freshFootprints: Footprint[] = [];

      const nextPositions = CHARACTER_PATHS.map((character) => {
        const progress = character.offset + elapsedSeconds * character.speed;
        const point = getPathPoint(character.path, progress);
        const lastDrop = footprintDropRef.current[character.id] ?? 0;
        if (now - lastDrop > 950) {
          footprintDropRef.current[character.id] = now;
          freshFootprints.push({ id: `${character.id}-${now}`, x: point.x, y: point.y, createdAt: now });
        }
        return { id: character.id, name: character.name, symbol: character.symbol, x: point.x, y: point.y };
      });

      setPositions(nextPositions);
      setFootprints((current) => [...current.filter((f) => now - f.createdAt < 3200), ...freshFootprints]);
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (animationFrameRef.current !== null) window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, [wizardingEnabled, mapVisible, mapPhase]);

  const mapClassName = useMemo(
    () => ["marauders-map-canvas", `phase-${mapPhase}`, wizardingEnabled ? "is-wizarding" : ""].filter(Boolean).join(" "),
    [mapPhase, wizardingEnabled],
  );

  const revealMap = useCallback(() => {
    if (!wizardingEnabled) return;
    const visible = mapVisibleRef.current;
    const phase = mapPhaseRef.current;
    if (visible && (phase === "open" || phase === "opening")) return;
    if (phase === "closing") return;
    if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current);
    setMapVisible(true);
    setHiddenRoomRevealed(false);
    setMapPhase("opening");
    phaseTimerRef.current = window.setTimeout(() => setMapPhase("open"), 950);
  }, [wizardingEnabled]);

  const concealMap = useCallback(() => {
    if (!wizardingEnabled) return;
    const visible = mapVisibleRef.current;
    const phase = mapPhaseRef.current;
    if (!visible || phase === "hidden" || phase === "closing") return;
    if (phase === "opening") return;
    if (phaseTimerRef.current !== null) window.clearTimeout(phaseTimerRef.current);
    setMapPhase("closing");
    phaseTimerRef.current = window.setTimeout(() => {
      setMapVisible(false);
      setMapPhase("hidden");
      setHoveredRoom(null);
    }, 700);
  }, [wizardingEnabled]);

  const onRevealToggle = () => {
    if (!wizardingEnabled) return;
    if (!mapVisible || mapPhase === "hidden") {
      revealMap();
      return;
    }
    if (mapPhase === "opening" || mapPhase === "closing") return;
    concealMap();
  };

  useEffect(() => {
    if (!wizardingEnabled) return;

    let buffer = "";
    const maxLen = 200;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableKeyboardTarget(event.target)) return;
      const raw = event.key ?? "";
      if (raw.length === 1) buffer = `${buffer}${raw.toLowerCase()}`;
      else if (raw === "Backspace") buffer = buffer.slice(0, -1);
      else if (raw === " " || raw === "Spacebar") buffer = `${buffer} `;
      else return;

      if (buffer.length > maxLen) buffer = buffer.slice(-maxLen);
      const n = normalizeMapPhrase(buffer);
      if (mapPhraseOpens(n)) {
        buffer = "";
        revealMap();
        return;
      }
      if (mapPhraseCloses(n)) {
        buffer = "";
        concealMap();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [wizardingEnabled, revealMap, concealMap]);

  useEffect(() => {
    if (!wizardingEnabled) return;

    const el = mapSectionRef.current ?? document.getElementById("marauders-map");
    if (!el) return;

    return subscribeWizardingSpeech({
      id: "marauders-map",
      isActive: () => wizardingEnabled && isElementActivelyVisible(el),
      onTranscript: (_raw, normalized) => {
        if (!normalized.length) return;
        if (mapSpeechOpens(normalized)) {
          revealMap();
          return;
        }
        if (mapSpeechCloses(normalized)) concealMap();
      },
    });
  }, [wizardingEnabled, revealMap, concealMap]);

  const onCanvasTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".map-room")) setHoveredRoom(null);
  };

  const setTooltipAtRoomCenter = (currentRoom: Room) => {
    const mapBody = mapBodyRef.current;
    if (!mapBody) return;
    const rect = mapBody.getBoundingClientRect();
    const roomCenterX = (currentRoom.x + currentRoom.width / 2) / 1200;
    const roomCenterY = (currentRoom.y + currentRoom.height / 2) / 700;
    setTooltipPos({ x: roomCenterX * rect.width, y: roomCenterY * rect.height });
  };

  return (
    <section
      id="marauders-map"
      ref={mapSectionRef}
      className="marauders-map-section"
      aria-labelledby="marauders-map-title"
    >
      <div className="marauders-map-shell">
        <div className="marauders-map-header">
          <h2 id="marauders-map-title" className="marauders-map-title">
            ~ The Marauder&apos;s Map ~
          </h2>
          <p className="marauders-map-oath">Messrs. Moony, Wormtail, Padfoot, and Prongs are proud to present...</p>
          <button type="button" className="marauders-map-reveal-btn" onClick={onRevealToggle}>
            {mapVisible && mapPhase !== "closing" ? "Mischief managed" : "I solemnly swear that I am up to no good"}
          </button>
        </div>

        {!mapVisible && (
          <div className="marauders-map-placeholder" aria-hidden="true">
            <div className="marauders-map-placeholder-scripts">
              <div className="marauders-map-script-column left">{OATH_BACKGROUND_EXTRACT_LEFT}</div>
              <div className="marauders-map-script-column right">{OATH_BACKGROUND_EXTRACT_RIGHT}</div>
            </div>
            <p className="marauders-map-placeholder-text">
              SPEAK THE OATH TO REVEAL THE MAP
            </p>
          </div>
        )}

        {mapVisible && (
          <div className={mapClassName} ref={mapBodyRef} onTouchStart={onCanvasTouchStart}>
            <div className="marauders-map-canvas-scripts" aria-hidden="true">
              <div className="marauders-map-script-column left">{OATH_BACKGROUND_EXTRACT_LEFT}</div>
              <div className="marauders-map-script-column right">{OATH_BACKGROUND_EXTRACT_RIGHT}</div>
            </div>
            <div className="marauders-map-legend" aria-hidden="true">
              {positions.map((character) => (
                <div key={character.id} className="marauders-map-legend-item">
                  <span className={`legend-symbol legend-symbol-${character.id}`}>{character.symbol}</span>
                  <span>{character.name}</span>
                </div>
              ))}
            </div>

            <svg className="marauders-map-floorplan" viewBox="0 0 1200 700" aria-label="Marauder map floorplan">
              <defs>
                <filter id="ink-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2b1a10" floodOpacity="0.35" />
                </filter>
              </defs>

              {MAP_CORRIDORS.map((corridor, idx) => {
                const hidden = corridor.hiddenUntilReveal && !hiddenRoomRevealed;
                const corridorPathId = `corridor-path-${corridor.id}`;
                return (
                  <g key={corridor.id} className={`map-pathway ${hidden ? "hidden-corridor" : ""}`}>
                    <path id={corridorPathId} d={corridor.d} className="map-pathway-base" />
                    <text className="map-path-quote">
                      <textPath href={`#${corridorPathId}`} startOffset="0%">
                        {(PATH_QUOTES[idx % PATH_QUOTES.length] + " ").repeat(4)}
                      </textPath>
                    </text>
                  </g>
                );
              })}

              {MAP_ROOMS.map((currentRoom) => {
                const hiddenRoom = currentRoom.id === "room-requirement" && !hiddenRoomRevealed;
                return (
                  <g
                    key={currentRoom.id}
                    onMouseEnter={() => {
                      setHoveredRoom(currentRoom);
                      setTooltipAtRoomCenter(currentRoom);
                    }}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onTouchStart={(event) => {
                      event.stopPropagation();
                      setHoveredRoom(currentRoom);
                      setTooltipAtRoomCenter(currentRoom);
                      if (currentRoom.id === "chamber") setHiddenRoomRevealed(true);
                    }}
                    onClick={() => {
                      if (currentRoom.id === "chamber") setHiddenRoomRevealed(true);
                    }}
                  >
                    <rect
                      x={currentRoom.x}
                      y={currentRoom.y}
                      width={currentRoom.width}
                      height={currentRoom.height}
                      rx={16}
                      ry={16}
                      className={`map-room ${hiddenRoom ? "hidden-room" : ""}`}
                      filter="url(#ink-shadow)"
                    />
                    <text
                      x={currentRoom.x + currentRoom.width / 2}
                      y={currentRoom.y + 34}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      className="map-room-label"
                    >
                      {hiddenRoom ? "HIDDEN PASSAGE" : currentRoom.label}
                    </text>
                    {!hiddenRoom &&
                      currentRoom.quoteLines.map((line, lineIdx) => (
                        <text
                          key={`${currentRoom.id}-line-${lineIdx}`}
                          x={currentRoom.x + currentRoom.width / 2}
                          y={currentRoom.y + 56 + lineIdx * 13}
                          textAnchor="middle"
                          dominantBaseline="hanging"
                          className="map-room-quote"
                        >
                          {line}
                        </text>
                      ))}
                    {currentRoom.id === "forest" && (
                      <g className="forest-grove">
                        {[0, 1, 2, 3, 4, 5].map((treeIndex) => {
                          const baseX = currentRoom.x + 30 + (treeIndex % 3) * 48;
                          const baseY = currentRoom.y + 94 + Math.floor(treeIndex / 3) * 58;
                          return (
                            <g key={`forest-tree-${treeIndex}`}>
                              <polygon
                                points={`${baseX},${baseY + 18} ${baseX + 10},${baseY - 4} ${baseX + 20},${baseY + 18}`}
                                className="forest-tree-crown"
                              />
                              <rect x={baseX + 8} y={baseY + 18} width={4} height={8} className="forest-tree-trunk" />
                            </g>
                          );
                        })}
                      </g>
                    )}
                  </g>
                );
              })}

              {footprints.map((footprint) => (
                <g key={footprint.id} className="map-footprint-pair">
                  <ellipse cx={footprint.x - 3.2} cy={footprint.y} rx={3.9} ry={2.4} className="map-footprint" />
                  <ellipse cx={footprint.x + 3.2} cy={footprint.y + 1} rx={3.9} ry={2.4} className="map-footprint" />
                </g>
              ))}

              {positions.map((character) => (
                <g key={character.id} className="map-character" style={{ transform: `translate(${character.x}px, ${character.y}px)` }}>
                  <text y={4} textAnchor="middle" className={`map-moving-symbol map-person-${character.id}`}>
                    {character.symbol}
                  </text>
                </g>
              ))}
            </svg>

            {hoveredRoom && (
              <div className="marauders-map-tooltip" style={{ left: tooltipPos.x + 18, top: tooltipPos.y + 18 }}>
                <strong>{hoveredRoom.label}</strong>
                <p>{hoveredRoom.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
