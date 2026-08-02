import Link from "next/link";
import { ArrowRightIcon } from "@/src/lib/icons";
import { Sponsors } from "@/src/components/Sponsors";
import { HomeStatement } from "@/src/components/HomeStatement";

/* ─────────────────────────────────────────────────────────
 * ENTRANCE STORYBOARD
 *
 *    0ms   mark fades in
 *   50ms   wordmark kicker follows
 *  100ms   headline lands
 *  150ms   paragraph settles
 *  200ms   CTA arrives
 *  250ms   sponsors close the page
 * ───────────────────────────────────────────────────────── */

// One beat between each element, so the five arrivals read as a single settling
// motion rather than five separate ones. Retime the whole entrance by changing
// BEAT; the storyboard above stays the running order.
const BEAT = 50;
const ENTRANCE = {
  mark: 0,
  wordmark: BEAT,
  headline: BEAT * 2,
  paragraph: BEAT * 3,
  cta: BEAT * 4,
  sponsors: BEAT * 5,
} as const;

// The landing: one quiet statement, dead-center in the window. The lab itself
// lives at /components.
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 selection:bg-foreground selection:text-background">
      <main className="max-w-md text-center">
        {/* The mark is served from /logo.svg, the same file the README and the
            registry point at, so the identity has one source. Empty alt: the
            wordmark directly under it already says the name, and announcing it
            twice would only add noise. */}
        <div className="animate-fade-in flex justify-center" style={{ animationDelay: `${ENTRANCE.mark}ms` }}>
          <img src="/logo-black.svg" alt="" width={32} height={32} className="block w-8 h-8" />
        </div>

        <p
          className="animate-fade-in mt-4 font-mono text-xs tracking-wide text-muted-foreground select-none"
          style={{ animationDelay: `${ENTRANCE.wordmark}ms` }}
        >
          moumenlab
        </p>

        {/* The headline and the paragraph, and the easter egg the paragraph
            hides. They moved into a client component together because the egg
            is one gesture across both of them: the `why` cannot be pulled out
            of the paragraph without the headline answering. Their entrance
            beats are still timed from the storyboard above, so this page keeps
            the whole running order in one place. */}
        <HomeStatement delays={{ headline: ENTRANCE.headline, paragraph: ENTRANCE.paragraph }} />

        <div className="animate-fade-in mt-8" style={{ animationDelay: `${ENTRANCE.cta}ms` }}>
          <Link
            href="/components"
            className="group inline-flex items-center gap-2 rounded-full bg-primary py-2.5 pl-5 pr-4 text-sm font-medium text-primary-foreground select-none transition-[background-color,scale] hover:bg-primary/85 active:scale-[0.96]"
          >
            Browse components
            {/* The arrow leans into the journey on hover; translate only, so the
                nudge is interruptible and never shifts the label. */}
            <span className="inline-flex transition-[translate] duration-200 ease-icon group-hover:translate-x-0.5">
              <ArrowRightIcon />
            </span>
          </Link>
        </div>

        {/* Last beat, and deliberately the quietest one: the CTA keeps the page's
            only filled surface, and the sponsor sits a full 3rem below it so the
            eye finishes on "Browse components" and finds this on the way out. */}
        <div className="animate-fade-in mt-12" style={{ animationDelay: `${ENTRANCE.sponsors}ms` }}>
          <Sponsors />
        </div>
      </main>
    </div>
  );
}
