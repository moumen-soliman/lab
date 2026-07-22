"use client";

import { useState } from "react";
import Link from "next/link";
import { LabClipCard } from "./LabClipCard";
import { Divider } from "./navigation";
import { ArrowLeftIcon, GitHubIcon } from "../lib/icons";
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
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="inline-flex items-center text-gray-500 hover:text-[#111] transition-colors"
            >
              <GitHubIcon />
            </a>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-[#111] leading-snug text-balance">Component Lab</h1>
          <p className="text-gray-600 text-[0.9375rem] leading-relaxed mt-3 max-w-xl text-pretty">
            Interaction experiments, each a short looping clip. Open any for the live component, its blueprint, and the
            source you can copy or install with <code className="text-[#111]">npx moumenlab add</code>.
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
