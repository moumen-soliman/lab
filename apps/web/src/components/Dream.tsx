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

   THE GLOW is the state: a cool white haze that stays for as long as the dream
   does. It sits at -z-10, in the same band as the message stream, so it lights
   the cards from underneath without touching the type.

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
