"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import TicketNumber, {
  type TicketNumberState,
  type PrStatus,
} from "@/registry/lab/ticket-number-ticker/ticket-number-ticker";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

const PR_ORDER: PrStatus[] = ["open", "draft", "merged", "closed"];

// Presets that walk through every behaviour: a plain number that runs up, a
// real-feeling dashed ticket, a NO-NUMBER id (discover: it's a name), then a
// long number and a long slug typed WITH SPACES — both normalise and
// middle-truncate to start…end. Picking one bumps runKey so numeric presets run.
const PRESETS = [
  "#232323",
  "#OPS-2451",
  "#feature-request",
  "#100284750001482930",
  "#billing webhook retry timeout 2026",
];

export function TicketNumberShowcase() {
  const [ticketValue, setTicketValue] = useState("#232323");
  const [runKey, setRunKey] = useState(0);
  const [prOn, setPrOn] = useState(false);
  const [prStatus, setPrStatus] = useState<PrStatus>("open");
  const [fixedWidth, setFixedWidth] = useState(false);
  const [inspectTicket, setInspectTicket] = useState(false);
  const [ticketState, setTicketState] = useState<TicketNumberState>({
    kind: "numeric",
    truncated: false,
    full: "#232323",
    status: null,
  });
  const handleTicketState = useCallback((state: TicketNumberState) => setTicketState(state), []);

  const cyclePr = useCallback(
    () => setPrStatus((current) => PR_ORDER[(PR_ORDER.indexOf(current) + 1) % PR_ORDER.length]),
    [],
  );

  const handlePreset = (preset: string) => {
    setTicketValue(preset);
    setRunKey((key) => key + 1);
  };

  return (
    <>
      <ShowcaseIntro title="Ticket Number Ticker" delay={40} defaultOpen>
        Bump <code className="text-[#111]">runKey</code> (the <span className="font-medium text-[#111]">Run</span>{" "}
        button here) and the digits run up on an odometer - <code className="text-[#111]">tabular-nums</code> keeps
        every column <code className="text-[#111]">1ch</code> wide so nothing shifts. The pill{" "}
        <span className="font-medium text-[#111]">grows with the value</span> up to a{" "}
        <code className="text-[#111]">max-width</code>, then <span className="font-medium text-[#111]">middle-truncates</span>{" "}
        to <code className="text-[#111]">start…end</code> - the git-SHA idiom - with the full value one hover or copy
        away. Spaces become <code className="text-[#111]">-</code>; drop the digits entirely and it becomes a plain
        name (no reels). Tick <span className="font-medium text-[#111]">GitHub PR status</span> for a live PR badge
        driven by the <code className="text-[#111]">status</code> prop - click it to cycle the lifecycle.{" "}
        <span className="font-medium text-[#111]">Note:</span> the demo below is scaled{" "}
        <code className="text-[#111]">1.5×</code> for presentation - the installed component ships at a compact
        dashboard size that sits naturally in list rows and toolbars.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[0.9375rem] font-medium select-none">#</span>
          <input
            type="text"
            value={ticketValue.replace(/^#/, "")}
            onChange={(event) => setTicketValue(`#${event.target.value.replace(/^#/, "")}`)}
            placeholder="232323 or ticket-name-here"
            aria-label="Ticket id"
            spellCheck={false}
            className="flex-1 min-w-0 rounded-lg bg-white px-3 py-2 text-base sm:text-sm text-[#111] shadow-border outline-none transition-shadow focus:shadow-border-hover focus:outline-2 focus:outline-[#111] focus:-outline-offset-1 placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={() => setRunKey((key) => key + 1)}
            className="rounded-lg bg-[#111] px-3 py-2 text-sm font-medium text-white select-none transition-[background-color,scale] hover:bg-[#333] active:scale-[0.96]"
          >
            Run
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePreset(preset)}
              className={`px-2.5 py-1 text-xs rounded-full font-medium font-mono tabular-nums transition-colors ${
                preset === ticketValue ? "bg-[#111] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <CheckToggle checked={prOn} onChange={setPrOn}>
          GitHub PR status <span className="text-gray-400">- a live badge driven by the status prop</span>
        </CheckToggle>
        <CheckToggle checked={fixedWidth} onChange={setFixedWidth}>
          Fixed width <span className="text-gray-400">- one footprint instead of growing to fit</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectTicket} onChange={setInspectTicket} />
          {inspectTicket && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-center justify-center rounded-2xl border px-6 py-12 min-h-[160px] transition-colors ${
          inspectTicket ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        {/* Presentation-only 1.5× scale: the wrapper is 100%/1.5 wide so the
            scaled pill fills the stage exactly. The installed component is NOT
            scaled — it ships at the compact dashboard size. */}
        <div className="flex justify-center w-[calc(100%/1.5)] scale-150">
          <TicketNumber
            value={ticketValue}
            runKey={runKey}
            status={prOn ? prStatus : undefined}
            onStatusClick={prOn ? cyclePr : undefined}
            width={fixedWidth ? "fixed" : "max"}
            inspect={inspectTicket}
            onStateChange={handleTicketState}
          />
        </div>
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500 break-words" style={{ animationDelay: "90ms" }}>
        {inspectTicket ? (
          <>
            <code className="text-[#111]">font-variant-numeric: tabular-nums</code> · reels roll{" "}
            <code className="text-[#111]">0 → digit</code> · middle-truncate to{" "}
            <code className="text-[#111]">start…end</code>
          </>
        ) : (
          <>
            Kind: <span className="font-medium text-[#111]">{ticketState.kind}</span>
            {" · "}
            <span className="font-medium text-[#111]">
              {ticketState.truncated ? "middle-truncated" : "fits in full"}
            </span>
            {ticketState.status && (
              <>
                {" "}
                · PR:{" "}
                <span className="font-medium text-[#111]">
                  {ticketState.status.charAt(0).toUpperCase() + ticketState.status.slice(1)}
                </span>
              </>
            )}
            {ticketState.truncated && (
              <>
                {" "}
                · full: <code className="text-[#111] break-all">{ticketState.full}</code>
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
