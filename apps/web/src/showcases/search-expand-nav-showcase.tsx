"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import SearchExpandNav from "@/registry/lab/search-expand-nav/search-expand-nav";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function SearchExpandNavShowcase() {
  const [lastSearch, setLastSearch] = useState<string | null>(null);
  const handleNavSearch = useCallback((query: string) => setLastSearch(query), []);
  const [inspectNav, setInspectNav] = useState(false);
  const [navFlip, setNavFlip] = useState(false);

  return (
    <>
      <ShowcaseIntro title="Search-Expand Navigation Bar" delay={40} defaultOpen>
        Click the search icon and the bar becomes a field, then the box grows upward into a card of recent searches.
        Hit <span className="font-medium text-[#111]">✕</span> to replay every step in reverse. Click the{" "}
        <span className="font-medium text-[#111]">avatar</span> for an account dropdown. Two open effects:{" "}
        <span className="font-medium text-[#111]">travel</span> (the icon glides right → left) or{" "}
        <span className="font-medium text-[#111]">flip</span> (the home icon rises and blurs into the search icon while
        the rest blur away).
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-2.5" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={navFlip} onChange={setNavFlip}>
          Flip effect
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectNav} onChange={setInspectNav} />
          {inspectNav && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-end justify-center rounded-2xl border px-6 pt-20 pb-8 min-h-[360px] transition-colors ${
          inspectNav ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <SearchExpandNav inspect={inspectNav} effect={navFlip ? "flip" : "travel"} onSearch={handleNavSearch} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500" style={{ animationDelay: "90ms" }}>
        {inspectNav ? (
          <>
            {navFlip ? (
              <>
                <code className="text-[#111]">translateY + blur</code> swap
              </>
            ) : (
              <>
                fixed-width <code className="text-[#111]">slide ←</code>
              </>
            )}{" "}
            then <code className="text-[#111]">height 0→content</code> grow ↑
          </>
        ) : (
          <>
            Effect: <span className="font-medium text-[#111]">{navFlip ? "flip" : "travel"}</span> · Last search:{" "}
            <span className="font-medium text-[#111]">{lastSearch ? `"${lastSearch}"` : "none"}</span>
          </>
        )}
      </p>
    </>
  );
}
