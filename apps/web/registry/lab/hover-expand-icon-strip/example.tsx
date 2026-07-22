"use client";

import type { ReactNode } from "react";
import ExpandingIconStrip, { type IconStripItem } from "./hover-expand-icon-strip";

export const STRIP_ITEMS: IconStripItem[] = [
  { label: "Home", icon: <HomeIcon /> },
  { label: "Search", icon: <SearchIcon /> },
  { label: "Library", icon: <LibraryIcon /> },
  { label: "Profile", icon: <ProfileIcon /> },
];

export default function ExpandingIconStripExample() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Default: 320px box — hover or Tab a panel and the others squeeze. */}
      <ExpandingIconStrip items={STRIP_ITEMS} onSelect={(item) => console.log(item.label)} />

      {/* Any fixed width; the panels share whatever box you give them. */}
      <ExpandingIconStrip items={STRIP_ITEMS.slice(0, 3)} width={240} />
    </div>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <Svg>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </Svg>
  );
}

function LibraryIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

function ProfileIcon() {
  return (
    <Svg>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  );
}
