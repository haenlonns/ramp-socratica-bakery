"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import "./grain.css";

/**
 * Film grain for image frames. Draws random white pixels onto a canvas that
 * fills its positioned parent. Every instance reads one shared settings object
 * and one shared timer, so a grid of cards doesn't
 * start a timer per card.
 */

export type GrainSettings = {
  opacity: number;
  /** CSS pixels per grain. */
  grainSize: number;
  fps: number;
  brightness: number;
  /** Chance (0–1) that a pixel gets noise. */
  density: number;
};

export const GRAIN_DEFAULTS: GrainSettings = {
  opacity: 0.4,
  grainSize: 1,
  fps: 3,
  brightness: 0.6,
  density: 1,
};

let settings = GRAIN_DEFAULTS;
const listeners = new Set<() => void>();

export function setGrain(next: Partial<GrainSettings>) {
  settings = { ...settings, ...next };
  restartTimer();
  listeners.forEach((l) => l());
}

const subscribeSettings = (l: () => void) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
const getSettings = () => settings;
const getDefaults = () => GRAIN_DEFAULTS;

export function useGrainSettings() {
  return useSyncExternalStore(subscribeSettings, getSettings, getDefaults);
}

type Draw = () => void;
const draws = new Set<Draw>();
let timer: ReturnType<typeof setInterval> | undefined;

function restartTimer() {
  if (timer) clearInterval(timer);
  timer = draws.size ? setInterval(() => draws.forEach((d) => d()), 1000 / settings.fps) : undefined;
}

function subscribe(draw: Draw) {
  draws.add(draw);
  if (!timer) restartTimer();
  return () => {
    draws.delete(draw);
    if (!draws.size) restartTimer();
  };
}

/** `mask` clips the grain to an image's opaque pixels, for transparent cutouts. */
export function Grain({ mask }: { mask?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { opacity, grainSize } = useGrainSettings();

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    const resize = () => {
      canvas.width = Math.max(1, Math.ceil(parent.clientWidth / grainSize));
      canvas.height = Math.max(1, Math.ceil(parent.clientHeight / grainSize));
    };

    const draw = () => {
      const { brightness, density } = settings;
      const frame = ctx.createImageData(canvas.width, canvas.height);
      const px = frame.data;
      for (let i = 0; i < px.length; i += 4) {
        if (Math.random() > density) continue;
        px[i] = px[i + 1] = px[i + 2] = 255;
        px[i + 3] = Math.random() * 255 * brightness;
      }
      ctx.putImageData(frame, 0, 0);
    };

    resize();
    draw();
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(parent);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const unsubscribe = reduced ? undefined : subscribe(draw);

    return () => {
      observer.disconnect();
      unsubscribe?.();
    };
  }, [grainSize]);

  const maskStyle: React.CSSProperties | undefined = mask
    ? {
        maskImage: `url(${mask})`,
        WebkitMaskImage: `url(${mask})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }
    : undefined;

  return <canvas ref={ref} className="grain" style={{ opacity, ...maskStyle }} aria-hidden />;
}
