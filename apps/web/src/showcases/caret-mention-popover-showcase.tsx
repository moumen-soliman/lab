"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import MentionComposer, { type MentionState } from "@/registry/lab/caret-mention-popover/caret-mention-popover";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function MentionComposerShowcase() {
  const [mentionFieldAnchor, setMentionFieldAnchor] = useState(false);
  const [inspectMention, setInspectMention] = useState(false);
  const [mentionState, setMentionState] = useState<MentionState>({
    open: false,
    query: "",
    matches: 0,
    caret: null,
    placement: "below",
    anchor: "caret",
    mentions: 0,
    lastMention: null,
  });
  const [lastComment, setLastComment] = useState<{ text: string; mentions: string[] } | null>(null);
  const handleMentionState = useCallback((state: MentionState) => setMentionState(state), []);
  const handleMentionSubmit = useCallback((text: string, mentions: string[]) => setLastComment({ text, mentions }), []);

  return (
    <>
      <ShowcaseIntro title="Caret-Anchored Mention Popover" delay={40} defaultOpen>
        Type <code className="text-foreground">@</code> and the people popover opens{" "}
        <span className="font-medium text-foreground">at the text caret</span>, not under the field. Textareas won&apos;t
        give you the caret&apos;s x·y, so a <span className="font-medium text-foreground">hidden mirror</span> re-typesets
        everything before it and reads a marker&apos;s offset. The popover{" "}
        <span className="font-medium text-foreground">glides after the caret</span> as you type, its rows cascade in, its
        height eases as the list filters, and it clamps to the card and flips above when the screen runs out.{" "}
        <span className="font-medium text-foreground">↑↓ + Enter</span> pick a person while focus never leaves the textarea
        (<code className="text-foreground">aria-activedescendant</code>), and inserted names render as{" "}
        <span className="font-medium text-foreground">pills</span> painted by a transparent overlay behind the real text.
        Tick <span className="font-medium text-foreground">Anchor to field</span> to feel the usual shortcut.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-2.5" style={{ animationDelay: "60ms" }}>
        <CheckToggle checked={mentionFieldAnchor} onChange={setMentionFieldAnchor}>
          Anchor to field <span className="text-subtle-foreground">- the usual dropdown shortcut, for comparison</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectMention} onChange={setInspectMention} />
          {inspectMention && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectMention ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <MentionComposer
          anchor={mentionFieldAnchor ? "field" : "caret"}
          inspect={inspectMention}
          onStateChange={handleMentionState}
          onSubmit={handleMentionSubmit}
        />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground" style={{ animationDelay: "90ms" }}>
        {inspectMention ? (
          <>
            mirror <code className="text-foreground">marker.offsetLeft/Top</code> = caret · popover{" "}
            <code className="text-foreground">translate</code> follows · clamp ↔ · flip ↕
          </>
        ) : (
          <>
            Popover:{" "}
            <span className="font-medium text-foreground">
              {mentionState.open ? `open · "${mentionState.query}" · ${mentionState.matches} match${mentionState.matches === 1 ? "" : "es"}` : "closed"}
            </span>
            {mentionState.caret && (
              <>
                {" "}
                · caret <span className="font-medium text-foreground">{mentionState.caret.x}×{mentionState.caret.y}</span>
              </>
            )}
            {" · "}Last mention: <span className="font-medium text-foreground">{mentionState.lastMention ?? "none"}</span>
            {lastComment && (
              <>
                {" "}
                · Sent with <span className="font-medium text-foreground">{lastComment.mentions.length}</span> mention
                {lastComment.mentions.length === 1 ? "" : "s"}
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
