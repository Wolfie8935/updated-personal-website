import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/components/wizarding/useReducedMotion";

/**
 * HeroScene — the signature 3D moment for the modern themes.
 *
 * A glowing "neural constellation": an icosahedron lattice (reasoning core) wrapped in a
 * drifting field of additive point-stars connected by faint synapses. Reacts to the pointer,
 * cycles through the aurora palette, caps DPR, and pauses when off-screen or hidden.
 *
 * Pure WebGL via three.js — no post-processing, so it stays light on mid-range hardware.
 * Under prefers-reduced-motion it renders a single static frame (no rAF loop).
 */
export function HeroScene({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    container.appendChild(renderer.domElement);

    const palette = [
      new THREE.Color("#6366f1"),
      new THREE.Color("#22d3ee"),
      new THREE.Color("#8b5cf6"),
      new THREE.Color("#ec4899"),
    ];

    const group = new THREE.Group();
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

    // node points at lattice vertices
    const nodeMat = new THREE.PointsMaterial({
      color: palette[1].clone(),
      size: 0.12,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: makeSpriteTexture(),
    });
    const nodes = new THREE.Points(icoGeo, nodeMat);
    group.add(nodes);

    // ---- Constellation field: scattered additive stars ----
    const STAR_COUNT = 150;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      // spherical shell
      const r = 2.6 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[i % palette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: makeSpriteTexture(),
    });
    const stars = new THREE.Points(starGeo, starMat);
    group.add(stars);

    // ---- Synapses: faint lines from a few stars to the core ----
    const synapsePositions: number[] = [];
    for (let i = 0; i < 18; i++) {
      const idx = Math.floor(Math.random() * STAR_COUNT);
      synapsePositions.push(0, 0, 0);
      synapsePositions.push(
        starPositions[idx * 3],
        starPositions[idx * 3 + 1],
        starPositions[idx * 3 + 2],
      );
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
    const target = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    const tmpColor = new THREE.Color();

    const renderFrame = () => {
      const t = clock.getElapsedTime();

      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      group.rotation.y = t * 0.12 + pointer.x * 0.5;
      group.rotation.x = Math.sin(t * 0.18) * 0.15 + pointer.y * 0.35;
      stars.rotation.y = -t * 0.04;
      stars.rotation.z = t * 0.02;

      // cycle palette across lattice / nodes / synapses
      const cycle = (t * 0.12) % palette.length;
      const i0 = Math.floor(cycle);
      const i1 = (i0 + 1) % palette.length;
      const f = cycle - i0;
      tmpColor.copy(palette[i0]).lerp(palette[i1], f);
      lineMat.color.copy(tmpColor);
      nodeMat.color.copy(tmpColor).offsetHSL(0.08, 0, 0.05);
      synMat.opacity = 0.08 + Math.sin(t * 0.8) * 0.05 + 0.06;

      renderer.render(scene, camera);
    };

    let frameId = 0;
    let running = false;
    const loop = () => {
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      clock.start();
      loop();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    // Pause when off-screen
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.05 },
    );
    io.observe(container);

    // Pause when tab hidden
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Resize
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    };
    window.addEventListener("resize", onResize);

    if (reduced) {
      // single static frame
      renderFrame();
    } else {
      start();
    }

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.dispose();
      icoGeo.dispose();
      edges.dispose();
      starGeo.dispose();
      synGeo.dispose();
      lineMat.dispose();
      nodeMat.dispose();
      starMat.dispose();
      synMat.dispose();
      nodeMat.map?.dispose();
      starMat.map?.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [reduced]);

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
