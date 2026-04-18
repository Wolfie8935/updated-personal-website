import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/context/ThemeContext";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";
import { WIZARD_MOVING_PHOTO_SRC } from "@/wizarding/wizardVideo";
import "./daily-prophet.css";

const PROPHET_BYLINES = [
  "By Rita Skeeter, Special Correspondent",
  "By Barnabas Cuffe, Editor at Large",
  "By Idris Oakby, Hogwarts Bureau",
];

const BREAKING_NEWS_ITEMS = [
  "Breaking: Ministry confirms new portfolio magic standard",
  "Hogwarts Bureau: Aman Goel charms judges at Codefest",
  "Quill Watch: Competitive programming streak crosses 400 spells",
  "Special Edition: ICPC regional rank sparks celebration in Diagon Alley",
];

const TICKER_SESSION_KEY = "wizarding_dp_ticker_shown";

interface ProphetAchievement {
  icon: ReactNode;
  title: string;
  subtitle: ReactNode;
}

interface DailyProphetAchievementsProps {
  achievements: ProphetAchievement[];
}

export function useDailyProphetEnhancements(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const cards = document.querySelectorAll<HTMLElement>("[data-prophet-card]");
    cards.forEach((card, index) => {
      card.querySelectorAll("[data-prophet-byline]").forEach((node) => node.remove());
      if (index >= PROPHET_BYLINES.length) return;

      const byline = document.createElement("p");
      byline.className = "daily-prophet-byline";
      byline.setAttribute("data-prophet-byline", "true");
      byline.textContent = PROPHET_BYLINES[index];

      const target = card.querySelector<HTMLElement>("[data-prophet-card-body]");
      target?.appendChild(byline);
    });
  }, [enabled]);
}

function DailyProphetMasthead() {
  return (
    <header className="daily-prophet-masthead" aria-label="Daily Prophet masthead">
      <p className="daily-prophet-edition">Established 1743 | Wizarding Edition</p>
      <h2 className="daily-prophet-title">The Daily Prophet</h2>
      <div className="daily-prophet-meta">
        <span>Saturday Special</span>
        <span>Owl Post Price: 5 Knuts</span>
        <span>Hogwarts Dispatch</span>
      </div>
    </header>
  );
}

function DailyProphetMovingPhotoVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap || theme !== "wizarding" || reducedMotion) {
      video?.pause();
      if (video) video.removeAttribute("src");
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (theme !== "wizarding" || reducedMotion) return;
          if (e.isIntersecting) {
            if (!video.src) video.src = WIZARD_MOVING_PHOTO_SRC;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.removeAttribute("src");
            video.load();
          }
        });
      },
      { threshold: 0.2 },
    );

    obs.observe(wrap);
    return () => obs.disconnect();
  }, [theme, reducedMotion]);

  return (
    <div
      ref={wrapRef}
      className="daily-prophet-moving-photo daily-prophet-moving-photo--video"
      aria-label="Moving magical photograph"
    >
      {theme === "wizarding" && !reducedMotion ? (
        <video
          ref={videoRef}
          className="daily-prophet-moving-photo__video"
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        <div className="daily-prophet-moving-photo__fallback" aria-hidden="true" />
      )}
      <p className="daily-prophet-moving-photo__caption">Moving Photograph — Aman Goel, Class of 2026</p>
    </div>
  );
}

export function DailyProphetTicker() {
  const [visible, setVisible] = useState(() => {
    try {
      return typeof sessionStorage !== "undefined" && sessionStorage.getItem(TICKER_SESSION_KEY) !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem(TICKER_SESSION_KEY, "1");
      setVisible(false);
    }, 14000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  const dismiss = () => {
    sessionStorage.setItem(TICKER_SESSION_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="daily-prophet-ticker" role="status" aria-live="polite">
      <div className="daily-prophet-ticker-label">Breaking News</div>
      <div className="daily-prophet-ticker-track">
        <span>{BREAKING_NEWS_ITEMS.join(" \u2726 ")}</span>
        <span aria-hidden="true">{BREAKING_NEWS_ITEMS.join(" \u2726 ")}</span>
      </div>
      <button
        type="button"
        className="daily-prophet-ticker-dismiss"
        onClick={dismiss}
        aria-label="Dismiss breaking news banner"
      >
        ×
      </button>
    </div>
  );
}

export function DailyProphetAchievements({ achievements }: DailyProphetAchievementsProps) {
  useDailyProphetEnhancements(true);

  return (
    <section id="achievements" className="daily-prophet-section py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DailyProphetMasthead />
        <div className="daily-prophet-columns">
          {achievements.map((item, index) => (
            <article className="daily-prophet-card" data-prophet-card key={item.title}>
              <div data-prophet-card-body>
                {index === 0 && <DailyProphetMovingPhotoVideo />}
                <div className="daily-prophet-card-icon">{item.icon}</div>
                <h3 className="daily-prophet-card-title">{item.title}</h3>
                <p className="daily-prophet-card-subtitle">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
