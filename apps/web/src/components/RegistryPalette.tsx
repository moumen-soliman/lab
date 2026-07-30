"use client";

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchIcon } from "../lib/icons";
import type { LabComponent } from "../registry-data";

/* ─────────────────────────────────────────────────────────
 * REGISTRY PALETTE - ⌘K anywhere on the site
 *
 * Mounted once in the root layout, so the whole registry is
 * one keystroke away from every page: the landing, the grid,
 * and every component page.
 *
 *   ⌘K / Ctrl+K   toggle, from anywhere, even mid-typing
 *   D             bare key, only when nothing text-like has
 *                 focus, so a "d" you meant to type is still
 *                 a "d" (the Raycast reflex: one finger, no
 *                 modifier, when your hands are off the form)
 *   ↑ ↓ ↵ esc     move, open, dismiss
 *
 * The palette owns exactly ONE tab stop, the input. Rows are
 * <li>s the input drives through aria-activedescendant, so
 * Tab never walks a 13-item list and the screen reader keeps
 * announcing from the combobox. Tab is swallowed while open:
 * with a single focusable child that IS the focus trap.
 *
 * ── OPEN STORYBOARD ───────────────────────────────────────
 * Read top-to-bottom. The panel is summoned, so it arrives as
 * ONE surface rather than staggered chunks: a palette you
 * cannot read for 300ms is a palette that failed.
 *
 *    0ms   scrim fades in behind a 3px backdrop blur
 *    0ms   panel drops its own 4px blur, lifts 8px and
 *          scales 0.98 → 1 on the shared smooth-out ease
 *  200ms   settled, input already focused and typable
 *  close   the same move reversed in 150ms, softer and
 *          shorter than the enter; the node lingers exactly
 *          that long, then unmounts
 *   idle   the ↵ hint on the active row cross-fades with the
 *          site's icon ease as the selection moves
 *
 * Deliberately CSS, not motion/react: this is site chrome and
 * it sits in the root layout, so importing the animation
 * runtime here would put it on the landing page too, for a
 * panel most visitors never open. Every transition is
 * interruptible, so ⌘K mashed mid-fade retargets instead of
 * restarting. prefers-reduced-motion drops all of it and the
 * panel simply appears. Nothing mounts until the first open,
 * which is what keeps the entrance off page load.
 * ───────────────────────────────────────────────────────── */

// Enter and exit are separate beats: the exit is shorter, because by then the
// user's attention is already on wherever they are going. The ms and the
// Tailwind class live together so they can never drift, and so the JIT still
// sees a literal class name.
const TRANSITION = {
  enter: { ms: 200, duration: "duration-200" },
  exit: { ms: 150, duration: "duration-150" },
} as const;

// The panel's two poses. Blur + lift + scale together, per the site's own
// motion language (the same trio drives the star and copy icon swaps).
const PANEL = {
  eased: "transition-[opacity,scale,translate,filter] ease-smooth-out motion-reduce:transition-none",
  resting: "translate-y-0 scale-100 opacity-100 blur-[0px]",
  offset: "-translate-y-2 scale-[0.98] opacity-0 blur-[4px]",
} as const;

// The ↵ hint is a contextual icon: it cross-fades in place rather than
// blinking, on the shared icon ease. Every class carries its own variant
// prefix - a prefix only binds to the class it is glued to.
const ENTER_HINT = {
  eased: "transition-[opacity,scale,filter] duration-200 ease-icon motion-reduce:transition-none",
  resting: "opacity-0 scale-25 blur-[4px]",
  active:
    "group-data-[active=true]/row:opacity-100 group-data-[active=true]/row:scale-100 group-data-[active=true]/row:blur-[0px]",
} as const;

// Scrim: ink low enough that the page reads as backgrounded rather than
// switched off, with the blur doing the separating.
const SCRIM = "bg-[#111]/12 backdrop-blur-[3px]";

// ── Matching ───────────────────────────────────────────────────────────
// A scored subsequence, the same shape the command-palette component uses:
// word-start hits and adjacent letters pay, gaps cost. "cmd" finds Command
// Palette, "nest" finds Unlimited Nested Menu, "otp" finds OTP Segmented Input.
function scan(query: string, hay: string, boundaryFirst: boolean) {
  const idx: number[] = [];
  let pos = 0;
  let score = 0;
  let prev = -2;
  for (const ch of query) {
    let at = -1;
    if (boundaryFirst) {
      for (let i = pos; i < hay.length; i += 1) {
        if (hay[i] === ch && (i === 0 || hay[i - 1] === " " || hay[i - 1] === "-")) {
          at = i;
          break;
        }
      }
    }
    if (at === -1) at = hay.indexOf(ch, pos);
    if (at === -1) return null;
    if (at === 0 || hay[at - 1] === " " || hay[at - 1] === "-") score += 10;
    else score += 4;
    if (at === prev + 1) score += 8;
    score -= Math.min(6, at - pos);
    idx.push(at);
    prev = at;
    pos = at + 1;
  }
  return { score, idx };
}

function fuzzy(query: string, text: string) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return { score: 0, idx: [] as number[] };
  const hay = text.toLowerCase();
  const boundary = scan(q, hay, true);
  const plain = scan(q, hay, false);
  if (!boundary) return plain;
  if (!plain) return boundary;
  return boundary.score >= plain.score ? boundary : plain;
}

interface Hit {
  entry: LabComponent;
  idx: number[];
  score: number;
  order: number;
}

// Title first. A slug hit counts as a title hit (same words, hyphenated) but
// carries no highlight; a description hit is a weak last resort, so "checkout"
// still surfaces a component whose title never says it.
function rank(query: string, entries: LabComponent[]): Hit[] {
  const q = query.trim();
  const out: Hit[] = [];
  entries.forEach((entry, order) => {
    if (!q) {
      out.push({ entry, idx: [], score: 0, order });
      return;
    }
    const title = fuzzy(q, entry.title);
    if (title) {
      out.push({ entry, idx: title.idx, score: title.score + 40, order });
      return;
    }
    const slug = fuzzy(q, entry.slug.replace(/-/g, " "));
    if (slug) {
      out.push({ entry, idx: [], score: slug.score + 20, order });
      return;
    }
    if (entry.description.toLowerCase().includes(q.toLowerCase())) {
      out.push({ entry, idx: [], score: 0, order });
    }
  });
  out.sort((a, b) => b.score - a.score || a.order - b.order);
  return out;
}

// Underline the matched letters where they sit; consecutive indices merge into
// one run so "comm" underlines once, not four times.
function Highlight({ text, idx }: { text: string; idx: number[] }) {
  if (idx.length === 0) return <>{text}</>;
  const set = new Set(idx);
  const out: ReactNode[] = [];
  let run = "";
  let marked = set.has(0);
  for (let i = 0; i <= text.length; i += 1) {
    const now = i < text.length && set.has(i);
    if (i === text.length || now !== marked) {
      if (run) {
        out.push(
          marked ? (
            <span key={`m${i}`} className="underline decoration-gray-400 decoration-1 underline-offset-[3px]">
              {run}
            </span>
          ) : (
            <Fragment key={`t${i}`}>{run}</Fragment>
          ),
        );
      }
      run = "";
      marked = now;
    }
    if (i < text.length) run += text[i];
  }
  return <>{out}</>;
}

// ── Shortcut plumbing ──────────────────────────────────────────────────
// A "d" typed into a field is a letter, not a command. `closest` rather than a
// tagName test so a <span contenteditable> deep inside an editor counts too.
function isTyping(target: EventTarget | null) {
  const node = target as HTMLElement | null;
  if (!node || typeof node.closest !== "function") return false;
  return node.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']") !== null;
}

/** ⌘ on Apple hardware, Ctrl everywhere else. Resolved after mount: the server
 *  has no way to know, and guessing would hydrate the wrong glyph. */
export function useMetaLabel() {
  const [label, setLabel] = useState("⌘");
  useEffect(() => {
    if (!/Mac|iPhone|iPad|iPod/.test(navigator.userAgent)) setLabel("Ctrl ");
  }, []);
  return label;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    // A single pure-black ring, not --shadow-border: that token's lift layers
    // read as grime at this size. oklch to match the rest of the tokens.
    <kbd className="inline-flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded px-1 font-mono text-[0.625rem] leading-none text-gray-500 shadow-[0_0_0_1px_oklch(0_0_0/0.08)]">
      {children}
    </kbd>
  );
}

export function RegistryPalette({ components }: { components: LabComponent[] }) {
  const [open, setOpen] = useState(false);
  // `mounted` is the node's life, `shown` is the transition target. They are
  // separate because a closing panel has to outlive `open` by one transition.
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listboxId = useId();
  const router = useRouter();
  const pathname = usePathname();

  const hits = useMemo(() => rank(query, components), [query, components]);
  const safe = Math.min(active, Math.max(0, hits.length - 1));

  // Closing leaves the query where it was, so the panel animates out reading the
  // way the user left it; the reset happens on the way IN, in the same batch
  // that mounts the node, where nobody can see it.
  const close = useCallback(() => setOpen(false), []);
  const show = useCallback(() => {
    setQuery("");
    setActive(0);
    setMounted(true);
    setOpen(true);
  }, []);

  // ⌘K from anywhere; bare D only when the keystroke isn't meant as a letter.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      const key = event.key.toLowerCase();
      if (key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (open) close();
        else show();
        return;
      }
      if (key === "d" && !open && !event.metaKey && !event.ctrlKey && !event.altKey && !isTyping(event.target)) {
        event.preventDefault();
        show();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close, show]);

  // Drive the transition a frame after the node exists (a class applied in the
  // same paint as the mount would have nothing to ease from), and hold the node
  // for one transition on the way out.
  useEffect(() => {
    if (!mounted) return undefined;
    if (open) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
    const timer = setTimeout(() => setMounted(false), TRANSITION.exit.ms);
    return () => clearTimeout(timer);
  }, [mounted, open]);

  // Focus in on open, back out on close, and hold the page still underneath.
  // The scrollbar's width is handed to padding so the layout doesn't jump the
  // moment it disappears.
  useEffect(() => {
    if (!open) return undefined;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    inputRef.current?.focus();
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  // Safety net: a back button or an in-palette navigation both land here.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Keep the highlighted row on screen inside the capped list.
  useEffect(() => {
    const list = listRef.current;
    const node = list?.children[safe] as HTMLElement | undefined;
    if (!list || !node) return;
    if (node.offsetTop < list.scrollTop) list.scrollTop = node.offsetTop;
    else if (node.offsetTop + node.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = node.offsetTop + node.offsetHeight - list.clientHeight;
    }
  }, [safe, open]);

  // Warm the route under the cursor so ↵ feels instant.
  useEffect(() => {
    const hit = hits[safe];
    if (open && hit) router.prefetch(`/components/${hit.entry.slug}`);
  }, [open, hits, safe, router]);

  function go(entry: LabComponent, newTab: boolean) {
    const href = `/components/${entry.slug}`;
    if (newTab) {
      window.open(href, "_blank", "noopener");
      return;
    }
    close();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (hits.length) setActive((i) => (Math.min(i, hits.length - 1) + 1) % hits.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (hits.length) setActive((i) => (Math.min(i, hits.length - 1) - 1 + hits.length) % hits.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[safe];
      if (hit) go(hit.entry, event.metaKey || event.ctrlKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (query) {
        setQuery("");
        setActive(0);
      } else {
        close();
      }
    } else if (event.key === "Tab") {
      // One focusable child, so swallowing Tab IS the focus trap.
      event.preventDefault();
    }
  }

  if (!mounted) return null;

  // One beat drives scrim and panel together, so they never desync.
  const beat = open ? TRANSITION.enter.duration : TRANSITION.exit.duration;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center px-6 pt-[14vh] ${open ? "" : "pointer-events-none"}`}
    >
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        className={`absolute inset-0 h-full w-full cursor-default ${SCRIM} transition-opacity ${beat} ease-smooth-out motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        onClick={close}
      />
      {/* Concentric: 16px panel radius − 8px list padding = 8px rows. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search components"
        className={`relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-border),var(--shadow-lift)] ${PANEL.eased} ${beat} ${
          shown ? PANEL.resting : PANEL.offset
        }`}
      >
        <div
          className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="inline-flex flex-none text-gray-400">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            className="min-w-0 flex-1 border-0 bg-transparent text-[0.9375rem] text-[#111] outline-none placeholder:text-gray-400"
            type="text"
            value={query}
            placeholder="Search the registry"
            aria-label="Search the registry"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={hits.length ? `${listboxId}-${safe}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>

        {hits.length > 0 ? (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Components"
            // Rows are a fixed 54px (both lines truncate), so the cap is tuned
            // to land HALF way through a row. A list that ends on a whole row
            // looks finished; a cut row is the only honest "keep scrolling".
            className="m-0 max-h-[min(19rem,46vh)] list-none overflow-y-auto p-2"
          >
            {hits.map((hit, index) => (
              <li
                key={hit.entry.slug}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === safe}
                className="group/row flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 data-[active=true]:bg-[#f4f4f5]"
                data-active={index === safe ? "true" : undefined}
                onMouseMove={() => setActive(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  go(hit.entry, event.metaKey || event.ctrlKey);
                }}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[#111]">
                    <Highlight text={hit.entry.title} idx={hit.idx} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-gray-500">{hit.entry.description}</span>
                </span>
                <span className={`flex-none ${ENTER_HINT.eased} ${ENTER_HINT.resting} ${ENTER_HINT.active}`}>
                  <Kbd>↵</Kbd>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            No component matches <span className="text-gray-600">&ldquo;{query}&rdquo;</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-2.5 text-[0.6875rem] text-gray-400">
          <span className="tabular-nums">
            {query ? `${hits.length} of ${components.length}` : `${components.length} components`}
          </span>
          <span className="inline-flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              move
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>esc</Kbd>
              close
            </span>
          </span>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {hits.length} {hits.length === 1 ? "component" : "components"}
      </span>
    </div>
  );
}
