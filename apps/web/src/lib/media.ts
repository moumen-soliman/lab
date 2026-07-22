// ── Connection-aware, non-blocking clip loading ──────────────────────────
// Ported from moumen.dev. Two knobs let the clips adapt to the visitor's link
// without ever blocking the main thread:
//   1. readConnection() buckets the link into a policy — 'eager' (autoplay, a
//      few at once), 'throttled' (autoplay, one at a time) or 'manual' (data
//      saver: wait for a tap) — plus the number of clips allowed to decode at once.
//   2. loadGate caps those concurrent decodes; requestIdleCallback keeps the
//      fetch/decode off the paint path.

export const CRAFTED_ASPECT_RATIO = "1886 / 1318";

export type ConnectionPolicy = "eager" | "throttled" | "manual";
export interface ConnectionState {
  policy: ConnectionPolicy;
  limit: number;
}

interface NetworkInformation extends EventTarget {
  saveData?: boolean;
  effectiveType?: string;
  downlink?: number;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInformation }).connection;
}

export function readConnection(): ConnectionState {
  const c = getConnection();
  // No API (Safari, most desktops): assume a healthy link, don't punish it.
  if (!c) return { policy: "eager", limit: 3 };
  if (c.saveData) return { policy: "manual", limit: 1 };
  const slow =
    c.effectiveType === "2g" ||
    c.effectiveType === "slow-2g" ||
    (typeof c.downlink === "number" && c.downlink > 0 && c.downlink < 1.5);
  return slow ? { policy: "throttled", limit: 1 } : { policy: "eager", limit: 3 };
}

export function prefersReducedMotion(): boolean {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

// A tiny async semaphore shared by every clip on the page. acquire() resolves a
// { gate, release } pair; the caller awaits `gate`, does its decode, then MUST
// release (on first frame, error or unmount) or the queue stalls.
interface GateEntry {
  granted: boolean;
  done: boolean;
  grant: () => void;
}

export const loadGate = (() => {
  let limit = 3;
  let active = 0;
  const queue: GateEntry[] = [];

  const pump = () => {
    while (active < limit && queue.length) {
      active += 1;
      queue.shift()!.grant();
    }
  };

  return {
    setLimit(next: number) {
      limit = Math.max(1, next | 0);
      pump();
    },
    acquire() {
      const entry: GateEntry = { granted: false, done: false, grant: () => {} };
      const gate = new Promise<void>((resolve) => {
        entry.grant = () => {
          entry.granted = true;
          resolve();
        };
      });
      queue.push(entry);
      pump();
      const release = () => {
        if (entry.done) return;
        entry.done = true;
        if (entry.granted) {
          active = Math.max(0, active - 1);
          pump();
        } else {
          const i = queue.indexOf(entry);
          if (i >= 0) queue.splice(i, 1);
        }
      };
      return { gate, release };
    },
  };
})();

// Run work when the browser is idle (falls back to a macrotask), so attaching a
// src and kicking off decode never shares a frame with a scroll or a tap.
export const onIdle = (fn: () => void): number =>
  typeof requestIdleCallback === "function"
    ? requestIdleCallback(fn, { timeout: 600 })
    : (setTimeout(fn, 1) as unknown as number);

export const cancelIdle = (handle: number | undefined) => {
  if (handle == null) return;
  if (typeof cancelIdleCallback === "function") cancelIdleCallback(handle);
  else clearTimeout(handle);
};

export function playSafely(video: HTMLVideoElement) {
  if (prefersReducedMotion()) return;
  const played = video.play();
  // Autoplay can reject (backgrounded tab, policy); ignore — looping resumes.
  if (played && typeof played.catch === "function") played.catch(() => {});
}
