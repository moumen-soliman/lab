# Command Palette with Argument Chips

Commands that take inline argument chips, fuzzy ranking, and a measured height morph.

- Demo: https://lab.moumen.dev/components/command-palette
- Install: `npx moumenlab add command-palette` — or `npx shadcn@latest add https://lab.moumen.dev/r/command-palette.json`
- Dependencies: motion
- Registry dependencies: https://lab.moumen.dev/r/lab-theme.json
- Installs to: `components/lab/command-palette.tsx`

## Usage

```tsx
"use client";

import type { ReactNode } from "react";
import CommandPalette, { type Command } from "./command-palette";

// Commands are data: label + icon + shortcut + typed argument slots, each with
// its own options and a `message` for the applied summary. Pass your own and
// handle onApply(clauses) to run the compound.
export default function CommandPaletteExample() {
  return <CommandPalette commands={COMMANDS} onApply={(clauses) => console.log("apply", clauses)} />;
}

const PEOPLE = [
  { value: "Sarah Chen", hint: "Design" },
  { value: "Omar Farouk", hint: "Engineering" },
  { value: "June Park", hint: "Product" },
  { value: "Maya Lindberg", hint: "Engineering" },
  { value: "Leo Okafor", hint: "Data" },
];
const PRIORITIES = [
  { value: "Urgent", dot: "#dc2626" },
  { value: "High", dot: "#f59e0b" },
  { value: "Medium", dot: "#3b82f6" },
  { value: "Low", dot: "#9ca3af" },
];
const PROJECTS = [{ value: "Website Redesign" }, { value: "Mobile App" }, { value: "Design System" }, { value: "Billing Service" }];
const LABELS = [
  { value: "Bug", dot: "#dc2626" },
  { value: "Feature", dot: "#3b82f6" },
  { value: "Improvement", dot: "#10b981" },
  { value: "Docs", dot: "#8b5cf6" },
  { value: "Chore", dot: "#9ca3af" },
];

function dueOptions() {
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  const day = (offset: number) => fmt.format(new Date(Date.now() + offset * 86400000));
  return [
    { value: "Today", hint: day(0) },
    { value: "Tomorrow", hint: day(1) },
    { value: "Next week", hint: day(7) },
    { value: "Next month", hint: day(30) },
    { value: "No due date" },
  ];
}

export const COMMANDS: Command[] = [
  {
    id: "assign",
    label: "Assign to",
    icon: <CommandIcon name="user" />,
    shortcut: "A",
    slots: [
      { name: "assignee", prompt: "Assign to whom", kind: "person", options: PEOPLE },
      { name: "priority", prompt: "With what priority", kind: "dot", options: PRIORITIES },
    ],
    message: (v) => `Assigned to ${v[0].value} · ${v[1].value} priority`,
  },
  {
    id: "due",
    label: "Set due date",
    icon: <CommandIcon name="calendar" />,
    shortcut: "D",
    slots: [{ name: "due", prompt: "When is it due", kind: "plain", options: dueOptions() }],
    message: (v) => (v[0].value === "No due date" ? "Due date cleared" : `Due ${v[0].value.toLowerCase()}${v[0].hint ? ` · ${v[0].hint}` : ""}`),
  },
  {
    id: "move",
    label: "Move to project",
    icon: <CommandIcon name="folder" />,
    shortcut: "M",
    slots: [{ name: "project", prompt: "Which project", kind: "plain", options: PROJECTS }],
    message: (v) => `Moved to ${v[0].value}`,
  },
  {
    id: "label",
    label: "Add label",
    icon: <CommandIcon name="tag" />,
    shortcut: "L",
    slots: [{ name: "label", prompt: "Which label", kind: "dot", options: LABELS }],
    message: (v) => `Labeled ${v[0].value}`,
  },
  { id: "copy", label: "Copy issue link", icon: <CommandIcon name="link" />, shortcut: "⌘C", slots: [], message: () => "Link copied to clipboard" },
  { id: "subscribe", label: "Subscribe to updates", icon: <CommandIcon name="bell" />, shortcut: "S", slots: [], message: () => "Subscribed to this issue" },
  { id: "archive", label: "Archive issue", icon: <CommandIcon name="archive" />, danger: true, slots: [], message: () => "Issue archived" },
];

function CommandIcon({ name }: { name: string }): ReactNode {
  const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "user") return <svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === "calendar") return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
  if (name === "folder") return <svg {...p}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
  if (name === "tag") return <svg {...p}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>;
  if (name === "link") return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
  if (name === "bell") return <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
  return <svg {...p}><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>;
}
```

## Source — `components/lab/command-palette.tsx`

```tsx
"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

// Command palette with argument chips — Linear-style multi-step commands inside
// a single input.
//
// The hard problem is focus choreography. A command like "Assign to [person]
// with priority [level]" is really a tiny form; the obvious build gives each
// picked value its own focusable element — then Tab order, Backspace and
// screen-reader context all fracture mid-command. Here the palette has exactly
// ONE focusable control, the text input, for its whole life:
//
//   · Picking a command collapses it into a CHIP painted before the input (the
//     chip is render output, not a field). The list slides to that command's
//     first argument slot and the same input now filters the options.
//   · Filling a command's last slot STAGES it as a clause instead of running
//     it — the list slides back to the remaining commands joined by an "and",
//     so one session builds a compound. Nothing runs until ✓ Apply (⌘⏎);
//     ✕ discards the whole stack.
//   · Backspace on an empty query POPS the last chip — across the "and" too.
//     Chips never join the tab order but ARE clickable: clicking one rewinds
//     to that slot; the tail dims to preview the rewind scope.
//
// Matching is a fuzzy subsequence ("mvp" finds "Move to project") scored with
// word-start + adjacency bonuses minus a gap penalty, matched letters
// underlined in place. The list body's height is a measured px that motion
// eases between filter states and view swaps; pushes slide in from the right,
// pops from the left; chips grow in and pop instantly (Backspace must feel
// immediate). Pass your own `commands` and handle `onApply`.
//
// Animation via motion/react; honours prefers-reduced-motion. Requires the
// lab-theme tokens. Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;
const SLIDE = 28; // 1.75rem directional slide

export interface CommandOption {
  value: string;
  hint?: string;
  dot?: string;
}
export interface CommandSlot {
  name: string;
  prompt: string;
  kind: "person" | "dot" | "plain";
  options: CommandOption[];
}
export interface Command {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  danger?: boolean;
  slots: CommandSlot[];
  message: (values: CommandOption[]) => string;
}

export interface CommandPaletteState {
  mode: string;
  depth: number;
  staged: number;
  query: string;
  matches: number;
  chips: string[];
  height: number | null;
  lastRun: string | null;
}

// ── Matching ───────────────────────────────────────────────────────────
function scan(query: string, hay: string, boundaryFirst: boolean) {
  const idx: number[] = [];
  let pos = 0;
  let score = 0;
  let prev = -2;
  for (const ch of query) {
    let at = -1;
    if (boundaryFirst) {
      for (let i = pos; i < hay.length; i += 1) {
        if (hay[i] === ch && (i === 0 || hay[i - 1] === " ")) {
          at = i;
          break;
        }
      }
    }
    if (at === -1) at = hay.indexOf(ch, pos);
    if (at === -1) return null;
    if (at === 0 || hay[at - 1] === " ") score += 10;
    else score += 4;
    if (at === prev + 1) score += 8;
    score -= Math.min(6, at - pos);
    idx.push(at);
    prev = at;
    pos = at + 1;
  }
  return { score, idx };
}

function fuzzyMatch(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return { score: 0, idx: [] };
  const hay = text.toLowerCase();
  const a = scan(q, hay, true);
  const b = scan(q, hay, false);
  if (!a) return b;
  if (!b) return a;
  return a.score >= b.score ? a : b;
}

function substringMatch(query: string, text: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, idx: [] };
  const at = text.toLowerCase().indexOf(q);
  if (at === -1) return null;
  return { score: 100 - at, idx: Array.from({ length: q.length }, (_, i) => at + i) };
}

// Underline the matched letters where they sit — consecutive indices merge.
function Highlight({ text, idx }: { text: string; idx: number[] }) {
  if (!idx || idx.length === 0) return <>{text}</>;
  const set = new Set(idx);
  const out: ReactNode[] = [];
  let run = "";
  let marked = set.has(0);
  for (let i = 0; i <= text.length; i += 1) {
    const now = i < text.length && set.has(i);
    if (i === text.length || now !== marked) {
      if (run)
        out.push(
          marked ? (
            <span key={`m${i}`} className="text-[#111] underline decoration-gray-400 decoration-1 underline-offset-[3px] group-data-[danger=true]/opt:group-data-[active=true]/opt:text-inherit">
              {run}
            </span>
          ) : (
            <Fragment key={`t${i}`}>{run}</Fragment>
          ),
        );
      run = "";
      marked = now;
    }
    if (i < text.length) run += text[i];
  }
  return <>{out}</>;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

interface Clause {
  command: Command;
  values: CommandOption[];
}
interface Row {
  item: CommandOption | Command;
  idx: number[];
  score: number;
  order: number;
}
const labelOf = (item: CommandOption | Command) => ("label" in item ? item.label : item.value);

export default function CommandPalette({
  commands,
  matcher = "fuzzy",
  morph = true,
  onApply,
  inspect = false,
  onStateChange,
}: {
  commands: Command[];
  /** "fuzzy" = scored subsequence · "substring" = plain indexOf. */
  matcher?: "fuzzy" | "substring";
  morph?: boolean;
  /** Runs when ✓ Apply / ⌘⏎ commits the staged clauses. */
  onApply?: (clauses: { command: Command; values: CommandOption[] }[]) => void;
  inspect?: boolean;
  onStateChange?: (state: CommandPaletteState) => void;
}) {
  const [query, setQuery] = useState("");
  const [command, setCommand] = useState<Command | null>(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [values, setValues] = useState<CommandOption[]>([]);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [active, setActive] = useState(0);
  const [bodyH, setBodyH] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<{ rows: Row[]; ctx: { command: Command | null; slotIndex: number }; dir: number } | null>(null);
  const [ran, setRan] = useState<{ message: string } | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [hoveredChip, setHoveredChip] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const leaveTimerRef = useRef<number>(0);
  const ranTimerRef = useRef<number>(0);
  const bodyFirstRef = useRef(true);
  const listboxId = useId();
  const reduced = useReducedMotion();

  const slot = command ? command.slots[slotIndex] : null;
  const stagedIds = useMemo(() => new Set(clauses.map((c) => c.command.id)), [clauses]);
  const items = useMemo<(CommandOption | Command)[]>(
    () => (slot ? slot.options : commands.filter((cmd) => !stagedIds.has(cmd.id))),
    [slot, commands, stagedIds],
  );
  const viewKey = command ? `${command.id}:${slotIndex}` : "root";

  const matches = useMemo<Row[]>(() => {
    const match = matcher === "fuzzy" ? fuzzyMatch : substringMatch;
    const out: Row[] = [];
    items.forEach((item, order) => {
      const hit = match(query, labelOf(item));
      if (hit) out.push({ item, idx: hit.idx, score: hit.score, order });
    });
    out.sort((a, b) => b.score - a.score || a.order - b.order);
    return out;
  }, [items, query, matcher]);

  const activeSafe = Math.min(active, Math.max(0, matches.length - 1));

  const chipGroups = [
    ...clauses.map((clause, index) => ({
      key: `clause-${index}`,
      chips: [
        { key: "cmd", label: clause.command.label, kind: "cmd" as const, dot: undefined as string | undefined },
        ...clause.values.map((v, i) => ({ key: `v${i}`, label: v.value, kind: "val" as const, dot: v.dot })),
      ],
    })),
    ...(command
      ? [
          {
            key: "live",
            chips: [
              { key: "cmd", label: command.label, kind: "cmd" as const, dot: undefined as string | undefined },
              ...values.map((v, i) => ({ key: `v${i}`, label: v.value, kind: "val" as const, dot: v.dot })),
            ],
          },
        ]
      : []),
  ];
  const chips = chipGroups.flatMap((g) => g.chips.map((c) => c.label));

  function shift(dir: number, mutate: () => void) {
    if (morph && !reduced) {
      setLeaving({ rows: matches, ctx: { command, slotIndex }, dir });
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = window.setTimeout(() => setLeaving(null), 320);
    }
    mutate();
    setQuery("");
    setActive(0);
  }

  function stageClause(cmd: Command, vals: CommandOption[]) {
    shift(1, () => {
      setClauses((list) => [...list, { command: cmd, values: vals }]);
      setCommand(null);
      setSlotIndex(0);
      setValues([]);
    });
  }

  function applyAll() {
    if (clauses.length === 0 || command) return;
    const message = clauses.map((c) => c.command.message(c.values)).join(" · ");
    onApply?.(clauses.map((c) => ({ command: c.command, values: c.values })));
    setRan({ message });
    setLastRun(message);
    clearTimeout(ranTimerRef.current);
    ranTimerRef.current = window.setTimeout(() => setRan(null), 1600);
    setClauses([]);
    setQuery("");
    setActive(0);
  }

  function clearAll() {
    if (command) {
      shift(-1, () => {
        setCommand(null);
        setSlotIndex(0);
        setValues([]);
        setClauses([]);
      });
    } else {
      setClauses([]);
      setQuery("");
      setActive(0);
    }
  }

  function pick(item: CommandOption | Command) {
    if (!command) {
      const cmd = item as Command;
      if (cmd.slots.length === 0) {
        stageClause(cmd, []);
        return;
      }
      shift(1, () => {
        setCommand(cmd);
        setSlotIndex(0);
        setValues([]);
      });
    } else if (slotIndex + 1 < command.slots.length) {
      shift(1, () => {
        setValues((list) => [...list, item as CommandOption]);
        setSlotIndex(slotIndex + 1);
      });
    } else {
      stageClause(command, [...values, item as CommandOption]);
    }
  }

  function popChip() {
    if (command) {
      if (slotIndex > 0) {
        shift(-1, () => {
          setValues((list) => list.slice(0, -1));
          setSlotIndex(slotIndex - 1);
        });
      } else {
        shift(-1, () => {
          setCommand(null);
          setValues([]);
        });
      }
    } else if (clauses.length > 0) {
      const last = clauses[clauses.length - 1];
      if (last.command.slots.length === 0) {
        setClauses((list) => list.slice(0, -1));
        setActive(0);
      } else {
        shift(-1, () => {
          setClauses((list) => list.slice(0, -1));
          setCommand(last.command);
          setSlotIndex(last.command.slots.length - 1);
          setValues(last.values.slice(0, -1));
        });
      }
    }
  }

  function editChip(groupIndex: number, chipIndex: number) {
    const keep = clauses.slice(0, groupIndex);
    const isLive = command && groupIndex === clauses.length;
    const cmd = isLive ? command! : clauses[groupIndex].command;
    const vals = isLive ? values : clauses[groupIndex].values;
    if (chipIndex === 0) {
      if (!command) {
        setClauses(keep);
        setQuery("");
        setActive(0);
      } else {
        shift(-1, () => {
          setClauses(keep);
          setCommand(null);
          setSlotIndex(0);
          setValues([]);
        });
      }
    } else {
      shift(-1, () => {
        setClauses(keep);
        setCommand(cmd);
        setSlotIndex(chipIndex - 1);
        setValues(vals.slice(0, chipIndex - 1));
      });
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (matches.length) setActive((i) => (Math.min(i, matches.length - 1) + 1) % matches.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (matches.length) setActive((i) => (Math.min(i, matches.length - 1) - 1 + matches.length) % matches.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (event.metaKey || event.ctrlKey) applyAll();
      else {
        const hit = matches[activeSafe];
        if (hit) pick(hit.item);
      }
    } else if (event.key === "Backspace" && query === "" && (command || clauses.length > 0)) {
      event.preventDefault();
      popChip();
    } else if (event.key === "Escape") {
      if (query !== "") {
        event.preventDefault();
        setQuery("");
        setActive(0);
      } else if (command || clauses.length > 0) {
        event.preventDefault();
        popChip();
      }
    }
  }

  // The height:auto illusion — measure the live view; motion eases `height`.
  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) return undefined;
    const measure = () => setBodyH(view.offsetHeight);
    measure();
    requestAnimationFrame(() => {
      bodyFirstRef.current = false;
    });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(view);
    return () => observer?.disconnect();
  }, [viewKey, matches.length]);

  // Keep the keyboard selection on screen inside the capped list.
  useEffect(() => {
    const list = listRef.current;
    const node = list?.children[activeSafe] as HTMLElement | undefined;
    if (!list || !node) return;
    if (node.offsetTop < list.scrollTop) list.scrollTop = node.offsetTop;
    else if (node.offsetTop + node.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = node.offsetTop + node.offsetHeight - list.clientHeight;
    }
  }, [activeSafe, viewKey]);

  useEffect(
    () => () => {
      clearTimeout(leaveTimerRef.current);
      clearTimeout(ranTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    onStateChange?.({
      mode: command ? `${command.label} → ${command.slots[slotIndex].name}` : "commands",
      depth: chips.length,
      staged: clauses.length,
      query,
      matches: matches.length,
      chips,
      height: bodyH == null ? null : Math.round(bodyH),
      lastRun,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command, slotIndex, clauses, query, matches.length, values, bodyH, lastRun, onStateChange]);

  function renderRows(rows: Row[], ctx: { command: Command | null; slotIndex: number }, live: boolean) {
    if (rows.length === 0) {
      return query === "" ? (
        <div className="flex flex-col items-center gap-1 px-3 py-[1.125rem] text-[0.8125rem] text-gray-400 text-center">
          Everything staged
          <span className="text-[0.6875rem]">✓ Apply runs it all · Backspace pops a chip</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 px-3 py-[1.125rem] text-[0.8125rem] text-gray-400 text-center">
          No matches for <span className="text-gray-500">&ldquo;{query}&rdquo;</span>
          <span className="text-[0.6875rem]">Esc clears{ctx.command || clauses.length > 0 ? " · Backspace pops a chip" : ""}</span>
        </div>
      );
    }
    const kind = ctx.command ? ctx.command.slots[ctx.slotIndex].kind : "command";
    return (
      <ul
        role={live ? "listbox" : undefined}
        id={live ? listboxId : undefined}
        aria-label={live ? (ctx.command ? ctx.command.slots[ctx.slotIndex].prompt : "Commands") : undefined}
        className="flex flex-col gap-px m-0 p-0 list-none max-h-[13.5rem] overflow-y-auto"
        ref={live ? listRef : undefined}
      >
        {rows.map((row, index) => {
          const isCommand = "label" in row.item;
          return (
            <li
              key={labelOf(row.item)}
              id={live ? `${listboxId}-${index}` : undefined}
              role={live ? "option" : undefined}
              aria-selected={live ? index === activeSafe : undefined}
              className="group/opt flex items-center gap-2 px-2 py-[0.4375rem] rounded-lg text-[0.8125rem] text-gray-700 cursor-pointer data-[active=true]:bg-[#f4f4f5] data-[active=true]:text-[#111] data-[danger=true]:data-[active=true]:bg-[#fef2f2] data-[danger=true]:data-[active=true]:text-[#dc2626]"
              data-active={live && index === activeSafe ? "true" : undefined}
              data-danger={isCommand && (row.item as Command).danger ? "true" : undefined}
              onMouseDown={
                live
                  ? (event) => {
                      event.preventDefault();
                      pick(row.item);
                    }
                  : undefined
              }
              onMouseMove={live ? () => setActive(index) : undefined}
            >
              {kind === "command" && (
                <span className="inline-flex flex-none text-gray-400 group-data-[active=true]/opt:text-gray-500 group-data-[danger=true]/opt:group-data-[active=true]/opt:text-[#dc2626]">
                  {(row.item as Command).icon}
                </span>
              )}
              {kind === "person" && (
                <span className="inline-flex items-center justify-center flex-none w-[1.375rem] h-[1.375rem] rounded-full bg-gray-200 text-zinc-600 text-[0.5625rem] font-semibold tracking-[0.02em]" aria-hidden="true">
                  {initials((row.item as CommandOption).value)}
                </span>
              )}
              {kind === "dot" && (
                <span
                  className="inline-block flex-none w-2 h-2 rounded-full"
                  style={{ background: (row.item as CommandOption).dot ?? "#9ca3af" }}
                  aria-hidden="true"
                />
              )}
              {kind === "plain" && (
                <span className="inline-flex flex-none text-gray-400 group-data-[active=true]/opt:text-gray-500">
                  {ctx.command?.icon}
                </span>
              )}
              <span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                <Highlight text={labelOf(row.item)} idx={row.idx} />
              </span>
              {"hint" in row.item && row.item.hint && (
                <span className="flex-none text-[0.6875rem] text-gray-400">{row.item.hint}</span>
              )}
              {isCommand && (row.item as Command).shortcut ? (
                <kbd className="inline-flex items-center justify-center min-w-4 px-1 rounded text-[0.625rem] font-mono leading-normal text-gray-500 shadow-[inset_0_0_0_1px_#e5e7eb] group-data-[active=true]/opt:bg-white group-data-[active=true]/opt:shadow-none" aria-hidden="true">
                  {(row.item as Command).shortcut}
                </kbd>
              ) : (
                <kbd className="inline-flex items-center justify-center min-w-4 px-1 rounded text-[0.625rem] font-mono leading-normal bg-[#f4f4f5] text-gray-500 opacity-0 group-data-[active=true]/opt:opacity-100" aria-hidden="true">
                  ↵
                </kbd>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  // Flat chip counter for the tail-dim preview (hover a chip → later chips dim).
  let flat = -1;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full max-w-[24rem]" data-inspect={inspect ? "true" : "false"}>
        <div className="bg-white rounded-xl shadow-border overflow-hidden">
          <div
            className={`flex flex-wrap items-center gap-1.5 px-3 py-2.5 border-b border-gray-100 cursor-text${
              inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444] -outline-offset-[3px]" : ""
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            <span className="inline-flex flex-none text-gray-400" aria-hidden="true">
              <SearchIcon />
            </span>
            {chipGroups.map((group, groupIndex) => (
              <Fragment key={group.key}>
                {groupIndex > 0 &&
                  (() => {
                    flat += 1;
                    const myFlat = flat;
                    return (
                      <span
                        className="flex-none text-[0.6875rem] font-medium text-gray-400 transition-opacity duration-[240ms]"
                        style={{ opacity: hoveredChip != null && myFlat > hoveredChip ? 0.35 : 1 }}
                      >
                        and
                      </span>
                    );
                  })()}
                {group.chips.map((chip, chipIndex) => {
                  flat += 1;
                  const myFlat = flat;
                  const isLast = groupIndex === chipGroups.length - 1 && chipIndex === group.chips.length - 1;
                  return (
                    <span
                      className="inline-flex transition-opacity duration-[240ms]"
                      key={`${group.key}-${chip.key}`}
                      style={{ opacity: hoveredChip != null && myFlat > hoveredChip ? 0.35 : 1 }}
                    >
                      <motion.button
                        type="button"
                        tabIndex={-1}
                        initial={morph && !reduced ? { opacity: 0, scale: 0.85, filter: "blur(2px)" } : false}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.24, ease: EASE }}
                        className={`inline-flex items-center gap-[0.3125rem] min-w-0 overflow-hidden whitespace-nowrap px-[0.4375rem] py-[0.1875rem] rounded-md text-xs font-medium cursor-pointer active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${
                          chip.kind === "cmd"
                            ? "bg-[#111] text-white [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#3f3f46]"
                            : "bg-[#f4f4f5] text-[#111] [@media(hover:hover)_and_(pointer:fine)]:hover:bg-[#e4e4e7]"
                        }`}
                        aria-label={`${chip.kind === "cmd" ? "Remove" : "Change"} ${chip.label}${isLast ? "" : ", also removes later chips"}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setHoveredChip(myFlat)}
                        onMouseLeave={() => setHoveredChip(null)}
                        onClick={() => editChip(groupIndex, chipIndex)}
                      >
                        {chip.dot && (
                          <span className="inline-block flex-none w-2 h-2 rounded-full" style={{ background: chip.dot }} aria-hidden="true" />
                        )}
                        {chip.label}
                      </motion.button>
                    </span>
                  );
                })}
              </Fragment>
            ))}
            <input
              ref={inputRef}
              className="flex-1 min-w-[5rem] border-0 outline-none bg-transparent text-sm text-[#111] py-0.5 placeholder:text-gray-400"
              type="text"
              value={query}
              placeholder={slot ? slot.prompt : "Type a command"}
              aria-label={slot ? slot.prompt : "Type a command"}
              role="combobox"
              aria-expanded="true"
              aria-controls={listboxId}
              aria-activedescendant={matches.length ? `${listboxId}-${activeSafe}` : undefined}
              aria-autocomplete="list"
              aria-describedby={chips.length > 0 ? `${listboxId}-trail` : undefined}
              spellCheck={false}
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={handleKeyDown}
            />
            <span id={`${listboxId}-trail`} className="sr-only">
              {chips.length > 0
                ? `Building: ${chipGroups.map((g) => g.chips.map((c) => c.label).join(" ")).join(", and ")}. Backspace removes the last chip.`
                : ""}
            </span>
          </div>

          <motion.div
            className={`relative overflow-hidden${inspect ? " outline outline-[1.5px] outline-dashed outline-[#3b82f6] -outline-offset-[3px]" : ""}`}
            animate={{ height: bodyH ?? "auto" }}
            transition={!morph || reduced || bodyFirstRef.current ? { duration: 0 } : { duration: 0.3, ease: EASE }}
          >
            {leaving && morph && !reduced && (
              <motion.div
                className="p-1 absolute top-0 left-0 w-full pointer-events-none"
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: -leaving.dir * SLIDE, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                aria-hidden="true"
                inert
              >
                {renderRows(leaving.rows, leaving.ctx, false)}
              </motion.div>
            )}
            <motion.div
              className="p-1"
              key={viewKey}
              ref={viewRef}
              initial={leaving && morph && !reduced ? { x: leaving.dir * SLIDE, opacity: 0, filter: "blur(2px)" } : false}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {renderRows(matches, { command, slotIndex }, true)}
            </motion.div>
          </motion.div>

          <div className="relative flex items-center justify-between gap-2 min-h-8 px-3 py-[0.4375rem] border-t border-gray-100 text-[0.6875rem] text-gray-400">
            <motion.span
              className="inline-flex items-center gap-[0.3125rem]"
              animate={ran ? { opacity: 0, y: -4, filter: "blur(2px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.25, ease: EASE_ICON }}
              style={{ pointerEvents: ran ? "none" : undefined }}
            >
              {command ? (
                <>
                  {command.label} · {command.slots[slotIndex].name} {slotIndex + 1} of {command.slots.length}
                </>
              ) : clauses.length > 0 ? (
                <>
                  <span className="tabular-nums">{clauses.length}</span> staged · add another or apply
                </>
              ) : (
                <>{commands.length} commands</>
              )}
            </motion.span>
            <motion.span
              className="inline-flex items-center gap-3 group/apply"
              animate={ran ? { opacity: 0, y: -4, filter: "blur(2px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.25, ease: EASE_ICON }}
              style={{ pointerEvents: ran ? "none" : undefined }}
            >
              <button
                type="button"
                className="relative inline-flex items-center justify-center w-7 h-7 rounded-md bg-transparent text-gray-400 cursor-pointer transition-[background-color,color,opacity,scale] duration-150 hover:enabled:bg-[#f4f4f5] hover:enabled:text-[#111] active:enabled:scale-[0.96] disabled:opacity-35 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] after:content-[''] after:absolute after:-inset-1.5"
                disabled={clauses.length === 0 && !command && query === ""}
                aria-label="Clear staged commands"
                onMouseDown={(event) => event.preventDefault()}
                onClick={clearAll}
              >
                <XIcon />
              </button>
              <button
                type="button"
                className="relative inline-flex items-center gap-[0.3125rem] h-7 px-2.5 rounded-[0.4375rem] bg-[#111] text-white text-xs font-medium cursor-pointer transition-[background-color,color,scale] duration-150 active:enabled:scale-[0.96] disabled:bg-[#f4f4f5] disabled:text-gray-400 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] after:content-[''] after:absolute after:-inset-y-1.5 after:inset-x-0 disabled:[&_[data-n]]:bg-black/[0.06]"
                disabled={clauses.length === 0 || !!command}
                aria-label={`Apply ${clauses.length} staged ${clauses.length === 1 ? "command" : "commands"}`}
                aria-keyshortcuts="Meta+Enter Control+Enter"
                title="⌘⏎"
                onMouseDown={(event) => event.preventDefault()}
                onClick={applyAll}
              >
                <CheckIcon />
                Apply
                {clauses.length > 0 && (
                  <span data-n className="inline-flex items-center justify-center min-w-4 px-1 rounded-[0.3125rem] bg-white/[0.18] text-[0.625rem] leading-normal tabular-nums">
                    {clauses.length}
                  </span>
                )}
              </button>
            </motion.span>
            <motion.span
              className="absolute inset-0 flex items-center gap-1.5 px-3 text-[#111] font-medium"
              aria-hidden={!ran}
              initial={false}
              animate={ran ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 4, filter: "blur(2px)" }}
              transition={{ duration: 0.25, ease: EASE_ICON }}
              style={{ pointerEvents: "none" }}
            >
              <span className="inline-flex flex-none text-[#16a34a]">
                <CheckIcon />
              </span>
              <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{ran?.message ?? lastRun}</span>
            </motion.span>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {ran
            ? `Applied: ${ran.message}`
            : `${slot ? `${slot.prompt}: ` : ""}${matches.length} ${matches.length === 1 ? "result" : "results"}${clauses.length > 0 ? `, ${clauses.length} staged` : ""}`}
        </span>

        {inspect && (
          <>
            <span className="absolute bottom-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              {matcher === "fuzzy" ? "fuzzy: word-start +10 · adjacent +8 · gap −1" : "substring: indexOf, earlier hit wins"}
            </span>
            <span className="absolute top-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              one tab stop · chip click rewinds · ⌫ pops · ⌘⏎ applies
            </span>
            <span className="absolute top-[calc(100%+0.4rem)] right-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              height: {bodyH == null ? "auto" : `${Math.round(bodyH)}px`} · measured → eased
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}

function Svg({ children, size = 15 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
function SearchIcon() { return <Svg size={16}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></Svg>; }
function CheckIcon() { return <Svg size={13}><path d="M20 6 9 17l-5-5" strokeWidth="2.5" /></Svg>; }
function XIcon() { return <Svg size={13}><path d="M18 6 6 18M6 6l12 12" strokeWidth="2.5" /></Svg>; }
```
