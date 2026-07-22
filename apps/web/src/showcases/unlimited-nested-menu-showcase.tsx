"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import NestedMenu, { type NestedMenuState, type NestedMenuItem } from "@/registry/lab/unlimited-nested-menu/unlimited-nested-menu";
import { MENU_ITEMS } from "@/registry/lab/unlimited-nested-menu/example";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function NestedMenuShowcase() {
  const [nestedInstant, setNestedInstant] = useState(false);
  const [inspectNested, setInspectNested] = useState(false);
  const [nestedState, setNestedState] = useState<NestedMenuState>({
    open: false,
    depth: 0,
    title: "Actions",
    path: [],
    count: 6,
    lastPick: null,
  });
  const handleNestedState = useCallback((state: NestedMenuState) => setNestedState(state), []);
  const [lastNested, setLastNested] = useState<{ label: string; path: string[] } | null>(null);
  const handleNestedSelect = useCallback(
    (item: NestedMenuItem, path: string[]) => setLastNested({ label: item.label, path }),
    [],
  );

  return (
    <>
      <ShowcaseIntro title="Unlimited Nested Menu" delay={40} defaultOpen>
        The main dropdown never changes. Click a branch and its children open as a{" "}
        <span className="font-medium text-[#111]">new panel right under that item</span>, stacked over the menu below it
        - the <span className="font-medium text-[#111]">clicked item&apos;s name becomes the title</span>, sitting
        exactly where the row was, so the item appears to turn into the sub-menu&apos;s header. Do it again and the
        grandchildren stack the same way, with <span className="font-medium text-[#111]">no depth limit</span> - the
        folder path here runs seven levels deep. Parents stay behind,{" "}
        <span className="font-medium text-[#111]">dimmed</span>, iOS-style; click one to pop back to it. It is a real{" "}
        <span className="font-medium text-[#111]">menu</span>: <code className="text-[#111]">↑↓</code> move,{" "}
        <code className="text-[#111]">→ / Enter</code> opens a sub-panel, <code className="text-[#111]">← / Esc</code>{" "}
        pops one level, and focus lands on the first item of each new panel. Opening is a{" "}
        <span className="font-medium text-[#111]">shared-element morph</span>: the row itself becomes the header - its
        label turns bold as the panel grows out of it; closing is a quick, quiet fade back. Tick{" "}
        <span className="font-medium text-[#111]">Instant</span> for the jump cut.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-2.5" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={nestedInstant} onChange={setNestedInstant}>
          Instant steps <span className="text-gray-400">- no pop animation, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectNested} onChange={setInspectNested} />
          {inspectNested && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 pt-10 pb-8 min-h-[380px] transition-colors ${
          inspectNested ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms", zIndex: nestedState.open ? 30 : undefined }}
      >
        <NestedMenu
          items={MENU_ITEMS}
          triggerLabel="Move file"
          rootTitle="Actions"
          animate={!nestedInstant}
          inspect={inspectNested}
          onStateChange={handleNestedState}
          onSelect={handleNestedSelect}
        />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500 break-words" style={{ animationDelay: "90ms" }}>
        {inspectNested ? (
          <>
            drill → measure item rect → mount panel at <code className="text-[#111]">{"{top,left}"}</code> over the stack
            · title = <code className="text-[#111]">item.label</code>
          </>
        ) : nestedState.open ? (
          <>
            Depth: <span className="font-medium text-[#111] tabular-nums">{nestedState.depth}</span>
            {" · "}At: <span className="font-medium text-[#111]">{["Actions", ...nestedState.path].join(" › ")}</span>
            {" · "}
            <span className="font-medium text-[#111] tabular-nums">{nestedState.count}</span> item
            {nestedState.count === 1 ? "" : "s"}
          </>
        ) : lastNested ? (
          <>
            Picked: <span className="font-medium text-[#111]">{lastNested.label}</span>
            {lastNested.path.length > 0 && (
              <>
                {" "}
                from <span className="font-medium text-[#111]">{lastNested.path.join(" › ")}</span>
              </>
            )}
          </>
        ) : (
          <>
            Closed · <span className="font-medium text-[#111]">click Move file</span> and drill into a folder
          </>
        )}
      </p>
    </>
  );
}
