"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import ScheduleBuilder, { type ScheduleBuilderState } from "@/registry/lab/schedule-builder/schedule-builder";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function ScheduleBuilderShowcase() {
  const [schedClamp, setSchedClamp] = useState(false);
  const [schedInstant, setSchedInstant] = useState(false);
  const [inspectSched, setInspectSched] = useState(false);
  const [schedState, setSchedState] = useState<ScheduleBuilderState>({
    sentence: "",
    next: null,
    skips: 0,
    dstChanges: 0,
    freq: "weekly",
  });
  const handleSchedState = useCallback((state: ScheduleBuilderState) => setSchedState(state), []);

  return (
    <>
      <ShowcaseIntro title="Schedule Builder" delay={40} defaultOpen>
        A recurrence rule assembled as a <span className="font-medium text-[#111]">live English sentence</span>, over
        the next five <span className="font-medium text-[#111]">real occurrences</span> - computed, never added. The
        calendar traps are the point: pick <span className="font-medium text-[#111]">day 31</span> and months without
        one appear as <span className="font-medium text-[#111]">ghost skipped rows</span> (RRULE semantics - tick{" "}
        <span className="font-medium text-[#111]">Clamp month ends</span> for the other real policy, where day 31
        becomes the 30th). Runs are built from <span className="font-medium text-[#111]">local wall-clock parts</span>,
        so 9:00 AM stays 9:00 AM across a daylight-saving jump - every row prints its{" "}
        <span className="font-medium text-[#111]">UTC offset</span> and flags the ones that differ. &ldquo;The 2nd
        Tuesday&rdquo; and &ldquo;the last Friday&rdquo; come from the month&apos;s first and last day, no scanning.
        And the sentence <span className="font-medium text-[#111]">morphs word by word</span>: words are keyed by text
        + occurrence and <span className="font-medium text-[#111]">glide via layout</span>, so switching
        &ldquo;week&rdquo; to &ldquo;month&rdquo; slides &ldquo;at 9:00 AM&rdquo; into place instead of retyping it -
        the sentence reads as one object being edited, not a string being replaced.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={schedClamp} onChange={setSchedClamp}>
          Clamp month ends <span className="text-gray-400">- day 31 becomes the 30th instead of skipping</span>
        </CheckToggle>
        <CheckToggle checked={schedInstant} onChange={setSchedInstant}>
          Instant sentence <span className="text-gray-400">- no word glide, the string just replaces, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectSched} onChange={setInspectSched} />
          {inspectSched && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectSched ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <ScheduleBuilder morph={!schedInstant} clamp={schedClamp} inspect={inspectSched} onStateChange={handleSchedState} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500 break-words" style={{ animationDelay: "90ms" }}>
        {inspectSched ? (
          <>
            layout glide <code className="text-[#111]">300ms</code> · keys{" "}
            <code className="text-[#111]">word · occurrence</code> · offsets from <code className="text-[#111]">Date</code>{" "}
            · policy <code className="text-[#111]">{schedClamp ? "clamp" : "skip"}</code>
          </>
        ) : (
          <>
            Rule: <span className="font-medium text-[#111]">{schedState.sentence || "…"}</span>
            {schedState.next && (
              <>
                {" "}
                · Next: <span className="font-medium text-[#111]">{schedState.next}</span>
              </>
            )}
            {schedState.skips > 0 && (
              <>
                {" "}
                · <span className="font-medium text-[#111] tabular-nums">{schedState.skips}</span> skipped
              </>
            )}
            {schedState.dstChanges > 0 && (
              <>
                {" "}
                · <span className="font-medium text-[#111] tabular-nums">{schedState.dstChanges}</span> DST{" "}
                {schedState.dstChanges === 1 ? "change" : "changes"}
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
