"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import DragReorderList, { type ReorderState } from "@/registry/lab/drag-to-reorder-list/drag-to-reorder-list";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function DragReorderListShowcase() {
  const [reorderSnap, setReorderSnap] = useState(false);
  const [inspectReorder, setInspectReorder] = useState(false);
  const [reorderState, setReorderState] = useState<ReorderState>({
    order: [],
    dragging: null,
    from: null,
    to: null,
    grabbed: false,
    lastMove: null,
  });
  const handleReorderState = useCallback((state: ReorderState) => setReorderState(state), []);

  return (
    <>
      <ShowcaseIntro title="Drag-to-Reorder List" delay={40} defaultOpen>
        Grab a card and the others <span className="font-medium text-foreground">glide out of the way</span> live. The
        dragged card follows the pointer with a raw <code className="text-foreground">translate</code> (easing there reads as
        lag), each displaced sibling shifts <span className="font-medium text-foreground">exactly one slot</span> on a
        retargetable transition, and the drop plays a <span className="font-medium text-foreground">FLIP</span>: measure,
        reorder, invert, glide. Drag past the ends and it turns to <span className="font-medium text-foreground">rubber</span>,
        friction instead of a wall. Fully keyboard operable too: focus a grip,{" "}
        <span className="font-medium text-foreground">Space</span> grabs, <span className="font-medium text-foreground">↑↓</span>{" "}
        move with the same glide, <span className="font-medium text-foreground">Escape</span> puts it back. Tick{" "}
        <span className="font-medium text-foreground">Hard snap</span> to feel the same math with zero interpolation.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-2.5" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={reorderSnap} onChange={setReorderSnap}>
          Hard snap <span className="text-subtle-foreground">- disables the glides and the FLIP, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectReorder} onChange={setInspectReorder} />
          {inspectReorder && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectReorder ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <DragReorderList flip={!reorderSnap} inspect={inspectReorder} onStateChange={handleReorderState} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground" style={{ animationDelay: "90ms" }}>
        {inspectReorder ? (
          <>
            dragged: raw <code className="text-foreground">translate</code> · siblings: <code className="text-foreground">±1 slot</code>{" "}
            · drop: <code className="text-foreground">FLIP invert → glide</code>
          </>
        ) : reorderState.dragging || reorderState.grabbed ? (
          <>
            Moving <span className="font-medium text-foreground">{reorderState.dragging ?? reorderState.order[reorderState.to ?? 0]}</span>
            {reorderState.from !== null && reorderState.to !== null && (
              <>
                {" "}
                · slot <span className="font-medium text-foreground">{reorderState.from + 1} → {reorderState.to + 1}</span>
              </>
            )}
          </>
        ) : reorderState.lastMove ? (
          <>
            Last move: <span className="font-medium text-foreground">{reorderState.lastMove.label}</span> ·{" "}
            <span className="font-medium text-foreground">
              {reorderState.lastMove.from} → {reorderState.lastMove.to}
            </span>
          </>
        ) : (
          <>
            Last move: <span className="font-medium text-foreground">none</span> · drag a card or click a grip
          </>
        )}
      </p>
    </>
  );
}
