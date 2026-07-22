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
          <a
            href="https://github.com/moumen-soliman/lab"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[#111] underline decoration-gray-300 underline-offset-4 transition-colors hover:decoration-[#111]"
          >
            GitHub
          </a>
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
