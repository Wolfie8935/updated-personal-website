/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";
import { EMAIL, LINKS, RESUME_URL, REPORT_FILE } from "@/components/modern/content";

/**
 * engine.ts — the imperative animation/interaction engine of the
 * "Court & Terminal" theme, ported 1:1 from the Claude Design script.
 *
 * The React tree (ModernHome + design/*) renders static markup carrying
 * data-* attributes; this class queries and drives them directly — a single
 * rAF loop owns the starfield, inertia scroll, velocity skew, hero letters,
 * throwable ball, horizontal work rail, 3D reasoning tree (canvas2d + WebGL
 * galaxy), contact wave, screensaver, cursor, and chrome. React only mounts/
 * unmounts it and relays theme changes.
 *
 * Deliberately kept in the original imperative style (not hooks) so it stays
 * diffable against the design source.
 */

export interface EngineHost {
  /** current theme is light (vs dark) */
  isLight: () => boolean;
  /** switch dark/light (persisted by ThemeContext) */
  setLight: (light: boolean) => void;
  /** enter the wizarding theme (terminal / footer easter egg) */
  setWizarding: () => void;
}

export class PortfolioEngine {
  [key: string]: any;

  props = {
    accent: "#C9A66B",
    motion: "cinematic" as "cinematic" | "calm",
    inertiaScroll: true,
    grain: true,
    screensaver: true,
  };

  constructor(host: EngineHost) {
    this._host = host;
  }

  mount() {
    this._cleanup = [];
    const $$ = (s: string) => Array.from(document.querySelectorAll(s)) as any[];

    // ---- grain texture ----
    this._grain = document.querySelector("[data-grain]");
    if (this._grain) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const x = c.getContext("2d")!;
      const im = x.createImageData(128, 128);
      for (let i = 0; i < im.data.length; i += 4) {
        const v = Math.floor(Math.random() * 255);
        im.data[i] = im.data[i + 1] = im.data[i + 2] = v;
        im.data[i + 3] = 255;
      }
      x.putImageData(im, 0, 0);
      this._grain.style.backgroundImage = "url(" + c.toDataURL() + ")";
    }

    // ---- reduced motion ----
    this._rm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    // ---- intro reveal (fired by preloader) ----
    this._introDone = false;
    this._startIntro = () => {
      if (this._introStarted) return;
      this._introStarted = true;
      const fast = this._rm;
      $$("[data-ltr]").forEach((el, i) => {
        el.style.transition = fast
          ? "none"
          : "transform 1.3s cubic-bezier(0.16,1,0.3,1) " + (0.15 + i * 0.055).toFixed(3) + "s";
        el.style.transform = "translateY(0)";
      });
      $$("[data-intro]").forEach((el) => {
        const d = fast ? 0 : parseFloat(el.dataset.intro || "0");
        el.style.transition = fast
          ? "opacity 0.3s ease"
          : "opacity 1.1s ease " + d + "s, transform 1.2s cubic-bezier(0.16,1,0.3,1) " + d + "s";
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        if (el.dataset.decode !== undefined && !fast) setTimeout(() => this._decode(el), d * 1000 + 200);
      });
      const freeTimer = setTimeout(
        () => {
          this._introDone = true;
          $$("[data-ltr]").forEach((el) => {
            el.style.transition = "none";
          });
          $$("[data-lclip]").forEach((el) => {
            el.style.overflow = "visible";
          });
        },
        fast ? 400 : 2750,
      );
      this._cleanup.push(() => clearTimeout(freeTimer));
    };
    this._initPreloader();

    // ---- scroll reveals (land with weight) + counters + decode ----
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as any;
          const d = parseFloat(el.dataset.rd || "0") * 0.12;
          el.style.transition =
            "opacity 0.9s ease " + d.toFixed(2) + "s, transform 1.1s cubic-bezier(0.34,1.45,0.64,1) " + d.toFixed(2) + "s";
          el.style.opacity = "1";
          el.style.transform = "none";
          el._revealed = true;
          const counter = el.querySelector("[data-count]") || (el.dataset.count !== undefined ? el : null);
          if (counter) this._countUp(counter);
          if (el.dataset.decode !== undefined) setTimeout(() => this._decode(el), d * 1000 + 150);
          io.unobserve(el);
        });
      },
      { threshold: 0.18 },
    );
    $$("[data-reveal]").forEach((el) => io.observe(el));
    this._cleanup.push(() => io.disconnect());

    // ---- cached nodes ----
    this._glow = document.querySelector("[data-glow]");
    this._bar = document.querySelector("[data-bar]");
    this._pagewrap = document.querySelector("[data-pagewrap]");
    this._heroc = document.querySelector("[data-heroc]");
    this._mag = document.querySelector("[data-mag]");
    this._hwrap = document.querySelector("[data-hwrap]");
    this._htrack = document.querySelector("[data-htrack]");
    this._hcount = document.querySelector("[data-hcount]");
    this._doorcue = document.querySelector("[data-doorcue]");
    this._cineT = document.querySelector('[data-cine="t"]');
    this._cineB = document.querySelector('[data-cine="b"]');
    this._hhead = document.querySelector("[data-hhead]");
    this._wcards = $$("[data-wcard]").map((el) => ({ el, ly: 0 }));
    this._wordwrap = document.querySelector("[data-wordwrap]");
    this._words = $$("[data-w]");
    this._plx = $$("[data-plx]").map((el) => ({ el, speed: parseFloat(el.dataset.plx) }));
    this._chip = document.querySelector("[data-chip]");
    this._cwrap = document.querySelector("[data-cwrap]");
    this._cm1 = document.querySelector('[data-cm="1"]');
    this._cm2 = document.querySelector('[data-cm="2"]');
    this._cmfade = document.querySelector("[data-cmfade]");
    this._cphoto = document.querySelector("[data-cphoto]");
    this._cta = document.querySelector("[data-cta]");
    this._ctain = document.querySelector("[data-ctain]");
    this._hfades = $$("[data-hfade]");
    this._mqs = $$("[data-mq]").map((el) => ({ el, dir: parseFloat(el.dataset.mq), pos: 0, half: 0 }));
    this._gravs = $$("[data-grav]").map((el) => ({ el, x: 0, y: 0 }));
    this._cdot = document.querySelector("[data-cdot]");
    this._cring = document.querySelector("[data-cring]");
    this._cdecoded = false;

    // ---- measure ----
    const measure = () => {
      const y = window.scrollY;
      this._plx.forEach((p: any) => {
        p.el.style.transform = "none";
        const r = p.el.getBoundingClientRect();
        p.top = r.top + y;
        p.h = r.height;
      });
      this._mqs.forEach((m: any) => {
        m.half = m.el.scrollWidth / 2;
      });
    };
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    const onResize = () => {
      measure();
      this._sizeTree();
      this._sizeStars();
      if (this._measureExp) this._measureExp();
    };
    window.addEventListener("resize", onResize);
    this._cleanup.push(() => window.removeEventListener("resize", onResize));

    // ---- mouse ----
    this._mx = window.innerWidth / 2;
    this._my = window.innerHeight / 2;
    this._pmx = this._mx;
    this._pmy = this._my;
    this._gx = this._mx;
    this._gy = this._my;
    this._chx = this._mx;
    this._chy = this._my;
    this._ctax = 0;
    this._ctay = 0;
    this._cshow = false;
    const onMove = (e: MouseEvent) => {
      this._mx = e.clientX;
      this._my = e.clientY;
      this._cshow = true;
    };
    window.addEventListener("mousemove", onMove);
    this._cleanup.push(() => window.removeEventListener("mousemove", onMove));

    // ---- cursor hover state ----
    this._chover = false;
    const onOver = (e: Event) => {
      const t = e.target as any;
      this._chover = !!(t && t.closest && t.closest("a, button, [data-tilt], [data-rrow], [data-tree], [data-orb], [data-wcard]"));
    };
    document.addEventListener("mouseover", onOver);
    this._cleanup.push(() => document.removeEventListener("mouseover", onOver));
    this._fine = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
    this._crx = this._mx;
    this._cry = this._my;
    this._crvx = 0;
    this._crvy = 0;

    // ---- recognition rows ----
    $$("[data-rrow]").forEach((row) => {
      const rank = row.querySelector("[data-rrank]");
      const enter = () => {
        row.style.paddingLeft = "44px";
        row.style.background = "linear-gradient(90deg, rgba(201,166,107,0.05), transparent 60%)";
        if (rank) rank.style.transform = "translateX(6px) scale(1.06)";
        if (this._chip) {
          this._chip.textContent = row.dataset.tag || "";
          this._chip.style.opacity = "1";
        }
      };
      const leave = () => {
        row.style.paddingLeft = "22px";
        row.style.background = "transparent";
        if (rank) rank.style.transform = "none";
        if (this._chip) this._chip.style.opacity = "0";
      };
      row.addEventListener("mouseenter", enter);
      row.addEventListener("mouseleave", leave);
      this._cleanup.push(() => {
        row.removeEventListener("mouseenter", enter);
        row.removeEventListener("mouseleave", leave);
      });
    });

    // ---- capability tilt cards ----
    $$("[data-tilt]").forEach((card) => {
      const glare = card.querySelector("[data-glare]");
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const mo = this._rm ? 0 : this.props.motion === "calm" ? 0.4 : 1;
        card.style.transition = "transform 0.16s ease-out";
        card.style.transform =
          "perspective(1000px) rotateX(" +
          ((0.5 - py) * 9 * mo).toFixed(2) +
          "deg) rotateY(" +
          ((px - 0.5) * 11 * mo).toFixed(2) +
          "deg) translateY(-4px)";
        if (glare) {
          const ac = this.props.accent;
          glare.style.background =
            "radial-gradient(circle at " + (px * 100).toFixed(1) + "% " + (py * 100).toFixed(1) + "%, " + ac + "1F, transparent 55%)";
          glare.style.opacity = "1";
        }
      };
      const leave = () => {
        card.style.transition = "transform 0.7s cubic-bezier(0.16,1,0.3,1)";
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
        if (glare) glare.style.opacity = "0";
      };
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      this._cleanup.push(() => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    });

    // ---- live clock ----
    const clockEl = document.querySelector("[data-clock]");
    if (clockEl) {
      const tick = () => {
        try {
          clockEl.textContent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" }) + " IST";
        } catch {
          clockEl.textContent = new Date().toLocaleTimeString("en-GB") + " LOCAL";
        }
      };
      tick();
      const iv = setInterval(tick, 1000);
      this._cleanup.push(() => clearInterval(iv));
    }

    // ---- physics subsystems ----
    this._initScrollEngine();
    this._initStars();
    this._initLetters();
    this._initOrb();
    this._initTree();
    this._initExpBall();
    this._initContact();
    this._initMobileMenu();
    this._initSpy();
    this._initSaver();
    this._initCase();
    this._initEggs();
    this._initTilt();

    // ---- theme (dark / light via ThemeContext) ----
    {
      const tt = document.querySelector("[data-themetoggle]");
      if (tt) {
        const h = () => {
          const r = tt.getBoundingClientRect();
          this._wipeTheme(r.left + r.width / 2, r.top + r.height / 2);
        };
        tt.addEventListener("click", h);
        this._cleanup.push(() => tt.removeEventListener("click", h));
      }
      const wiz = document.querySelector("[data-wizhint]");
      if (wiz) {
        const h = () => this._host.setWizarding();
        wiz.addEventListener("click", h);
        this._cleanup.push(() => wiz.removeEventListener("click", h));
      }
      this._applyThemeMode(this._host.isLight());
    }

    // ---- master rAF loop ----
    this._hp = 0;
    this._skew = 0;
    this._lastTX = 0;
    this._lastT = performance.now();
    const loop = (time: number) => {
      const dt = Math.min(Math.max((time - this._lastT) / 1000, 0.008), 0.034);
      this._lastT = time;
      // fps auto-degrade (one-way)
      this._fpsE = (this._fpsE || 60) * 0.96 + (1 / dt) * 0.04;
      if (!this._perfLow) {
        this._lowT = this._introDone && this._fpsE < 44 ? (this._lowT || 0) + dt : 0;
        if (this._lowT > 2.2) {
          this._perfLow = true;
          if (this._starsArr && this._starsArr.length > 110) this._starsArr.length = 110;
          if (this._tdust && this._tdust.length > 28) this._tdust.length = 28;
          this._sizeStars();
          this._sizeTree();
        }
      }
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const mo = this._rm ? 0 : this.props.motion === "calm" ? 0.4 : 1;

      // inertia scroll step
      const cur = window.scrollY;
      if (this.props.inertiaScroll && Math.abs(this._starget - cur) > 0.5) {
        const nxt = cur + (this._starget - cur) * 0.105;
        this._sexpect = nxt;
        window.scrollTo(0, nxt);
      }
      const y = window.scrollY;
      const rawV = y - (this._lastY === undefined ? y : this._lastY);
      this._lastY = y;
      this._sv = this._sv || 0;
      this._sv += (rawV - this._sv) * 0.16;
      const svn = Math.max(Math.min(this._sv / vh, 1.2), -1.2);

      // cursor velocity
      const cvx = this._mx - this._pmx,
        cvy = this._my - this._pmy;
      this._pmx = this._mx;
      this._pmy = this._my;
      void cvx;
      void cvy;

      // progress bar
      if (this._bar) {
        const total = document.documentElement.scrollHeight - vh;
        this._bar.style.width = (total > 0 ? (y / total) * 100 : 0) + "%";
      }

      // glass nav + scroll-spy
      this._stepChrome(y);

      // velocity skew on page
      if (this._pagewrap) {
        const target = Math.max(Math.min(svn * 5.2 * mo, 2.2), -2.2);
        this._skew += (target - this._skew) * 0.12;
        this._pagewrap.style.transform = Math.abs(this._skew) > 0.02 ? "skewY(" + this._skew.toFixed(3) + "deg)" : "none";
      }

      // starfield
      this._drawStars(dt, svn, mo);

      // hero drift + fades
      const hp = Math.min(Math.max(y / vh, 0), 1);
      if (this._heroc) this._heroc.style.transform = "translateY(" + hp * 90 * mo + "px)";
      this._hfades.forEach((el: any) => {
        if (y > 1) {
          el._hf = true;
          el.style.opacity = String(Math.max(1 - hp * 1.6, 0));
        } else if (el._hf) el.style.opacity = "1";
      });
      if (this._mag) {
        const dx = (this._mx - vw / 2) / vw;
        const dy = (this._my - vh / 2) / vh;
        this._mag.style.transform = "translate(" + dx * -18 * mo + "px," + dy * -12 * mo + "px)";
      }

      // hero letters: shatter (scroll) + springs (hover)
      this._stepLetters(dt, hp, svn, mo);

      // parallax layers
      const center = y + vh / 2;
      this._plx.forEach((p: any) => {
        if (p.top === undefined) return;
        const off = (p.top + p.h / 2 - center) * p.speed * mo;
        p.el.style.transform = "translateY(" + -off + "px)";
      });

      // marquees react to scroll velocity
      this._mqs.forEach((m: any) => {
        if (!m.half) return;
        if (!this._rm) m.pos -= (m.dir * 42 + this._sv * 9 * m.dir) * dt * (0.6 + 0.4 * mo);
        while (m.pos < -m.half) m.pos += m.half;
        while (m.pos > 0) m.pos -= m.half;
        m.el.style.transform = "translate3d(" + m.pos.toFixed(1) + "px,0,0)";
        if (m.dir < 0 && !this._rm) {
          const kw = 300 + Math.round(Math.min(Math.abs(this._sv) * 2.6, 400) / 20) * 20;
          if (kw !== m.kw) {
            m.kw = kw;
            m.el.style.fontWeight = String(kw);
          }
        }
      });

      // works rail: settle → inertial horizontal drift → final panel expands full-bleed
      if (this._hwrap && this._htrack) {
        const r = this._hwrap.getBoundingClientRect();
        const total = this._hwrap.offsetHeight - vh;
        const p = Math.min(Math.max(-r.top / total, 0), 1);
        // heavy inertia — the rail floats behind the scroll
        this._hp += (p - this._hp) * (this._rm ? 1 : 0.055);
        const hpr = this._hp;
        const pA = Math.min(hpr / 0.14, 1);
        const eA = 1 - Math.pow(1 - pA, 3);
        const pB = Math.min(Math.max((hpr - 0.14) / 0.6, 0), 1);
        const eB = pB < 0.5 ? 2 * pB * pB : 1 - Math.pow(-2 * pB + 2, 2) / 2; // easeInOutQuad — starts soft, lands soft
        const pC = Math.min(Math.max((hpr - 0.8) / 0.2, 0), 1);
        const eC = 1 - Math.pow(1 - pC, 3);
        const last = this._wcards.length ? this._wcards[this._wcards.length - 1].el : null;
        const max = this._htrack.scrollWidth - vw;
        // phase C keeps the last card centered while it expands
        let tx = -eB * max;
        if (last && pC > 0) {
          const endTx = -(last.offsetLeft - (vw - last.offsetWidth) / 2);
          tx = -max + (endTx - -max) * eC;
        }
        const sc = 1.35 - 0.35 * eA;
        const rot = -6 * (1 - eA);
        this._htrack.style.transformOrigin = "30vw 50%";
        this._htrack.style.transform =
          "translate3d(" + tx.toFixed(1) + "px,0,0) scale(" + sc.toFixed(4) + ") rotate(" + rot.toFixed(3) + "deg)";
        if (this._hhead) this._hhead.style.opacity = String(eA * (1 - eC));
        const tvx = tx - this._lastTX;
        this._lastTX = tx;
        // velocity skew — cards lean into the motion, each with its own lag
        this._wcards.forEach((c: any, i: number) => {
          const isLast = i === this._wcards.length - 1;
          const target = Math.max(Math.min(tvx * (0.1 + i * 0.09) * mo, 22), -22);
          c.ly += (target - c.ly) * 0.1;
          const skT = Math.max(Math.min(-tvx * 0.05 * mo, 3.4), -3.4);
          c.sk = (c.sk || 0) + (skT - c.sk) * (0.06 + i * 0.025);
          let tf =
            "translateY(" + (c.ly * (1 - eC * (isLast ? 1 : 0))).toFixed(1) + "px) skewX(" + (c.sk * (1 - eC)).toFixed(2) + "deg)";
          if (isLast && pC > 0) {
            // full-bleed expansion — undo the settle scale so it lands exactly on the viewport
            const w = c.el.offsetWidth,
              h = c.el.offsetHeight;
            const gx = 1 + (vw / w - 1) * eC;
            const gy = 1 + (vh / h - 1) * eC;
            tf =
              "translateY(" + (c.ly * (1 - eC)).toFixed(1) + "px) scale(" + (gx / sc).toFixed(4) + "," + (gy / sc).toFixed(4) + ")";
            c.el.style.borderColor = "rgba(201,166,107," + (0.45 * (1 - eC)).toFixed(3) + ")";
            c.el.style.zIndex = "2";
          }
          c.el.style.transform = tf;
        });
        // neighbors fall back as the finale takes the stage
        if (pC > 0 || this._csFaded) {
          this._csFaded = pC > 0;
          this._wcards.forEach((c: any, i: number) => {
            if (i < this._wcards.length - 1) c.el.style.opacity = String(1 - eC * 0.85);
          });
        }
        if (this._cineT) {
          const cb = eA * (1 - eC);
          this._cineT.style.transform = "translateY(" + ((cb - 1) * 101).toFixed(1) + "%)";
          this._cineB.style.transform = "translateY(" + ((1 - cb) * 101).toFixed(1) + "%)";
        }
        if (this._doorcue) this._doorcue.style.opacity = String(Math.max(eC * 2 - 1, 0));
        if (this._hcount) {
          const idx = Math.min(3, Math.max(1, Math.round(eB * 2) + 1));
          const txt = "0" + idx;
          if (this._hcount.textContent !== txt) this._hcount.textContent = txt;
        }
      }

      // about word brighten
      if (this._wordwrap && this._words.length) {
        const r = this._wordwrap.getBoundingClientRect();
        const p = Math.min(Math.max((vh * 0.9 - r.top) / (r.height + vh * 0.4), 0), 1);
        const n = this._words.length;
        this._words.forEach((w: any, i: number) => {
          const t = Math.min(Math.max(p * (n + 6) - i, 0), 1);
          w.style.opacity = String(0.13 + 0.87 * t);
        });
      }

      // contact mask reveal
      if (this._cwrap) {
        const r = this._cwrap.getBoundingClientRect();
        const total = this._cwrap.offsetHeight - vh;
        const p = Math.min(Math.max(-r.top / total, 0), 1);
        const ease = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
        const p1 = ease((p - 0.02) / 0.32);
        const p2 = ease((p - 0.16) / 0.34);
        const p3 = ease((p - 0.42) / 0.3);
        if (this._cm1) {
          this._cm1.style.clipPath = "inset(0 0 " + ((1 - p1) * 100).toFixed(2) + "% 0)";
          this._cm1.style.transform = "translateY(" + (1 - p1) * 50 + "px)";
        }
        if (this._cm2) {
          this._cm2.style.clipPath = "inset(0 0 " + ((1 - p2) * 100).toFixed(2) + "% 0)";
          this._cm2.style.transform = "translateY(" + (1 - p2) * 50 + "px)";
        }
        if (this._cmfade) {
          this._cmfade.style.opacity = String(p3);
          this._cmfade.style.transform = "translateY(" + (1 - p3) * 40 + "px)";
        }
        if (this._cphoto) this._cphoto.style.opacity = (ease((p - 0.1) / 0.5) * 0.09).toFixed(3);
        if (!this._cdecoded && p > 0.05) {
          this._cdecoded = true;
          const d2 = document.querySelector("[data-decode2]");
          if (d2) this._decode(d2);
        }
      }

      // magnetic CTA
      if (this._cta) {
        const r = this._cta.getBoundingClientRect();
        let tx2 = 0,
          ty2 = 0,
          sc2 = 1;
        if (r.top < vh && r.bottom > 0) {
          const cx = r.left + r.width / 2,
            cy = r.top + r.height / 2;
          const dx = this._mx - cx,
            dy = this._my - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < 240) {
            tx2 = dx * 0.3;
            ty2 = dy * 0.3;
            sc2 = 1.06;
          }
        }
        this._ctax += (tx2 - this._ctax) * 0.12;
        this._ctay += (ty2 - this._ctay) * 0.12;
        this._cta.style.transform = "translate(" + this._ctax.toFixed(1) + "px," + this._ctay.toFixed(1) + "px) scale(" + sc2 + ")";
        if (this._ctain)
          this._ctain.style.transform = "translate(" + (this._ctax * 0.35).toFixed(1) + "px," + (this._ctay * 0.35).toFixed(1) + "px)";
      }

      // gravity wells
      this._gravs.forEach((g: any) => {
        const r = g.el.getBoundingClientRect();
        if (r.width === 0) return;
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        const dx = this._mx - cx,
          dy = this._my - cy;
        const d = Math.hypot(dx, dy);
        let tx3 = 0,
          ty3 = 0;
        if (d < 150 && d > 0.1) {
          const pull = (1 - d / 150) * 9 * mo;
          tx3 = (dx / d) * pull;
          ty3 = (dy / d) * pull;
        }
        g.x += (tx3 - g.x) * 0.14;
        g.y += (ty3 - g.y) * 0.14;
        g.el.style.transform = Math.abs(g.x) + Math.abs(g.y) > 0.1 ? "translate(" + g.x.toFixed(1) + "px," + g.y.toFixed(1) + "px)" : "none";
      });

      // cursor glow + chip
      if (this._glow) {
        this._gx += (this._mx - this._gx) * 0.07;
        this._gy += (this._my - this._gy) * 0.07;
        this._glow.style.transform = "translate(" + (this._gx - 320) + "px," + (this._gy - 320) + "px)";
      }
      if (this._chip) {
        this._chx += (this._mx - this._chx) * 0.18;
        this._chy += (this._my - this._chy) * 0.18;
        this._chip.style.transform = "translate(" + (this._chx + 22) + "px," + (this._chy - 40) + "px)";
      }

      // elastic cursor
      if (this._fine && this._cdot && this._cring && this._cshow) {
        this._cdot.style.opacity = "1";
        this._cring.style.opacity = "1";
        this._cdot.style.transform = "translate(" + (this._mx - 3) + "px," + (this._my - 3) + "px)";
        this._crvx += (this._mx - this._crx) * 0.26;
        this._crvx *= 0.68;
        this._crvy += (this._my - this._cry) * 0.26;
        this._crvy *= 0.68;
        this._crx += this._crvx;
        this._cry += this._crvy;
        const spd = Math.hypot(this._crvx, this._crvy);
        const stretch = Math.min(spd * 0.011, 0.5) * mo;
        const ang = Math.atan2(this._crvy, this._crvx);
        const hs = this._chover ? 1.55 : 1;
        this._cring.style.transform =
          "translate(" +
          (this._crx - 19) +
          "px," +
          (this._cry - 19) +
          "px) rotate(" +
          ang.toFixed(3) +
          "rad) scale(" +
          ((1 + stretch) * hs).toFixed(3) +
          "," +
          ((1 - stretch * 0.55) * hs).toFixed(3) +
          ")";
        this._cring.style.background = this._chover ? "rgba(201,166,107,0.08)" : "transparent";
      }

      // orb physics
      this._stepOrb(dt);

      // experience ball + contact letter wave
      this._stepExp();
      this._stepMail(dt);

      // idle screensaver
      this._stepSaver(dt);

      // 3D tree
      this._drawTree(time);

      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
    this._cleanup.push(() => cancelAnimationFrame(this._raf));

    this._applyTheme();
  }

  unmount() {
    (this._cleanup || []).forEach((f: () => void) => f());
    this._cleanup = [];
    if (this._gameOn) this._endGame();
    document.documentElement.style.overflow = "";
  }

  // ================= INERTIA SCROLL =================
  _initScrollEngine() {
    this._starget = window.scrollY;
    this._sexpect = -1;
    const onWheel = (e: WheelEvent) => {
      if (this._rm || this._plActive || this._ovOpen || !this.props.inertiaScroll) return;
      if (e.ctrlKey) return;
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;
      else if (e.deltaMode === 2) d *= window.innerHeight;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      this._starget = Math.min(Math.max(this._starget + d, 0), max);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    this._cleanup.push(() => window.removeEventListener("wheel", onWheel));
    const onScroll = () => {
      if (Math.abs(window.scrollY - this._sexpect) > 2) this._starget = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this._cleanup.push(() => window.removeEventListener("scroll", onScroll));
    const onClick = (e: MouseEvent) => {
      const t = e.target as any;
      const a = t && t.closest && t.closest('a[href^="#"]');
      if (!a) return;
      const el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      const max = document.documentElement.scrollHeight - window.innerHeight;
      this._starget = Math.min(Math.max(el.getBoundingClientRect().top + window.scrollY, 0), max);
    };
    document.addEventListener("click", onClick);
    this._cleanup.push(() => document.removeEventListener("click", onClick));
  }

  // ================= STARFIELD =================
  _initStars() {
    this._scanvas = document.querySelector("[data-stars]");
    if (!this._scanvas) return;
    this._sctx = this._scanvas.getContext("2d");
    this._starsArr = [];
    for (let i = 0; i < 220; i++) {
      this._starsArr.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 0.05 + Math.random() * 0.95,
        gold: Math.random() < 0.16,
        px: null,
        py: null,
      });
    }
    this._burst = [];
    this._sizeStars();
  }

  _sizeStars() {
    if (!this._scanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, this._perfLow ? 1 : 1.5);
    this._scanvas.width = Math.max(1, Math.round(window.innerWidth * dpr));
    this._scanvas.height = Math.max(1, Math.round(window.innerHeight * dpr));
    this._sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._sw = window.innerWidth;
    this._sh = window.innerHeight;
  }

  _spawnBurst(x: number, y: number, dir: number) {
    for (let i = 0; i < 7; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 180;
      this._burst.push({
        x,
        y,
        vx: Math.cos(a) * sp * 0.5,
        vy: Math.sin(a) * sp * 0.4 + dir * (60 + Math.random() * 120),
        life: 1,
      });
    }
    if (this._burst.length > 240) this._burst.splice(0, this._burst.length - 240);
  }

  _drawStars(dt: number, svn: number, mo: number) {
    if (!this._sctx) return;
    const ctx = this._sctx;
    const W = this._sw,
      H = this._sh;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2,
      cy = H / 2;
    const dz = (0.016 + svn * 0.3) * dt * (0.5 + 0.5 * mo);
    const parx = (this._mx - cx) * 0.018,
      pary = (this._my - cy) * 0.018;
    const ac = this.props.accent;
    const ink = this._ink || "#EAE4D8";
    this._starsArr.forEach((s: any) => {
      s.z -= dz;
      if (s.z <= 0.04) {
        s.z = 1;
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.px = null;
      } else if (s.z > 1) {
        s.z = 0.04 + (s.z - 1);
        s.x = (Math.random() - 0.5) * 2;
        s.y = (Math.random() - 0.5) * 2;
        s.px = null;
      }
      const k = 1 / s.z;
      const sx = cx + s.x * k * cx * 0.62 + parx * (1 - s.z);
      const sy = cy + s.y * k * cy * 0.62 + pary * (1 - s.z);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) {
        s.px = null;
        return;
      }
      const size = (1 - s.z) * 1.9 + 0.2;
      const a = (1 - s.z) * 0.5 + 0.04;
      if (s.px !== null && Math.abs(svn) > 0.06) {
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = s.gold ? ac : ink;
        ctx.globalAlpha = a * 0.8;
        ctx.lineWidth = size;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? ac : ink;
        ctx.globalAlpha = a;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      s.px = sx;
      s.py = sy;
    });
    // letter-shatter dust
    for (let i = this._burst.length - 1; i >= 0; i--) {
      const b = this._burst[i];
      b.life -= dt * 0.8;
      if (b.life <= 0) {
        this._burst.splice(i, 1);
        continue;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy *= 0.995;
      b.vx *= 0.995;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 1.6 * b.life + 0.3, 0, Math.PI * 2);
      ctx.fillStyle = ac;
      ctx.globalAlpha = b.life * 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // ================= HERO LETTERS =================
  _initLetters() {
    const frac = (n: number) => n - Math.floor(n);
    this._lts = Array.from(document.querySelectorAll("[data-ltr]")).map((el, i) => ({
      el,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r1: frac(Math.sin((i + 1) * 127.1) * 43758.5453),
      r2: frac(Math.sin((i + 1) * 269.5) * 98765.4321),
    }));
    this._lastShat = 0;
    this._lts.forEach((lt: any) => {
      const enter = () => {
        if (!this._introDone) return;
        const r = lt.el.getBoundingClientRect();
        const cx = r.left + r.width / 2,
          cy = r.top + r.height / 2;
        const dx = cx - this._mx,
          dy = cy - this._my;
        const d = Math.hypot(dx, dy) || 1;
        lt.vx += (dx / d) * 260 + (Math.random() - 0.5) * 140;
        lt.vy += (dy / d) * 260 - 120;
      };
      lt.el.addEventListener("mouseenter", enter);
      this._cleanup.push(() => lt.el.removeEventListener("mouseenter", enter));
    });
  }

  _stepLetters(dt: number, hp: number, svn: number, mo: number) {
    if (!this._lts || !this._introDone || this._rm) return;
    const raw = Math.min(Math.max((hp - 0.08) / 0.5, 0), 1);
    const e2 = raw * raw * (3 - 2 * raw);
    // particle burst on crossing the shatter threshold
    if (e2 > 0.42 !== this._lastShat > 0.42 && Math.abs(svn) > 0.01) {
      const dir = svn > 0 ? -1 : 1;
      this._lts.forEach((lt: any) => {
        const r = lt.el.getBoundingClientRect();
        if (r.width > 0 && r.top > -100 && r.top < window.innerHeight + 100)
          this._spawnBurst(r.left + r.width / 2, r.top + r.height / 2, dir);
      });
    }
    this._lastShat = e2;
    const k = 110,
      c = 9;
    this._lts.forEach((lt: any) => {
      lt.vx += (-k * lt.x - c * lt.vx) * dt;
      lt.vy += (-k * lt.y - c * lt.vy) * dt;
      lt.x += lt.vx * dt;
      lt.y += lt.vy * dt;
      const offX = (lt.r1 - 0.5) * 2 * 460 * e2 * mo;
      const offY = (-(lt.r2 * 340) - 80) * e2 * mo;
      const rot = (lt.r1 - 0.5) * 170 * e2 * mo;
      const op = Math.max(1 - e2 * 1.25, 0);
      lt.el.style.transform = "translate(" + (lt.x + offX).toFixed(1) + "px," + (lt.y + offY).toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg)";
      lt.el.style.opacity = String(op);
      lt.el.style.filter = e2 > 0.03 ? "blur(" + (e2 * 6).toFixed(1) + "px)" : "none";
    });
  }

  // ================= THROWABLE BALL =================
  _initOrb() {
    this._orb = document.querySelector("[data-orb]");
    this._orbLabel = document.querySelector("[data-orblabel]");
    if (!this._orb) return;
    this._hero = document.getElementById("top");
    const w = this._hero.offsetWidth,
      h = this._hero.offsetHeight;
    this._ob = { x: w * 0.8, y: h * 0.3, vx: 0, vy: 0, rot: 0, drag: false, r: 32, touched: false, lpx: 0, lpy: 0 };
    const el = this._orb;
    const down = (e: PointerEvent) => {
      e.preventDefault();
      const hr = this._hero.getBoundingClientRect();
      this._ob.drag = true;
      this._ob.touched = true;
      this._ob.vx = 0;
      this._ob.vy = 0;
      this._ob.lpx = e.clientX;
      this._ob.lpy = e.clientY;
      this._ob.x = e.clientX - hr.left;
      this._ob.y = e.clientY - hr.top;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      if (this._orbLabel) this._orbLabel.style.opacity = "0";
    };
    const move = (e: PointerEvent) => {
      if (!this._ob.drag) return;
      const hr = this._hero.getBoundingClientRect();
      this._ob.x = e.clientX - hr.left;
      this._ob.y = e.clientY - hr.top;
      this._ob.vx = this._ob.vx * 0.5 + (e.clientX - this._ob.lpx) * 34;
      this._ob.vy = this._ob.vy * 0.5 + (e.clientY - this._ob.lpy) * 34;
      this._ob.lpx = e.clientX;
      this._ob.lpy = e.clientY;
    };
    const up = () => {
      this._ob.drag = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    this._cleanup.push(() => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    });
  }

  _stepOrb(dt: number) {
    if (!this._orb || !this._ob || !this._hero) return;
    const hr = this._hero.getBoundingClientRect();
    if (hr.bottom < -60) return;
    const o = this._ob;
    const w = this._hero.offsetWidth,
      h = this._hero.offsetHeight;
    this._tiltX = (this._tiltX || 0) + ((this._tiltTX || 0) - (this._tiltX || 0)) * 0.08;
    this._tiltY = (this._tiltY || 0) + ((this._tiltTY || 0) - (this._tiltY || 0)) * 0.08;
    if (!o.drag) {
      o.vy += (1650 + this._tiltY * 950) * dt;
      o.vx += this._tiltX * 1300 * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      if (o.y > h - o.r) {
        o.y = h - o.r;
        o.vy *= -0.7;
        o.vx *= 0.985;
        if (Math.abs(o.vy) < 45) o.vy = 0;
      }
      if (o.y < o.r) {
        o.y = o.r;
        o.vy *= -0.7;
      }
      if (o.x > w - o.r) {
        o.x = w - o.r;
        o.vx *= -0.72;
      }
      if (o.x < o.r) {
        o.x = o.r;
        o.vx *= -0.72;
      }
      if (o.y >= h - o.r - 0.5) o.vx *= 0.994;
    }
    // ball ↔ hero letters (kinetic type)
    if (this._lts && this._introDone && !this._rm && this._lastShat < 0.2) {
      const bx = hr.left + o.x,
        by = hr.top + o.y;
      const sp = Math.hypot(o.vx, o.vy);
      if (sp > 130 || o.drag) {
        const now = performance.now();
        this._lts.forEach((lt: any) => {
          if (lt.cool && lt.cool > now) return;
          const r2 = lt.el.getBoundingClientRect();
          if (!r2.width) return;
          if (bx > r2.left - o.r && bx < r2.right + o.r && by > r2.top - o.r && by < r2.bottom + o.r) {
            const cx2 = r2.left + r2.width / 2,
              cy2 = r2.top + r2.height / 2;
            const dx = cx2 - bx,
              dy = cy2 - by;
            const d = Math.hypot(dx, dy) || 1;
            const kick = Math.min(Math.max(sp, 280), 900);
            lt.vx += (dx / d) * kick * 0.5 + o.vx * 0.2;
            lt.vy += (dy / d) * kick * 0.4 + o.vy * 0.16 - 70;
            lt.cool = now + 260;
            this._spawnBurst(cx2, cy2, -1);
            if (!o.drag) {
              o.vx *= 0.85;
              o.vy *= 0.85;
            }
          }
        });
      }
    }
    o.rot += (o.vx * dt) / o.r;
    this._orb.style.transform = "translate(" + (o.x - o.r).toFixed(1) + "px," + (o.y - o.r).toFixed(1) + "px) rotate(" + o.rot.toFixed(3) + "rad)";
    if (this._orbLabel && !o.touched) {
      this._orbLabel.style.transform = "translate(" + (o.x - 34).toFixed(1) + "px," + (o.y + o.r + 14).toFixed(1) + "px)";
    }
  }

  // ================= EXPERIENCE BALL =================
  _initExpBall() {
    this._exp = document.querySelector("[data-exprows]");
    this._expPath = document.querySelector("[data-exppath]");
    this._expBall = document.querySelector("[data-expball]");
    this._expSvg = document.querySelector("[data-expsvg]");
    if (!this._exp || !this._expPath || !this._expBall) return;
    this._expDots = [];
    this._expP = 0;
    this._measureExp = () => {
      const rows = Array.from(this._exp.querySelectorAll("[data-exprow]")) as any[];
      if (!rows.length) return;
      const railX = 44;
      const pts = [{ x: railX, y: 4 }];
      rows.forEach((row) => {
        pts.push({ x: railX, y: row.offsetTop + row.offsetHeight * 0.55 });
      });
      let d = "M " + pts[0].x + " " + pts[0].y;
      for (let i = 1; i < pts.length; i++) {
        const bulge = i % 2 === 0 ? -24 : 56;
        d += " Q " + (railX + bulge) + " " + ((pts[i - 1].y + pts[i].y) / 2).toFixed(1) + " " + pts[i].x + " " + pts[i].y.toFixed(1);
      }
      this._expPath.setAttribute("d", d);
      this._expLen = this._expPath.getTotalLength();
      this._expPath.style.strokeDasharray = String(this._expLen);
      this._expPath.style.strokeDashoffset = String(this._expLen);
      this._expDots.forEach((c: any) => c.remove());
      this._expDots = pts.slice(1).map((p) => {
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("cx", String(p.x));
        c.setAttribute("cy", String(p.y));
        c.setAttribute("r", "3.2");
        c.setAttribute("fill", this.props.accent);
        c.style.opacity = "0.15";
        c.style.transition = "opacity 0.4s";
        this._expSvg.appendChild(c);
        return c;
      });
      this._expPts = pts;
    };
    this._measureExp();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => this._measureExp && this._measureExp());
  }

  _stepExp() {
    if (!this._exp || !this._expLen) return;
    const r = this._exp.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -80 || r.top > vh + 80) return;
    const p = Math.min(Math.max((vh * 0.72 - r.top) / r.height, 0), 1);
    this._expP += (p - this._expP) * 0.1;
    const pe = this._expP;
    this._expPath.style.strokeDashoffset = String(this._expLen * (1 - pe));
    const pt = this._expPath.getPointAtLength(this._expLen * pe);
    let sq = 1;
    (this._expPts || []).slice(1).forEach((lp: any, i: number) => {
      const d = Math.abs(pt.y - lp.y);
      if (d < 18) sq = Math.min(sq, 0.72 + (d / 18) * 0.28);
      if (this._expDots && this._expDots[i]) this._expDots[i].style.opacity = pt.y > lp.y - 6 ? "0.95" : "0.15";
    });
    this._expBall.style.opacity = pe > 0.004 ? "1" : "0";
    this._expBall.style.transform =
      "translate(" + (pt.x - 7.5).toFixed(1) + "px," + (pt.y - 7.5).toFixed(1) + "px) scale(" + (2 - sq).toFixed(2) + "," + sq.toFixed(2) + ")";
  }

  // ================= CONTACT =================
  _initContact() {
    this._mchs = Array.from(document.querySelectorAll("[data-mch]")).map((el) => ({ el, y: 0, vy: 0, r: 0 }));
    this._mailwave = document.querySelector("[data-mailwave]");
    this._mailrule = document.querySelector("[data-mailrule]");
    const input = document.querySelector("[data-cinput]") as HTMLInputElement | null;
    const send = document.querySelector("[data-csend]");
    const composer = document.querySelector("[data-composer]") as HTMLElement | null;
    // click-to-copy email (double-click opens mail app)
    const mw = this._mailwave;
    const hint = document.querySelector("[data-copyhint]") as HTMLElement | null;
    if (mw) {
      const click = (e: Event) => {
        e.preventDefault();
        const done = () => {
          if (!hint) return;
          hint.textContent = "COPIED — SEE YOU IN THE INBOX";
          hint.style.color = this.props.accent;
          clearTimeout(this._copyT);
          this._copyT = setTimeout(() => {
            hint.textContent = "CLICK TO COPY — DOUBLE-CLICK TO OPEN MAIL";
            hint.style.color = "rgba(" + (this._inkRGB || "234,228,216") + ",0.35)";
          }, 2400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(EMAIL).then(done, done);
        else done();
      };
      const dbl = () => {
        window.location.href = "mailto:" + EMAIL;
      };
      mw.addEventListener("click", click);
      mw.addEventListener("dblclick", dbl);
      this._cleanup.push(() => {
        mw.removeEventListener("click", click);
        mw.removeEventListener("dblclick", dbl);
      });
    }
    if (!input || !send) return;
    const go = () => {
      const v = input.value.trim();
      window.location.href =
        "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Let's build something rare") + (v ? "&body=" + encodeURIComponent(v) : "");
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Enter") go();
    };
    const foc = () => {
      if (composer) composer.style.borderColor = this.props.accent;
    };
    const blr = () => {
      if (composer) composer.style.borderColor = "rgba(" + (this._inkRGB || "234,228,216") + ",0.25)";
    };
    send.addEventListener("click", go);
    input.addEventListener("keydown", key);
    input.addEventListener("focus", foc);
    input.addEventListener("blur", blr);
    this._cleanup.push(() => {
      send.removeEventListener("click", go);
      input.removeEventListener("keydown", key);
      input.removeEventListener("focus", foc);
      input.removeEventListener("blur", blr);
    });
  }

  _stepMail(dt: number) {
    if (!this._mchs || !this._mchs.length || !this._mailwave) return;
    const wr = this._mailwave.getBoundingClientRect();
    if (wr.bottom < -60 || wr.top > window.innerHeight + 60 || wr.width === 0) return;
    let near = false;
    const ac = this.props.accent;
    this._mchs.forEach((m: any) => {
      const r = m.el.getBoundingClientRect();
      const dx = this._mx - (r.left + r.width / 2);
      const dy = this._my - (r.top + r.height / 2);
      const inf = Math.exp(-(dx * dx + dy * dy) / 16200);
      if (inf > 0.3) near = true;
      const target = -Math.min(inf * 24, 24);
      m.vy += ((target - m.y) * 150 - m.vy * 12) * dt;
      m.y += m.vy * dt;
      m.r += ((dx > 0 ? -1 : 1) * inf * 6 - m.r) * 0.15;
      if (Math.abs(m.y) > 0.15 || Math.abs(m.r) > 0.15) {
        m.el.style.transform = "translateY(" + m.y.toFixed(1) + "px) rotate(" + m.r.toFixed(2) + "deg)";
        m.el.style.color = inf > 0.22 ? ac : "";
      } else {
        m.el.style.transform = "none";
        m.el.style.color = "";
      }
    });
    if (this._mailrule) this._mailrule.style.width = near ? "100%" : "0%";
  }

  // ================= 3D TREE =================
  _initTree() {
    this._tcanvas = document.querySelector("[data-tree]");
    if (!this._tcanvas) return;
    this._tctx = this._tcanvas.getContext("2d");
    this._ttip = document.querySelector("[data-tree-tip]");
    this._tstage = document.querySelector("[data-tree-stage]");

    // seeded rng
    let seed = 42;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };

    // orbital galaxy: nodes live on tilted orbit shells around the root
    const nodes: any[] = [];
    const labels = ["PROMPT", "PLAN", "VERIFY", "PATH"];
    const radii = [0, 132, 222, 304];
    const root = { id: 0, lvl: 0, parent: null, shellR: 0, ang: 0, spd: 0, tx: 0, tz: 0, x: 0, y: 0, z: 0, score: 1, phase: rnd() * 6.28, jit: 0 };
    nodes.push(root);
    let id = 1;
    for (let i = 0; i < 5; i++) {
      const a1 = (i / 5) * Math.PI * 2 + 0.35;
      const t1x = 0.42 + (rnd() - 0.5) * 0.26,
        t1z = (i / 5 - 0.5) * 1.15 + (rnd() - 0.5) * 0.2;
      const n1 = {
        id: id++, lvl: 1, parent: root, shellR: radii[1], ang: a1, spd: 0.1 + rnd() * 0.05,
        tx: t1x, tz: t1z, x: 0, y: 0, z: 0, score: 0.55 + rnd() * 0.44, phase: rnd() * 6.28, jit: rnd(),
      };
      nodes.push(n1);
      for (let j = 0; j < 3; j++) {
        const n2 = {
          id: id++, lvl: 2, parent: n1, shellR: radii[2], ang: a1 + (j - 1) * 0.44, spd: 0.075 + rnd() * 0.04,
          tx: t1x + (rnd() - 0.5) * 0.22, tz: t1z + (rnd() - 0.5) * 0.22, x: 0, y: 0, z: 0,
          score: 0.55 + rnd() * 0.44, phase: rnd() * 6.28, jit: rnd(),
        };
        nodes.push(n2);
        for (let k = 0; k < 2; k++) {
          const n3 = {
            id: id++, lvl: 3, parent: n2, shellR: radii[3], ang: n2.ang + (k - 0.5) * 0.3, spd: 0.055 + rnd() * 0.035,
            tx: n2.tx + (rnd() - 0.5) * 0.18, tz: n2.tz + (rnd() - 0.5) * 0.18, x: 0, y: 0, z: 0,
            score: 0.55 + rnd() * 0.44, phase: rnd() * 6.28, jit: rnd(),
          };
          nodes.push(n3);
        }
      }
    }
    nodes.forEach((n) => this._orbNodePos(n, 0));
    this._tnodes = nodes;
    this._tlabels = labels;
    this._tradii = radii;

    // ambient dust field
    this._tdust = [];
    for (let i = 0; i < 70; i++) {
      const th = rnd() * Math.PI * 2,
        ph = (rnd() - 0.5) * Math.PI;
      const rr = 160 + rnd() * 300;
      this._tdust.push({
        x: Math.cos(th) * Math.cos(ph) * rr,
        y: Math.sin(ph) * rr * 0.7,
        z: Math.sin(th) * Math.cos(ph) * rr,
        phase: rnd() * 6.28,
        sz: 0.6 + rnd() * 1.3,
      });
    }

    // birth animation — tree grows in when scrolled into view
    this._tborn = 0;
    const bio = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting && !this._tborn) {
            this._tborn = performance.now();
            bio.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    bio.observe(this._tcanvas);
    this._cleanup.push(() => bio.disconnect());

    // greedy path: best child chain
    const chain = (n: any) => {
      const out = [];
      while (n) {
        out.unshift(n);
        n = n.parent;
      }
      return out;
    };
    let cur = root as any;
    for (;;) {
      const kids = nodes.filter((n) => n.parent === cur);
      if (!kids.length) break;
      cur = kids.reduce((a, b) => (a.score > b.score ? a : b));
    }
    this._tgreedy = chain(cur);
    this._tpath = this._tgreedy;
    this._tchain = chain;

    this._tcasc = null;
    this._tnextCasc = 4500;
    this._tyaw = 0.6;
    this._tpitch = 0.18;
    this._tvyaw = 0;
    this._tdrag = false;
    this._tmoved = 0;
    this._thover = null;
    this._tmx = 0;
    this._tmy = 0;
    this._tinside = false;

    const cv = this._tcanvas;
    const down = (e: PointerEvent) => {
      this._tdrag = true;
      this._tmoved = 0;
      this._tlx = e.clientX;
      this._tly = e.clientY;
      cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      this._tmx = e.clientX - r.left;
      this._tmy = e.clientY - r.top;
      this._tinside = true;
      if (this._tdrag) {
        const dx = e.clientX - this._tlx,
          dy = e.clientY - this._tly;
        this._tyaw += dx * 0.005;
        this._tvyaw = dx * 0.004;
        this._tpitch = Math.min(Math.max(this._tpitch + dy * 0.003, -0.55), 0.7);
        this._tmoved += Math.abs(dx) + Math.abs(dy);
        this._tlx = e.clientX;
        this._tly = e.clientY;
      }
    };
    const up = () => {
      if (this._tdrag && this._tmoved < 6) {
        if (this._thover) {
          this._tpath = this._tchain(this._thover);
          if (this._tstage)
            this._tstage.textContent = "PATH TRACED — " + this._tlabels[this._thover.lvl] + " N-" + String(this._thover.id).padStart(2, "0");
        } else {
          this._tpath = this._tgreedy;
          if (this._tstage) this._tstage.textContent = "GREEDY PATH — AUTO-SELECTED";
        }
      }
      this._tdrag = false;
    };
    const leave = () => {
      this._tinside = false;
      this._thover = null;
      if (this._ttip) this._ttip.style.opacity = "0";
    };
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    cv.addEventListener("pointerleave", leave);
    this._cleanup.push(() => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      cv.removeEventListener("pointerleave", leave);
    });

    this._initTreeGL();
    this._sizeTree();
  }

  // ================= WEBGL GALAXY LAYER =================
  _initTreeGL() {
    const cv = document.querySelector("[data-treegl]") as HTMLCanvasElement | null;
    if (!cv) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uni = {
      uYaw: { value: 0 },
      uPitch: { value: 0 },
      uCamz: { value: 520 },
      uF: { value: 620 },
      uTime: { value: 0 },
      uMo: { value: 1 },
      uDpr: { value: 1 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uCol: { value: new THREE.Vector3(0.788, 0.651, 0.42) },
      uAlpha: { value: 1 },
    };
    const head = [
      "uniform float uYaw; uniform float uPitch; uniform float uCamz; uniform float uF;",
      "uniform float uTime; uniform float uMo; uniform float uDpr; uniform vec2 uRes;",
      "vec4 projPt(vec3 p, out float ps) {",
      "  float cy = cos(uYaw); float sy = sin(uYaw); float cp2 = cos(uPitch); float sp2 = sin(uPitch);",
      "  float x1 = p.x*cy - p.z*sy; float zz = p.x*sy + p.z*cy;",
      "  float y2 = p.y*cp2 - zz*sp2; float z2 = p.y*sp2 + zz*cp2;",
      "  float s = uF/(uF + z2 + uCamz); ps = s;",
      "  vec2 scr = vec2(uRes.x*0.5 + x1*s, uRes.y*0.5 - 8.0 + y2*s);",
      "  vec2 ndc = vec2(scr.x/uRes.x, scr.y/uRes.y)*2.0 - 1.0;",
      "  return vec4(ndc.x, -ndc.y, 0.0, 1.0);",
      "}",
    ].join("\n");
    // galaxy dust — particles on the three orbit shells
    const NG = 1400;
    const gAng = new Float32Array(NG),
      gRad = new Float32Array(NG),
      gTz = new Float32Array(NG);
    const gSpd = new Float32Array(NG),
      gSz = new Float32Array(NG),
      gPh = new Float32Array(NG),
      gYj = new Float32Array(NG);
    const shells = [132, 222, 304];
    for (let i = 0; i < NG; i++) {
      const l = i % 3;
      gAng[i] = Math.random() * Math.PI * 2;
      gRad[i] = shells[l] + (Math.random() - 0.5) * 48;
      gTz[i] = (l - 1) * 0.58;
      gSpd[i] = (0.05 + Math.random() * 0.11) * (l === 0 ? 1.6 : l === 1 ? 1.05 : 0.75);
      gSz[i] = 1.4 + Math.random() * 3.2;
      gPh[i] = Math.random() * 6.28;
      gYj[i] = (Math.random() - 0.5) * 34;
    }
    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NG * 3), 3));
    gGeo.setAttribute("aAng", new THREE.BufferAttribute(gAng, 1));
    gGeo.setAttribute("aRad", new THREE.BufferAttribute(gRad, 1));
    gGeo.setAttribute("aTz", new THREE.BufferAttribute(gTz, 1));
    gGeo.setAttribute("aSpd", new THREE.BufferAttribute(gSpd, 1));
    gGeo.setAttribute("aSz", new THREE.BufferAttribute(gSz, 1));
    gGeo.setAttribute("aPh", new THREE.BufferAttribute(gPh, 1));
    gGeo.setAttribute("aYj", new THREE.BufferAttribute(gYj, 1));
    const gMat = new THREE.ShaderMaterial({
      uniforms: uni,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      vertexShader:
        head +
        [
          "attribute float aAng; attribute float aRad; attribute float aTz; attribute float aSpd;",
          "attribute float aSz; attribute float aPh; attribute float aYj;",
          "varying float vA;",
          "void main() {",
          "  float ang = aAng + uTime*aSpd*uMo;",
          "  float tX = 0.42;",
          "  float px0 = cos(ang)*aRad; float pz0 = sin(ang)*aRad;",
          "  float y1 = -pz0*sin(tX); float z1 = pz0*cos(tX);",
          "  vec3 wp = vec3(px0*cos(aTz)-y1*sin(aTz), px0*sin(aTz)+y1*cos(aTz) + aYj + sin(uTime*0.6+aPh)*9.0*uMo, z1);",
          "  float s; gl_Position = projPt(wp, s);",
          "  gl_PointSize = max(aSz*s*uDpr, 1.0);",
          "  vA = clamp((s-0.45)*1.3, 0.0, 1.0) * (0.3 + 0.7*abs(sin(uTime*0.7+aPh)));",
          "}",
        ].join("\n"),
      fragmentShader: [
        "uniform vec3 uCol; uniform float uAlpha; varying float vA;",
        "void main() {",
        "  float r = length(gl_PointCoord - vec2(0.5));",
        "  float a = smoothstep(0.5, 0.06, r) * vA * uAlpha * 0.55;",
        "  if (a < 0.012) discard;",
        "  gl_FragColor = vec4(uCol, a);",
        "}",
      ].join("\n"),
    });
    scene.add(new THREE.Points(gGeo, gMat));
    // node glow halos
    const NN = this._tnodes.length;
    const nPos = new THREE.BufferAttribute(new Float32Array(NN * 3), 3);
    const nSz = new THREE.BufferAttribute(new Float32Array(NN), 1);
    const nIn = new THREE.BufferAttribute(new Float32Array(NN), 1);
    nPos.setUsage(THREE.DynamicDrawUsage);
    nSz.setUsage(THREE.DynamicDrawUsage);
    nIn.setUsage(THREE.DynamicDrawUsage);
    const nGeo = new THREE.BufferGeometry();
    nGeo.setAttribute("position", nPos);
    nGeo.setAttribute("aSz", nSz);
    nGeo.setAttribute("aIn", nIn);
    const nMat = new THREE.ShaderMaterial({
      uniforms: uni,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      vertexShader:
        head +
        [
          "attribute float aSz; attribute float aIn; varying float vI;",
          "void main() {",
          "  float s; gl_Position = projPt(position, s);",
          "  gl_PointSize = aSz*s*uDpr;",
          "  vI = aIn * clamp((s-0.35)*1.4, 0.0, 1.0);",
          "}",
        ].join("\n"),
      fragmentShader: [
        "uniform vec3 uCol; uniform float uAlpha; varying float vI;",
        "void main() {",
        "  float r = length(gl_PointCoord - vec2(0.5));",
        "  float a = pow(max(1.0 - r*2.0, 0.0), 2.4) * vI * uAlpha;",
        "  if (a < 0.012) discard;",
        "  gl_FragColor = vec4(uCol, a);",
        "}",
      ].join("\n"),
    });
    scene.add(new THREE.Points(nGeo, nMat));
    this._tglS = { renderer, scene, cam, gGeo, nPos, nSz, nIn, uni };
    this._cleanup.push(() => {
      try {
        renderer.dispose();
      } catch {
        /* renderer already lost */
      }
    });
  }

  _drawTreeGL(t: number, yaw: number, pitch: number, camz: number, mo: number, born: number) {
    const G = this._tglS;
    if (!G || !this._tnodes) return;
    G.uni.uYaw.value = yaw;
    G.uni.uPitch.value = pitch;
    G.uni.uCamz.value = camz;
    G.uni.uTime.value = t * 0.001;
    G.uni.uMo.value = mo;
    G.uni.uAlpha.value = this._light ? 0.5 : 1;
    if (this._light) G.uni.uCol.value.set(0.55, 0.42, 0.2);
    else G.uni.uCol.value.set(0.788, 0.651, 0.42);
    G.gGeo.setDrawRange(0, this._perfLow ? 520 : 1400);
    const easeOB = (p: number) => {
      p = Math.min(Math.max(p, 0), 1);
      const c = 1.4;
      return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
    };
    const inPath: any = {};
    (this._tpath || []).forEach((n: any) => {
      inPath[n.id] = true;
    });
    const pa = G.nPos.array,
      sa = G.nSz.array,
      ia = G.nIn.array;
    this._tnodes.forEach((n: any, i: number) => {
      this._orbNodePos(n, t);
      const b = this._tborn ? Math.max(Math.min(easeOB((born - (n.lvl * 300 + n.jit * 260)) / 800), 1.12), 0) : 0;
      pa[i * 3] = n.x;
      pa[i * 3 + 1] = n.y + Math.sin(t * 0.0007 + n.phase) * 6 * mo;
      pa[i * 3 + 2] = n.z;
      sa[i] = (n.lvl === 0 ? 96 : inPath[n.id] ? 68 : 36) * b;
      ia[i] = n.lvl === 0 ? 0.85 : inPath[n.id] ? 0.65 : 0.2;
    });
    G.nPos.needsUpdate = true;
    G.nSz.needsUpdate = true;
    G.nIn.needsUpdate = true;
    G.renderer.render(G.scene, G.cam);
  }

  // ================= DEVICE TILT =================
  _initTilt() {
    this._tiltTX = 0;
    this._tiltTY = 0;
    if (this._rm || !window.DeviceOrientationEvent) return;
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) return;
    const chip = document.querySelector("[data-tiltchip]") as HTMLElement | null;
    const onOri = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.gamma === undefined) return;
      this._tiltTX = Math.min(Math.max(e.gamma / 42, -1), 1);
      this._tiltTY = Math.min(Math.max(((e.beta || 0) - 42) / 42, -1), 1);
    };
    const start = () => {
      window.addEventListener("deviceorientation", onOri);
      this._cleanup.push(() => window.removeEventListener("deviceorientation", onOri));
      if (chip) chip.style.display = "none";
    };
    const doe = DeviceOrientationEvent as any;
    if (typeof doe.requestPermission === "function") {
      if (!chip) return;
      chip.style.display = "flex";
      const click = () => {
        doe
          .requestPermission()
          .then((r: string) => {
            if (r === "granted") start();
            else chip.style.display = "none";
          })
          .catch(() => {
            chip.style.display = "none";
          });
      };
      chip.addEventListener("click", click);
      this._cleanup.push(() => chip.removeEventListener("click", click));
    } else {
      start();
    }
  }

  _sizeTree() {
    if (!this._tcanvas) return;
    const r = this._tcanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, this._perfLow ? 1.25 : 2);
    this._tcanvas.width = Math.max(1, Math.round(r.width * dpr));
    this._tcanvas.height = Math.max(1, Math.round(r.height * dpr));
    this._tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._tw = r.width;
    this._th = r.height;
    if (this._tglS) {
      this._tglS.renderer.setPixelRatio(dpr);
      this._tglS.renderer.setSize(r.width, r.height, false);
      this._tglS.uni.uRes.value.set(r.width, r.height);
      this._tglS.uni.uDpr.value = dpr;
    }
  }

  _drawTree(time: number) {
    if (!this._tcanvas || !this._tnodes) return;
    const rect = this._tcanvas.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    if (Math.abs(rect.width - this._tw) > 2) this._sizeTree();

    const ctx = this._tctx;
    const W = this._tw,
      H = this._th;
    ctx.clearRect(0, 0, W, H);

    const mo = this._rm ? 0 : this.props.motion === "calm" ? 0.4 : 1;
    if (!this._tdrag) {
      this._tvyaw *= 0.95;
      this._tyaw += 0.0018 * mo + this._tvyaw;
    }

    const ac = this.props.accent;
    const ink = this._ink || "#EAE4D8";
    const inkRGB = this._inkRGB || "234,228,216";
    const hi = this._hi || "#FFF6E4";
    const t = time || 0;
    const born = this._tborn ? Math.max(t - this._tborn, 0) : 0;
    const yaw = this._tyaw + (this._tiltX || 0) * 0.5,
      pitch = this._tpitch + (this._tiltY || 0) * 0.32 + Math.sin(t * 0.00021) * 0.035 * mo;
    const cy1 = Math.cos(yaw),
      sy1 = Math.sin(yaw);
    const cx1 = Math.cos(pitch),
      sx1 = Math.sin(pitch);
    const f = 620,
      camz = 520 + Math.sin(t * 0.00034) * 40 * mo;
    const cx = W / 2,
      cyc = H / 2 - 8;
    const proj = (x: number, y: number, z: number) => {
      const x1 = x * cy1 - z * sy1;
      const z1 = x * sy1 + z * cy1;
      const y2 = y * cx1 - z1 * sx1;
      const z2 = y * sx1 + z1 * cx1;
      const s = f / (f + z2 + camz);
      return { x: cx + x1 * s, y: cyc + y2 * s, s };
    };
    const easeOB = (p: number) => {
      p = Math.min(Math.max(p, 0), 1);
      const c = 1.4;
      return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
    };

    // center aura
    const aura = ctx.createRadialGradient(cx, cyc, 0, cx, cyc, Math.min(W, H) * 0.55);
    aura.addColorStop(0, ac + "0E");
    aura.addColorStop(1, ac + "00");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);

    // WebGL layer — particle galaxy + node glows, same camera
    this._drawTreeGL(t, yaw, pitch, camz, mo, born);

    // ambient dust
    (this._tdust || []).forEach((d: any) => {
      const p = proj(d.x, d.y + Math.sin(t * 0.0003 + d.phase) * 14 * mo, d.z);
      const a = Math.min(Math.max((p.s - 0.55) * 0.9, 0), 0.32);
      if (a <= 0.01) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, d.sz * p.s, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + inkRGB + "," + a.toFixed(3) + ")";
      ctx.fill();
    });

    // orbital shell rings (gyroscope) + billboard labels
    const ringPt = (a: number, R: number, tX: number, tZ: number) => {
      const px0 = Math.cos(a) * R,
        pz0 = Math.sin(a) * R;
      const y1 = -pz0 * Math.sin(tX);
      const z1 = pz0 * Math.cos(tX);
      return proj(px0 * Math.cos(tZ) - y1 * Math.sin(tZ), px0 * Math.sin(tZ) + y1 * Math.cos(tZ), z1);
    };
    for (let l = 1; l <= 3; l++) {
      const R = this._tradii[l];
      const tX = 0.42,
        tZ = (l - 2) * 0.58 + Math.sin(t * 0.00006 + l) * 0.06 * mo;
      ctx.beginPath();
      for (let i = 0; i <= 90; i++) {
        const p = ringPt((i / 90) * Math.PI * 2, R, tX, tZ);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "rgba(" + inkRGB + ",0.07)";
      ctx.lineWidth = 0.7;
      ctx.stroke();
      const lp = ringPt(-0.6, R + 32, tX, tZ);
      const la = Math.min(Math.max((lp.s - 0.72) * 2.4, 0), 0.5);
      if (la > 0.02) {
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = ac + Math.round(la * 255).toString(16).padStart(2, "0");
        ctx.fillText(this._tlabels[l], lp.x, lp.y);
      }
    }

    // project nodes + birth scale
    const path = this._tpath || [];
    const inPath: any = {};
    path.forEach((n: any) => {
      inPath[n.id] = true;
    });
    const hoverChain: any = {};
    if (this._thover)
      this._tchain(this._thover).forEach((n: any) => {
        hoverChain[n.id] = true;
      });

    this._tnodes.forEach((n: any) => {
      this._orbNodePos(n, t);
      const fy = n.y + Math.sin(t * 0.0007 + n.phase) * 6 * mo;
      const p = proj(n.x, fy, n.z);
      n.sx = p.x;
      n.sy = p.y;
      n.ss = p.s;
      n.birth = this._tborn ? easeOB((born - (n.lvl * 300 + n.jit * 260)) / 800) : 0;
    });

    // cursor ripple on nodes
    this._tnodes.forEach((n: any) => {
      if (this._tinside && n.birth > 0.5) {
        const d = Math.hypot(n.sx - this._tmx, n.sy - this._tmy);
        if (d < 110) n.rip = Math.min((n.rip || 0) + (1 - d / 110) * 0.22, 1.4);
      }
      n.rip = (n.rip || 0) * 0.9;
    });

    // thought cascade — a query fires on its own
    if (this._tborn && !this._tcasc && !this._thover && t > (this._tnextCasc || 0)) {
      const leaves = this._tnodes.filter((x: any) => x.lvl === 3);
      const leaf = leaves[Math.floor(Math.random() * leaves.length)];
      this._tcasc = { t0: t, chain: this._tchain(leaf) };
      if (this._tstage && this._tpath === this._tgreedy) this._tstage.textContent = "CASCADE — QUERY FIRED";
    }
    if (this._tcasc && t - this._tcasc.t0 > this._tcasc.chain.length * 300 + 900) {
      this._tcasc = null;
      this._tnextCasc = t + 6000 + Math.random() * 4000;
      if (this._tstage && this._tpath === this._tgreedy) this._tstage.textContent = "GREEDY PATH — AUTO-SELECTED";
    }

    // curved edges (grow in with birth)
    this._tnodes.forEach((n: any) => {
      if (!n.parent) return;
      const p = n.parent;
      const b = Math.min(n.birth, p.birth, 1);
      if (b <= 0.01) {
        n._cp = null;
        return;
      }
      const cp = proj(((n.x + p.x) / 2) * 1.14, (n.y + p.y) / 2 - 10, ((n.z + p.z) / 2) * 1.14);
      n._cp = cp;
      const on = inPath[n.id] && inPath[p.id];
      const hov = hoverChain[n.id] && hoverChain[p.id] && !on;
      const depth = Math.min(Math.max((n.ss + p.ss) / 2, 0.4), 1.1);
      ctx.beginPath();
      ctx.moveTo(p.sx, p.sy);
      if (b >= 0.99) {
        ctx.quadraticCurveTo(cp.x, cp.y, n.sx, n.sy);
      } else {
        for (let s2 = 1; s2 <= 10; s2++) {
          const u = (s2 / 10) * b;
          const iu = 1 - u;
          ctx.lineTo(iu * iu * p.sx + 2 * iu * u * cp.x + u * u * n.sx, iu * iu * p.sy + 2 * iu * u * cp.y + u * u * n.sy);
        }
      }
      if (on) {
        ctx.strokeStyle = ac;
        ctx.globalAlpha = 0.9 * b;
        ctx.lineWidth = 1.7;
        ctx.shadowColor = ac;
        ctx.shadowBlur = 10;
      } else if (hov) {
        ctx.strokeStyle = ink;
        ctx.globalAlpha = 0.4 * b;
        ctx.lineWidth = 1.1;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = ink;
        ctx.globalAlpha = (0.06 + (depth - 0.4) * 0.13) * b;
        ctx.lineWidth = 0.7;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    });

    // twin signal pulses along active path
    if (path.length > 1 && this._tborn) {
      for (let pi = 0; pi < 2; pi++) {
        const pt = (((t + pi * 1300) % 2600) / 2600) * (path.length - 1);
        const i0 = Math.floor(pt),
          fr = pt - i0;
        const a = path[i0],
          b2 = path[Math.min(i0 + 1, path.length - 1)];
        const cp = b2._cp || { x: (a.sx + b2.sx) / 2, y: (a.sy + b2.sy) / 2 };
        const iu = 1 - fr;
        const px = iu * iu * a.sx + 2 * iu * fr * cp.x + fr * fr * b2.sx;
        const py = iu * iu * a.sy + 2 * iu * fr * cp.y + fr * fr * b2.sy;
        ctx.beginPath();
        ctx.arc(px, py, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = hi;
        ctx.shadowColor = ac;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // cascade edge flashes
    if (this._tcasc) {
      const ch = this._tcasc.chain;
      for (let ci = 1; ci < ch.length; ci++) {
        const local = (t - this._tcasc.t0 - (ci - 1) * 300) / 650;
        if (local <= 0 || local >= 1) continue;
        const g2 = Math.sin(Math.PI * local);
        const a2 = ch[ci - 1],
          b3 = ch[ci];
        const cp2 = b3._cp || { x: (a2.sx + b3.sx) / 2, y: (a2.sy + b3.sy) / 2 };
        ctx.beginPath();
        ctx.moveTo(a2.sx, a2.sy);
        ctx.quadraticCurveTo(cp2.x, cp2.y, b3.sx, b3.sy);
        ctx.strokeStyle = hi;
        ctx.globalAlpha = 0.7 * g2;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = ac;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    // hover detection
    let hover: any = null;
    if (this._tinside && !this._tdrag) {
      let best = 20;
      this._tnodes.forEach((n: any) => {
        if (n.birth < 0.5) return;
        const d = Math.hypot(n.sx - this._tmx, n.sy - this._tmy);
        if (d < best) {
          best = d;
          hover = n;
        }
      });
    }
    this._thover = hover;

    // cascade node glow map
    const cascGlow: any = {};
    if (this._tcasc) {
      this._tcasc.chain.forEach((n: any, ci: number) => {
        const local = (t - this._tcasc.t0 - ci * 300) / 650;
        if (local > 0 && local < 1) cascGlow[n.id] = Math.sin(Math.PI * local);
      });
    }

    // nodes far-to-near
    const sorted = this._tnodes.slice().sort((a: any, b: any) => a.ss - b.ss);
    sorted.forEach((n: any) => {
      if (n.birth <= 0.01) return;
      const on = inPath[n.id];
      const isH = hover === n;
      const base = n.lvl === 0 ? 7.5 : n.lvl === 3 ? 3.2 : 4.8;
      const r = Math.max(base * n.ss * 1.5 * (isH ? 1.5 : 1) * (1 + (n.rip || 0) * 0.35) * Math.min(n.birth, 1.15), 0.8);
      const depthA = Math.min(Math.max((n.ss - 0.5) * 1.8, 0.18), 1);
      if (on || isH) {
        const g = ctx.createRadialGradient(n.sx, n.sy, 0, n.sx, n.sy, r * 4);
        g.addColorStop(0, on ? ac + "48" : "rgba(" + inkRGB + ",0.2)");
        g.addColorStop(1, ac + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, r, 0, Math.PI * 2);
      if (on) {
        ctx.fillStyle = ac;
        ctx.globalAlpha = Math.min(depthA + 0.3, 1);
        ctx.shadowColor = ac;
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = ink;
        ctx.globalAlpha = depthA * 0.78;
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      const cg = cascGlow[n.id] || 0;
      if (n.rip > 0.03) {
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r + 4 + (1.4 - n.rip) * 12, 0, Math.PI * 2);
        ctx.strokeStyle = ac;
        ctx.globalAlpha = Math.min(n.rip * 0.4, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (cg > 0.05) {
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r + 3 + cg * 10, 0, Math.PI * 2);
        ctx.strokeStyle = hi;
        ctx.globalAlpha = cg * 0.7;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (n.lvl === 0) {
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r + 6 + Math.sin(t * 0.002) * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = ac;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      if (isH) {
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, r + 8, 0, Math.PI * 2);
        ctx.strokeStyle = on ? ac : ink;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // tooltip
    if (this._ttip) {
      if (hover) {
        const lbl = this._tlabels[hover.lvl];
        const txt = hover.lvl === 0 ? "PROMPT — ROOT" : lbl + " N-" + String(hover.id).padStart(2, "0") + " — SCORE " + hover.score.toFixed(2);
        this._ttip.textContent = txt;
        this._ttip.style.opacity = "1";
        const tx = Math.min(Math.max(hover.sx + 18, 8), W - 220);
        const ty = Math.min(Math.max(hover.sy - 44, 8), H - 40);
        this._ttip.style.transform = "translate(" + tx.toFixed(0) + "px," + ty.toFixed(0) + "px)";
        if (this._tstage && hover.lvl > 0) this._tstage.textContent = "STAGE — " + lbl;
      } else {
        this._ttip.style.opacity = "0";
      }
    }
  }

  // ================= ORBITAL NODE POSITION =================
  _orbNodePos(n: any, t: number) {
    if (!n.shellR) {
      n.x = 0;
      n.y = 0;
      n.z = 0;
      return;
    }
    const a = n.ang + (this._rm ? 0 : t * 0.001 * n.spd * 0.06);
    const px = Math.cos(a) * n.shellR,
      pz = Math.sin(a) * n.shellR;
    const y1 = -pz * Math.sin(n.tx);
    const z1 = pz * Math.cos(n.tx);
    n.x = px * Math.cos(n.tz) - y1 * Math.sin(n.tz);
    n.y = px * Math.sin(n.tz) + y1 * Math.cos(n.tz);
    n.z = z1;
  }

  // ================= PRELOADER =================
  _initPreloader() {
    const pl = document.querySelector("[data-preloader]") as HTMLElement | null;
    const num = document.querySelector("[data-plcount]");
    const line = document.querySelector("[data-plline]") as HTMLElement | null;
    if (!pl || !num) {
      this._startIntro();
      return;
    }
    this._plActive = true;
    document.documentElement.style.overflow = "hidden";
    const t0 = performance.now();
    const dur = this._rm ? 350 : 1550;
    let fontsReady = false;
    let finished = false;
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => {
        fontsReady = true;
      });
    else fontsReady = true;
    setTimeout(() => {
      fontsReady = true;
    }, 2200);
    const finish = () => {
      if (finished) return;
      finished = true;
      num.textContent = "100";
      if (line) line.style.width = "100%";
      setTimeout(
        () => {
          // iris reveal — the page opens through a collapsing circle
          pl.style.clipPath = "circle(160% at 50% 46%)";
          (pl.style as any).webkitClipPath = "circle(160% at 50% 46%)";
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              pl.style.transition =
                "clip-path 1.25s cubic-bezier(0.76,0,0.24,1), -webkit-clip-path 1.25s cubic-bezier(0.76,0,0.24,1), opacity 1.25s";
              pl.style.clipPath = "circle(0% at 50% 46%)";
              (pl.style as any).webkitClipPath = "circle(0% at 50% 46%)";
              pl.style.opacity = "0.96";
            }),
          );
          this._plActive = false;
          document.documentElement.style.overflow = "";
          this._startIntro();
          setTimeout(() => {
            pl.style.display = "none";
          }, 1350);
        },
        this._rm ? 60 : 260,
      );
    };
    const step = (t: number) => {
      if (finished) return;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const target = fontsReady ? e : Math.min(e, 0.92);
      const v = Math.floor(target * 100);
      num.textContent = v < 10 ? "0" + v : String(v);
      if (line) line.style.width = (target * 100).toFixed(1) + "%";
      if (p >= 1 && fontsReady) finish();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    const cap = setTimeout(finish, 4000);
    this._cleanup.push(() => clearTimeout(cap));
  }

  // ================= MOBILE MENU =================
  _initMobileMenu() {
    this._menu = document.querySelector("[data-mmenu]");
    const btn = document.querySelector("[data-hamburger]");
    if (!btn || !this._menu) return;
    const l1 = btn.querySelector('[data-hline="1"]') as HTMLElement | null;
    const l2 = btn.querySelector('[data-hline="2"]') as HTMLElement | null;
    this._menuOpen = false;
    const set = (open: boolean) => {
      this._menuOpen = open;
      this._menu.style.opacity = open ? "1" : "0";
      this._menu.style.pointerEvents = open ? "auto" : "none";
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (l1) l1.style.transform = open ? "translateY(4.25px) rotate(45deg)" : "none";
      if (l2) l2.style.transform = open ? "translateY(-4.25px) rotate(-45deg)" : "none";
      Array.from(this._menu.querySelectorAll("[data-mlink]")).forEach((a: any, i: number) => {
        a.style.transition =
          "opacity 0.5s ease " +
          (open ? (0.08 + i * 0.06).toFixed(2) : "0") +
          "s, transform 0.6s cubic-bezier(0.16,1,0.3,1) " +
          (open ? (0.08 + i * 0.06).toFixed(2) : "0") +
          "s";
        a.style.opacity = open ? "1" : "0";
        a.style.transform = open ? "none" : "translateY(18px)";
      });
    };
    set(false);
    const tgl = () => set(!this._menuOpen);
    btn.addEventListener("click", tgl);
    const onMenuClick = (e: Event) => {
      const t = e.target as any;
      if (t.closest && t.closest("[data-mlink]")) set(false);
    };
    this._menu.addEventListener("click", onMenuClick);
    const mt = this._menu.querySelector("[data-mtheme]");
    if (mt) {
      const th = () => {
        const r = mt.getBoundingClientRect();
        this._wipeTheme(r.left + r.width / 2, r.top + r.height / 2);
      };
      mt.addEventListener("click", th);
      this._cleanup.push(() => mt.removeEventListener("click", th));
    }
    this._cleanup.push(() => {
      btn.removeEventListener("click", tgl);
      this._menu.removeEventListener("click", onMenuClick);
    });
  }

  // ================= GLASS NAV + SCROLL-SPY =================
  _initSpy() {
    this._spyLinks = Array.from(document.querySelectorAll("[data-navlink]")).map((el: any) => ({ el, id: el.dataset.navlink }));
    this._spyCur = null;
    this._nav = document.querySelector("[data-navbar]");
    this._navGlass = null;
  }

  _stepChrome(y: number) {
    if (this._nav && this._introDone) {
      const on = y > 90;
      if (on !== this._navGlass) {
        this._navGlass = on;
        const n = this._nav;
        n.style.transition = "background 0.5s ease, padding 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease";
        n.style.background = on ? "rgba(" + (this._bgRGB || "10,9,8") + ",0.55)" : "transparent";
        n.style.backdropFilter = on ? "blur(16px) saturate(1.25)" : "none";
        n.style.webkitBackdropFilter = on ? "blur(16px) saturate(1.25)" : "none";
        n.style.borderBottom = "1px solid " + (on ? "rgba(" + (this._inkRGB || "234,228,216") + ",0.07)" : "transparent");
        n.style.padding = on ? "16px 40px" : "26px 40px";
      }
    }
    if (this._spyLinks && this._spyLinks.length) {
      if (!this._spySecs) this._spySecs = ["about", "work", "engine", "contact"].map((id) => document.getElementById(id)).filter(Boolean);
      const probe = y + window.innerHeight * 0.38;
      let best: string | null = null,
        bestTop = -1;
      this._spySecs.forEach((s: any) => {
        const top = s.offsetTop;
        if (top <= probe && top > bestTop) {
          bestTop = top;
          best = s.id;
        }
      });
      if (best !== this._spyCur) {
        this._spyCur = best;
        const ac = this.props.accent;
        this._spyLinks.forEach((l: any) => {
          l.el.style.color = l.id === best ? ac : "rgba(" + (this._inkRGB || "234,228,216") + ",0.55)";
        });
      }
    }
  }

  // ================= IDLE SCREENSAVER =================
  _initSaver() {
    this._saver = document.querySelector("[data-saver]");
    if (!this._saver) return;
    this._saverTime = document.querySelector("[data-savertime]");
    this._saverBall = document.querySelector("[data-saverball]");
    this._saverOn = false;
    this._idleMs = 0;
    this._sb = { x: 120, y: 120, vx: 132, vy: 104, rot: 0 };
    const wake = () => {
      this._idleMs = 0;
      if (this._saverOn) {
        this._saverOn = false;
        this._saver.style.opacity = "0";
        this._saver.style.pointerEvents = "none";
      }
    };
    ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach((ev) => {
      window.addEventListener(ev, wake, { passive: true });
      this._cleanup.push(() => window.removeEventListener(ev, wake));
    });
  }

  _stepSaver(dt: number) {
    if (!this._saver || !this.props.screensaver || !this._introDone) return;
    this._idleMs += dt * 1000;
    if (!this._saverOn && this._idleMs > 45000) {
      this._saverOn = true;
      this._saver.style.opacity = "1";
      this._saver.style.pointerEvents = "auto";
      this._sb.x = 80 + Math.random() * Math.max(window.innerWidth - 300, 100);
      this._sb.y = 80 + Math.random() * Math.max(window.innerHeight - 300, 100);
    }
    if (!this._saverOn) return;
    if (this._saverTime) {
      let s = "";
      try {
        s = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      } catch {
        s = "";
      }
      if (s && this._saverTime.textContent !== s) this._saverTime.textContent = s;
    }
    if (this._saverBall && !this._rm) {
      const b = this._sb,
        W = window.innerWidth,
        H = window.innerHeight,
        sz = 72;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < 0) {
        b.x = 0;
        b.vx = Math.abs(b.vx);
      }
      if (b.x > W - sz) {
        b.x = W - sz;
        b.vx = -Math.abs(b.vx);
      }
      if (b.y < 0) {
        b.y = 0;
        b.vy = Math.abs(b.vy);
      }
      if (b.y > H - sz) {
        b.y = H - sz;
        b.vy = -Math.abs(b.vy);
      }
      b.rot += (b.vx * dt) / 36;
      this._saverBall.style.transform = "translate(" + b.x.toFixed(1) + "px," + b.y.toFixed(1) + "px) rotate(" + b.rot.toFixed(3) + "rad)";
    }
  }

  // ================= THEME =================
  /** External sync (ThemeContext → engine), e.g. after mount or outside toggles. */
  syncTheme(light: boolean) {
    if (this._light === !!light) return;
    this._applyThemeMode(light);
  }

  _applyThemeMode(light: boolean) {
    this._light = !!light;
    const LF = "#241A0E",
      LFR = "36,26,14",
      DF = "#EAE4D8",
      DFR = "234,228,216";
    this._ink = this._light ? LF : DF;
    this._inkRGB = this._light ? LFR : DFR;
    this._hi = this._light ? this.props.accent : "#FFF6E4";
    if (this._glow) this._glow.style.mixBlendMode = this._light ? "multiply" : "screen";
    if (this._grain) {
      this._grain.style.mixBlendMode = this._light ? "multiply" : "normal";
      this._grain.style.opacity = this._light ? "0.06" : "0.05";
    }
    const knob = document.querySelector("[data-themeknob]") as HTMLElement | null;
    const label = document.querySelector("[data-themelabel]");
    if (knob) {
      knob.style.transform = this._light ? "translateX(21px)" : "translateX(0)";
      knob.style.boxShadow = this._light
        ? "0 0 13px rgba(201,166,107,0.65)"
        : "inset -5px -3px 0 0 var(--bg), 0 0 9px rgba(201,166,107,0.45)";
    }
    if (label) label.textContent = this._light ? "DAY" : "NIGHT";
    this._bgRGB = this._light ? "232,222,203" : "10,9,8";
    const mlab = document.querySelector("[data-mthemelabel]");
    if (mlab) mlab.textContent = this._light ? "SWITCH TO NIGHT" : "SWITCH TO DAY";
    this._navGlass = null;
    // persist + flip the html.light class through the site's ThemeContext
    this._host.setLight(this._light);
  }

  _wipeTheme(x: number, y: number) {
    if (this._wiping) return;
    this._wiping = true;
    const oldBg = this._light ? "#E8DECB" : "#0A0908";
    this._applyThemeMode(!this._light);
    const w = document.querySelector("[data-wipe]") as HTMLElement | null;
    const ring = document.querySelector("[data-wipering]") as HTMLElement | null;
    const W = window.innerWidth,
      H = window.innerHeight;
    const R1 = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 6;
    if (w) {
      w.style.background = oldBg;
      w.style.display = "block";
    }
    if (ring) {
      ring.style.left = x + "px";
      ring.style.top = y + "px";
      ring.style.width = "0px";
      ring.style.height = "0px";
      ring.style.opacity = "0.55";
      ring.style.display = "block";
    }
    const setMask = (r: number) => {
      if (!w) return;
      const m = "radial-gradient(circle at " + x + "px " + y + "px, transparent " + r + "px, #000 " + (r + 1.5) + "px)";
      (w.style as any).webkitMaskImage = m;
      w.style.maskImage = m;
    };
    setMask(0);
    const t0 = performance.now(),
      dur = 760;
    const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const r = ease(p) * R1;
      setMask(r);
      if (ring) {
        const d = r * 2;
        ring.style.width = d + "px";
        ring.style.height = d + "px";
        ring.style.opacity = String(0.55 * (1 - p));
      }
      if (p < 1) requestAnimationFrame(step);
      else {
        if (w) {
          w.style.display = "none";
          (w.style as any).webkitMaskImage = "none";
          w.style.maskImage = "none";
        }
        if (ring) {
          ring.style.display = "none";
        }
        this._wiping = false;
      }
    };
    requestAnimationFrame(step);
  }

  _applyTheme() {
    const ac = this.props.accent;
    if (this._light) this._hi = ac;
    document.querySelectorAll("[data-ac]").forEach((el: any) => {
      const m = el.dataset.ac;
      if (m.indexOf("c") > -1) el.style.color = ac;
      if (m.indexOf("b") > -1) el.style.background = ac;
    });
    if (this._glow) this._glow.style.background = "radial-gradient(circle, " + ac + "2E 0%, transparent 65%)";
    if (this._grain) this._grain.style.display = this.props.grain ? "block" : "none";
    if (this._chip) this._chip.style.color = ac;
    if (this._cring) this._cring.style.borderColor = ac + "A6";
  }

  _decode(el: any) {
    if (el._decoded) return;
    el._decoded = true;
    if (this._rm) return;
    const final = el.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—/";
    const dur = 900;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const lock = Math.floor(p * final.length);
      let out = "";
      for (let i = 0; i < final.length; i++) {
        if (i < lock || final[i] === " ") out += final[i];
        else out += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = final;
    };
    requestAnimationFrame(step);
  }

  _countUp(el: any) {
    if (el._counted) return;
    el._counted = true;
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const suf = el.dataset.suf || "";
    if (this._rm) {
      el.textContent = end.toFixed(dec) + suf;
      return;
    }
    const dur = 1700;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ================= CASE STUDIES =================
  _initCase() {
    this._csRoot = document.querySelector("[data-csroot]");
    this._csPanels = Array.from(document.querySelectorAll("[data-cspanel]")).sort(
      (a: any, b: any) => +a.dataset.cspanel - +b.dataset.cspanel,
    );
    this._csCur = null;
    if (!this._csRoot || !this._csPanels.length) return;
    this._csPanels.forEach((p: any) => {
      p.style.transition = "transform 0.95s cubic-bezier(0.76,0,0.24,1)";
    });
    Array.from(document.querySelectorAll("[data-wcard]")).forEach((el, i) => {
      const h = (e: Event) => {
        const t = e.target as any;
        if (t.closest && t.closest("a")) return;
        this._openCase(i);
      };
      el.addEventListener("click", h);
      this._cleanup.push(() => el.removeEventListener("click", h));
    });
    const onClick = (e: MouseEvent) => {
      const t = e.target as any;
      if (!t || !t.closest) return;
      if (t.closest("[data-csclose]")) {
        this._closeCase();
        return;
      }
      const nx = t.closest("[data-csnext]");
      if (nx) this._openCase(parseInt(nx.dataset.csnext, 10));
    };
    document.addEventListener("click", onClick);
    this._cleanup.push(() => document.removeEventListener("click", onClick));
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (this._gameOn) {
        this._endGame();
        return;
      }
      if (this._termOn) {
        this._termClose();
        return;
      }
      if (this._csCur !== null) this._closeCase();
    };
    window.addEventListener("keydown", onKey);
    this._cleanup.push(() => window.removeEventListener("keydown", onKey));
  }

  _openCase(i: number) {
    if (!this._csPanels || !this._csPanels[i]) return;
    const prev = this._csCur !== null ? this._csPanels[this._csCur] : null;
    this._csCur = i;
    this._ovOpen = true;
    clearTimeout(this._csHideT);
    this._csRoot.style.visibility = "visible";
    this._csRoot.style.pointerEvents = "auto";
    const panel = this._csPanels[i];
    panel.scrollTop = 0;
    this._csZ = (this._csZ || 10) + 1;
    panel.style.zIndex = String(this._csZ);
    panel.style.transform = "translateY(0)";
    document.documentElement.style.overflow = "hidden";
    if (prev && prev !== panel)
      setTimeout(() => {
        if (this._csPanels[this._csCur] !== prev) prev.style.transform = "translateY(103%)";
      }, 520);
  }

  _closeCase() {
    if (this._csCur === null || this._csCur === undefined) return;
    const panel = this._csPanels[this._csCur];
    panel.style.transform = "translateY(103%)";
    this._csCur = null;
    this._csRoot.style.pointerEvents = "none";
    if (!this._termOn && !this._gameOn) {
      this._ovOpen = false;
      document.documentElement.style.overflow = "";
      this._starget = window.scrollY;
    }
    clearTimeout(this._csHideT);
    this._csHideT = setTimeout(() => {
      if (this._csCur === null) this._csRoot.style.visibility = "hidden";
    }, 1000);
  }

  // ================= EASTER EGGS =================
  _initEggs() {
    try {
      console.log(
        "%cAMAN GOEL%c — portfolio, engineered.\n\n%c^ ^ v v < > < > B A%c   rally against the reasoning engine\n%c` (backtick)%c          open the hidden terminal\n\ngithub.com/Wolfie8935",
        "font:italic 22px Georgia,serif; color:#C9A66B",
        "font:12px monospace; color:#8f8a7e",
        "font:12px monospace; color:#C9A66B",
        "font:12px monospace; color:#8f8a7e",
        "font:12px monospace; color:#C9A66B",
        "font:12px monospace; color:#8f8a7e",
      );
    } catch {
      /* console unavailable */
    }
    this._initTerm();
    this._initGame();
    const hint = document.querySelector("[data-gamehint]");
    if (hint) {
      const hc = () => this._startGame();
      hint.addEventListener("click", hc);
      this._cleanup.push(() => hint.removeEventListener("click", hc));
    }
    const seq = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];
    this._kidx = 0;
    this._kidx2 = 0; // forgiving variant — arrows only
    const seq2 = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright"];
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as any) && (e.target as any).tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "`" && !typing && !this._gameOn) {
        e.preventDefault();
        if (this._termOn) this._termClose();
        else this._termOpen();
        return;
      }
      if (typing) return;
      if (this._gameOn) {
        if (e.key.toLowerCase() === "r" && this._G && this._G.over) {
          this._endGame();
          this._startGame();
        }
        return;
      }
      const k = e.key.toLowerCase();
      this._kidx = k === seq[this._kidx] ? this._kidx + 1 : k === seq[0] ? 1 : 0;
      this._kidx2 = k === seq2[this._kidx2] ? this._kidx2 + 1 : k === seq2[0] ? 1 : 0;
      if (this._kidx >= seq.length || this._kidx2 >= seq2.length) {
        this._kidx = 0;
        this._kidx2 = 0;
        this._startGame();
      }
    };
    window.addEventListener("keydown", onKey);
    this._cleanup.push(() => window.removeEventListener("keydown", onKey));
  }

  // ================= TERMINAL =================
  _initTerm() {
    this._term = document.querySelector("[data-term]");
    this._termLog = document.querySelector("[data-termlog]");
    this._termIn = document.querySelector("[data-termin]");
    this._termOn = false;
    if (!this._term || !this._termIn) return;
    const key = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") {
        const v = this._termIn.value.trim();
        this._termIn.value = "";
        this._termRun(v);
      } else if (e.key === "Escape" || e.key === "`") {
        e.preventDefault();
        this._termClose();
      }
    };
    this._termIn.addEventListener("keydown", key);
    this._cleanup.push(() => this._termIn.removeEventListener("keydown", key));
  }

  _termOpen() {
    if (!this._term) return;
    this._termOn = true;
    this._ovOpen = true;
    this._term.style.display = "flex";
    document.documentElement.style.overflow = "hidden";
    if (!this._termBooted) {
      this._termBooted = true;
      this._termPrint("AMAN—OS v9.79 — reasoning shell", "#C9A66B");
      this._termPrint('type "help" for commands.');
    }
    setTimeout(() => {
      if (this._termIn) this._termIn.focus();
    }, 60);
  }

  _termClose() {
    if (!this._term) return;
    this._termOn = false;
    this._term.style.display = "none";
    if (this._termIn) this._termIn.blur();
    if (this._csCur === null || this._csCur === undefined) {
      this._ovOpen = false;
      document.documentElement.style.overflow = "";
      this._starget = window.scrollY;
    }
  }

  _termPrint(txt: string, color?: string) {
    if (!this._termLog) return;
    const d = document.createElement("div");
    d.textContent = txt;
    d.style.color = color || "rgba(234,228,216,0.75)";
    this._termLog.appendChild(d);
    this._termLog.scrollTop = this._termLog.scrollHeight;
  }

  _termRun(v: string) {
    if (!v) return;
    this._termPrint("aman@portfolio:~$ " + v, "rgba(234,228,216,0.4)");
    const c = v.toLowerCase();
    const go = (id: string) => {
      this._termClose();
      const el = document.getElementById(id);
      if (el) this._starget = el.getBoundingClientRect().top + window.scrollY;
    };
    if (c === "help") {
      [
        "help            this list",
        "whoami          the short version",
        "work            list the case studies",
        "open ceras      open one (ceras / cyclone / chatbot)",
        "papers          published research",
        "research        the IISc internship",
        "resume          download the CV",
        "links           github / linkedin / mail",
        "theme           flip day and night",
        "wizarding       the third theme",
        "play            rally against the engine",
        "contact         jump to match point",
        "clear           wipe the log",
        "exit            close the terminal",
      ].forEach((l) => this._termPrint(l));
    } else if (c === "whoami") {
      this._termPrint("Aman Goel — reasoning engines, ML pipelines, systems that hold under load.");
      this._termPrint("B.Tech CSE '26, 9.79 CGPA. Played tennis for India before any of it.");
    } else if (c === "work" || c === "ls") {
      this._termPrint("01  CERAS            reasoning platform        (open ceras)");
      this._termPrint("02  Cyclone          intensity prediction      (open cyclone)");
      this._termPrint("03  GenAI Chatbot    CPU-optimized inference   (open chatbot)");
    } else if (c === "open ceras" || c === "ceras") {
      this._termClose();
      this._openCase(0);
    } else if (c === "open cyclone" || c === "cyclone") {
      this._termClose();
      this._openCase(1);
    } else if (c === "open chatbot" || c === "chatbot") {
      this._termClose();
      this._openCase(2);
    } else if (c === "papers") {
      this._termPrint("Cyclone Intensity Prediction using ERA5 — IEEE, ICCMC 2025");
      this._termPrint("  doi.org/10.1109/ICCMC65190.2025.11140783");
      this._termPrint("Smart Hotel Automation System — CRC Press book chapter");
      this._termPrint("  doi.org/10.1201/9781003658221-44");
      this._termPrint("orcid  " + LINKS.orcid);
    } else if (c === "research") {
      this._termPrint("Studies on Probabilistic Methods in Machine Learning");
      this._termPrint("IISc Bangalore — summer 2025, under Prof. C. Pandurangan.");
      this._termPrint("opening the report…", "#C9A66B");
      setTimeout(() => window.open(import.meta.env.BASE_URL + REPORT_FILE, "_blank"), 600);
    } else if (c === "resume" || c === "cv") {
      this._termPrint("fetching the one-pager…", "#C9A66B");
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = RESUME_URL;
        a.download = "Aman_Goel_Resume.pdf";
        a.click();
      }, 500);
    } else if (c === "links") {
      this._termPrint("github    " + LINKS.github);
      this._termPrint("linkedin  " + LINKS.linkedin + "/");
      this._termPrint("leetcode  " + LINKS.leetcode);
      this._termPrint("mail      " + EMAIL);
    } else if (c === "theme") {
      this._termClose();
      this._wipeTheme(window.innerWidth / 2, window.innerHeight / 2);
    } else if (c === "wizarding" || c === "accio") {
      this._termPrint("swish and flick…", "#C9A66B");
      setTimeout(() => {
        this._termClose();
        this._host.setWizarding();
      }, 700);
    } else if (c === "play" || c === "konami" || c === "tennis") {
      this._termClose();
      this._startGame();
    } else if (c === "contact") go("contact");
    else if (c === "clear") {
      this._termLog.innerHTML = "";
    } else if (c === "exit" || c === "quit") this._termClose();
    else if (c === "sudo hire aman") {
      this._termPrint("permission granted. drafting the offer…", "#C9A66B");
      setTimeout(() => {
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("The offer");
      }, 900);
    } else this._termPrint("command not found: " + v + ' — try "help"');
  }

  // ================= RETRO RALLY =================
  _initGame() {
    this._gameEl = document.querySelector("[data-game]");
    this._gameCv = document.querySelector("[data-gamecv]");
    if (!this._gameEl || !this._gameCv) return;
    this._gameCtx = this._gameCv.getContext("2d");
    this._gameOn = false;
    this._gsY = document.querySelector("[data-gsyou]");
    this._gsE = document.querySelector("[data-gseng]");
    this._gMsg = document.querySelector("[data-gmsg]");
    const mv = (e: PointerEvent) => {
      if (this._gameOn) this._gmy = e.clientY;
    };
    window.addEventListener("pointermove", mv);
    this._cleanup.push(() => window.removeEventListener("pointermove", mv));
    const click = (e: Event) => {
      const t = e.target as any;
      if (t.closest && t.closest("[data-gexit]")) this._endGame();
    };
    this._gameEl.addEventListener("click", click);
    this._cleanup.push(() => this._gameEl.removeEventListener("click", click));
  }

  _startGame() {
    if (!this._gameEl || this._gameOn) return;
    this._gameOn = true;
    this._ovOpen = true;
    this._gameEl.style.display = "block";
    document.documentElement.style.overflow = "hidden";
    const W = window.innerWidth,
      H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this._gameCv.width = Math.round(W * dpr);
    this._gameCv.height = Math.round(H * dpr);
    this._gameCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._G = {
      W,
      H,
      py: H / 2,
      ey: H / 2,
      bx: W / 2,
      by: H / 2,
      bvx: 430 * (Math.random() < 0.5 ? -1 : 1),
      bvy: (Math.random() - 0.5) * 480,
      ps: 0,
      es: 0,
      over: false,
      trail: [],
      msg: "FIRST TO FIVE — SERVE IS LIVE",
      msgT: performance.now() + 2200,
    };
    this._gmy = H / 2;
    if (this._gsY) this._gsY.textContent = "0";
    if (this._gsE) this._gsE.textContent = "0";
    this._glt = 0;
    const loop = (t: number) => {
      if (!this._gameOn) return;
      this._gameStep(t);
      this._graf = requestAnimationFrame(loop);
    };
    this._graf = requestAnimationFrame(loop);
  }

  _endGame() {
    if (!this._gameOn) return;
    this._gameOn = false;
    cancelAnimationFrame(this._graf);
    this._gameEl.style.display = "none";
    if ((this._csCur === null || this._csCur === undefined) && !this._termOn) {
      this._ovOpen = false;
      document.documentElement.style.overflow = "";
      this._starget = window.scrollY;
    }
  }

  _gServe(dir: number) {
    const G = this._G;
    G.bx = G.W / 2;
    G.by = G.H / 2;
    G.bvx = 430 * dir;
    G.bvy = (Math.random() - 0.5) * 480;
    G.trail.length = 0;
    if (this._gsY) this._gsY.textContent = String(G.ps);
    if (this._gsE) this._gsE.textContent = String(G.es);
    G.msg = "YOU " + G.ps + " — " + G.es + " ENGINE";
    G.msgT = performance.now() + 1400;
  }

  _gameStep(t: number) {
    const G = this._G,
      ctx = this._gameCtx;
    if (!G || !ctx) return;
    const dt = this._glt ? Math.min((t - this._glt) / 1000, 0.033) : 0.016;
    this._glt = t;
    const W = G.W,
      H = G.H,
      ph = 116,
      pw = 10,
      m = 48;
    G.py += ((this._gmy || H / 2) - G.py) * 0.3;
    G.py = Math.min(Math.max(G.py, ph / 2 + 24), H - ph / 2 - 24);
    if (!G.over) {
      const tgt = G.bvx > 0 ? G.by : H / 2;
      const cap = 330;
      G.ey += Math.min(Math.max((tgt - G.ey) * 3.2 * dt, -cap * dt), cap * dt);
      G.ey = Math.min(Math.max(G.ey, ph / 2 + 24), H - ph / 2 - 24);
      G.bx += G.bvx * dt;
      G.by += G.bvy * dt;
      if (G.by < 32) {
        G.by = 32;
        G.bvy = Math.abs(G.bvy);
      }
      if (G.by > H - 32) {
        G.by = H - 32;
        G.bvy = -Math.abs(G.bvy);
      }
      if (G.bx < m + pw + 8 && G.bvx < 0 && Math.abs(G.by - G.py) < ph / 2 + 10) {
        G.bvx = Math.abs(G.bvx) * 1.05;
        G.bvy += (G.by - G.py) * 6.5;
        G.bx = m + pw + 8;
      }
      if (G.bx > W - m - pw - 8 && G.bvx > 0 && Math.abs(G.by - G.ey) < ph / 2 + 10) {
        G.bvx = -Math.abs(G.bvx) * 1.05;
        G.bvy += (G.by - G.ey) * 5.5;
        G.bx = W - m - pw - 8;
      }
      G.bvy = Math.min(Math.max(G.bvy, -660), 660);
      G.bvx = Math.min(Math.max(G.bvx, -1080), 1080);
      if (G.bx < -24) {
        G.es++;
        if (G.es >= 5) G.over = true;
        else this._gServe(1);
      }
      if (G.bx > W + 24) {
        G.ps++;
        if (G.ps >= 5) G.over = true;
        else this._gServe(-1);
      }
      if (G.over) {
        if (this._gsY) this._gsY.textContent = String(G.ps);
        if (this._gsE) this._gsE.textContent = String(G.es);
        G.msg = G.ps >= 5 ? "GAME, SET, MATCH — YOU. PRESS R FOR A REMATCH" : "THE ENGINE HOLDS — PRESS R FOR A REMATCH";
        G.msgT = Infinity;
      }
      G.trail.unshift({ x: G.bx, y: G.by });
      if (G.trail.length > 14) G.trail.pop();
    }
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(234,228,216,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(24.5, 24.5, W - 49, H - 49);
    ctx.setLineDash([10, 16]);
    ctx.beginPath();
    ctx.moveTo(W / 2, 24);
    ctx.lineTo(W / 2, H - 24);
    ctx.stroke();
    ctx.setLineDash([]);
    G.trail.forEach((p: any, i: number) => {
      const a = (1 - i / 14) * 0.3;
      const s = 12 - i * 0.55;
      ctx.fillStyle = "rgba(201,166,107," + a.toFixed(3) + ")";
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    });
    ctx.fillStyle = "#C9A66B";
    ctx.fillRect(G.bx - 7, G.by - 7, 14, 14);
    ctx.fillStyle = "#EAE4D8";
    ctx.fillRect(m, G.py - ph / 2, pw, ph);
    ctx.fillRect(W - m - pw, G.ey - ph / 2, pw, ph);
    if (!G.over && G.bvx > 0) {
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(201,166,107,0.65)";
      ctx.fillText("THINKING…", W - m - 100, G.ey - ph / 2 - 16);
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(W - m - pw - 16, Math.min(Math.max(G.by + i * 54, 30), H - 30), 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(201,166,107," + (i === 0 ? 0.5 : 0.18) + ")";
        ctx.fill();
      }
    }
    if (this._gMsg) {
      if (this._gMsg.textContent !== G.msg) this._gMsg.textContent = G.msg;
      this._gMsg.style.opacity = t < G.msgT ? "1" : "0";
    }
  }
}
