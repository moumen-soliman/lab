"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, InspectToggle, SpecLegend } from "./shared";
import ExpandingIconStrip, {
  type IconStripItem,
} from "@/registry/lab/hover-expand-icon-strip/hover-expand-icon-strip";
import { STRIP_ITEMS } from "@/registry/lab/hover-expand-icon-strip/example";

// Faint 8px blueprint grid — 8px is the component's spacing unit (the gap).
const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function ExpandingIconStripShowcase() {
  const [lastIcon, setLastIcon] = useState<string | null>(null);
  const handleIconSelect = useCallback((item: IconStripItem) => setLastIcon(item.label), []);
  const [inspectStrip, setInspectStrip] = useState(false);

  return (
    <>
      <ShowcaseIntro title="Hover-Expand Icon Strip" delay={40} defaultOpen>
        Four icons share a fixed-width box. Hover one and it expands while the others squeeze to make room - the row
        never changes width, and <span className="font-medium text-[#111]">Tab</span> expands panels exactly like hover.
        The label <span className="font-medium text-[#111]">waits ~90ms</span> for its panel to open before it lands
        (opacity, rise, blur), then ducks out fast on the way back so the shrinking panel never crushes it.
      </ShowcaseIntro>

      <div
        className="animate-fade-in mb-4 flex items-center justify-between gap-4"
        style={{ animationDelay: "60ms" }}
      >
        <InspectToggle checked={inspectStrip} onChange={setInspectStrip} />
        {inspectStrip && <SpecLegend />}
      </div>

      <section
        className={`animate-fade-in relative flex items-center justify-center rounded-2xl border px-6 py-12 min-h-[160px] transition-colors ${
          inspectStrip ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <ExpandingIconStrip items={STRIP_ITEMS} inspect={inspectStrip} onSelect={handleIconSelect} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500" style={{ animationDelay: "90ms" }}>
        {inspectStrip ? (
          <>
            Hover or focus → <code className="text-[#111]">flex-grow</code> 1 → 5 · others squeeze within the fixed
            width · label enter +90ms, exit 150ms
          </>
        ) : (
          <>
            Last opened: <span className="font-medium text-[#111]">{lastIcon ?? "none"}</span>
          </>
        )}
      </p>
    </>
  );
}
