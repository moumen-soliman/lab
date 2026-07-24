# Share & Permissions Popover

A three-view floating surface that morphs on both axes with a focus trap surviving the swaps.

- Demo: https://lab.moumen.dev/components/share-permissions-popover
- Install: `npx moumenlab add share-permissions-popover` — or `npx shadcn@latest add https://lab.moumen.dev/r/share-permissions-popover.json`
- Dependencies: motion
- Registry dependencies: https://lab.moumen.dev/r/lab-theme.json
- Installs to: `components/lab/share-permissions-popover.tsx`

## Usage

```tsx
"use client";

import SharePopover from "./share-permissions-popover";

// Seed it with your collaborators and wire onShare to persist every change
// (invite / role / remove / link scope).
export default function SharePopoverExample() {
  return (
    <SharePopover
      docTitle="Q3 Launch Plan"
      owner={{ name: "Moumen Soliman", email: "moumen@acme.co" }}
      people={[
        { id: "sarah", name: "Sarah Chen", email: "sarah@acme.co" },
        { id: "omar", name: "Omar Farouk", email: "omar@acme.co" },
        { id: "june", name: "June Park", email: "june@acme.co" },
      ]}
      initialRoles={{ sarah: "full", omar: "edit", june: "view" }}
      onShare={(event) => console.log(event.type, event.detail)}
    />
  );
}
```

## Source — `components/lab/share-permissions-popover.tsx`

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

// Share & permissions popover — three views in one floating element.
//
// A popover is a FLOATING element with three different-sized panels inside
// (share list · a person's role picker · link settings), and swapping panels
// has to feel like one surface changing shape, not three popovers taking turns.
//
//   · Animated auto-size on BOTH axes. Each view declares its natural width and
//     grows its own height; views are absolutely positioned so they keep their
//     intrinsic size, and the frame's width AND height are measured px
//     (useLayoutEffect + ResizeObserver) that motion eases between — the
//     height:auto illusion, on two axes. A fresh open snaps to size instead of
//     morphing from the last session's.
//   · A focus trap that survives view swaps. Tab cycles the LIVE view's
//     controls only; every swap hands focus somewhere sensible (push → the
//     current role; pop → the row that opened it; close → the trigger). Pass
//     trap={false} to feel Tab walk out.
//   · Breadcrumb back-navigation. Escape backs out one layer at a time.
//
// The popover scales in FROM THE TRIGGER (origin under the Share button), stays
// mounted so open/close are interruptible, and slides views directionally:
// push enters from the right, pop from the left, with a short-lived leaving
// snapshot. Animation via motion/react; honours prefers-reduced-motion.
// Requires the lab-theme tokens. Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;
const SLIDE = 28; // 1.75rem directional slide distance

export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface SharePopoverState {
  open: boolean;
  view: string;
  people: number;
  link: string;
  size: { w: number; h: number } | null;
  lastAction: string | null;
}

type View = { name: "share" } | { name: "role"; person: Person } | { name: "link" };

const ROLES = [
  { id: "full", label: "Full access", hint: "Edit, share and manage" },
  { id: "edit", label: "Can edit", hint: "Edit but not share" },
  { id: "comment", label: "Can comment", hint: "Read and comment" },
  { id: "view", label: "Can view", hint: "Read only" },
];

const LINK_SCOPES = [
  { id: "anyone", label: "Anyone with the link", hint: "No sign-in needed", icon: "globe" as const },
  { id: "invited", label: "Invited people only", hint: "Must be on this list", icon: "users" as const },
  { id: "off", label: "No link access", hint: "Only direct invites", icon: "lock" as const },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// "sarah.chen@acme.co" → "Sarah Chen" · "Priya" → priya@acme.co
function parseInvite(raw: string): { name: string; email: string } | null {
  const text = raw.trim();
  if (!text) return null;
  if (text.includes("@")) {
    const name = text.split("@")[0].split(/[._-]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join(" ");
    return { name: name || text, email: text };
  }
  return { name: text, email: `${text.toLowerCase().replace(/\s+/g, ".")}@acme.co` };
}

const roleLabel = (id: string) => ROLES.find((r) => r.id === id)?.label ?? id;
const scopeLabel = (id: string) => LINK_SCOPES.find((s) => s.id === id)?.label ?? id;

const OPT =
  "group/opt flex items-center gap-2 w-full p-1.5 rounded-lg bg-transparent text-left cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

export default function SharePopover({
  people: initialPeople = INITIAL_PEOPLE,
  initialRoles = INITIAL_ROLES,
  owner = { name: "Moumen Soliman", email: "moumen@acme.co" },
  docTitle = "Q3 Launch Plan",
  onShare,
  morph = true,
  trap = true,
  inspect = false,
  onStateChange,
}: {
  people?: Person[];
  initialRoles?: Record<string, string>;
  owner?: { name: string; email: string };
  docTitle?: string;
  /** Fires on any change (invite, role, remove, link scope) — wire your backend here. */
  onShare?: (event: { type: "invite" | "role" | "remove" | "link"; detail: string }) => void;
  morph?: boolean;
  trap?: boolean;
  inspect?: boolean;
  onStateChange?: (state: SharePopoverState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ name: "share" });
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [roles, setRoles] = useState<Record<string, string>>(initialRoles);
  const [linkScope, setLinkScope] = useState("invited");
  const [invite, setInvite] = useState("");
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState<{ view: View; dir: number } | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<number>(0);
  const copyTimerRef = useRef<number>(0);
  const freshRef = useRef(false);
  const snapRef = useRef(false);
  const pendingFocusRef = useRef<string | null>(null);
  const reduced = useReducedMotion();

  const viewKey = view.name === "role" ? `role:${view.person.id}` : view.name;

  function openPop() {
    freshRef.current = true;
    pendingFocusRef.current = "[data-invite-input]";
    setView({ name: "share" });
    setLeaving(null);
    setOpen(true);
  }

  function closePop(returnFocus: boolean) {
    setOpen(false);
    setLeaving(null);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function navigate(nextView: View, dir: number, focusSelector?: string) {
    if (morph && !reduced) {
      setLeaving({ view, dir });
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = window.setTimeout(() => setLeaving(null), 320);
    }
    pendingFocusRef.current = focusSelector ?? null;
    setView(nextView);
  }

  const goRole = (person: Person) => navigate({ name: "role", person }, 1, `[data-role-opt="${roles[person.id]}"]`);
  const goLink = () => navigate({ name: "link" }, 1, `[data-link-opt="${linkScope}"]`);
  const backFromRole = (person: Person) => navigate({ name: "share" }, -1, `[data-person="${person.id}"]`);
  const backFromLink = () => navigate({ name: "share" }, -1, "[data-link-row]");

  function handleInvite() {
    const parsed = parseInvite(invite);
    if (!parsed) return;
    const id = `p${Date.now()}`;
    setPeople((list) => [...list, { id, ...parsed }]);
    setRoles((map) => ({ ...map, [id]: "edit" }));
    setInvite("");
    setLastAction(`Invited ${parsed.name} · Can edit`);
    onShare?.({ type: "invite", detail: `${parsed.name} <${parsed.email}>` });
  }

  function pickRole(person: Person, roleId: string) {
    setRoles((map) => ({ ...map, [person.id]: roleId }));
    setLastAction(`${person.name} → ${roleLabel(roleId)}`);
    onShare?.({ type: "role", detail: `${person.name}: ${roleLabel(roleId)}` });
    backFromRole(person);
  }

  function removePerson(person: Person) {
    setPeople((list) => list.filter((p) => p.id !== person.id));
    setLastAction(`Removed ${person.name}`);
    onShare?.({ type: "remove", detail: person.name });
    navigate({ name: "share" }, -1, "[data-invite-input]");
  }

  function pickScope(scopeId: string) {
    setLinkScope(scopeId);
    setLastAction(`Link: ${scopeLabel(scopeId)}`);
    onShare?.({ type: "link", detail: scopeLabel(scopeId) });
    backFromLink();
  }

  function copyLink() {
    try {
      navigator.clipboard?.writeText("https://acme.co/doc/q3-launch-plan");
    } catch {
      /* the demo doesn't care */
    }
    setCopied(true);
    setLastAction("Link copied");
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied(false), 1400);
  }

  // The two-axis height:auto illusion — the live view keeps its intrinsic size;
  // the frame is told the measured px for BOTH axes so motion eases between
  // them. A fresh open snaps (duration 0) instead of morphing from the last one.
  useLayoutEffect(() => {
    const node = viewRef.current;
    if (!open || !node) return undefined;
    const apply = () => {
      const w = node.offsetWidth;
      const h = node.offsetHeight;
      setDims({ w, h });
    };
    if (freshRef.current) {
      freshRef.current = false;
      snapRef.current = true;
      apply();
      requestAnimationFrame(() => {
        snapRef.current = false;
      });
    } else {
      apply();
    }
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(apply) : null;
    observer?.observe(node);
    return () => observer?.disconnect();
  }, [open, viewKey, people.length]);

  // Focus choreography: after every open/swap, hand focus to the promised control.
  useLayoutEffect(() => {
    if (!open) return;
    const selector = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (!selector) return;
    viewRef.current?.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  }, [open, viewKey]);

  // The trap: Tab cycles the LIVE view's controls only (the leaving snapshot is inert).
  function handleTrapKeys(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      if (view.name === "role") backFromRole(view.person);
      else if (view.name === "link") backFromLink();
      else closePop(true);
      return;
    }
    if (!trap || event.key !== "Tab") return;
    const focusables = viewRef.current
      ? [...viewRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)")]
      : [];
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!focusables.includes(document.activeElement as HTMLElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    }
  }

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (inspect && !open) {
      freshRef.current = true;
      pendingFocusRef.current = null;
      setView({ name: "share" });
      setOpen(true);
    } else if (!inspect && open && !rootRef.current?.contains(document.activeElement)) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspect]);

  useEffect(
    () => () => {
      clearTimeout(leaveTimerRef.current);
      clearTimeout(copyTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    onStateChange?.({
      open,
      view: view.name === "role" ? `role · ${view.person.name}` : view.name,
      people: people.length + 1,
      link: scopeLabel(linkScope),
      size: dims ? { w: Math.round(dims.w), h: Math.round(dims.h) } : null,
      lastAction,
    });
  }, [open, view, people.length, linkScope, dims, lastAction, onStateChange]);

  // ── Views (one renderer serves the live view and the leaving snapshot) ─
  function renderView(target: View, live: boolean) {
    if (target.name === "role") {
      const person = target.person;
      const current = roles[person.id];
      return (
        <div className="p-2 w-[15rem]">
          <button
            type="button"
            className="flex items-center gap-1.5 w-full p-1.5 rounded-lg bg-transparent text-muted-foreground text-left cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            onClick={live ? () => backFromRole(person) : undefined}
          >
            <ChevronLeftIcon />
            <span className="flex flex-col min-w-0">
              <span className="text-[0.8125rem] font-medium text-foreground">{person.name}</span>
              <span className="text-[0.6875rem] text-muted-foreground/70">{person.email}</span>
            </span>
          </button>
          <div className="flex flex-col mt-1" role="group" aria-label={`Role for ${person.name}`}>
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                className={OPT}
                data-role-opt={role.id}
                aria-pressed={role.id === current}
                onClick={live ? () => pickRole(person, role.id) : undefined}
              >
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="text-[0.8125rem] text-foreground">{role.label}</span>
                  <span className="text-[0.6875rem] text-muted-foreground/70">{role.hint}</span>
                </span>
                {role.id === current && (
                  <span className="inline-flex flex-none text-foreground">
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
            <div className="h-px mx-1.5 my-1.5 bg-border" role="presentation" />
            <button
              type="button"
              className="group/danger flex items-center gap-2 w-full p-1.5 rounded-lg bg-transparent text-left cursor-pointer transition-colors duration-150 hover:bg-destructive/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              onClick={live ? () => removePerson(person) : undefined}
            >
              <span className="flex flex-col min-w-0 flex-1">
                <span className="text-[0.8125rem] text-foreground group-hover/danger:text-destructive">Remove access</span>
                <span className="text-[0.6875rem] text-muted-foreground/70 group-hover/danger:text-destructive">They lose this doc</span>
              </span>
            </button>
          </div>
        </div>
      );
    }

    if (target.name === "link") {
      return (
        <div className="p-2 w-[17rem]">
          <button
            type="button"
            className="flex items-center gap-1.5 w-full p-1.5 rounded-lg bg-transparent text-muted-foreground text-left cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            onClick={live ? backFromLink : undefined}
          >
            <ChevronLeftIcon />
            <span className="flex flex-col min-w-0">
              <span className="text-[0.8125rem] font-medium text-foreground">Link access</span>
              <span className="text-[0.6875rem] text-muted-foreground/70">Who can use the doc link</span>
            </span>
          </button>
          <div className="flex flex-col mt-1" role="group" aria-label="Link access">
            {LINK_SCOPES.map((scope) => (
              <button
                key={scope.id}
                type="button"
                className={OPT}
                data-link-opt={scope.id}
                aria-pressed={scope.id === linkScope}
                onClick={live ? () => pickScope(scope.id) : undefined}
              >
                <span className="inline-flex flex-none text-muted-foreground/70">
                  <ScopeIcon name={scope.icon} />
                </span>
                <span className="flex flex-col min-w-0 flex-1">
                  <span className="text-[0.8125rem] text-foreground">{scope.label}</span>
                  <span className="text-[0.6875rem] text-muted-foreground/70">{scope.hint}</span>
                </span>
                {scope.id === linkScope && (
                  <span className="inline-flex flex-none text-foreground">
                    <CheckIcon />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="p-2 w-[19rem]">
        <div className="flex gap-1.5 mb-2">
          <input
            data-invite-input
            className="flex-1 min-w-0 h-8 px-2.5 rounded-lg bg-muted text-[0.8125rem] text-foreground outline-none transition-[background-color,box-shadow] duration-150 placeholder:text-muted-foreground/70 focus:bg-popover focus:shadow-[inset_0_0_0_1.5px_var(--color-ring)]"
            type="text"
            value={live ? invite : ""}
            placeholder="Invite by name or email"
            aria-label="Invite by name or email"
            spellCheck={false}
            onChange={live ? (event) => setInvite(event.target.value) : undefined}
            onKeyDown={
              live
                ? (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleInvite();
                    }
                  }
                : undefined
            }
            readOnly={!live}
          />
          <button
            type="button"
            className="relative h-8 px-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer transition-[background-color,color,scale] duration-150 disabled:bg-muted disabled:text-muted-foreground/70 disabled:cursor-default active:enabled:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1"
            disabled={!live || parseInvite(invite) === null}
            onClick={live ? handleInvite : undefined}
          >
            Invite
          </button>
        </div>

        <p className="mx-1.5 mt-1 mb-0.5 text-[0.625rem] font-semibold tracking-[0.06em] uppercase text-muted-foreground/70">
          People with access
        </p>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-1.5 py-[0.3125rem] rounded-lg">
            <span className="inline-flex items-center justify-center flex-none w-[1.625rem] h-[1.625rem] rounded-full bg-primary text-primary-foreground text-[0.5625rem] font-semibold tracking-[0.02em]" aria-hidden="true">
              {initials(owner.name)}
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="text-[0.8125rem] text-foreground overflow-hidden text-ellipsis whitespace-nowrap">{owner.name}</span>
              <span className="text-[0.6875rem] text-muted-foreground/70 overflow-hidden text-ellipsis whitespace-nowrap">{owner.email}</span>
            </span>
            <span className="flex-none text-xs text-muted-foreground/70 pr-1">Owner</span>
          </div>
          {people.map((person) => (
            <div className="flex items-center gap-2 px-1.5 py-[0.3125rem] rounded-lg" key={person.id}>
              <span className="inline-flex items-center justify-center flex-none w-[1.625rem] h-[1.625rem] rounded-full bg-foreground/10 text-foreground/70 text-[0.5625rem] font-semibold tracking-[0.02em]" aria-hidden="true">
                {initials(person.name)}
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="text-[0.8125rem] text-foreground overflow-hidden text-ellipsis whitespace-nowrap">{person.name}</span>
                <span className="text-[0.6875rem] text-muted-foreground/70 overflow-hidden text-ellipsis whitespace-nowrap">{person.email}</span>
              </span>
              <button
                type="button"
                className="relative inline-flex items-center gap-1 flex-none h-8 px-2 rounded-md bg-transparent text-muted-foreground text-xs cursor-pointer transition-[background-color,color,scale] duration-150 hover:bg-accent hover:text-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1"
                data-person={person.id}
                aria-label={`${person.name}: ${roleLabel(roles[person.id])}. Change role`}
                onClick={live ? () => goRole(person) : undefined}
              >
                {roleLabel(roles[person.id])}
                <ChevronRightIcon />
              </button>
            </div>
          ))}
        </div>

        <div className="h-px mx-1.5 my-1.5 bg-border" role="presentation" />
        <button
          type="button"
          className="flex items-center gap-2 w-full p-1.5 rounded-lg bg-transparent text-muted-foreground/70 text-left cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          data-link-row
          onClick={live ? goLink : undefined}
        >
          <span className="inline-flex flex-none text-muted-foreground/70">
            <ScopeIcon name={LINK_SCOPES.find((s) => s.id === linkScope)!.icon} />
          </span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className="text-[0.8125rem] text-foreground overflow-hidden text-ellipsis whitespace-nowrap">Link access</span>
            <span className="text-[0.6875rem] text-muted-foreground/70 overflow-hidden text-ellipsis whitespace-nowrap">{scopeLabel(linkScope)}</span>
          </span>
          <ChevronRightIcon />
        </button>

        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 px-1.5 pb-0.5 border-t border-border">
          <button
            type="button"
            className="relative inline-flex items-center gap-1.5 h-8 pl-7 pr-2 rounded-lg bg-transparent text-muted-foreground text-xs font-medium cursor-pointer transition-[background-color,color,scale] duration-150 hover:bg-accent hover:text-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1"
            onClick={live ? copyLink : undefined}
          >
            <motion.span
              className="absolute left-2 top-1/2 inline-flex"
              style={{ y: "-50%" }}
              initial={false}
              animate={copied && live ? { opacity: 0, scale: 0.25, filter: "blur(4px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.25, ease: EASE_ICON }}
            >
              <LinkIcon />
            </motion.span>
            <motion.span
              className="absolute left-2 top-1/2 inline-flex text-[#16a34a]"
              style={{ y: "-50%" }}
              aria-hidden="true"
              initial={false}
              animate={copied && live ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: EASE_ICON }}
            >
              <CheckIcon />
            </motion.span>
            {copied && live ? "Copied" : "Copy link"}
          </button>
          <span className="text-[0.6875rem] text-muted-foreground/70 tabular-nums">{people.length + 1} people</span>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className="relative w-full max-w-96" data-inspect={inspect ? "true" : "false"}>
        {/* The anchor context: a fake doc header the popover hangs off. */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 bg-card rounded-xl shadow-border">
          <span className="inline-flex flex-none text-muted-foreground/70" aria-hidden="true">
            <DocIcon />
          </span>
          <span className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-foreground">{docTitle}</span>
            <span className="text-[0.6875rem] text-muted-foreground/70">Edited 2h ago</span>
          </span>
          <button
            ref={triggerRef}
            type="button"
            className={`relative inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-[0.8125rem] font-medium cursor-pointer transition-[background-color,scale] duration-150 hover:bg-primary/85 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1${
              inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444] outline-offset-[3px]" : ""
            }`}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => (open ? closePop(false) : openPop())}
          >
            <ShareIcon />
            Share
          </button>
        </div>

        {/* Always mounted so open/close are interruptible; inert while closed. */}
        <motion.div
          className="absolute top-[calc(100%+0.5rem)] right-0 z-20 [transform-origin:calc(100%-2.25rem)_-0.375rem]"
          initial={false}
          animate={open ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{ duration: morph && !reduced ? (open ? 0.18 : 0.16) : 0, ease: EASE }}
          style={{ pointerEvents: open ? "auto" : "none" }}
          role="dialog"
          aria-modal={open && trap ? "true" : undefined}
          aria-label={`Share ${docTitle}`}
          aria-hidden={!open}
          inert={!open}
          onKeyDown={handleTrapKeys}
        >
          <motion.div
            ref={frameRef}
            className={`relative overflow-hidden bg-popover rounded-xl shadow-[var(--shadow-border),0_12px_32px_-12px_rgba(0,0,0,0.18)]${
              inspect ? " outline outline-[1.5px] outline-dashed outline-[#3b82f6] outline-offset-[3px]" : ""
            }`}
            animate={dims ? { width: dims.w, height: dims.h } : undefined}
            transition={!morph || reduced || snapRef.current ? { duration: 0 } : { duration: 0.3, ease: EASE }}
          >
            {leaving && morph && !reduced && (
              <motion.div
                className="absolute top-0 left-0 w-max pointer-events-none"
                initial={{ x: 0, opacity: 1 }}
                animate={{ x: -leaving.dir * SLIDE, opacity: 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                aria-hidden="true"
                inert
              >
                {renderView(leaving.view, false)}
              </motion.div>
            )}
            <motion.div
              className="absolute top-0 left-0 w-max"
              key={viewKey}
              ref={viewRef}
              initial={leaving && morph && !reduced ? { x: leaving.dir * SLIDE, opacity: 0, filter: "blur(2px)" } : false}
              animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {renderView(view, true)}
            </motion.div>
          </motion.div>
        </motion.div>

        {lastAction && (
          <span className="sr-only" aria-live="polite">
            {lastAction}
          </span>
        )}

        {inspect && open && (
          <>
            <span className="absolute bottom-[calc(100%+0.4rem)] left-0 z-[25] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              size: {dims ? `${Math.round(dims.w)} × ${Math.round(dims.h)}px` : "measured"} · both axes eased
            </span>
            <span className="absolute bottom-[calc(100%+0.4rem)] right-0 z-[25] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              {trap ? "trap: Tab cycles the live view · Esc backs out" : "trap OFF · Tab walks out of the popover"}
            </span>
            <span className="absolute top-[3.25rem] right-0 z-[25] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              origin: under the trigger · scale 0.96 → 1
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}

const INITIAL_PEOPLE: Person[] = [
  { id: "sarah", name: "Sarah Chen", email: "sarah@acme.co" },
  { id: "omar", name: "Omar Farouk", email: "omar@acme.co" },
  { id: "june", name: "June Park", email: "june@acme.co" },
];
const INITIAL_ROLES: Record<string, string> = { sarah: "full", omar: "edit", june: "view" };

function Svg({ children, size = 15, sw = 1.8 }: { children: React.ReactNode; size?: number; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function ScopeIcon({ name }: { name: "globe" | "users" | "lock" }) {
  if (name === "globe") return <Svg><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20" /></Svg>;
  if (name === "users") return <Svg><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Svg>;
  return <Svg><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>;
}
function ShareIcon() { return <Svg size={13} sw={2}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4M12 2v13" /></Svg>; }
function DocIcon() { return <Svg size={16}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4M8 13h8M8 17h5" /></Svg>; }
function LinkIcon() { return <Svg size={13}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Svg>; }
function ChevronLeftIcon() { return <Svg size={14} sw={2}><path d="m15 18-6-6 6-6" /></Svg>; }
function ChevronRightIcon() { return <Svg size={12} sw={2}><path d="m9 18 6-6-6-6" /></Svg>; }
function CheckIcon() { return <Svg size={13} sw={2.5}><path d="M20 6 9 17l-5-5" /></Svg>; }
```
