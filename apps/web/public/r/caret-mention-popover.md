# Caret-Anchored Mention Popover

An @-mention popover anchored to the text caret via a hidden mirror, gliding as you type.

- Demo: https://lab.moumen.dev/components/caret-mention-popover
- Install: `npx moumenlab add caret-mention-popover` — or `npx shadcn@latest add https://lab.moumen.dev/r/caret-mention-popover.json`
- Dependencies: motion
- Registry dependencies: https://lab.moumen.dev/r/lab-theme.json
- Installs to: `components/lab/caret-mention-popover.tsx`

## Usage

```tsx
"use client";

import MentionComposer from "./caret-mention-popover";

export default function MentionComposerExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      {/* Type @ to mention. Pass your people and handle onSubmit(text, mentions). */}
      <MentionComposer
        people={[
          { name: "Sarah Chen", handle: "sarahchen" },
          { name: "Omar Farouk", handle: "omarfarouk" },
          { name: "June Park", handle: "junepark" },
        ]}
        onSubmit={(text, mentions) => console.log("send", text, mentions)}
      />

      {/* anchor="field" is the usual dropdown shortcut — under the field, not the caret. */}
      <MentionComposer anchor="field" />
    </div>
  );
}
```

## Source — `components/lab/caret-mention-popover.tsx`

```tsx
"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";

// Mention composer — a caret-anchored @mention popover.
//
// A textarea won't tell you where its caret is — the only API is selectionStart,
// a character index, no x/y. So most popovers anchor to the FIELD (bottom-left,
// like a dropdown), which feels detached from what you're typing. This one
// anchors to the CARET, with three stacked layers sharing one typography class
// so their metrics can never drift:
//
//   · input    — the real textarea (transparent background, visible text).
//   · backdrop — behind it, same box, text painted TRANSPARENT; only the
//     highlight boxes show through (inserted mentions as pills, the live @query
//     as a lighter chip). The spans add zero advance (box-shadow fakes the
//     inset), so the backdrop's glyph grid matches the textarea exactly.
//   · mirror   — invisible. value.slice(0, caret) is re-typeset into it plus a
//     marker <span>; the marker's offsetLeft/offsetTop IS the caret's x/y.
//
// The popover is positioned with `translate` (left/top stay 0), so following the
// caret is one retargetable transition — it glides, and a fresh open snaps. It
// clamps horizontally and flips above when the viewport runs out. Focus never
// leaves the textarea: ↑↓/Enter/Tab drive the list via aria-activedescendant.
//
// Animation via motion/react (the pill fade + send-icon swap) plus CSS
// transitions; honours prefers-reduced-motion. Requires the lab-theme tokens.
// Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;

// THE contract: input, backdrop and mirror all take this, so their metrics
// (font, line height, wrap width, spacing) cannot drift apart.
const TEXT = "font-[inherit] text-[0.9375rem] leading-6 tracking-normal whitespace-pre-wrap [overflow-wrap:break-word]";

export interface Person {
  name: string;
  handle: string;
}

export interface MentionState {
  open: boolean;
  query: string;
  matches: number;
  caret: { x: number; y: number } | null;
  placement: string;
  anchor: string;
  mentions: number;
  lastMention: string | null;
}

interface Match {
  person: Person;
  score?: number;
  nameRange: [number, number] | null;
  handleRange: [number, number] | null;
}

// Word-prefix on the name beats handle-prefix beats substring.
function rank(people: Person[], query: string): Match[] {
  if (!query) return people.map((person) => ({ person, nameRange: null, handleRange: null }));
  const needle = query.toLowerCase();
  const scored: Match[] = [];
  for (const person of people) {
    const name = person.name.toLowerCase();
    const handle = person.handle.toLowerCase();
    let score: number | null = null;
    let nameRange: [number, number] | null = null;
    let handleRange: [number, number] | null = null;
    let offset = 0;
    for (const word of name.split(" ")) {
      if (word.startsWith(needle)) {
        score = 3;
        nameRange = [offset, offset + query.length];
        break;
      }
      offset += word.length + 1;
    }
    if (score === null && handle.startsWith(needle)) {
      score = 2;
      handleRange = [0, query.length];
    }
    if (score === null) {
      const at = name.indexOf(needle);
      if (at !== -1) {
        score = 1;
        nameRange = [at, at + query.length];
      }
    }
    if (score === null) {
      const at = handle.indexOf(needle);
      if (at !== -1) {
        score = 0;
        handleRange = [at, at + query.length];
      }
    }
    if (score !== null) scored.push({ person, score, nameRange, handleRange });
  }
  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return scored;
}

function findToken(text: string, caretIndex: number) {
  const before = text.slice(0, caretIndex);
  const match = /(?:^|[\s([{])@([\w-]*)$/.exec(before);
  if (!match) return null;
  return { start: caretIndex - match[1].length - 1, end: caretIndex, query: match[1] };
}

function buildSegments(text: string, names: string[], token: { start: number; end: number } | null, inspect: boolean) {
  const marks: { start: number; end: number; kind: "pill" | "tok" }[] = [];
  for (const name of names) {
    const needle = `@${name}`;
    let from = 0;
    let at: number;
    while ((at = text.indexOf(needle, from)) !== -1) {
      marks.push({ start: at, end: at + needle.length, kind: "pill" });
      from = at + needle.length;
    }
  }
  if (token && token.end > token.start) marks.push({ start: token.start, end: token.end, kind: "tok" });
  marks.sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  const seen: Record<string, number> = {};
  let pos = 0;
  for (const mark of marks) {
    if (mark.start < pos) continue;
    if (mark.start > pos) out.push(text.slice(pos, mark.start));
    const content = text.slice(mark.start, mark.end);
    const key = mark.kind === "pill" ? `pill-${content}-${(seen[content] = (seen[content] ?? 0) + 1)}` : `tok-${mark.start}`;
    out.push(
      <motion.span
        key={key}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: EASE }}
        className={
          mark.kind === "pill"
            ? "bg-[#e8ebee] rounded-[0.25rem] shadow-[0_0_0_1.5px_#e8ebee] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
            : `bg-[#f4f4f5] rounded-[0.25rem] shadow-[0_0_0_1.5px_#f4f4f5] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]${inspect ? " outline outline-[1.5px] outline-dashed outline-[#f59e0b] outline-offset-[1.5px]" : ""}`
        }
      >
        {content}
      </motion.span>,
    );
    pos = mark.end;
  }
  if (pos < text.length) out.push(text.slice(pos));
  return out;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// Underline (not bold) for the matched range — a weight change would reflow.
function Highlight({ text, range }: { text: string; range: [number, number] | null }) {
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range[0])}
      <span className="underline underline-offset-2 decoration-gray-400">{text.slice(range[0], range[1])}</span>
      {text.slice(range[1])}
    </>
  );
}

export default function MentionComposer({
  people = PEOPLE,
  anchor = "caret",
  inspect = false,
  onStateChange,
  onSubmit,
}: {
  people?: Person[];
  anchor?: "caret" | "field";
  inspect?: boolean;
  onStateChange?: (state: MentionState) => void;
  onSubmit?: (value: string, mentions: string[]) => void;
}) {
  const [value, setValue] = useState("Nice catch, let’s loop in ");
  const [mentioned, setMentioned] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<{ start: number; end: number; query: string } | null>(null);
  const [matches, setMatches] = useState<Match[]>(() => rank(people, ""));
  const [active, setActive] = useState(0);
  const [caret, setCaret] = useState<{ x: number; y: number; tx: number; ty: number; h: number } | null>(null);
  const [placement, setPlacement] = useState("below");
  const [lastMention, setLastMention] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const backdropInnerRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const popCardRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wasOpenRef = useRef(false);
  const composingRef = useRef(false);
  const dismissedRef = useRef<number | null>(null);
  const pendingCaretRef = useRef<{ index: number; focus: boolean } | null>(null);
  const sentTimerRef = useRef<number>(0);
  const syncRef = useRef<(overrideIndex?: number) => void>(() => {});
  const listboxId = useId();

  const query = token?.query ?? "";

  function measureCaret(caretIndex: number) {
    const ta = inputRef.current;
    const mirror = mirrorRef.current;
    const field = fieldRef.current;
    if (!ta || !mirror || !field) return;
    mirror.style.width = `${ta.clientWidth}px`;
    mirror.textContent = ta.value.slice(0, caretIndex);
    const marker = document.createElement("span");
    marker.textContent = "​";
    mirror.appendChild(marker);
    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 24;
    const tx = marker.offsetLeft - ta.scrollLeft;
    const ty = marker.offsetTop - ta.scrollTop;
    setCaret({ x: field.offsetLeft + tx, y: field.offsetTop + ty, tx, ty, h: lineHeight });
  }

  function sync(overrideIndex?: number) {
    const ta = inputRef.current;
    if (!ta || composingRef.current) return;
    const caretIndex = overrideIndex ?? ta.selectionStart ?? ta.value.length;
    const found = findToken(ta.value, caretIndex);
    if (found) {
      if (found.query !== (token?.query ?? null)) setActive(0);
      const ranked = rank(people, found.query);
      setToken(found);
      setMatches(ranked);
      setOpen(ranked.length > 0 && dismissedRef.current !== found.start);
    } else {
      dismissedRef.current = null;
      setToken(null);
      setOpen(false);
    }
    measureCaret(caretIndex);
  }
  syncRef.current = sync;

  function autoGrow() {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }

  useLayoutEffect(() => {
    autoGrow();
    const ta = inputRef.current;
    if (!ta) return;
    const pending = pendingCaretRef.current;
    pendingCaretRef.current = null;
    if (pending) {
      if (pending.focus) {
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(pending.index, pending.index);
        sync();
      } else {
        sync(pending.index);
      }
    } else {
      sync();
    }
    if (backdropInnerRef.current) backdropInnerRef.current.style.transform = `translateY(${-ta.scrollTop}px)`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useLayoutEffect(() => {
    const pop = popRef.current;
    const card = popCardRef.current;
    const wrapper = rootRef.current;
    const field = fieldRef.current;
    if (!pop || !wrapper || !field) return;
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    const gap = 6;
    const caretX = caret ? caret.x : field.offsetLeft;
    const caretY = caret ? caret.y : field.offsetTop;
    const lineH = caret ? caret.h : 24;
    const anchorX = anchor === "caret" ? caretX : field.offsetLeft;
    const belowY = anchor === "caret" ? caretY + lineH + gap : field.offsetTop + field.offsetHeight + gap;
    const aboveAnchorY = anchor === "caret" ? caretY : field.offsetTop;
    const popW = pop.offsetWidth;
    const listH = listRef.current?.offsetHeight ?? 0;
    const popH = listH + 8;
    const left = Math.max(0, Math.min(anchorX, wrapper.clientWidth - popW));
    const rect = wrapper.getBoundingClientRect();
    const fitsBelow = rect.top + belowY + popH + 12 <= window.innerHeight;
    const aboveY = aboveAnchorY - popH - gap;
    const useAbove = !fitsBelow && rect.top + aboveY >= 8;
    const top = useAbove ? aboveY : belowY;
    setPlacement(useAbove ? "above" : "below");
    card?.style.setProperty("--ox", `${Math.max(12, Math.min(anchorX - left, popW - 12))}px`);
    const clip = clipRef.current;
    if (!wasOpenRef.current) {
      pop.style.transition = "none";
      if (clip) clip.style.transition = "none";
      pop.style.translate = `${left}px ${top}px`;
      if (clip) clip.style.height = `${listH}px`;
      void pop.offsetWidth;
      pop.style.transition = "";
      if (clip) clip.style.transition = "";
    } else {
      pop.style.translate = `${left}px ${top}px`;
      if (clip) clip.style.height = `${listH}px`;
    }
    wasOpenRef.current = true;
  }, [open, caret, anchor, matches.length]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (!inspect) {
      if (document.activeElement !== inputRef.current) setOpen(false);
      return;
    }
    dismissedRef.current = null;
    const current = inputRef.current?.value ?? "";
    if (findToken(current, current.length)) {
      sync(current.length);
    } else {
      const next = `${current}${current === "" || /\s$/.test(current) ? "" : " "}@`;
      pendingCaretRef.current = { index: next.length, focus: false };
      setValue(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspect]);

  useEffect(() => {
    const onResize = () => syncRef.current();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => () => clearTimeout(sentTimerRef.current), []);

  useEffect(() => {
    onStateChange?.({
      open,
      query,
      matches: matches.length,
      caret: caret ? { x: Math.round(caret.tx), y: Math.round(caret.ty) } : null,
      placement,
      anchor,
      mentions: mentioned.length,
      lastMention,
    });
  }, [open, query, matches.length, caret, placement, anchor, mentioned, lastMention, onStateChange]);

  function insertMention(person: Person) {
    const ta = inputRef.current;
    if (!ta || !token) return;
    const mention = `@${person.name}`;
    const next = `${value.slice(0, token.start)}${mention} ${value.slice(ta.selectionStart)}`;
    pendingCaretRef.current = { index: token.start + mention.length + 1, focus: true };
    setValue(next);
    setMentioned((list) => (list.includes(person.name) ? list : [...list, person.name]));
    setLastMention(person.name);
    setToken(null);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (index + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      insertMention(matches[active].person);
    } else if (event.key === "Escape") {
      event.preventDefault();
      dismissedRef.current = token?.start ?? null;
      setOpen(false);
    }
  }

  function handleScroll() {
    const ta = inputRef.current;
    if (!ta) return;
    if (backdropInnerRef.current) backdropInnerRef.current.style.transform = `translateY(${-ta.scrollTop}px)`;
    if (token) measureCaret(ta.selectionStart ?? 0);
  }

  function handleSend() {
    onSubmit?.(value, mentioned);
    setSent(true);
    clearTimeout(sentTimerRef.current);
    sentTimerRef.current = window.setTimeout(() => setSent(false), 1400);
    setValue("");
    setMentioned([]);
    setToken(null);
    setOpen(false);
  }

  const iconShown = { opacity: 1, scale: 1, filter: "blur(0px)" };
  const iconHidden = { opacity: 0, scale: 0.25, filter: "blur(4px)" };

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="relative w-full" data-inspect={inspect ? "true" : "false"}>
        <div
          className={`bg-white rounded-2xl px-4 pt-3.5 pb-2.5 shadow-border [transition:box-shadow_200ms_ease] hover:shadow-border-hover focus-within:shadow-border-hover focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-[#111]${
            inspect ? " !shadow-none outline outline-[1.5px] outline-dashed outline-[#3b82f6]" : ""
          }`}
        >
          <div className="relative" ref={fieldRef}>
            <div className={`${TEXT} absolute inset-0 overflow-hidden text-transparent pointer-events-none`} aria-hidden="true">
              <div ref={backdropInnerRef}>{buildSegments(value, mentioned, token, inspect)}</div>
            </div>
            <textarea
              ref={inputRef}
              className={`${TEXT} block relative z-[1] w-full min-h-12 max-h-[10.5rem] p-0 border-0 resize-none overflow-y-auto bg-transparent text-[#111] [caret-color:#111] outline-none placeholder:text-gray-400`}
              value={value}
              rows={2}
              placeholder="Write a comment, @ to mention"
              aria-label="Comment"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={open ? `${listboxId}-${active}` : undefined}
              spellCheck={false}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={() => sync()}
              onClick={() => sync()}
              onFocus={() => sync()}
              onBlur={() => {
                if (!inspect) setOpen(false);
              }}
              onScroll={handleScroll}
              onCompositionStart={() => {
                composingRef.current = true;
              }}
              onCompositionEnd={() => {
                composingRef.current = false;
                sync();
              }}
            />
            <div className={`${TEXT} absolute top-0 left-0 invisible pointer-events-none`} ref={mirrorRef} aria-hidden="true" />
          </div>

          <div className="flex items-center justify-between gap-3 mt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <kbd className="font-[inherit] text-[0.6875rem] font-semibold text-gray-500 bg-[#f4f4f5] px-[0.3125rem] rounded-[0.25rem] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">@</kbd> to mention
              {mentioned.length > 0 && <> · {mentioned.length} mentioned</>}
            </span>
            <button
              type="button"
              className="grid place-items-center w-9 h-9 rounded-[0.625rem] text-gray-500 [transition:scale_150ms_ease-out,background-color_200ms_ease,color_200ms_ease,opacity_200ms_ease] hover:enabled:bg-[#f4f4f5] hover:enabled:text-[#111] active:enabled:scale-[0.96] disabled:opacity-35 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
              disabled={!sent && value.trim() === ""}
              onClick={handleSend}
              aria-label="Send comment"
            >
              <motion.span className="[grid-area:1/1] inline-flex [&>svg]:[translate:-1px_1px]" initial={false} animate={sent ? iconHidden : iconShown} transition={{ duration: 0.3, ease: EASE_ICON }}>
                <SendIcon />
              </motion.span>
              <motion.span className="[grid-area:1/1] inline-flex text-[#16a34a]" initial={false} animate={sent ? iconShown : iconHidden} transition={{ duration: 0.3, ease: EASE_ICON }} aria-hidden="true">
                <CheckIcon />
              </motion.span>
            </button>
          </div>
        </div>

        {/* Popover: always mounted; `translate` on the shell (imperative) anchors it. */}
        <div
          className="group/pop absolute top-0 left-0 w-[15rem] z-30 pointer-events-none [transition:translate_140ms_var(--ease-smooth-out)] data-[open=true]:pointer-events-auto"
          ref={popRef}
          data-open={open ? "true" : "false"}
          data-placement={placement}
          aria-hidden={!open}
        >
          <div
            className={`relative bg-white rounded-xl p-1 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_32px_-8px_rgba(0,0,0,0.22)] [transform-origin:var(--ox,1rem)_top] opacity-0 scale-[0.96] -translate-y-1 blur-[2px] invisible [transition:opacity_140ms_var(--ease-smooth-out),scale_140ms_var(--ease-smooth-out),translate_140ms_var(--ease-smooth-out),filter_140ms_var(--ease-smooth-out),visibility_0s_linear_140ms] group-data-[placement=above]/pop:[transform-origin:var(--ox,1rem)_bottom] group-data-[placement=above]/pop:translate-y-1 group-data-[open=true]/pop:opacity-100 group-data-[open=true]/pop:scale-100 group-data-[open=true]/pop:translate-y-0 group-data-[open=true]/pop:blur-[0px] group-data-[open=true]/pop:visible group-data-[open=true]/pop:[transition:opacity_180ms_var(--ease-smooth-out),scale_180ms_var(--ease-smooth-out),translate_180ms_var(--ease-smooth-out),filter_180ms_var(--ease-smooth-out),visibility_0s]${
              inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444]" : ""
            }`}
            ref={popCardRef}
          >
            <div className="overflow-hidden [transition:height_160ms_var(--ease-smooth-out)]" ref={clipRef}>
              <ul role="listbox" id={listboxId} aria-label="People to mention" className="flex flex-col max-h-[15.5rem] overflow-y-auto" ref={listRef}>
                {matches.map((match, index) => (
                  <li
                    key={match.person.handle}
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={index === active}
                    className="flex items-center gap-2.5 min-h-10 px-2 py-1.5 rounded-lg cursor-pointer opacity-0 translate-y-1 [transition:background-color_90ms_ease,opacity_200ms_var(--ease-smooth-out),translate_200ms_var(--ease-smooth-out)] group-data-[open=true]/pop:opacity-100 group-data-[open=true]/pop:translate-y-0 group-data-[open=true]/pop:[transition-delay:0ms,calc(var(--i,0)*25ms),calc(var(--i,0)*25ms)] data-[active]:bg-[#f4f4f5]"
                    style={{ "--i": Math.min(index, 5) } as React.CSSProperties}
                    data-active={index === active ? "true" : undefined}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      insertMention(match.person);
                    }}
                    onMouseMove={() => setActive(index)}
                  >
                    <span className="flex-none grid place-items-center w-7 h-7 rounded-full bg-[#eef0f2] text-[0.625rem] font-semibold tracking-[0.02em] text-gray-700" aria-hidden="true">
                      {initials(match.person.name)}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className="text-[0.8125rem] font-medium text-[#111] whitespace-nowrap overflow-hidden text-ellipsis">
                        <Highlight text={match.person.name} range={match.nameRange} />
                      </span>
                      <span className="text-[0.6875rem] text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
                        @<Highlight text={match.person.handle} range={match.handleRange} />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {inspect && <SpecLabel className="top-[calc(100%+0.4rem)] right-0 border-[#fecaca] text-[#dc2626]">translate: caret + line · clamp ↔ · flip ↕</SpecLabel>}
          </div>
        </div>

        {open && (
          <span className="sr-only" aria-live="polite">
            {matches.length} {matches.length === 1 ? "person" : "people"} found. Press up and down to navigate, Enter to mention.
          </span>
        )}

        {inspect && (
          <>
            <SpecLabel className="-top-[1.7rem] left-0 border-[#bfdbfe] text-[#2563eb]">hidden mirror re-typesets the value → marker = caret</SpecLabel>
            {caret && (
              <span className="absolute top-0 left-0 w-0.5 h-[var(--h,1.5rem)] bg-[#ef4444] z-[35] pointer-events-none" style={{ translate: `${caret.x}px ${caret.y}px`, "--h": `${caret.h}px` } as React.CSSProperties}>
                <SpecLabel className="top-0 left-1.5 border-[#fecaca] text-[#dc2626]">caret · x {Math.round(caret.tx)} · y {Math.round(caret.ty)}</SpecLabel>
              </span>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  );
}

function SpecLabel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`absolute z-[36] whitespace-nowrap rounded-[0.25rem] border bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none ${className}`}>{children}</span>;
}

const PEOPLE: Person[] = [
  { name: "Sarah Chen", handle: "sarahchen" },
  { name: "Omar Farouk", handle: "omarfarouk" },
  { name: "June Park", handle: "junepark" },
  { name: "Maya Lindberg", handle: "mayalindberg" },
  { name: "Tomás Rivera", handle: "tomasrivera" },
  { name: "Ali Hassan", handle: "alihassan" },
  { name: "Nadia Rahman", handle: "nadiarahman" },
  { name: "Leo Okafor", handle: "leookafor" },
];

function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function SendIcon() { return <Svg><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></Svg>; }
function CheckIcon() { return <Svg><path d="M20 6 9 17l-5-5" /></Svg>; }
```
