import type { SVGProps } from "react";
import { Mintlify, OpenPanel } from "@/src/lib/logos";

// Who keeps the lab running. One entry per sponsor: the row is a wrapping,
// centered flex list, so the third and fourth cost nothing but a line here.
//
// Each sponsor ships a whole lockup, mark plus wordmark, so the row sets no
// names of its own: `name` is the accessible label for the link and the React
// key, never rendered type. Setting it twice, once as artwork and once in Geist,
// was the alternative and it reads as a stutter.
//
// The wordmarks run on `currentColor` at #111, and the whole link rests at 70%
// opacity rather than at a gray, so the type and Mintlify's greens come up
// together on hover instead of one warming while the other sits still.
const SPONSORS: { name: string; href: string; Logo: (props: SVGProps<SVGSVGElement>) => React.JSX.Element }[] = [
  { name: "Mintlify", href: "https://mintlify.com?utm_source=moumenlab", Logo: Mintlify },
  { name: "OpenPanel", href: "https://openpanel.dev?utm_source=moumenlab", Logo: OpenPanel },
];

/* The sponsor row. No chip, no ring, no border: at rest each lockup is simply
   sitting back at 70%, and hovering brings it up to full while a highlight
   passes across it once.

   The highlight is two white bars, wide-and-soft leading, narrow-and-bright
   trailing, blurred and raked 12°. Nothing is masked to the artwork because it
   does not need to be: white over a white page is invisible, so the pass only
   shows where it crosses ink, which is exactly where a reflection would land.

   ── HOVER ────────────────────────────────────────────────
     idle    lockup at 70%, bars parked one full width off the left
     hover   opacity → 100% over 200ms
       0ms   bars enter from the left edge
     850ms   bars leave past the right edge, one pass, no repeat
     press   scale 0.96, released on pointer-up
     reduced no pass at all; the opacity change carries it
   ───────────────────────────────────────────────────────── */
export function Sponsors() {
  return (
    <section aria-labelledby="sponsors-heading">
      <h2 id="sponsors-heading" className="font-mono text-xs tracking-wide text-gray-500 select-none">
        Sponsored by
      </h2>

      <ul className="mt-1 flex flex-wrap items-center justify-center gap-1">
        {SPONSORS.map(({ name, href, Logo }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              // The lockup is the only content, and it is aria-hidden artwork,
              // so the link would otherwise have no accessible name at all.
              aria-label={name}
              // h-10 keeps the target at 40px even though the lockup reads as
              // ~18px of ink, so the pointer never has to be precise. The radius
              // and overflow are invisible at rest; they exist to clip the pass.
              className="group relative inline-flex h-10 items-center overflow-hidden rounded-full px-3.5 text-[#111] opacity-70 select-none transition-[opacity,scale] duration-200 ease-smooth-out hover:opacity-100 active:scale-[0.96]"
            >
              {/* Locked to height, never to width: both viewBoxes are framed to
                  the same 95.8% ink ratio, so one height gives both lockups the
                  same ink height, and `w-auto` lets each keep its own aspect -
                  4.5:1 here, 5.8:1 there. Ink height is a proxy, not a guarantee
                  of matching type size (one logotype is lowercase, the other
                  isn't), so a new sponsor is worth an eye before it ships. */}
              <Logo className="h-[1.125rem] w-auto shrink-0" />

              {/* The pass. Parked off the left until hover, and gone entirely
                  under reduced motion rather than left mid-sweep. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-glint motion-reduce:hidden"
              >
                <span className="absolute -inset-y-2 left-0 w-2.5 -skew-x-12 bg-white/70 blur-[5px]" />
                <span className="absolute -inset-y-2 left-4 w-1 -skew-x-12 bg-white/90 blur-[3px]" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
