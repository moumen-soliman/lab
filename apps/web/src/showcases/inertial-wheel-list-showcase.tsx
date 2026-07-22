"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import WheelList, { type WheelState } from "@/registry/lab/inertial-wheel-list/inertial-wheel-list";
import { TIMES } from "@/registry/lab/inertial-wheel-list/example";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function WheelListShowcase() {
  const [wheelFlat, setWheelFlat] = useState(false);
  const [inspectWheel, setInspectWheel] = useState(false);
  const [wheelState, setWheelState] = useState<WheelState>({
    value: "9:00 AM",
    index: 36,
    count: 96,
    settled: true,
  });
  const handleWheelState = useCallback((state: WheelState) => setWheelState(state), []);

  return (
    <>
      <ShowcaseIntro title="Inertial Wheel List" delay={40} defaultOpen>
        The iOS picker drum without scroll-jacking: it is a{" "}
        <span className="font-medium text-[#111]">plain scrollable list</span>, so the browser owns the momentum - a
        thumb-fling on a phone included - and <code className="text-[#111]">scroll-snap: y mandatory</code> lands every
        fling on an item. The selection is <span className="font-medium text-[#111]">derived from the scroll</span> (
        <code className="text-[#111]">round(scrollTop / itemHeight)</code>), never stored beside it, so the two cannot
        disagree. Each scroll frame, one rAF pass writes <code className="text-[#111]">rotateX</code>,{" "}
        <code className="text-[#111]">scale</code> and opacity straight onto the items by their distance from the centre
        - the <span className="font-medium text-[#111]">middle item is biggest</span> and the rim dissolves through a{" "}
        <code className="text-[#111]">mask-image</code> fade rather than clipping. It is also a proper{" "}
        <span className="font-medium text-[#111]">listbox</span>: one tab stop, arrows and Home/End scroll to the
        neighbour, and the live selection is announced.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={wheelFlat} onChange={setWheelFlat}>
          Flat wheel <span className="text-gray-400">- drop the 3D drum, keep the scale and fade</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectWheel} onChange={setInspectWheel} />
          {inspectWheel && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectWheel ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <WheelList
          items={TIMES}
          label="Pick a start time"
          initialIndex={36}
          drum={!wheelFlat}
          inspect={inspectWheel}
          onStateChange={handleWheelState}
        />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500" style={{ animationDelay: "90ms" }}>
        {inspectWheel ? (
          <>
            <code className="text-[#111]">t = distance / half</code> · scale{" "}
            <code className="text-[#111]">1.14 − 0.34|t|</code>
            {!wheelFlat && (
              <>
                {" "}
                · <code className="text-[#111]">rotateX(38° · t)</code>
              </>
            )}{" "}
            · snap <code className="text-[#111]">mandatory</code>
          </>
        ) : (
          <>
            Selected: <span className="font-medium text-[#111]">{wheelState.value}</span>
            {" · "}
            <span className="font-medium text-[#111] tabular-nums">
              {wheelState.index + 1} / {wheelState.count}
            </span>
            {" · "}
            <span className="font-medium text-[#111]">{wheelState.settled ? "settled" : "coasting"}</span>
          </>
        )}
      </p>
    </>
  );
}
