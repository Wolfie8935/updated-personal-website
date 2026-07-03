import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { sampleStage } from "@/components/modern/journey/stages";
import { buildShapes } from "@/components/modern/journey/shapes";
import type { DeviceTier } from "@/components/modern/hooks/useDeviceTier";

/**
 * JourneyScene — the signature scroll-driven morphing constellation for the
 * modern themes. Rendered as a fixed full-viewport WebGL layer behind all
 * content.
 *
 * The centrepiece is a particle cloud that MORPHS between shape targets as the
 * visitor scrolls — sphere → double helix → torus knot → wave sheet → spiral
 * galaxy → a single converged point (see journey/shapes.ts + journey/stages.ts).
 * Around it: a drifting additive star field and faint synapse lines. The
 * normalized progress in `progressRef` drives the whole keyframed journey:
 * camera dolly, drift, hue shifts, morph, and final convergence.
 *
 * Tiers (see useDeviceTier):
 * - "high": 2600 particles, full star count, DPR ≤ 1.75, UnrealBloom glow.
 * - "low":  1100 particles, fewer stars, DPR 1, no bloom.
 * - "static": a single rendered frame, no rAF loop (prefers-reduced-motion).
 *
 * Lifecycle-safe: caps DPR, pauses when off-screen or the tab is hidden, handles
 * resize, and fully disposes every GPU resource on unmount (so switching to the
 * wizarding theme leaves nothing running).
 */
export function JourneyScene({
  tier,
  progressRef,
  className,
}: {
  tier: DeviceTier;
  progressRef: MutableRefObject<number>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Bloom already soft-blurs everything it renders, so MSAA on top of it is
    // pure waste; skipping it (and capping DPR at 1.5) roughly halves GPU cost.
    const useBloom = tier === "high";
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !useBloom,
        powerPreference: "high-performance",
      });
    } catch {
      // WebGL unavailable → the aurora background alone remains. Page stays usable.
      return;
    }
    renderer.setSize(width, height);
    const maxDpr = tier === "low" ? 1 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    container.appendChild(renderer.domElement);

    // ---- Theme awareness ----
    // Dark keeps a transparent canvas (the aurora + dark page show through, and
    // additive glow / bloom read beautifully on black). Light can't do that: the
    // bloom composer outputs an opaque black backdrop, and additive blending is
    // invisible on a pale page. So in light we clear to the themed background
    // colour, switch the constellation to normal blending, and skip bloom.
    const readThemeBg = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();
      const [h, s, l] = raw.split(/\s+/).map((v) => parseFloat(v));
      return new THREE.Color().setHSL((h || 0) / 360, (s || 0) / 100, (l || 0) / 100);
    };
    const isLightTheme = () => document.documentElement.classList.contains("light");
    let light = isLightTheme();

    // ---- Optional bloom (high tier only) ----
    // Half-resolution bloom target: the pass is a stack of gaussian blurs, so
    // feeding it a half-size buffer is visually identical for a glow effect
    // but ~4x cheaper — the main de-lag lever.
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (useBloom) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width / 2, height / 2),
        1.15,
        0.6,
        0.85,
      );
      composer.addPass(bloomPass);
    }

    const palette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#ec4899"),
    ];

    const group = new THREE.Group();
    group.position.set(1.5, 0, 0); // matches STAGES[0] so there's no first-frame snap
    // photogenic starting angle: the torus knot reads as a sculpted object on
    // the very first rendered frame instead of an edge-on particle band
    group.rotation.set(0.45, 0.65, 0);
    scene.add(group);

    // ---- Morphing journey cloud: the signature object ----
    const CLOUD_COUNT = tier === "low" ? 1100 : 2600;
    const shapes = buildShapes(CLOUD_COUNT);
    const cloudPositions = new Float32Array(CLOUD_COUNT * 3);
    cloudPositions.set(shapes[0]);

    // Per-particle colour gradient along the index so the cloud shimmers with
    // the whole aurora palette; the material colour tints it per stage.
    const cloudColors = new Float32Array(CLOUD_COUNT * 3);
    const tmpGrad = new THREE.Color();
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const g = (i / CLOUD_COUNT) * (palette.length - 1);
      const gi = Math.floor(g);
      tmpGrad.copy(palette[gi]).lerp(palette[Math.min(gi + 1, palette.length - 1)], g - gi);
      // brighten toward white so vertex colours read after material tinting
      tmpGrad.lerp(new THREE.Color("#ffffff"), 0.45);
      cloudColors[i * 3] = tmpGrad.r;
      cloudColors[i * 3 + 1] = tmpGrad.g;
      cloudColors[i * 3 + 2] = tmpGrad.b;
    }

    // Physics state: every particle is a body with velocity. Each frame a
    // spring pulls it toward its morph target, damping bleeds energy, and the
    // pointer pushes bodies aside — so the cloud behaves like a physical
    // medium (ripples, recoils, reforms) instead of a keyframed texture.
    const cloudVel = new Float32Array(CLOUD_COUNT * 3);

    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute("position", new THREE.BufferAttribute(cloudPositions, 3));
    cloudGeo.setAttribute("color", new THREE.BufferAttribute(cloudColors, 3));
    const cloudTex = makeSpriteTexture();
    const cloudMat = new THREE.PointsMaterial({
      color: palette[0].clone(),
      size: tier === "low" ? 0.065 : 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: cloudTex,
    });
    const cloud = new THREE.Points(cloudGeo, cloudMat);
    group.add(cloud);

    // ---- Constellation field: scattered additive stars ----
    const STAR_COUNT = tier === "low" ? 70 : 150;
    const starBase = new Float32Array(STAR_COUNT * 3); // base positions; scaled by `spread`/`converge`
    const starColors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 2.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starBase[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starBase[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starBase[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starPositions = starBase.slice();
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starTex = makeSpriteTexture();
    const starMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: starTex,
    });
    const stars = new THREE.Points(starGeo, starMat);
    group.add(stars);

    // ---- Wireframe satellites: small geometric solids orbiting at different
    // depths — they sell the parallax and make the scene read as a 3D space,
    // not a flat backdrop. ----
    interface Satellite {
      mesh: THREE.LineSegments;
      geo: THREE.EdgesGeometry;
      mat: THREE.LineBasicMaterial;
      orbitR: number;
      orbitSpeed: number;
      orbitPhase: number;
      orbitTiltY: number;
      spinX: number;
      spinY: number;
    }
    const satellites: Satellite[] = [];
    const satelliteSpecs: Array<{ geo: THREE.BufferGeometry; color: number; r: number; speed: number; scale: number }> = [
      { geo: new THREE.IcosahedronGeometry(0.34, 0), color: 0x6366f1, r: 3.3, speed: 0.12, scale: 1 },
      { geo: new THREE.OctahedronGeometry(0.3, 0), color: 0x22d3ee, r: 4.1, speed: -0.09, scale: 1 },
      { geo: new THREE.TetrahedronGeometry(0.28, 0), color: 0xec4899, r: 4.8, speed: 0.07, scale: 1 },
    ];
    for (let i = 0; i < satelliteSpecs.length; i++) {
      const spec = satelliteSpecs[i];
      const edges = new THREE.EdgesGeometry(spec.geo);
      spec.geo.dispose(); // only the edges survive
      const mat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.LineSegments(edges, mat);
      group.add(mesh);
      satellites.push({
        mesh,
        geo: edges,
        mat,
        orbitR: spec.r,
        orbitSpeed: spec.speed,
        orbitPhase: (i / satelliteSpecs.length) * Math.PI * 2,
        orbitTiltY: 0.5 + i * 0.4,
        spinX: 0.3 + i * 0.12,
        spinY: 0.22 + i * 0.09,
      });
    }

    // ---- Synapses: faint lines from a few stars to the core ----
    const synapsePositions: number[] = [];
    for (let i = 0; i < 18; i++) {
      const idx = Math.floor(Math.random() * STAR_COUNT);
      synapsePositions.push(0, 0, 0);
      synapsePositions.push(starBase[idx * 3], starBase[idx * 3 + 1], starBase[idx * 3 + 2]);
    }
    const synGeo = new THREE.BufferGeometry();
    synGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(synapsePositions), 3),
    );
    const synMat = new THREE.LineBasicMaterial({
      color: palette[2].clone(),
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
    });
    const synapses = new THREE.LineSegments(synGeo, synMat);
    group.add(synapses);

    // ---- Apply / track the active theme ----
    // baseCloudOpacity / baseSynOpacity feed the render loop so per-frame opacity
    // respects the theme. bloomActive gates the composer (off in light).
    let baseCloudOpacity = 0.95;
    let baseSynOpacity = 0.14;
    let bloomActive = useBloom && !light;
    const applyTheme = (isLight: boolean) => {
      const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      cloudMat.blending = blend;
      starMat.blending = blend;
      synMat.blending = blend;
      cloudMat.needsUpdate = true;
      starMat.needsUpdate = true;
      synMat.needsUpdate = true;
      for (const s of satellites) {
        s.mat.blending = blend;
        s.mat.opacity = isLight ? 0.65 : 0.5;
        s.mat.needsUpdate = true;
      }
      baseCloudOpacity = isLight ? 0.8 : 0.95;
      baseSynOpacity = isLight ? 0.2 : 0.14;
      starMat.opacity = isLight ? 0.95 : 0.85;
      // Dark keeps the TRANSPARENT clear. Important: with bloom active the
      // EffectComposer gamma-encodes the whole buffer, so an opaque near-black
      // clear colour comes out as washed grey — transparent alpha stays black.
      // Dark-mode consistency between the bloom and no-bloom paths is handled
      // in CSS instead (the dark aurora is dimmed to near-black in modern.css).
      if (isLight) renderer.setClearColor(readThemeBg(), 1);
      else renderer.setClearColor(0x000000, 0);
      bloomActive = useBloom && !isLight;
    };
    applyTheme(light);

    // Re-apply when the user toggles dark ↔ light (no full scene re-init).
    const themeObserver = new MutationObserver(() => {
      light = isLightTheme();
      applyTheme(light);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // ---- Interaction & animation ----
    const pointer = { x: 0, y: 0 };
    const targetP = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      targetP.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetP.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    const tmpColor = new THREE.Color();
    const maxShape = shapes.length - 1;

    // pointer projected into the cloud's local space for the repulsion force
    const pointerLocal = new THREE.Vector3();
    const SPRING_K = 16; // pull toward morph target
    const DAMPING = 5.5; // exponential energy loss
    const REPULSE_R = 1.15; // pointer influence radius (world units)
    const REPULSE_F = 26; // pointer push strength

    const renderFrame = () => {
      // clamped delta so physics stays stable across tab-switch hitches
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const stage = sampleStage(progressRef.current);

      pointer.x += (targetP.x - pointer.x) * 0.05;
      pointer.y += (targetP.y - pointer.y) * 0.05;

      // Camera dolly + a slow lateral orbit so the scene is seen from a living
      // viewpoint (this is what makes it read as 3D space, not wallpaper).
      camera.position.z += (stage.cameraZ - camera.position.z) * 0.06;
      camera.position.x += (Math.sin(t * 0.07) * 0.5 - camera.position.x) * 0.03;
      camera.position.y += (Math.cos(t * 0.055) * 0.3 - camera.position.y) * 0.03;
      camera.lookAt(group.position.x * 0.4, group.position.y * 0.4, 0);
      group.position.x += (stage.offsetX - group.position.x) * 0.06;
      group.position.y += (stage.offsetY - group.position.y) * 0.06;
      const s = group.scale.x + (stage.scale - group.scale.x) * 0.06;
      group.scale.setScalar(s);

      // 0.65 base yaw = photogenic three-quarter view from frame one
      group.rotation.y = 0.65 + t * stage.spin + pointer.x * 0.5;
      group.rotation.x =
        stage.tiltX + Math.sin(t * 0.18) * 0.12 + pointer.y * 0.3;
      stars.rotation.y = -t * 0.04;
      stars.rotation.z = t * 0.02;

      const conv = stage.converge;

      // ---- Morph the journey cloud between shape targets ----
      const m = Math.min(Math.max(stage.morph, 0), maxShape);
      const ia = Math.min(Math.floor(m), maxShape - 1);
      const f = m - ia;
      // smoothstep the blend so shape-holds feel settled and transitions swell
      const fe = f * f * (3 - 2 * f);
      const shapeA = shapes[ia];
      const shapeB = shapes[ia + 1];
      const collapse = 1 - conv;
      // slow organic breath so the cloud never looks frozen mid-hold
      const breath = 1 + Math.sin(t * 0.55) * 0.025;
      const k = collapse * breath;
      // per-particle swirl: a height-dependent twist that flows through the
      // shape over time — the cloud is always alive, never a static object
      const swirlAmp = 0.16 * collapse;

      // ---- physics step ----
      // Pointer position on the z=0 plane, in the cloud's local space, so the
      // repulsion force tracks the cursor regardless of group drift/scale.
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      pointerLocal.set(
        camera.position.x + pointer.x * halfH * camera.aspect,
        camera.position.y - pointer.y * halfH,
        0,
      );
      group.worldToLocal(pointerLocal);
      const rLocal = REPULSE_R / (s || 1);
      const r2 = rLocal * rLocal;
      const kdt = SPRING_K * dt;
      const damp = Math.exp(-DAMPING * dt);
      const step = tier === "static" ? 0 : dt;

      for (let i = 0; i < CLOUD_COUNT; i++) {
        const j = i * 3;
        const x = (shapeA[j] + (shapeB[j] - shapeA[j]) * fe) * k;
        const y = (shapeA[j + 1] + (shapeB[j + 1] - shapeA[j + 1]) * fe) * k;
        const z = (shapeA[j + 2] + (shapeB[j + 2] - shapeA[j + 2]) * fe) * k;
        const a = swirlAmp * Math.sin(t * 0.5 + y * 1.1);
        const cosA = 1 - a * a * 0.5; // small-angle cos
        const tx = x * cosA - z * a;
        const ty = y + Math.sin(t * 0.9 + x * 0.8) * 0.04 * collapse;
        const tz = x * a + z * cosA;

        if (step === 0) {
          // reduced motion: no simulation, just the sampled pose
          cloudPositions[j] = tx;
          cloudPositions[j + 1] = ty;
          cloudPositions[j + 2] = tz;
          continue;
        }

        // spring toward the morph target
        let vx = cloudVel[j] + (tx - cloudPositions[j]) * kdt;
        let vy = cloudVel[j + 1] + (ty - cloudPositions[j + 1]) * kdt;
        let vz = cloudVel[j + 2] + (tz - cloudPositions[j + 2]) * kdt;

        // pointer repulsion — bodies inside the radius get shoved outward
        const dx = cloudPositions[j] - pointerLocal.x;
        const dy = cloudPositions[j + 1] - pointerLocal.y;
        const dz = cloudPositions[j + 2] - pointerLocal.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < r2) {
          const d = Math.sqrt(d2) + 1e-4;
          const f = (REPULSE_F * (1 - d2 / r2) * step) / d;
          vx += dx * f;
          vy += dy * f;
          vz += dz * f;
        }

        vx *= damp;
        vy *= damp;
        vz *= damp;
        cloudVel[j] = vx;
        cloudVel[j + 1] = vy;
        cloudVel[j + 2] = vz;
        cloudPositions[j] += vx * step;
        cloudPositions[j + 1] += vy * step;
        cloudPositions[j + 2] += vz * step;
      }
      cloudGeo.attributes.position.needsUpdate = true;

      // Satellites orbit the core on tilted paths and fade during convergence.
      for (const sat of satellites) {
        const oa = t * sat.orbitSpeed + sat.orbitPhase;
        sat.mesh.position.set(
          Math.cos(oa) * sat.orbitR,
          Math.sin(oa * sat.orbitTiltY) * sat.orbitR * 0.35,
          Math.sin(oa) * sat.orbitR * 0.8,
        );
        sat.mesh.rotation.x = t * sat.spinX;
        sat.mesh.rotation.y = t * sat.spinY;
        sat.mat.opacity = (light ? 0.65 : 0.5) * collapse;
      }

      // Star field spread + convergence toward a single point.
      const spread = stage.spread;
      for (let i = 0; i < STAR_COUNT; i++) {
        starPositions[i * 3] = starBase[i * 3] * spread * collapse;
        starPositions[i * 3 + 1] = starBase[i * 3 + 1] * spread * collapse;
        starPositions[i * 3 + 2] = starBase[i * 3 + 2] * spread * collapse;
      }
      starGeo.attributes.position.needsUpdate = true;

      // Palette driven by the stage so each scroll region has a hue identity.
      const pIdx = ((stage.palette % palette.length) + palette.length) % palette.length;
      const i0 = Math.floor(pIdx);
      const i1 = (i0 + 1) % palette.length;
      tmpColor.copy(palette[i0]).lerp(palette[i1], pIdx - i0);
      cloudMat.color.copy(tmpColor);
      // as everything converges, the cloud brightens instead of fading — a spark
      cloudMat.opacity = baseCloudOpacity * (1 - conv * 0.25);
      cloudMat.size = (tier === "low" ? 0.065 : 0.05) * (1 + conv * 1.6);
      synMat.opacity = (baseSynOpacity + Math.sin(t * 0.8) * 0.05) * (1 - conv);

      if (bloomPass) bloomPass.strength = stage.bloom;
      if (composer && bloomActive) composer.render();
      else renderer.render(scene, camera);
    };

    let frameId = 0;
    let running = false;
    const loop = () => {
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || tier === "static") return;
      running = true;
      clock.start();
      loop();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    // Pause when fully off-screen (the fixed layer is always on-screen, but this
    // also covers display:none during theme transitions).
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
      },
      { threshold: 0 },
    );
    io.observe(container);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
      composer?.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    if (tier === "static") renderFrame();
    else start();

    return () => {
      stop();
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      composer?.dispose();
      renderer.dispose();
      cloudGeo.dispose();
      starGeo.dispose();
      synGeo.dispose();
      cloudMat.dispose();
      starMat.dispose();
      synMat.dispose();
      cloudTex.dispose();
      starTex.dispose();
      for (const sat of satellites) {
        sat.geo.dispose();
        sat.mat.dispose();
      }
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [tier, progressRef]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

/** Soft circular sprite so points render as glowing dots rather than squares. */
function makeSpriteTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
