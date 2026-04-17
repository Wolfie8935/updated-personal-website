const PARTICLE_CANVAS_ID = "wizarding-particles-canvas";

const isWizardingThemeActive = () =>
  document.documentElement.classList.contains("theme-wizarding");

const randomInRange = (min, max) => min + Math.random() * (max - min);

const createParticle = (width, height, driftScale) => ({
  x: randomInRange(0, width),
  y: randomInRange(0, height),
  radius: randomInRange(0.65, 2.2),
  alpha: randomInRange(0.18, 0.58),
  driftX: randomInRange(-0.06, 0.06) * driftScale,
  driftY: randomInRange(-0.24, -0.08) * driftScale,
});

export function enableWizardingParticles(options = {}) {
  if (typeof window === "undefined") return () => {};

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedMotion =
    options.reducedMotion ?? reducedMotionQuery.matches ?? false;
  if (reducedMotion) {
    return () => {};
  }
  const maxParticles = reducedMotion ? 24 : options.maxParticles ?? 72;
  const driftScale = reducedMotion ? 0.55 : 1;

  const canvas = document.createElement("canvas");
  canvas.id = PARTICLE_CANVAS_ID;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = String(options.zIndex ?? 4);
  canvas.style.opacity = "0";
  canvas.style.transition = "opacity 180ms ease";
  canvas.style.display = "none";
  canvas.className = "wizarding-particles-canvas";

  document.body.appendChild(canvas);
  const context = canvas.getContext("2d");
  if (!context) {
    canvas.remove();
    return () => {};
  }

  let particles = [];
  let rafId = 0;
  let isDisposed = false;

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: maxParticles }, () =>
      createParticle(width, height, driftScale),
    );
  };

  const render = () => {
    if (isDisposed) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const wizardingActive = isWizardingThemeActive();

    if (!wizardingActive) {
      canvas.style.opacity = "0";
      canvas.style.display = "none";
      context.clearRect(0, 0, width, height);
      rafId = window.requestAnimationFrame(render);
      return;
    }

    canvas.style.display = "block";
    canvas.style.opacity = "1";
    context.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.driftX;
      particle.y += particle.driftY;

      if (particle.y < -8) {
        particle.y = height + randomInRange(0, 24);
        particle.x = randomInRange(0, width);
      }
      if (particle.x < -12) particle.x = width + 12;
      if (particle.x > width + 12) particle.x = -12;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(252, 226, 141, ${particle.alpha})`;
      context.shadowBlur = 10;
      context.shadowColor = "rgba(166, 133, 255, 0.45)";
      context.fill();
    });

    context.shadowBlur = 0;
    rafId = window.requestAnimationFrame(render);
  };

  resize();
  rafId = window.requestAnimationFrame(render);
  window.addEventListener("resize", resize, { passive: true });

  return () => {
    isDisposed = true;
    window.removeEventListener("resize", resize);
    window.cancelAnimationFrame(rafId);
    canvas.remove();
  };
}
