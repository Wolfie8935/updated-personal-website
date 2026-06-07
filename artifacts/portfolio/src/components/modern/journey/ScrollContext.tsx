import { createContext, useContext } from "react";

export type ScrollToFn = (target: string | HTMLElement, offset?: number) => void;

/** Native fallback used when no smooth-scroll provider is present (low/static tier). */
const nativeScrollTo: ScrollToFn = (target, offset = -80) => {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el instanceof HTMLElement) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
  }
};

/**
 * Shared anchor-scroll for the modern theme. ModernHome provides the Lenis-aware
 * scrollTo from useSmoothScroll; consumers (navbar, hero) call useScrollTo() so a
 * single scroll engine drives every in-page jump, smooth on high tier and native
 * everywhere else.
 */
export const ScrollContext = createContext<ScrollToFn>(nativeScrollTo);

export const useScrollTo = (): ScrollToFn => useContext(ScrollContext);
