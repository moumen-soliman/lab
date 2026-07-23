"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection, useInView } from "../lib/useConnection";
import {
  CRAFTED_ASPECT_RATIO,
  cancelIdle,
  loadGate,
  onIdle,
  playSafely,
} from "../lib/media";
import { PlayIcon } from "../lib/icons";

export interface ClipItem {
  title: string;
  src: string;
  aspectRatio?: string;
  blur?: string | null;
}

// The blur-up reveal, converted from `.crafted-clip` — a clip resolves from
// soft to crisp. It starts scaled-up and blurred (hiding the coarse first-frame
// decode), then settles once `data-ready` flips. Only opacity/transform/filter
// animate, so the reveal stays on the compositor.
const CLIP_REVEAL =
  "opacity-0 scale-[1.06] blur-[14px] transition-[opacity,transform,filter] duration-[400ms] ease-smooth-out will-change-[opacity,transform,filter] " +
  "data-[ready=true]:opacity-100 data-[ready=true]:scale-100 data-[ready=true]:blur-[0px] data-[ready=true]:will-change-auto " +
  "motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:transition-opacity motion-reduce:duration-[350ms] motion-reduce:ease-linear right-0 left-0";

interface CraftedVideoProps {
  item: ClipItem;
  load?: boolean;
  onReady?: () => void;
  onSettled?: () => void;
  observe?: boolean;
  fill?: boolean;
  fit?: "cover" | "contain";
}

export function CraftedVideo({
  item,
  load = true,
  onReady,
  onSettled,
  observe = true,
  fill = false,
  fit = "cover",
}: CraftedVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const releaseRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const connection = useConnection();
  const [armed, setArmed] = useState(() => connection.policy !== "manual");

  const inView = useInView(containerRef, { rootMargin: "300px", enabled: observe });
  const shouldLoad = load && inView && armed;

  useEffect(() => {
    // React drops the bare `muted` attribute on hydration; set it imperatively
    // so the browser actually allows autoplay.
    if (videoRef.current) videoRef.current.muted = true;
  }, []);

  useEffect(() => {
    loadGate.setLimit(connection.limit);
    if (connection.policy !== "manual") setArmed(true);
  }, [connection.limit, connection.policy]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!shouldLoad) {
      if (!video.paused) video.pause();
      return undefined;
    }

    if (video.src) {
      playSafely(video);
      return undefined;
    }

    let cancelled = false;
    let idleHandle: number | undefined;
    const { gate, release } = loadGate.acquire();
    releaseRef.current = release;
    gate.then(() => {
      if (cancelled) return release();
      idleHandle = onIdle(() => {
        if (cancelled) return release();
        video.src = item.src;
        video.load();
        playSafely(video);
      });
    });

    return () => {
      cancelled = true;
      cancelIdle(idleHandle);
      release();
    };
  }, [shouldLoad, item.src]);

  const handleReady = () => {
    releaseRef.current?.();
    if (readyRef.current) return;
    readyRef.current = true;
    setReady(true);
    onReady?.();
    onSettled?.();
  };

  const handleError = () => {
    releaseRef.current?.();
    setFailed(true);
    if (readyRef.current) return;
    readyRef.current = true;
    onSettled?.();
  };

  const waitingForTap = observe && connection.policy === "manual" && !armed && !ready;

  return (
    <div
      ref={containerRef}
      className={
        fill
          ? "shadow-border absolute inset-0 select-none overflow-hidden bg-gray-50 rounded-2xl will-change-transform"
          : "shadow-border relative select-none overflow-hidden bg-white w-full rounded-xl will-change-transform p-5"
      }
      style={fill ? undefined : { aspectRatio: item.aspectRatio || CRAFTED_ASPECT_RATIO }}
    >
      {item.blur ? (
        <img
          aria-hidden="true"
          alt=""
          src={item.blur}
          className="pointer-events-none absolute inset-0 z-0 block size-full object-cover blur-[24px] saturate-[1.3] scale-[1.1] transform-gpu opacity-100 transition-opacity duration-[400ms] ease-smooth-out data-[hide=true]:opacity-0"
          data-hide={ready}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-[linear-gradient(110deg,#f4f4f5_8%,#fafafa_18%,#f4f4f5_33%)] bg-[length:200%_100%] animate-shimmer opacity-100 transition-opacity duration-[350ms] ease-smooth-out data-[hide=true]:opacity-0 motion-reduce:animate-none"
          data-hide={ready}
        />
      )}

      <video
        ref={videoRef}
        className={
          fill && fit === "contain"
            ? `${CLIP_REVEAL} absolute inset-3 z-0 block object-contain`
            : `${CLIP_REVEAL} absolute inset-0 z-0 block size-full object-cover rounded-[11px]`
        }
        data-ready={ready}
        loop
        muted
        playsInline
        preload="none"
        onLoadedData={handleReady}
        onError={handleError}
        aria-label={item.title}
      />

      {waitingForTap && (
        <button
          type="button"
          onClick={() => setArmed(true)}
          className="absolute inset-0 z-20 grid place-items-center bg-white/30 backdrop-blur-sm text-gray-600 hover:text-[#111] transition-colors"
          aria-label={`Load ${item.title}`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-medium shadow-sm">
            <PlayIcon /> Tap to play
          </span>
        </button>
      )}

      {failed && !waitingForTap && (
        <div className="absolute inset-0 z-20 grid place-items-center text-xs text-gray-400">
          Couldn&rsquo;t load clip
        </div>
      )}
    </div>
  );
}
