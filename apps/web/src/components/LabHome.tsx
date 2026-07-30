"use client";

import { useState } from "react";
import Link from "next/link";
import { LabClipCard } from "./LabClipCard";
import { Divider } from "./navigation";
import { ArrowLeftIcon, StarIcon, StarFilledIcon } from "../lib/icons";
import { Kbd, useMetaLabel } from "./RegistryPalette";
import type { LabComponent } from "../registry-data";

const GITHUB_URL = "https://github.com/moumen-soliman/lab";

export function LabHome({ bento }: { bento: LabComponent[] }) {
  // The home page is a three-up wall of looping clips. Each card stages its clip
  // centered on a quiet surface; hovering frosts the clip and floats a
  // liquid-glass View button that routes to /components/<slug>.
  //
  // Clips load STRICTLY ONE AT A TIME, in grid order: card n+1 only starts
  // fetching once card n has its first frame (or fails). Off-screen cards also
  // wait for the IntersectionObserver, so the chain pauses at the fold and
  // resumes on scroll. Under data saver every card is tap-to-play instead.
  const [unlocked, setUnlocked] = useState(1);
  const meta = useMetaLabel();

  return (
    <div className="min-h-screen flex flex-col items-center py-24 px-6 selection:bg-[#111] selection:text-white">
      <main className="w-full max-w-5xl">
        <header className="mb-10 animate-fade-in">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-[#111] transition-colors text-sm"
            >
              <ArrowLeftIcon />
              lab.moumen.dev
            </Link>
            {/* ── STAR HOVER STORYBOARD ─────────────────────────────────
                  idle    hollow star, grey label, hairline surface
                  hover   over 300ms the hollow star cross-fades into a
                          filled one (scale 0.25 → 1, blur 4px → 0) while
                          the label and the surface darken
                  press   the whole pill dips to 0.96
                Both stars stay mounted, the filled one stacked on the
                hollow one, so the swap is interruptible and reverses
                cleanly on leave. @media(hover:hover) keeps it off touch,
                where group-hover would stick after a tap. The scale and
                blur are gated behind motion-safe rather than undone by a
                motion-reduce override, so under a reduced-motion setting
                they are never declared and only opacity moves; overriding
                would have left two rules of equal specificity deciding it
                on source order. */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="group/star inline-flex items-center gap-2 rounded-full py-2.5 pl-3.5 pr-4 text-sm text-gray-600 shadow-[var(--shadow-border)] transition-[color,scale,box-shadow] duration-200 ease-smooth-out hover:text-[#111] hover:shadow-[var(--shadow-border-hover)] motion-safe:active:scale-[0.96]"
            >
              <span className="relative inline-flex size-4 shrink-0 items-center justify-center">
                <StarIcon className="absolute size-4 transition-[opacity,scale,filter] duration-300 ease-icon [@media(hover:hover)]:group-hover/star:opacity-0 motion-safe:[@media(hover:hover)]:group-hover/star:scale-[0.25] motion-safe:[@media(hover:hover)]:group-hover/star:blur-[4px]" />
                <StarFilledIcon className="absolute size-4 opacity-0 transition-[opacity,scale,filter] duration-300 ease-icon motion-safe:scale-[0.25] motion-safe:blur-[4px] [@media(hover:hover)]:group-hover/star:opacity-100 motion-safe:[@media(hover:hover)]:group-hover/star:scale-100 motion-safe:[@media(hover:hover)]:group-hover/star:blur-[0px]" />
              </span>
              Star on GitHub
            </a>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#111] leading-snug text-balance">Component Lab</h1>
          <p className="text-gray-600 text-[0.9375rem] leading-relaxed mt-3 max-w-xl text-pretty">
            Interaction experiments, each a short looping clip. Open any for the live component, its blueprint, and the
            source you can copy or install with <code className="text-[#111]">npx moumenlab add</code>.
          </p>
          {/* The palette lives in the root layout and answers everywhere; this
              line is the only place that says so out loud. */}
          <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
            Press <Kbd>{meta}K</Kbd> or <Kbd>D</Kbd> anywhere to jump to one.
          </p>
        </header>

        <Divider delay={30} className="mb-8" />

        {bento.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bento.map((entry, index) => (
              <LabClipCard
                key={entry.slug}
                entry={entry}
                index={index}
                load={index < unlocked}
                onSettled={() => setUnlocked((count) => Math.max(count, index + 2))}
              />
            ))}
          </div>
        ) : (
          <p className="animate-fade-in text-gray-400 text-sm text-center py-16">More experiments landing soon.</p>
        )}

        <Divider delay={320} className="mt-10 mb-8" />

        <footer className="animate-fade-in text-center" style={{ animationDelay: "340ms" }}>
          <p className="text-gray-400 text-sm">
            By{" "}
            <Link href="https://moumen.dev" className="hover:text-[#111] transition-colors">
              Moumen Soliman
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
