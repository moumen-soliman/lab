"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Offers } from "./Offers";
import { Dream } from "./Dream";

/* ─────────────────────────────────────────────────────────
 * THE STATEMENT, AND THE EGG UNDER IT
 *
 * The headline and the paragraph, plus the one thing the landing page hides.
 * The paragraph offers the reader the `why`; clicking that word takes it back,
 * and what answers is the joke - an inbox of companies who read the stories
 * instead of copying the component. It is a daydream, and the page says so:
 * the swap happens inside a film dissolve (see Dream) and Escape wakes you up.
 *
 * PULL STORYBOARD. Each value is ms after the click.
 *
 *    0ms   the outgoing copy plays its own entrance backwards - the same 10px,
 *          on the exact mirror of the same curve - so it leaves the way it came
 *  180ms   headline, paragraph and caption trade height at once, three rows
 *          resizing on one clock, so the page settles a single time
 *  240ms   the outgoing copy is gone and the incoming copy starts, same frame
 *  270ms   the dream dissolve is at its deepest, which is no accident: the
 *          handoff happens where the bloom is brightest and nobody can see it
 *  580ms   everything has landed; the messages keep arriving behind it
 *  900ms   the page is sharp again
 *
 * The handoff at 240ms is the whole reason these numbers are what they are.
 * An earlier cut ran the exit over 400ms and started the entrance at 500ms,
 * which read as a hitch: `ease-leave` is a true ease-in, so it is nearly flat
 * for its first third - at 150ms the paragraph was still at 99% opacity - and
 * then there were 100ms with neither line on screen. Both are gone now. The
 * exit is short enough that the flat head is under 70ms, the entrance begins
 * on the exact frame the exit ends, and the resize starts before either, so
 * the page is visibly moving well before the copy has finished leaving.
 *
 * The exit is also deliberately quicker than the entrance, 240ms against
 * 340ms: whatever is arriving deserves the longer look.
 *
 * Escape puts it back, and so does clicking the headline. Every beat is a
 * transition, never a keyframe: a reader who clicks twice in a second sees one
 * motion reverse mid-flight instead of two animations racing to the same
 * properties. Keyframes are left to the two things that genuinely run once or
 * forever - the page entrance, and the looping stream in Offers.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  leave: 0, // the outgoing copy starts back down its arrival curve
  resize: 180, // the rows trade height, under the tail of the fade
  arrive: 240, // the incoming copy starts on the frame the outgoing one ends
};

// The durations these delays are timed against live as literals in the class
// strings below, because Tailwind reads this file as text and will never see
// an interpolated `duration-[${x}ms]`. Kept here so the storyboard above can
// be checked against them, and `arrive` must always equal `leave`'s duration
// or the dead window comes back.
const DURATION = {
  leaving: 240, // duration-[240ms] in GONE
  arriving: 340, // duration-[340ms] in HERE
  row: 400, // duration-[400ms] in ROW
};

/* One half of a swap, in three layers: the row that owns the height, the box
   that clips it, and the copy that fades and travels. Duration travels with
   the state rather than sitting on COPY, because leaving and arriving are not
   the same length. */
const ROW = "grid transition-[grid-template-rows] duration-[400ms] ease-smooth-out motion-reduce:transition-none";
const COPY = "block transition-[opacity,translate] motion-reduce:translate-y-0";
const HERE = "translate-y-0 opacity-100 ease-arrive duration-[340ms]"; // landed
const GONE = "translate-y-[10px] opacity-0 ease-leave duration-[240ms]"; // the entrance, backwards

/* A pair of these makes a swap: one closes from 1fr to 0fr while the other
   opens, and a grid resolves 1fr against its own content, so each row lands on
   exactly the height it is holding without anyone measuring anything.

   Every element is a span set to block or grid, so a Swap is legal inside an
   <h1>, whose content model would reject a <div>.

   Nothing unmounts. A click mid-swap retargets both transitions instead of
   restarting them, which is the whole reason this is not a keyframe. */
function Swap({
  show,
  clip = true,
  children,
}: {
  show: boolean;
  /** The paragraph turns its clip OFF at rest - see `clipping` below. */
  clip?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={ROW}
      style={{ gridTemplateRows: show ? "1fr" : "0fr", transitionDelay: `${TIMING.resize}ms` }}
    >
      <span className={clip ? "block overflow-hidden" : "block"}>
        <span
          inert={!show}
          className={`${COPY} ${show ? HERE : GONE}`}
          style={{ transitionDelay: `${show ? TIMING.arrive : TIMING.leave}ms` }}
        >
          {children}
        </span>
      </span>
    </span>
  );
}

export function HomeStatement({ delays }: { delays: { headline: number; paragraph: number } }) {
  const [pulled, setPulled] = useState(false);

  // Counts flips rather than tracking direction, because the dissolve is the
  // same going under and coming back. Zero until the reader does something,
  // so the page never loads mid-dream.
  const [flips, setFlips] = useState(0);
  const flip = (next: boolean) => {
    setPulled(next);
    setFlips((count) => count + 1);
  };

  // The paragraph's row clips itself only while it is collapsed or moving. At
  // rest it must NOT sit inside an overflow-hidden box: the GitHub link on its
  // last line floats a popover that reaches well above the paragraph's own
  // bounds, and a permanent clip would guillotine it.
  const [clipping, setClipping] = useState(false);

  useEffect(() => {
    if (pulled) {
      setClipping(true);
      return undefined;
    }
    const timer = setTimeout(() => setClipping(false), TIMING.resize + DURATION.row);
    return () => clearTimeout(timer);
  }, [pulled]);

  // Escape is the way back for anyone who hit this by accident, or who read
  // the joke and wants the sentence that actually explains the site.
  useEffect(() => {
    if (!pulled) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") flip(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pulled]);

  const entrance = (delay: number): CSSProperties => ({ animationDelay: `${delay}ms` });

  return (
    <>
      <Dream flips={flips} open={pulled} />
      <Offers open={pulled} />

      {/* The headline swaps a three-word line for a whole sentence, so it has
          to resize, and it does it on the same clock as the copy underneath -
          three rows moving together read as the page recomposing once, where
          three staggered resizes would read as the page coming apart. */}
      <h1
        className="animate-fade-in mt-3 text-2xl font-medium tracking-tight leading-[1.1] text-foreground text-balance"
        style={entrance(delays.headline)}
      >
        <Swap show={!pulled}>Less is more</Swap>
        <Swap show={pulled}>
          {/* The way back out, and the only affordance it needs is the cursor:
              a heading that offers to be pressed is already unusual enough. */}
          <button
            type="button"
            onClick={() => flip(false)}
            aria-label="Wake up and bring the why back"
            className="transition-[opacity,scale] duration-200 ease-smooth-out hover:opacity-70 active:scale-[0.96] motion-reduce:transition-opacity"
          >
            How I feel if someone read the stories instead of copy
          </button>
        </Swap>
      </h1>

      <Swap show={!pulled} clip={clipping}>
        <p className="animate-fade-in mt-4 text-muted-foreground text-[0.9375rem] leading-relaxed text-pretty" style={entrance(delays.paragraph)}>
          A small lab of <span className="font-medium text-foreground">the components we build every day</span>,{" "}
          <span className="font-medium text-foreground">rethought for better feel</span>. Copy the source if that’s all you
          need. Stay for <span className="font-medium text-foreground">how each one was built</span>, dead ends included,
          written for <span className="font-medium text-foreground">frontend and design engineers</span> who want the{" "}
          {/* The egg's one door. A dotted underline is the whole invitation:
              enough to say the word is not merely set in mono, quiet enough
              that the sentence still reads as a sentence.

              `inline-block` so the press scale has something to act on without
              disturbing the line it sits in, and the pseudo-element takes the
              target from roughly 30x20 to 44x34. It stops short of a square 44
              on purpose: the collision rule outranks the size rule, and the
              line above and the line below are 24px away. */}
          <button
            type="button"
            onClick={() => flip(true)}
            className="relative inline-block font-mono text-foreground underline decoration-dotted decoration-subtle-foreground/70 underline-offset-4 transition-[text-decoration-color,scale] duration-200 ease-smooth-out after:absolute after:-inset-x-1.5 after:-inset-y-[7px] hover:decoration-foreground active:scale-[0.96] motion-reduce:transition-[text-decoration-color]"
          >
            why
          </button>
          . In React, fully Tailwind, on the <span className="font-medium text-foreground">shadcn registry</span>:{" "}
          <code className="whitespace-nowrap text-foreground">npx moumenlab add</code>, or star it on{" "}
          {/* The GitHub link hides a meme: hover reveals a gif popover guilt-
              tripping you about our very humble star count.
              ── HOVER STORYBOARD ──────────────────────────────────────────
                idle   card sits 4px low, scale 0.96, fully transparent
                hover  over 200ms it lifts into place + fades in, growing out
                       of the link (origin-bottom); reverses on leave.
              Pure CSS via the group, so it costs no state. It's one compact
              surface, so it reveals as a single unit rather than a staggered
              entrance. @media(hover:hover) keeps it off touch (tap falls
              through to the repo); prefers-reduced-motion drops the move. */}
          <span className="group/gh relative inline-block">
            <a
              href="https://github.com/moumen-soliman/lab"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline decoration-subtle-foreground/70 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              GitHub
            </a>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-40 origin-bottom -translate-x-1/2 translate-y-1 scale-[0.96] rounded-2xl bg-popover p-2 opacity-0 shadow-[var(--shadow-border),var(--shadow-lift)] transition-[opacity,scale,translate] duration-200 ease-smooth-out motion-reduce:transition-none [@media(hover:hover)]:group-hover/gh:translate-y-0 [@media(hover:hover)]:group-hover/gh:scale-100 [@media(hover:hover)]:group-hover/gh:opacity-100"
            >
              <img
                src="/github.gif"
                alt="A meme reacting to our star count"
                width={288}
                height={288}
                className="block aspect-square w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
              />
              <span className="mt-2 block text-center text-xs leading-snug text-muted-foreground">
                be the <span className="font-medium text-foreground">⭐</span> we’ve been waiting for.
              </span>
            </span>
          </span>
          .
        </p>
      </Swap>

      <Swap show={pulled}>
        <p className="mt-4 text-muted-foreground text-[0.9375rem] leading-relaxed text-pretty">
          In the dream, some of them read it. <span className="font-medium text-foreground">They keep writing.</span>
          {/* Said out loud, because an easter egg that swallows the one
              paragraph explaining the site should name its own exit. */}
          <span className="mt-2 block font-mono text-xs text-subtle-foreground">esc wakes you up</span>
        </p>
      </Swap>
    </>
  );
}
