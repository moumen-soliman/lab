# OTP Segmented Input

Six cells that are secretly one real input, with native selection driving the active cell.

- Demo: https://lab.moumen.dev/components/otp-segmented-input
- Install: `npx moumenlab add otp-segmented-input` — or `npx shadcn@latest add https://lab.moumen.dev/r/otp-segmented-input.json`
- Dependencies: motion
- Registry dependencies: https://lab.moumen.dev/r/lab-theme.json
- Installs to: `components/lab/otp-segmented-input.tsx`

## Usage

```tsx
"use client";

import OtpInput from "./otp-segmented-input";

// Wire your real check through `verify` — sync or async. Return true and the
// cells cascade green; false and the row shakes, drops the digits, and hands
// the caret back:
//
//   <OtpInput
//     verify={async (code) => {
//       const res = await fetch("/api/verify-otp", { method: "POST", body: code });
//       return res.ok;
//     }}
//   />
export default function OtpInputExample() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Default: six digits, verified against your adapter (or the `code` prop). */}
      <OtpInput verify={(code) => code === "246810"} />

      {/* Masked — paints • instead of the digit, the value stays untouched. */}
      <OtpInput mask />

      {/* Split 3-3, the way SMS codes are read aloud. */}
      <OtpInput group />

      {/* Any length — the group gap lands at the halfway point. */}
      <OtpInput length={4} code="2468" group />
    </div>
  );
}
```

## Source — `components/lab/otp-segmented-input.tsx`

```tsx
"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { MotionConfig, motion } from "motion/react";

// OTP segmented input — N boxes, secretly ONE real input.
//
// The version everyone demos is six <input>s wired together with JS focus
// hops. It looks right and behaves wrong: SMS autofill can't fill it (iOS
// offers the code to ONE field), paste needs bespoke splitting, screen
// readers announce six unlabeled boxes, and half the keyboard is re-invented.
//
// This is the hard version: one real <input> stretched invisibly over the
// whole row (color and caret transparent — NOT display:none, it must stay
// focusable and autofillable), with the cells painted underneath from its
// value. Everything hard becomes free:
//
//   · SMS autofill just works — autocomplete="one-time-code" on a real,
//     visible-to-the-browser input.
//   · Paste just works — "246 810" lands in the input, one normalize pass
//     strips the junk, the cells repaint.
//   · Backspace walks backwards and ←/→ move the caret because they are the
//     NATIVE caret — the active cell is derived from selectionStart, never
//     stored beside it. Select-all paints all cells selected, because a
//     selection range maps to a cell range.
//   · The input's own glyphs are letter-spaced to sit under the cells, so the
//     blueprint toggle can simply tint them red and you SEE the real input
//     lying over the fake one.
//
// Verification is yours: pass `verify` (sync or async — hit your API) and a
// full code drives the little state machine: right → the cells cascade green
// left to right; wrong → the row shakes, the digits drop out one by one, then
// the field clears and hands the caret back. Without `verify` it compares
// against the `code` prop, so the component demos out of the box.
//
// Animation via motion/react; honours prefers-reduced-motion. Requires the
// lab-theme tokens. Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;
const SHAKE_S = 0.38; // wrong code: the row shake
const DROP_S = 0.24; // each digit's fall-out
const STAGGER_S = 0.045; // per-digit clear offset
const FILL_S = 0.055; // per-cell success cascade offset

const OTP_VARS = {
  "--otp-cell-w": "2.75rem",
  "--otp-cell-h": "3.25rem",
  "--otp-gap": "0.5rem",
} as CSSProperties;

export interface OtpInputState {
  length: number;
  caret: { start: number; end: number };
  state: "idle" | "success" | "error";
  attempts: number;
  focused: boolean;
}

export default function OtpInput({
  length = 6,
  code = "246810",
  verify,
  mask = false, // paint • instead of the digit
  group = false, // split in half, like SMS codes read aloud
  prefill = null, // {key, code} — simulate an autofill (keyed so re-picking re-applies)
  inspect = false,
  onStateChange,
}: {
  length?: number;
  /** Demo fallback: the code `verify` defaults to comparing against. */
  code?: string;
  /** Your check — sync or async (hit your API); return whether the code is right. */
  verify?: (value: string) => boolean | Promise<boolean>;
  mask?: boolean;
  group?: boolean;
  prefill?: { key: number; code: string } | null;
  inspect?: boolean;
  onStateChange?: (state: OtpInputState) => void;
}) {
  const [value, setValue] = useState("");
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<"idle" | "success" | "error">("idle");
  const [attempts, setAttempts] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<number>(0);

  const chars = value.split("");
  const collapsed = sel.start === sel.end;
  const caretCell = Math.min(sel.start, length - 1);
  const groupAt = Math.ceil(length / 2);

  function syncSel() {
    const el = inputRef.current;
    if (!el) return;
    setSel({ start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0 });
  }

  // The active cell is DERIVED from the native selection — arrows, backspace,
  // select-all all just move the real caret and the paint follows.
  useEffect(() => {
    const onSelectionChange = () => {
      if (document.activeElement === inputRef.current) syncSel();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (state !== "idle") return;
    // One normalize pass covers typing, paste and autofill: "246 810",
    // "246-810" and "246810" all become the same digits.
    const next = event.target.value.replace(/\D/g, "").slice(0, length);
    setValue(next);
    requestAnimationFrame(syncSel);
  }

  // Native click mapping is the one thing that's wrong for OTP (you can't
  // edit the middle of a code) — snap pointer focus to the end instead.
  function handleMouseDown(event: React.MouseEvent) {
    event.preventDefault();
    const el = inputRef.current;
    el?.focus({ preventScroll: true });
    el?.setSelectionRange(value.length, value.length);
    syncSel();
  }

  // A full code in → verify. A beat of delay so the last digit is seen landing
  // before the row answers; the check itself may be async (your API).
  useEffect(() => {
    if (state !== "idle" || value.length !== length) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      let ok: boolean;
      try {
        ok = await Promise.resolve(verify ? verify(value) : value === code);
      } catch {
        ok = false;
      }
      if (cancelled) return;
      setAttempts((n) => n + 1);
      if (ok) {
        setState("success");
      } else {
        setState("error");
        // Shake, then the digits drop out one by one, then the field clears
        // and the caret comes back for another try.
        errorTimerRef.current = window.setTimeout(() => {
          setValue("");
          setState("idle");
          const el = inputRef.current;
          if (el && document.activeElement === el) {
            el.setSelectionRange(0, 0);
            syncSel();
          } else {
            setSel({ start: 0, end: 0 });
          }
        }, SHAKE_S * 1000 + length * STAGGER_S * 1000 + 260);
      }
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, state, code, verify, length]);

  // Simulated autofill (e.g. demo presets) — through the same normalize +
  // verify path a real autofill would take.
  useEffect(() => {
    if (!prefill) return;
    clearTimeout(errorTimerRef.current);
    setState("idle");
    setValue(String(prefill.code).replace(/\D/g, "").slice(0, length));
    setSel({ start: length, end: length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.key]);

  function reset() {
    clearTimeout(errorTimerRef.current);
    setValue("");
    setState("idle");
    setAttempts(0);
    const el = inputRef.current;
    el?.focus({ preventScroll: true });
    el?.setSelectionRange(0, 0);
    syncSel();
  }

  useEffect(() => () => clearTimeout(errorTimerRef.current), []);

  useEffect(() => {
    onStateChange?.({
      length: value.length,
      caret: { start: sel.start, end: sel.end },
      state,
      attempts,
      focused,
    });
  }, [value.length, sel, state, attempts, focused, onStateChange]);

  const cells = useMemo(
    () =>
      Array.from({ length }, (_, index) => {
        const char = chars[index];
        return {
          index,
          char,
          active: focused && state === "idle" && collapsed && caretCell === index,
          selected: focused && !collapsed && index >= sel.start && index < sel.end,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chars.join(""), length, focused, state, collapsed, caretCell, sel.start, sel.end],
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative flex flex-col items-center gap-2" style={OTP_VARS} data-state={state}>
        {/* Wrong code: the row shakes once, as one object. */}
        <motion.div
          className="relative flex gap-[var(--otp-gap)]"
          animate={state === "error" ? { x: [0, -6, 5, -4, 3, -1, 0] } : { x: 0 }}
          transition={{ duration: SHAKE_S, ease: EASE }}
        >
          {cells.map((cell) => (
            <div
              key={cell.index}
              className={[
                "flex items-center justify-center w-[var(--otp-cell-w)] h-[var(--otp-cell-h)] rounded-[0.625rem] text-xl font-medium tabular-nums",
                "transition-[box-shadow,background-color,color] duration-150",
                group && cell.index === groupAt ? "ml-3" : "",
                // the success cascade retimes the tint with a per-cell delay
                state === "success"
                  ? "shadow-[var(--shadow-border),0_0_0_1.5px_#16a34a] bg-[#f0fdf4] text-[#15803d]"
                  : cell.active
                    ? "bg-card text-foreground shadow-[var(--shadow-border),0_0_0_2px_var(--color-ring)]"
                    : state === "error"
                      ? "bg-card text-destructive shadow-border"
                      : "bg-card text-foreground shadow-border",
                inspect ? "outline outline-[1.5px] outline-dashed outline-[#3b82f6] -outline-offset-2" : "",
              ].join(" ")}
              style={state === "success" ? { transitionDelay: `${cell.index * FILL_S * 1000}ms` } : undefined}
              aria-hidden="true"
            >
              {cell.char && (
                // A selection RANGE maps to a cell range — one input. The
                // highlight hugs the digit like native text selection paints
                // the glyph's line box, instead of tinting the whole slot.
                // Padding is offset by negative margins so toggling it never
                // shifts the centered glyph.
                <motion.span
                  className={`inline-block rounded-[0.3125rem] px-1 py-0.5 -mx-1 -my-0.5 transition-colors duration-150 ${
                    cell.selected ? "bg-foreground/10" : "bg-transparent"
                  }`}
                  initial={false}
                  animate={
                    state === "success"
                      ? { scale: [1, 1.15, 1], y: 0, opacity: 1, filter: "blur(0px)" }
                      : state === "error"
                        ? { y: "0.5rem", opacity: 0, filter: "blur(2px)" }
                        : { scale: 1, y: 0, opacity: 1, filter: "blur(0px)" }
                  }
                  transition={
                    state === "success"
                      ? { duration: 0.3, ease: EASE, delay: cell.index * FILL_S }
                      : state === "error"
                        ? { duration: DROP_S, ease: "easeOut", delay: SHAKE_S + cell.index * STAGGER_S }
                        : { duration: 0 }
                  }
                >
                  {mask ? "•" : cell.char}
                </motion.span>
              )}
              {cell.active && !cell.char && (
                // The fake caret: a hard blink (steps, not a fade).
                <motion.span
                  className="w-[1.5px] h-[1.375rem] rounded-[1px] bg-foreground"
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ duration: 1.1, times: [0, 0.5, 0.5, 1], repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          ))}

          {/* THE component: one real input over the whole row. Transparent, not
              hidden — the browser must see it to autofill and focus it. No
              maxLength: it would truncate a formatted paste ("246 810" is 7
              chars) BEFORE the normalize pass — the slice enforces length. */}
          <input
            ref={inputRef}
            className={[
              "absolute inset-0 w-full h-full border-0 outline-none bg-transparent font-mono text-xl cursor-text",
              "[letter-spacing:calc(var(--otp-cell-w)+var(--otp-gap)-1ch)] pl-[calc(var(--otp-cell-w)/2-0.5ch)]",
              // A host page's own ::selection styling repaints selected glyphs
              // with a visible foreground — select-all would reveal masked
              // digits (this site does exactly that: selection:text-white on
              // the page wrapper, which Tailwind cascades to descendants at
              // EQUAL specificity, so source order decides). `!` makes the
              // component win deterministically in any host page; the
              // text-fill-color below is the second lock — ::selection cannot
              // override it, so the glyphs stay invisible mid-selection.
              "selection:bg-transparent! selection:text-transparent! [caret-color:transparent]",
              inspect
                ? "text-[rgba(220,38,38,0.55)] [-webkit-text-fill-color:rgba(220,38,38,0.55)] outline outline-[1.5px] outline-dashed outline-[#ef4444] outline-offset-4" // the secret, revealed
                : "text-transparent [-webkit-text-fill-color:transparent]",
            ].join(" ")}
            type="text"
            value={value}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-label={`${length}-digit verification code`}
            spellCheck={false}
            autoCorrect="off"
            readOnly={state !== "idle"}
            onChange={handleChange}
            onMouseDown={handleMouseDown}
            onKeyUp={syncSel}
            onFocus={() => {
              setFocused(true);
              const el = inputRef.current;
              el?.setSelectionRange(value.length, value.length);
              syncSel();
            }}
            onBlur={() => setFocused(false)}
          />
        </motion.div>

        {/* Fixed-height under-row so Verified / Wrong code never shift the layout. */}
        <div className="flex items-center gap-2.5 min-h-7">
          <span
            className={`text-[0.8125rem] transition-colors duration-150 ${
              state === "success" ? "text-[#16a34a] font-medium" : state === "error" ? "text-destructive font-medium" : "text-muted-foreground/70"
            }`}
          >
            {state === "success" ? "Verified" : state === "error" ? "Wrong code" : mask ? "Digits are masked" : " "}
          </span>
          {state === "success" && (
            <motion.button
              type="button"
              className="h-7 px-2.5 rounded-lg bg-muted text-foreground text-xs font-medium cursor-pointer transition-[background-color,scale] duration-150 hover:bg-foreground/10 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={reset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              Try again
            </motion.button>
          )}
        </div>

        <span className="sr-only" aria-live="polite">
          {state === "success" ? "Code verified." : state === "error" ? "Wrong code, the field will clear. Try again." : ""}
        </span>

        {/* Blueprint annotations — red is the real input revealed (its glyphs
            are letter-spaced to sit under the cells), blue the derived paint. */}
        {inspect && (
          <>
            <span className="absolute bottom-[calc(100%+0.75rem)] left-1/2 -translate-x-1/2 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              one real input · color: transparent · autocomplete: one-time-code
            </span>
            <span className="absolute top-[calc(100%+0.4rem)] left-1/2 -translate-x-1/2 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              selection {sel.start}..{sel.end} → {collapsed ? `cell ${caretCell}` : `cells ${sel.start}-${Math.max(sel.start, sel.end - 1)}`}
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
```
