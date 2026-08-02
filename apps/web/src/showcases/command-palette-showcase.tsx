"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import CommandPalette, { type CommandPaletteState } from "@/registry/lab/command-palette/command-palette";
import { COMMANDS } from "@/registry/lab/command-palette/example";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function CommandPaletteShowcase() {
  const [cmdkSubstring, setCmdkSubstring] = useState(false);
  const [cmdkInstant, setCmdkInstant] = useState(false);
  const [inspectCmdk, setInspectCmdk] = useState(false);
  const [cmdkState, setCmdkState] = useState<CommandPaletteState>({
    mode: "commands",
    depth: 0,
    staged: 0,
    query: "",
    matches: 7,
    chips: [],
    height: null,
    lastRun: null,
  });
  const handleCmdkState = useCallback((state: CommandPaletteState) => setCmdkState(state), []);

  return (
    <>
      <ShowcaseIntro title="Command Palette with Argument Chips" delay={40} defaultOpen>
        Commands that take arguments, filled inline, Linear style. Pick <span className="font-medium text-foreground">Assign to</span>{" "}
        and the command collapses into a <span className="font-medium text-foreground">chip</span>, the list slides to
        people, and the same input now filters names. A finished command{" "}
        <span className="font-medium text-foreground">stages behind an &ldquo;and&rdquo;</span> instead of running - keep
        stacking until the explicit <span className="font-medium text-foreground">✓ Apply</span> (or{" "}
        <code className="text-foreground">⌘⏎</code>) runs the whole compound, or <span className="font-medium text-foreground">✕</span>{" "}
        discards it. The choreography rule: <span className="font-medium text-foreground">focus never leaves the one input</span>.
        Chips are paint, not fields - <span className="font-medium text-foreground">Backspace on an empty query pops the last chip</span>,
        even back across an &ldquo;and&rdquo; into a staged command, and Escape backs out a layer, exactly like a path.
        Matching is a real <span className="font-medium text-foreground">fuzzy subsequence</span> - type{" "}
        <code className="text-foreground">mvp</code> and watch it find <span className="font-medium text-foreground">Move to project</span>{" "}
        - scored with word-start and adjacency bonuses minus a gap penalty, the matched letters underlined in place
        (underline, not bold, so rows never reflow as you type). The list&apos;s height is a{" "}
        <span className="font-medium text-foreground">measured px easing between states</span>, and chips grow in and pop
        instantly because Backspace must feel immediate.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={cmdkSubstring} onChange={setCmdkSubstring}>
          Plain substring match <span className="text-subtle-foreground">- indexOf only, to feel what the ranking adds</span>
        </CheckToggle>
        <CheckToggle checked={cmdkInstant} onChange={setCmdkInstant}>
          Instant swaps <span className="text-subtle-foreground">- no height morph, slides, or chip grow, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectCmdk} onChange={setInspectCmdk} />
          {inspectCmdk && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectCmdk ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <CommandPalette
          commands={COMMANDS}
          matcher={cmdkSubstring ? "substring" : "fuzzy"}
          morph={!cmdkInstant}
          inspect={inspectCmdk}
          onStateChange={handleCmdkState}
        />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground break-words" style={{ animationDelay: "90ms" }}>
        {inspectCmdk ? (
          <>
            {cmdkSubstring ? (
              <>
                substring: <code className="text-foreground">indexOf</code>, earlier hit wins
              </>
            ) : (
              <>
                fuzzy <code className="text-foreground">word-start +10 · adjacent +8 · gap −1</code>
              </>
            )}{" "}
            · height <code className="text-foreground">{cmdkState.height ? `${cmdkState.height}px` : "measured"}</code> ·
            chips <code className="text-foreground">grow + pop</code>
          </>
        ) : (
          <>
            Mode: <span className="font-medium text-foreground">{cmdkState.mode}</span>
            {" · "}
            <span className="font-medium text-foreground">
              {cmdkState.matches} {cmdkState.matches === 1 ? "match" : "matches"}
            </span>
            {(cmdkState.staged ?? 0) > 0 && (
              <>
                {" "}
                · staged: <span className="font-medium text-foreground tabular-nums">{cmdkState.staged}</span>
              </>
            )}
            {cmdkState.chips.length > 0 && (
              <>
                {" "}
                · chips: <span className="font-medium text-foreground">{cmdkState.chips.join(" · ")}</span>
              </>
            )}
            {cmdkState.lastRun && (
              <>
                {" "}
                · Last applied: <span className="font-medium text-foreground">{cmdkState.lastRun}</span>
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
