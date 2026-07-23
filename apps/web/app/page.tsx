import Link from "next/link";
import { ArrowRightIcon } from "@/src/lib/icons";

/* ─────────────────────────────────────────────────────────
 * ENTRANCE STORYBOARD
 *
 *    0ms   wordmark kicker fades in
 *   50ms   headline lands
 *  100ms   paragraph settles
 *  150ms   CTA arrives
 * ───────────────────────────────────────────────────────── */

// The landing: one quiet statement, dead-center in the window. The lab itself
// lives at /components.
export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 selection:bg-[#111] selection:text-white">
      <main className="max-w-md text-center">
        <p className="animate-fade-in font-mono text-xs tracking-wide text-gray-500 select-none">moumenlab</p>

        <h1
          className="animate-fade-in mt-3 text-2xl font-medium tracking-tight leading-[1.1] text-[#111] text-balance"
          style={{ animationDelay: "50ms" }}
        >
          Less is more
        </h1>

        <p
          className="animate-fade-in mt-4 text-gray-500 text-[0.9375rem] leading-relaxed text-pretty"
          style={{ animationDelay: "100ms" }}
        >
          A small lab of <span className="font-medium text-[#111]">the components we build every day</span>,{" "}
          <span className="font-medium text-[#111]">rethought for better feel</span>. Each one does{" "}
          <span className="font-medium text-[#111]">one thing well</span>, built in React and fully Tailwind, and
          available in the <span className="font-medium text-[#111]">shadcn registry</span> - copy the source, install
          it with <code className="whitespace-nowrap text-[#111]">npx moumenlab add</code>, or star it on{" "}
          {/* The GitHub link hides a meme: hover reveals a gif popover guilt-
              tripping you about our very humble star count.
              ── HOVER STORYBOARD ──────────────────────────────────────────
                idle   card sits 4px low, scale 0.96, fully transparent
                hover  over 200ms it lifts into place + fades in, growing out
                       of the link (origin-bottom); reverses on leave.
              Pure CSS via the group so the page stays a server component. It's
              one compact surface, so it reveals as a single unit rather than a
              staggered entrance. @media(hover:hover) keeps it off touch (tap
              falls through to the repo); prefers-reduced-motion drops the move. */}
          <span className="group/gh relative inline-block">
            <a
              href="https://github.com/moumen-soliman/lab"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#111] underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-[#111]"
            >
              GitHub
            </a>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-40 origin-bottom -translate-x-1/2 translate-y-1 scale-[0.96] rounded-2xl bg-white p-2 opacity-0 shadow-[var(--shadow-border),var(--shadow-lift)] transition-[opacity,scale,translate] duration-200 ease-smooth-out motion-reduce:transition-none [@media(hover:hover)]:group-hover/gh:translate-y-0 [@media(hover:hover)]:group-hover/gh:scale-100 [@media(hover:hover)]:group-hover/gh:opacity-100"
            >
              <img
                src="/github.gif"
                alt="A meme reacting to our star count"
                width={288}
                height={288}
                className="block aspect-square w-full rounded-lg object-cover outline outline-1 -outline-offset-1 outline-black/10"
              />
              <span className="mt-2 block text-center text-xs leading-snug text-gray-500">
                be the <span className="font-medium text-[#111]">⭐</span> we&apos;ve been waiting for.
              </span>
            </span>
          </span>
          .
        </p>

        <div className="animate-fade-in mt-8" style={{ animationDelay: "150ms" }}>
          <Link
            href="/components"
            className="group inline-flex items-center gap-2 rounded-full bg-[#111] py-2.5 pl-5 pr-4 text-sm font-medium text-white select-none transition-[background-color,scale] hover:bg-[#333] active:scale-[0.96]"
          >
            Browse components
            {/* The arrow leans into the journey on hover; translate only, so the
                nudge is interruptible and never shifts the label. */}
            <span className="inline-flex transition-[translate] duration-200 ease-icon group-hover:translate-x-0.5">
              <ArrowRightIcon />
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
