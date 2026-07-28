"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "../lib/icons";

export type StoryStep = {
  title: string;
  body: ReactNode;
  /** A little wireframe sketch of this milestone, drawn beside the text. */
  figure?: ReactNode;
};

export type StoryReference = {
  /** Omi- while the link is still being tracked down — the label renders as plain text until then. */
  href?: string;
  label: string;
  /** What the reference is and why it matters — including a pointer to the exact part (e.g. a video timestamp). */
  note?: ReactNode;
  /** A screenshot of the referenced work, shown under the note. */
  image?: { src: string; alt: string; width: number; height: number };
};

/* ─────────────────────────────────────────────────────────
 * STORY — how the component came to be, told as milestones
 *
 * Same grammar as the rest of the page: an uppercase section
 * label, a See more fold (0fr → 1fr accordion, open on the
 * detail page), and a numbered timeline whose dotted spine
 * echoes the Divider's dotted line.
 * ───────────────────────────────────────────────────────── */
export function StorySection({
  steps,
  references,
  legend,
  delay = 0,
  defaultOpen = true,
}: {
  steps: StoryStep[];
  references?: StoryReference[];
  /** A key to the figures' tinted bands, shown right under the timeline. */
  legend?: ReactNode;
  delay?: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="animate-fade-in mt-10" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[0.6875rem] font-medium uppercase tracking-wide text-gray-500 select-none">Story</h2>
        <button
          type="button"
          className="relative flex-none inline-flex items-center gap-1 px-2 py-1 -mr-2 rounded-full text-xs font-medium text-gray-500 [transition:color_200ms_ease,background-color_200ms_ease,scale_150ms_ease-out] hover:text-[#111] hover:bg-gray-100 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] after:content-[''] after:absolute after:-inset-y-2 after:inset-x-0"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "See less" : "See more"}
          <span
            className={`inline-flex [transition:rotate_250ms_var(--ease-smooth-out)] ${open ? "rotate-180" : "rotate-0"}`}
          >
            <ChevronDownIcon />
          </span>
        </button>
      </div>
      <div
        className="group/story grid grid-rows-[0fr] [transition:grid-template-rows_400ms_var(--ease-smooth-out)] data-[open=true]:grid-rows-[1fr]"
        data-open={open ? "true" : "false"}
        id={id}
      >
        <div className="min-h-0 overflow-hidden">
          <ol className="pt-4 opacity-0 [transform:translateY(-0.25rem)] blur-[2px] [transition:opacity_350ms_var(--ease-smooth-out),transform_350ms_var(--ease-smooth-out),filter_350ms_var(--ease-smooth-out)] group-data-[open=true]/story:opacity-100 group-data-[open=true]/story:[transform:translateY(0)] group-data-[open=true]/story:blur-[0px]">
            {steps.map((step, index) => (
              <li key={step.title} className="relative pl-8 pb-6 last:pb-0">
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[10px] top-6 bottom-1 w-px bg-[linear-gradient(180deg,#d4d4d8_2px,transparent_2px)] bg-[length:1px_4px]"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 grid h-5 w-5 place-items-center rounded-full border border-gray-200 bg-white text-[0.625rem] font-medium tabular-nums text-gray-500 select-none"
                >
                  {index + 1}
                </span>
                <h3 className="text-sm font-medium tracking-tight text-[#111]">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 text-pretty">{step.body}</p>
                {step.figure && (
                  <div className="mt-3" aria-hidden="true">
                    {step.figure}
                  </div>
                )}
              </li>
            ))}
          </ol>
          {legend && (
            <div
              className="mt-1 pl-8 opacity-0 [transform:translateY(-0.25rem)] blur-[2px] [transition:opacity_350ms_var(--ease-smooth-out),transform_350ms_var(--ease-smooth-out),filter_350ms_var(--ease-smooth-out)] group-data-[open=true]/story:opacity-100 group-data-[open=true]/story:[transform:translateY(0)] group-data-[open=true]/story:blur-[0px]"
              style={{ transitionDelay: open ? "60ms" : "0ms" }}
              aria-hidden="true"
            >
              {legend}
            </div>
          )}
          {references && references.length > 0 && (
            <div
              className="mt-5 pl-8 opacity-0 [transform:translateY(-0.25rem)] blur-[2px] [transition:opacity_350ms_var(--ease-smooth-out),transform_350ms_var(--ease-smooth-out),filter_350ms_var(--ease-smooth-out)] group-data-[open=true]/story:opacity-100 group-data-[open=true]/story:[transform:translateY(0)] group-data-[open=true]/story:blur-[0px]"
              style={{ transitionDelay: open ? "120ms" : "0ms" }}
            >
              <h3 className="text-[0.6875rem] font-medium uppercase tracking-wide text-gray-500 select-none">
                References
              </h3>
              <ul className="mt-2 space-y-1.5">
                {references.map((reference) => (
                  <li key={reference.label} className="text-sm leading-relaxed text-gray-500 text-pretty">
                    {reference.href ? (
                      <a
                        href={reference.href}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#111] underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-[#111]"
                      >
                        {reference.label}
                      </a>
                    ) : (
                      <span className="font-medium text-[#111]">{reference.label}</span>
                    )}
                    {reference.note && <> — {reference.note}</>}
                    {reference.image && (
                      <img
                        src={reference.image.src}
                        alt={reference.image.alt}
                        width={reference.image.width}
                        height={reference.image.height}
                        loading="lazy"
                        className="mt-2.5 w-full max-w-[240px] rounded-xl border border-black/10"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
