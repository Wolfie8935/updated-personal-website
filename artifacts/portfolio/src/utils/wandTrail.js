const SPARK_COLORS = ["#c9a84c", "#e8c96e", "#fff8c0"];
const STYLE_ID = "wand-trail-style";

const randomInRange = (min, max) => min + Math.random() * (max - min);
const randomInt = (min, max) => Math.floor(randomInRange(min, max + 1));
const randomPick = (items) => items[Math.floor(Math.random() * items.length)];

const isWizardingThemeActive = () =>
  document.documentElement.classList.contains("theme-wizarding");

function ensureSparkStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes sparkle-die {
      0% {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate3d(var(--dx), var(--dy), 0) scale(0.35);
      }
    }

    .wand-spark {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border-radius: 999px;
      will-change: transform, opacity;
      animation-name: sparkle-die;
      animation-timing-function: ease-out;
      animation-fill-mode: forwards;
    }
  `;

  document.head.appendChild(style);
}

function createSpark(x, y, options = {}) {
  if (!isWizardingThemeActive()) return;

  const sizeMin = options.sizeMin ?? 3;
  const sizeMax = options.sizeMax ?? 7;
  const durationMin = options.durationMin ?? 500;
  const durationMax = options.durationMax ?? 800;
  const dxMin = options.dxMin ?? -20;
  const dxMax = options.dxMax ?? 20;
  const dyMin = options.dyMin ?? -40;
  const dyMax = options.dyMax ?? -10;
  const dx = options.dx ?? randomInRange(dxMin, dxMax);
  const dy = options.dy ?? randomInRange(dyMin, dyMax);

  const spark = document.createElement("div");
  const size = randomInRange(sizeMin, sizeMax);

  spark.className = "wand-spark";
  spark.style.left = `${x - size / 2}px`;
  spark.style.top = `${y - size / 2}px`;
  spark.style.width = `${size}px`;
  spark.style.height = `${size}px`;
  spark.style.backgroundColor = randomPick(SPARK_COLORS);
  spark.style.boxShadow = "0 0 10px rgba(255, 244, 182, 0.65)";
  spark.style.setProperty("--dx", `${dx}px`);
  spark.style.setProperty("--dy", `${dy}px`);
  spark.style.animationDuration = `${randomInRange(durationMin, durationMax)}ms`;

  spark.addEventListener(
    "animationend",
    () => {
      spark.remove();
    },
    { once: true },
  );

  document.body.appendChild(spark);
}

export function enableWandTrail() {
  if (typeof window === "undefined") return () => {};

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  ensureSparkStyles();

  let rafId = null;
  let lastSparkTime = 0;
  let queuedPosition = null;
  let disposed = false;
  const clearSparkState = () => {
    queuedPosition = null;
    document.querySelectorAll(".wand-spark").forEach((node) => node.remove());
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const emitQueuedSpark = () => {
    rafId = null;
    if (disposed || reducedMotionQuery.matches || !queuedPosition || !isWizardingThemeActive()) return;

    const now = performance.now();
    if (now - lastSparkTime < 30) return;

    createSpark(queuedPosition.x, queuedPosition.y);
    lastSparkTime = now;
    queuedPosition = null;
  };

  const onMouseMove = (event) => {
    if (reducedMotionQuery.matches || !isWizardingThemeActive()) return;

    queuedPosition = { x: event.clientX, y: event.clientY };
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(emitQueuedSpark);
  };

  const onClick = (event) => {
    if (reducedMotionQuery.matches || !isWizardingThemeActive()) return;

    const count = randomInt(8, 12);
    const baseAngle = randomInRange(0, Math.PI * 2);

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + (Math.PI * 2 * i) / count;
      const distance = randomInRange(14, 30);

      createSpark(event.clientX, event.clientY, {
        sizeMin: 6,
        sizeMax: 10,
        durationMin: 260,
        durationMax: 340,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
      });
    }
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("click", onClick, { passive: true });
  const onReducedMotionChange = () => {
    if (reducedMotionQuery.matches) {
      clearSparkState();
    }
  };
  reducedMotionQuery.addEventListener("change", onReducedMotionChange);

  return () => {
    disposed = true;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("click", onClick);
    reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
    clearSparkState();
  };
}
