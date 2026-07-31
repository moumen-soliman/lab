/* The dissolve every film uses to drop someone into a dream, and to pull them
   back out of it. Two layers, and neither one knows anything about the page it
   is sitting on.

   THE WASH is the transition itself. It is the Premiere/Orton move: take the
   frame, blur it, crush the saturation and drive the brightness up, and lay
   that back over the top. The ink lifts off black and diffuses into the white
   around it, everything blooms, and then it clears.

   It works page-wide because it sits ABOVE everything and filters through
   `backdrop-filter` rather than blurring a wrapper - which means the landing
   page never had to be restructured, and the logo, the CTA and the sponsors
   all go under with the copy. It plays once per flip, in both directions,
   because going under and waking up look the same from the outside.

   THE GLOW is the state: a cool white haze, plus the rays turning inside it,
   for as long as the dream lasts. It sits at -z-10, in the same band as the
   message stream, so it lights the cards from underneath without touching the
   type.

   THE TAPE is the other half of the state, and the half that says this is a
   memory rather than a live feed: scanlines with a chroma split, a still layer
   of grain, and one tracking band crawling up the frame every 7 seconds. It
   sits at z-40, over the content and under the wash.

   ── DREAM STORYBOARD (per flip) ───────────────────────────
      0ms   clear, sharp
    270ms   deepest: the page behind is blurred, desaturated and driven 60%
            brighter, the white bloom is at full, and the copy underneath is
            mid-handoff - which is the point. The swap happens where nobody
            can quite see it.
    900ms   surfaced, sharp again
   Falling under takes 30% of the run and surfacing takes 70%. Waking up is
   always the slower half.

   The wash is gated behind `motion-safe`. A bright full-frame bloom is exactly
   what prefers-reduced-motion is asking not to be shown, and the glow alone
   still says dream without anything flashing.
   ───────────────────────────────────────────────────────── */

// Pure white, chroma 0 at every stop. An earlier pass ran this warm and it
// read as a sepia flashback rather than a dream - the reference is cathedral
// light, which is white going slightly cool, never yellow.
const BLOOM =
  "radial-gradient(70% 60% at 50% 44%, oklch(1 0 0 / 0.97), oklch(1 0 0 / 0.84) 48%, oklch(1 0 0 / 0.52) 100%)";

/* The lingering glow, and the one genuinely hard part of all of this: white
   light on a white page is invisible. #fff is already the ceiling, so the
   center cannot be made any brighter. Three things make it read anyway.

   A cool cast. Barely-there blue, chroma 0.012, which the eye takes as "bright
   white light" rather than as a tint, because daylight is cooler than paper.

   A vignette, which is what actually does the work. If the middle cannot go
   up, the edges have to come down. This is the same reason the glow in a film
   frame only reads against a darker room, and why the reference shot is a
   cathedral: the light needs somewhere dim to be bright against. */
const GLOW = [
  "radial-gradient(62% 50% at 50% 42%, oklch(0.995 0.014 250 / 0.95), oklch(0.99 0.01 250 / 0.45) 55%, transparent 78%)",
  "radial-gradient(92% 82% at 50% 44%, transparent 40%, oklch(0.855 0.008 250 / 0.62) 100%)",
].join(", ");

/* And rays, which is the third thing. They live only in the ring the vignette
   just darkened, because that is the only band on the page where white has
   anything to be brighter than - hence the mask, which fades them in past the
   bright core and back out before the corners.

   Soft-shouldered stops rather than hard edges, so the shafts are diffuse
   without a filter: blurring a layer this size is what cost 282ms a moment ago
   in the wash, and it would cost it here every frame instead of once.

   90 seconds for a full turn. Fast enough to be alive, slow enough that
   nobody catches it moving. */
const RAYS =
  "repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, oklch(1 0 0 / 0.5) 3deg, oklch(1 0 0 / 0.72) 5deg, oklch(1 0 0 / 0.5) 7deg, transparent 11deg)";
const RAY_MASK =
  "radial-gradient(closest-side, transparent 26%, oklch(0 0 0) 52%, oklch(0 0 0) 68%, transparent 92%)";

/* ── TAPE ──────────────────────────────────────────────────────────────────
   A dream remembered is a dream on a worn tape, so the whole thing plays back
   through one. Three parts, and not one of them uses a filter - the 282ms
   lesson from the wash applies double to a layer that is up the entire time.

   SCANLINES, in three passes rather than one. A single gray line reads as a
   screen door; splitting it into a cyan pass and a magenta pass one pixel out
   of step is what a tape's chroma error actually looks like, and it costs the
   same as the gray one because it is still just a gradient. */
const SCANLINES = [
  "repeating-linear-gradient(to bottom, oklch(0 0 0 / 0.05) 0 1px, transparent 1px 3px)",
  "repeating-linear-gradient(to bottom, oklch(0.72 0.13 200 / 0.055) 0 1px, transparent 1px 4px)",
  "repeating-linear-gradient(to bottom, transparent 0 2px, oklch(0.68 0.17 340 / 0.05) 2px 3px, transparent 3px 4px)",
].join(", ");

/* GRAIN. `feTurbulence` baked into a data URI, so the browser rasterizes one
   tile once and repeats it. Static on purpose: grain that moves is a per-frame
   repaint of the whole viewport, and it would read as static rather than as
   tape anyway. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.28'/%3E%3C/svg%3E\")";

/* THE TRACKING BAND: the soft bright bar that crawls up a tape that is not
   quite locked. Nothing here is random, because it does not need to be - one
   band on a 7s loop is the thing everyone remembers, and it only ever moves
   `translate`, so it never leaves the compositor. */
const TRACKING =
  "linear-gradient(to bottom, transparent, oklch(1 0 0 / 0.4) 30%, oklch(0.99 0.03 250 / 0.66) 50%, oklch(1 0 0 / 0.4) 70%, transparent)";

export function Dream({ flips, open }: { flips: number; open: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-700 ease-arrive ${
          open ? "opacity-100 delay-200" : "opacity-0 delay-0"
        }`}
        style={{ background: GLOW }}
      >
        {/* Square and oversized, so a conic gradient stays circular on a wide
            viewport and the corners never sweep into view as it turns. Only
            `rotate` animates, which the compositor handles without repainting
            the gradient; `animate-none` under reduced motion leaves the rays
            standing exactly where they are rather than removing them. */}
        <div
          className="animate-shine absolute top-1/2 left-1/2 aspect-square w-[170vmax] -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none"
          style={{ background: RAYS, maskImage: RAY_MASK, WebkitMaskImage: RAY_MASK }}
        />
      </div>

      {/* The tape sits ABOVE the content, at z-40, because a tape is played
          back over everything on it - scanlines that stop politely at the edge
          of the type would read as wallpaper. It stays under the wash at z-50,
          so the dissolve still blows over the top of it.

          Everything here is thin: 0.05 alpha on the lines, 0.28 on the grain.
          The test is that the paragraph underneath still reads exactly as well
          as it does with the tape off. */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-40 overflow-hidden transition-opacity duration-700 ease-arrive ${
          open ? "opacity-100 delay-200" : "opacity-0 delay-0"
        }`}
      >
        <div className="absolute inset-0" style={{ background: SCANLINES }} />
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN }} />
        {/* Parked below the fold until it is animated, so a reader who has
            asked for less motion gets a still tape rather than a bright bar
            frozen across the middle of the copy. */}
        <div
          className="animate-tracking absolute inset-x-0 top-0 h-32 translate-y-[110vh] motion-reduce:animate-none"
          style={{ background: TRACKING }}
        />
      </div>

      {/* `flips` is both the gate and the key: zero on first paint, so the page
          never loads mid-dissolve, and a fresh value on every flip, which
          remounts the layer and restarts the one-shot from the top. A CSS
          animation cannot be re-triggered on a live element without that. */}
      {flips > 0 ? (
        <div
          key={flips}
          aria-hidden
          className="animate-dream pointer-events-none fixed inset-0 z-50 motion-reduce:hidden"
          style={{ background: BLOOM }}
        />
      ) : null}
    </>
  );
}
