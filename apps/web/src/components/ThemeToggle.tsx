"use client";

import { useEffect } from "react";
import { SunIcon, MoonIcon } from "../lib/icons";

/* ── The theme switch ──────────────────────────────────────────────────────
 *
 * `data-theme` on <html> is the single source of truth, and this button is one
 * of two things that ever writes it - the other is the inline script in
 * app/layout.tsx, which stamps the first value before the first paint so a
 * reader who chose dark never gets a white frame thrown at them.
 *
 * THE COMPONENT HOLDS NO STATE, and that is deliberate rather than clever. The
 * server cannot know which theme this reader is on: it is in their localStorage
 * or in their OS, and neither travels with the request. Anything rendered from
 * a `theme` variable would therefore have to render wrong on the server and be
 * corrected on hydration, which is either a mismatch warning or a flicker.
 *
 * So nothing here renders from the theme. Both icons are always mounted and
 * both labels are always in the markup; which pair is showing is decided by the
 * `dark:` variant, i.e. by CSS reading the same attribute the script already
 * set. The HTML is identical in both themes, hydration has nothing to correct,
 * and the button is right on the very first frame.
 *
 * ── HOVER / PRESS STORYBOARD ──────────────────────────
 *   idle    target icon at rest, muted, hairline ring
 *   hover   icon and ring both come up one step over 200ms
 *   press   the whole control dips to 0.96
 *   click   the icons trade places over 300ms: the outgoing one shrinks to
 *           0.25 and blurs out, the incoming one grows in from the same
 *           values, on the shared icon curve
 * Both icons stay mounted and stacked, so a reader who double-taps sees one
 * cross-fade reverse mid-flight instead of two animations racing. Same swap,
 * same numbers and same curve as the star in the header - the site only knows
 * one way to trade an icon for another.
 */

const STORAGE_KEY = "theme";

/* Stacked on the same grid cell, so the pair cross-fades in place instead of
   the box collapsing to nothing between them.

   The two states are written out in full on each icon rather than composed
   from shared parts: Tailwind reads this file as text, and a class it only
   ever sees assembled at runtime is a class it never generates. The scale and
   the blur sit behind `motion-safe` so that under a reduced-motion setting
   they are never declared at all and only the opacity moves - the same
   reasoning as the star swap, and the reason it is not a `motion-reduce`
   override, which would leave two rules of equal specificity to source order. */
const ICON = "size-4 col-start-1 row-start-1 transition-[opacity,scale,filter] duration-300 ease-icon";

export function ThemeToggle({ className = "" }: { className?: string }) {
  // Follow the OS for as long as the reader has not overruled it. Once they
  // have, the stored value is the answer and the system can change all it
  // likes - a choice that gets undone by the sun going down is not a choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        // Storage can be blocked outright; following the OS is the sane default.
      }
      document.documentElement.dataset.theme = event.matches ? "dark" : "light";
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode, or storage denied. The theme still flips for this page;
      // it just will not be remembered, which beats not flipping at all.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      // 40px, the same as the search button and the star pill it sits beside,
      // so the header's controls share one hit area as well as one shape.
      className={`inline-grid size-10 flex-none place-items-center rounded-full text-muted-foreground shadow-[var(--shadow-border)] transition-[color,scale,box-shadow] duration-200 ease-smooth-out hover:text-foreground hover:shadow-[var(--shadow-border-hover)] motion-safe:active:scale-[0.96] ${className}`}
    >
      {/* The icon of the theme you are going TO, not the one you are in: the
          button offers a destination rather than reporting a state. */}
      <MoonIcon
        className={`${ICON} opacity-100 motion-safe:scale-100 motion-safe:blur-[0px] dark:opacity-0 dark:motion-safe:scale-25 dark:motion-safe:blur-[4px]`}
      />
      <SunIcon
        className={`${ICON} opacity-0 motion-safe:scale-25 motion-safe:blur-[4px] dark:opacity-100 dark:motion-safe:scale-100 dark:motion-safe:blur-[0px]`}
      />

      {/* The accessible name, which has to change with the theme and cannot be
          an attribute for the reason in the header comment - so it is two
          elements, and `hidden` takes the wrong one out of the a11y tree
          entirely rather than merely hiding it from view. */}
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </button>
  );
}
