import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { sampleStage } from "@/components/modern/journey/stages";
import type { DeviceTier } from "@/components/modern/hooks/useDeviceTier";

/**
 * JourneyScene — the signature scroll-driven neural constellation for the modern
 * themes. Rendered as a fixed full-viewport WebGL layer behind all content.
 *
 * One evolving "reasoning core" (icosahedron lattice + node points) wrapped in a
 * drifting additive star field and faint synapses. As the visitor scrolls, the
 * normalized progress in `progressRef` drives a keyframed journey (see journey/
 * stages.ts): the core dollies, drifts, re-spreads, shifts hue, and finally
 * converges inward to a single glowing point.
 *
 * Tiers (see useDeviceTier):
 * - "high": full star count, DPR ≤ 1.75, UnrealBloom glow.
 * - "low":  fewer stars, DPR 1, no bloom.
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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      // WebGL unavailable → the aurora background alone remains. Page stays usable.
      return;
    }
    renderer.setSize(width, height);
    const maxDpr = tier === "low" ? 1 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    container.appendChild(renderer.domElement);

    // ---- Optional bloom (high tier only) ----
    const useBloom = tier === "high";
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    if (useBloom) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.15, 0.6, 0.85);
      composer.addPass(bloomPass);
    }

    const palette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#ec4899"),
    ];

    const group = new THREE.Group();
    group.position.set(1.4, 0, 0); // matches STAGES[0] so there's no first-frame snap
    scene.add(group);

    // ---- Reasoning core: icosahedron lattice ----
    const icoGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const edges = new THREE.EdgesGeometry(icoGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: palette[0].clone(),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const lattice = new THREE.LineSegments(edges, lineMat);
    group.add(lattice);

    const nodeTex = makeSpriteTexture();
    const nodeMat = new THREE.PointsMaterial({
      color: palette[1].clone(),
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: nodeTex,
    });
    const nodes = new THREE.Points(icoGeo, nodeMat);
    group.add(nodes);

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

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      const stage = sampleStage(progressRef.current);

      pointer.x += (targetP.x - pointer.x) * 0.05;
      pointer.y += (targetP.y - pointer.y) * 0.05;

      // Camera dolly + group placement eased toward the journey stage targets.
      camera.position.z += (stage.cameraZ - camera.position.z) * 0.06;
      group.position.x += (stage.offsetX - group.position.x) * 0.06;
      group.position.y += (stage.offsetY - group.position.y) * 0.06;
      const s = group.scale.x + (stage.scale - group.scale.x) * 0.06;
      group.scale.setScalar(s);

      group.rotation.y = t * stage.spin + pointer.x * 0.5;
      group.rotation.x = Math.sin(t * 0.18) * 0.15 + pointer.y * 0.35;
      stars.rotation.y = -t * 0.04;
      stars.rotation.z = t * 0.02;

      // Star field spread + convergence toward a single point.
      const conv = stage.converge;
      const spread = stage.spread;
      for (let i = 0; i < STAR_COUNT; i++) {
        starPositions[i * 3] = starBase[i * 3] * spread * (1 - conv);
        starPositions[i * 3 + 1] = starBase[i * 3 + 1] * spread * (1 - conv);
        starPositions[i * 3 + 2] = starBase[i * 3 + 2] * spread * (1 - conv);
      }
      starGeo.attributes.position.needsUpdate = true;

      // Palette driven by the stage so each scroll region has a hue identity.
      const pIdx = ((stage.palette % palette.length) + palette.length) % palette.length;
      const i0 = Math.floor(pIdx);
      const i1 = (i0 + 1) % palette.length;
      tmpColor.copy(palette[i0]).lerp(palette[i1], pIdx - i0);
      lineMat.color.copy(tmpColor);
      nodeMat.color.copy(tmpColor).offsetHSL(0.08, 0, 0.05);
      lineMat.opacity = 0.55 * (1 - conv * 0.6);
      synMat.opacity = (0.08 + Math.sin(t * 0.8) * 0.05 + 0.06) * (1 - conv);

      if (bloomPass) bloomPass.strength = stage.bloom;
      if (composer) composer.render();
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
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      composer?.dispose();
      renderer.dispose();
      icoGeo.dispose();
      edges.dispose();
      starGeo.dispose();
      synGeo.dispose();
      lineMat.dispose();
      nodeMat.dispose();
      starMat.dispose();
      synMat.dispose();
      nodeTex.dispose();
      starTex.dispose();
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
