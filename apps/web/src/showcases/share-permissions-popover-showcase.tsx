"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import SharePopover, { type SharePopoverState } from "@/registry/lab/share-permissions-popover/share-permissions-popover";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function SharePopoverShowcase() {
  const [shareInstant, setShareInstant] = useState(false);
  const [shareLoose, setShareLoose] = useState(false);
  const [inspectShare, setInspectShare] = useState(false);
  const [shareState, setShareState] = useState<SharePopoverState>({
    open: false,
    view: "share",
    people: 4,
    link: "Invited people only",
    size: null,
    lastAction: null,
  });
  const handleShareState = useCallback((state: SharePopoverState) => setShareState(state), []);

  return (
    <>
      <ShowcaseIntro title="Share &amp; Permissions Popover" delay={40} defaultOpen>
        A Notion-style share popover that is <span className="font-medium text-foreground">three views in one floating surface</span>:
        the share list, a per-person role picker, and link settings. Each view declares its own natural width, so
        swapping panels morphs the popover on <span className="font-medium text-foreground">both axes</span> - width and
        height are always a <span className="font-medium text-foreground">measured px easing between views</span> (the
        height:auto illusion, twice), while panels slide directionally with a breadcrumb back header. The{" "}
        <span className="font-medium text-foreground">focus trap survives the swaps</span>: Tab cycles the live panel only,
        pushing into the role picker lands focus on the <span className="font-medium text-foreground">current role</span>,
        popping back returns it to the exact row that opened it, and closing hands it back to the Share button. Escape
        backs out <span className="font-medium text-foreground">one layer at a time</span>. The popover scales in{" "}
        <span className="font-medium text-foreground">from under the trigger</span> (origin-aware, never center) and stays
        mounted so open and close are interruptible. Tick <span className="font-medium text-foreground">Loose focus</span>{" "}
        and Tab quietly walks out of the popover - the trap is the difference.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={shareLoose} onChange={setShareLoose}>
          Loose focus <span className="text-subtle-foreground">- drop the trap, Tab escapes the popover, for comparison</span>
        </CheckToggle>
        <CheckToggle checked={shareInstant} onChange={setShareInstant}>
          Instant swaps <span className="text-subtle-foreground">- no size morph or slides, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectShare} onChange={setInspectShare} />
          {inspectShare && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 pt-8 pb-8 min-h-[520px] transition-colors ${
          inspectShare ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <SharePopover morph={!shareInstant} trap={!shareLoose} inspect={inspectShare} onStateChange={handleShareState} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground break-words" style={{ animationDelay: "90ms" }}>
        {inspectShare ? (
          <>
            size <code className="text-foreground">{shareState.size ? `${shareState.size.w} × ${shareState.size.h}px` : "measured"}</code>{" "}
            · both axes eased · origin <code className="text-foreground">under the trigger</code> · trap{" "}
            <code className="text-foreground">{shareLoose ? "off" : "live view only"}</code>
          </>
        ) : (
          <>
            Popover: <span className="font-medium text-foreground">{shareState.open ? `open · ${shareState.view}` : "closed"}</span>
            {" · "}
            <span className="font-medium text-foreground tabular-nums">{shareState.people} people</span>
            {" · "}Link: <span className="font-medium text-foreground">{shareState.link}</span>
            {shareState.lastAction && (
              <>
                {" "}
                · Last: <span className="font-medium text-foreground">{shareState.lastAction}</span>
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
