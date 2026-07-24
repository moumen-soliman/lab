"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, MotionConfig, useAnimationControls, useReducedMotion } from "motion/react";

// Ticket number ticker — a ticket id shown as one celebratory value.
//
// The pill hugs its value and grows with it up to a max-width; a short #42 is a
// small pill, a longer id fills out toward the cap. Past the cap it uses the
// idiom every commit-SHA and wallet-address UI already uses: MIDDLE-TRUNCATE to
// `start…end`, keeping the two ends that identify and disambiguate and dropping
// the middle you can recover on hover (tooltip) or copy:
//
//   #100000000042            → #10000…0042
//   #billing-webhook-...2026 → #billing-…-2026
//
// How much survives is measured against the CAP's budget (not the current hug
// width) — a hidden clone is binary-searched to the last `#start…end` that fits.
//
// Numbers additionally get the odometer run-up: each surviving digit is a reel —
// a 1em window over a 0-9 strip — snapped to 0 then released to `10 + digit` so
// it scrolls a full turn and lands on target, cascading left→right. Bump
// `runKey` to play it (e.g. when a new ticket arrives). tabular-nums keeps every
// column exactly 1ch so nothing shifts as it rolls or truncates. Drop the digits
// entirely and it's a plain name: no reels.
//
// Pass `status` to show a GitHub pull-request state badge (open/draft/merged/
// closed, GitHub's own colours); pass `onStatusClick` to make it interactive.
// `width="fixed"` gives every pill one footprint for steady columns. As you
// type, motion's `layout` glides the centred pill to its new spot instead of
// snapping (position only — the width change stays instant so the new digit is
// never clipped). Animation via motion/react; honours prefers-reduced-motion.
// Requires the lab-theme tokens. Fully Tailwind, no CSS files.
//
// NOTE ON SIZE: the pill is deliberately compact (text-xl value, h-8 actions)
// so it drops straight into dashboards, list rows and toolbars. The lab demo
// page renders it inside a scale wrapper purely for presentation — what you
// install is the dashboard size you see in your own app.

const MEASURE_SAFETY = 2; // px of slack so the value never kisses the clip edge

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;

export type PrStatus = "open" | "draft" | "merged" | "closed";

export interface TicketNumberState {
  kind: "numeric" | "text";
  truncated: boolean;
  full: string;
  status: PrStatus | null;
}

// GitHub's own state colours; the icon shape carries the meaning, the colour
// reinforces it. The inset ring is the status colour at 22%.
const STATUS_STYLES: Record<PrStatus, { label: string; className: string; Icon: () => React.JSX.Element }> = {
  open: {
    label: "Open",
    className: "text-[#1a7f37] bg-[#dafbe1] shadow-[inset_0_0_0_1px_rgba(26,127,55,0.22)]",
    Icon: PrOpenIcon,
  },
  draft: {
    label: "Draft",
    className: "text-[#57606a] bg-[#eaeef2] shadow-[inset_0_0_0_1px_rgba(87,96,106,0.22)]",
    Icon: PrOpenIcon,
  },
  merged: {
    label: "Merged",
    className: "text-[#8250df] bg-[#f5edff] shadow-[inset_0_0_0_1px_rgba(130,80,223,0.22)]",
    Icon: PrMergedIcon,
  },
  closed: {
    label: "Closed",
    className: "text-[#cf222e] bg-[#ffebe9] shadow-[inset_0_0_0_1px_rgba(207,34,46,0.22)]",
    Icon: PrClosedIcon,
  },
};

// The contextual icon swap states (copy ⇄ check).
const ICON_SHOWN = { opacity: 1, scale: 1, filter: "blur(0px)" };
const ICON_HIDDEN = { opacity: 0, scale: 0.25, filter: "blur(4px)" };

// The value's typography, shared verbatim by the visible value and the hidden
// measuring clone so the fit is pixel-accurate. 1.25rem = text-xl — dashboard
// scale, not display scale.
const VALUE_TYPE = "text-xl font-semibold tracking-[-0.01em] tabular-nums whitespace-nowrap";

export default function TicketNumber({
  value = "#0",
  runKey = 0,
  status,
  onStatusClick,
  width = "max",
  maxWidth = "14rem",
  copyable = true,
  inspect = false,
  onStateChange,
}: {
  /** The ticket id — "#1042", "1042" or "ticket name here" (spaces become dashes). */
  value?: string;
  /** Increment to play the odometer run-up (numeric values only). */
  runKey?: number;
  /** Show a GitHub pull-request state badge. */
  status?: PrStatus;
  /** Makes the status badge a button (e.g. to cycle states in a demo). */
  onStatusClick?: () => void;
  /** "max" hugs the value up to the cap; "fixed" always takes the full cap width. */
  width?: "max" | "fixed";
  /** The cap the pill grows to before middle-truncating. */
  maxWidth?: string;
  copyable?: boolean;
  inspect?: boolean;
  onStateChange?: (state: TicketNumberState) => void;
}) {
  // Normalise: drop a leading "#", collapse whitespace to "-" (a ticket "name
  // here" is really a slug), trim stray edge dashes. A pure-digit body is
  // numeric (odometer); anything else — letters, dashes, mixed — is a text slug.
  const body = String(value).trim().replace(/^#/, "").replace(/\s+/g, "-").replace(/^-+|-+$/g, "");
  const kind: "numeric" | "text" = /^\d+$/.test(body) && body.length > 0 ? "numeric" : "text";
  const fullId = `#${body}`;

  const pillRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const [display, setDisplay] = useState({ head: body, tail: "", truncated: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    onStateChange?.({ kind, truncated: display.truncated, full: fullId, status: status ?? null });
  }, [kind, display.truncated, fullId, status, onStateChange]);

  // The value's budget = the pill AT ITS CAP, minus chrome (padding + gap +
  // actions). All of that is constant regardless of the current hug width, so we
  // can compute the cap budget without ever forcing the pill wide.
  function budgetPx() {
    const pill = pillRef.current;
    if (!pill) return 0;
    const cs = getComputedStyle(pill);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const gap = parseFloat(cs.columnGap || cs.gap) || 0;
    // offsetWidth (layout px) rather than getBoundingClientRect, so an ancestor
    // CSS `scale` (e.g. a demo presentation wrapper) never skews the budget.
    const actionsW = actionsRef.current ? actionsRef.current.offsetWidth : 0;
    const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const capPx = (parseFloat(cs.getPropertyValue("--ticket-max")) || 14) * rootPx;
    let parentAvail = Infinity;
    const parent = pill.parentElement;
    if (parent) {
      const pcs = getComputedStyle(parent);
      parentAvail = parent.clientWidth - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight);
    }
    return Math.min(parentAvail, capPx) - padX - gap - actionsW - MEASURE_SAFETY;
  }

  // Measure the longest `#start…end` that fits the cap budget and commit it.
  // Runs before paint and on resize / font load — the clone it reads is never
  // the animated value, so there is no measure→render→measure loop.
  useLayoutEffect(() => {
    const cloneEl = measureRef.current;
    if (!pillRef.current || !cloneEl) return undefined;

    const widthOf = (text: string) => {
      cloneEl.textContent = text;
      return cloneEl.scrollWidth;
    };

    const measure = () => {
      const avail = budgetPx();
      if (avail <= 0) return;

      let next;
      if (body.length <= 2 || widthOf(fullId) <= avail) {
        next = { head: body, tail: "", truncated: false };
      } else {
        // Binary-search how many characters (split head-heavy) fit around a "…".
        let lo = 2;
        let hi = body.length - 1;
        let keep = 2;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const head = Math.ceil(mid / 2);
          const tail = mid - head;
          if (widthOf(`#${body.slice(0, head)}…${body.slice(body.length - tail)}`) <= avail) {
            keep = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        const head = Math.ceil(keep / 2);
        const tail = keep - head;
        next = { head: body.slice(0, head), tail: body.slice(body.length - tail), truncated: true };
      }

      setDisplay((prev) =>
        prev.head === next.head && prev.tail === next.tail && prev.truncated === next.truncated ? prev : next,
      );
    };

    measure();
    // Observe the parent (the width source) so a viewport change re-truncates.
    const target = pillRef.current.parentElement || pillRef.current;
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(target);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => observer?.disconnect();
    // `status` matters: adding the badge grows the actions row and shrinks the
    // value's budget — so the truncation must be re-measured, or the last chars clip.
  }, [fullId, body, kind, status, copyable, maxWidth]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard blocked (insecure context / denied) — no-op */
    }
  }

  // Reels are indexed continuously across head + tail so the run-up stagger
  // cascades through the whole visible value, not restarting after the "…".
  const headDigits = display.head.split("");
  const tailDigits = display.tail.split("");
  const statusStyle = status ? STATUS_STYLES[status] : null;

  const ellipsisClass = `text-muted-foreground/70 px-[0.06em]${inspect ? " outline outline-[1.5px] outline-dashed outline-[#f59e0b] outline-offset-1 rounded-[2px]" : ""}`;

  return (
    <MotionConfig reducedMotion="user">
      {/* layout="position": as the hugging pill changes width it glides to its
          new centred spot instead of snapping — position only, so the width
          change stays instant and the just-typed digit is never clipped. */}
      <motion.div
        ref={pillRef}
        layout="position"
        transition={{ duration: 0.22, ease: EASE }}
        className={[
          "relative inline-flex items-center gap-2.5 max-w-[min(100%,var(--ticket-max))] py-2 pl-3.5 pr-2.5 bg-card rounded-xl text-card-foreground transition-shadow duration-200",
          width === "fixed" ? "w-[min(100%,var(--ticket-max))]" : "w-fit",
          inspect
            ? "shadow-none outline outline-[1.5px] outline-dashed outline-[#3b82f6]"
            : "shadow-border hover:shadow-border-hover",
        ].join(" ")}
        style={{ "--ticket-max": maxWidth } as CSSProperties}
        data-kind={kind}
      >
        <div
          className={[
            "relative flex items-center min-w-0",
            width === "fixed" ? "flex-1" : "flex-[0_1_auto]",
            // The clip is only a safety net; clip-margin leaves slack so sub-pixel
            // flex rounding never shaves the right edge of the last glyph.
            inspect ? "overflow-visible" : "[overflow:clip] [overflow-clip-margin:0.3em]",
          ].join(" ")}
        >
          <span
            className={`inline-flex items-baseline min-w-0 leading-[1.09] ${VALUE_TYPE}`}
            title={fullId}
            aria-hidden="true"
          >
            <span className="mr-[0.06em] text-muted-foreground/70 font-medium">#</span>
            {kind === "numeric" ? (
              <span className="inline-flex">
                {/* Key by index+digit: changing a digit (typing a new id) remounts
                    that reel so it snaps to the value instantly, while a replay —
                    same digits — keeps the element and rolls it via runKey. */}
                {headDigits.map((digit, index) => (
                  <Reel
                    key={`h${index}-${digit}`}
                    digit={Number(digit)}
                    index={index}
                    runKey={runKey}
                    inspect={inspect && index === 0}
                  />
                ))}
                {display.truncated && <span className={ellipsisClass}>…</span>}
                {tailDigits.map((digit, index) => (
                  <Reel
                    key={`t${index}-${digit}`}
                    digit={Number(digit)}
                    index={headDigits.length + index}
                    runKey={runKey}
                    inspect={false}
                  />
                ))}
              </span>
            ) : (
              // Keyed by its content so an edit remounts it and replays the soft-in.
              <motion.span
                className={`whitespace-nowrap${inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444]" : ""}`}
                key={`${display.head}|${display.tail}`}
                initial={{ opacity: 0, filter: "blur(2px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.17, ease: EASE }}
              >
                {display.head}
                {display.truncated && <span className={ellipsisClass}>…</span>}
                {display.tail}
              </motion.span>
            )}
          </span>

          {/* Hidden clone JS drives to measure candidate widths — same typography
              as the value, so the fit is pixel-accurate. */}
          <span
            className={`absolute top-0 left-0 invisible pointer-events-none ${VALUE_TYPE}`}
            ref={measureRef}
            aria-hidden="true"
          />

          {/* Screen readers get the whole id as text; the visual is aria-hidden. */}
          <span className="sr-only">Ticket {fullId}</span>

          {inspect && (
            <>
              <span className="absolute -top-[1.7rem] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                {width === "fixed" ? "width: fixed" : display.truncated ? "width: capped at max" : "width: fit-content"}
              </span>
              <span className="absolute -bottom-[1.7rem] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                {kind === "numeric" ? "reel · 1ch × 1em" : "text · start … end"}
              </span>
              {display.truncated && (
                <span className="absolute -top-[1.7rem] right-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fde68a] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#b45309] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                  middle dropped →
                </span>
              )}
            </>
          )}
        </div>

        {(statusStyle || copyable) && (
          <div className="flex-none inline-flex items-center gap-1" ref={actionsRef}>
            {statusStyle &&
              (onStatusClick ? (
                <button
                  type="button"
                  className={`grid place-items-center w-8 h-8 rounded-lg transition-[color,background-color,box-shadow,scale,filter] hover:brightness-[0.97] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${statusStyle.className}`}
                  onClick={onStatusClick}
                  aria-label={`Pull request status: ${statusStyle.label}. Click to change`}
                  title={`Pull request · ${statusStyle.label}`}
                >
                  <StatusIcon status={status!} Icon={statusStyle.Icon} />
                </button>
              ) : (
                <span
                  className={`grid place-items-center w-8 h-8 rounded-lg transition-[color,background-color,box-shadow] ${statusStyle.className}`}
                  role="img"
                  aria-label={`Pull request status: ${statusStyle.label}`}
                  title={`Pull request · ${statusStyle.label}`}
                >
                  <StatusIcon status={status!} Icon={statusStyle.Icon} />
                </span>
              ))}
            {copyable && (
              <button
                type="button"
                className="grid place-items-center w-8 h-8 rounded-lg text-muted-foreground transition-[scale,background-color,color] hover:bg-accent hover:text-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                onClick={copy}
                aria-label={copied ? "Copied" : `Copy ${fullId}`}
              >
                {/* Contextual icon swap: both icons stay in the DOM, stacked in
                    one grid cell, cross-fading on opacity + scale + blur. */}
                <motion.span
                  className="[grid-area:1/1] inline-flex"
                  initial={false}
                  animate={copied ? ICON_HIDDEN : ICON_SHOWN}
                  transition={{ duration: 0.3, ease: EASE_ICON }}
                >
                  <CopyIcon />
                </motion.span>
                <motion.span
                  className="[grid-area:1/1] inline-flex text-[#16a34a]"
                  initial={false}
                  animate={copied ? ICON_SHOWN : ICON_HIDDEN}
                  transition={{ duration: 0.3, ease: EASE_ICON }}
                >
                  <CheckIcon />
                </motion.span>
              </button>
            )}
          </div>
        )}
      </motion.div>
    </MotionConfig>
  );
}

// Keyed by status → remounts on each change → replays the pop-in.
function StatusIcon({ status, Icon }: { status: PrStatus; Icon: () => React.JSX.Element }) {
  return (
    <motion.span
      className="[grid-area:1/1] inline-flex"
      key={status}
      initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: EASE_ICON }}
    >
      <Icon />
    </motion.span>
  );
}

// One odometer column. Two 0-9 cycles stacked (20 figures); the strip rests on
// `10 + digit`. A runKey bump snaps it to 0 (no animation) and releases it to
// the target, so it scrolls a full turn before landing — the "run up". The
// per-column delay cascades the settle left→right. Soft-in on remount: a
// changed digit fades + unblurs in instead of hard-cutting.
function Reel({ digit, index, runKey, inspect }: { digit: number; index: number; runKey: number; inspect: boolean }) {
  const reduced = useReducedMotion();
  const controls = useAnimationControls();
  const target = `${-(10 + digit)}em`;

  useEffect(() => {
    if (runKey <= 0 || reduced) return;
    controls.set({ y: "0em" });
    controls.start({ y: target, transition: { duration: 0.64, ease: EASE, delay: index * 0.055 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey]);

  return (
    <motion.span
      className={`relative w-[1ch] h-[1em] overflow-hidden text-center${inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444]" : ""}`}
      aria-hidden="true"
      initial={{ opacity: 0, filter: "blur(2px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.17, ease: EASE }}
    >
      <motion.span className="flex flex-col" style={{ y: target }} animate={controls}>
        {REEL_FIGURES.map((n, i) => (
          <span className="h-[1em] leading-[1em]" key={i}>
            {n}
          </span>
        ))}
      </motion.span>
    </motion.span>
  );
}

const REEL_FIGURES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// ── GitHub PR status icons ──────────────────────────────────────────────
// Open + draft share GitHub's pull-request glyph; the badge colour tells them
// apart (green vs grey), exactly as GitHub does.
function GitBranch({ children }: { children: React.ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function PrOpenIcon() {
  return (
    <GitBranch>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </GitBranch>
  );
}

function PrMergedIcon() {
  return (
    <GitBranch>
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </GitBranch>
  );
}

function PrClosedIcon() {
  return (
    <GitBranch>
      <circle cx="6" cy="6" r="3" />
      <path d="M6 9v12" />
      <path d="m21 3-6 6" />
      <path d="m21 9-6-6" />
      <circle cx="18" cy="18" r="3" />
    </GitBranch>
  );
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
