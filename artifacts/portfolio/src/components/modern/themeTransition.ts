/**
 * Liquid circular theme switch.
 *
 * For the dark -> light step (a modern -> modern transition) we use the View Transitions
 * API to play a circular reveal expanding from the toggle button. For light -> wizarding we
 * fall through to a plain toggle so the wizarding theme's own cinematic intro can play. Any
 * browser without View Transitions (or with reduced motion) also just toggles plainly.
 *
 * The target classes are applied synchronously inside the transition callback so the captured
 * snapshot reflects the new theme regardless of React's async commit; toggle() then keeps the
 * React state in sync, and ThemeProvider's effect re-applies the same classes idempotently.
 */
export function toggleThemeWithTransition(
  theme: string,
  toggle: () => void,
  e: { clientX: number; clientY: number },
) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void> };
  };

  const goingModernToModern = theme === "dark"; // next theme in the cycle is "light"
  const supportsVT = typeof doc.startViewTransition === "function";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!goingModernToModern || !supportsVT || reduced) {
    toggle();
    return;
  }

  const x = e.clientX;
  const y = e.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = doc.startViewTransition!(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-wizarding");
    root.classList.add("light");
    toggle();
  });

  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});
}
