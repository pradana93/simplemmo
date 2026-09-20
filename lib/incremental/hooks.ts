"use client";

import { useEffect, useRef } from "react";

/**
 * Local idle-game loop helpers, API-compatible with the `react-incremental-lib` spec:
 * useGameLoop, useTick, useIdleProgress, useOfflineProgress.
 *
 * NOTE on substitution: `react-incremental-lib` is not published on npm as a
 * React-19-compatible package, so this repo vendors the same hook contract
 * locally (zero deps, rAF-driven, Zustand-friendly). If the upstream package
 * publishes a React 19 build, swap this import path for the library.
 */

/** Run `fn` every `intervalMs` using requestAnimationFrame batching (no setInterval drift). */
export function useGameLoop(fn: (dtMs: number) => void, intervalMs = 1000, active = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      if (acc >= intervalMs) {
        acc = 0;
        ref.current(dt);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [intervalMs, active]);
}

export function useTick(fn: (tick: number) => void, intervalMs = 1000, active = true) {
  const count = useRef(0);
  useGameLoop(
    () => {
      count.current += 1;
      fn(count.current);
    },
    intervalMs,
    active,
  );
}

/** Progress 0..1 toward a goal given rate/sec. Pure UI helper. */
export function useIdleProgress(ratePerSec: number, goal: number, active = true): number {
  const acc = useRef(0);
  useGameLoop((dt) => {
    acc.current += (dt / 1000) * ratePerSec;
  }, 250, active);
  if (goal <= 0) return 0;
  return Math.min(1, acc.current / goal);
}

/** Compute elapsed offline seconds from a stored ISO timestamp (client estimate; server validates). */
export function useOfflineProgress(lastSeenAt: string | null): number {
  if (!lastSeenAt) return 0;
  const last = Date.parse(lastSeenAt);
  if (Number.isNaN(last)) return 0;
  return Math.max(0, Math.floor((Date.now() - last) / 1000));
}
