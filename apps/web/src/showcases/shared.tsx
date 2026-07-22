"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDownIcon, CheckIcon } from "../lib/icons";

// Showcase header: the page scans as titles, options and playgrounds; the full
// story folds out of "See more" (accordion via a 0fr→1fr grid, nothing
// measured). On a solo detail page it opens by default.
export function ShowcaseIntro({
  title,
  delay = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  delay?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="animate-fade-in mb-4" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between gap-4">
        {/* The page's top heading: h1 from the document outline, sized via CSS
            to stay quiet (the demo is the hero, not the title). */}
        <h1 className="text-sm font-medium tracking-tight text-[#111]">{title}</h1>
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
        className="group/intro grid grid-rows-[0fr] [transition:grid-template-rows_400ms_var(--ease-smooth-out)] data-[open=true]:grid-rows-[1fr]"
        data-open={open ? "true" : "false"}
        id={id}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="text-gray-500 text-sm leading-relaxed pt-2 text-pretty opacity-0 [transform:translateY(-0.25rem)] blur-[2px] [transition:opacity_350ms_var(--ease-smooth-out),transform_350ms_var(--ease-smooth-out),filter_350ms_var(--ease-smooth-out)] group-data-[open=true]/intro:opacity-100 group-data-[open=true]/intro:[transform:translateY(0)] group-data-[open=true]/intro:blur-[0px]">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
}

// The box pins to the FIRST line (items-start + a nudge) and the children render
// inside one wrapping span — a long gray description flows as a paragraph
// instead of breaking into detached flex items beside the box.
export function CheckToggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer select-none text-sm text-gray-600 hover:text-[#111] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`mt-0.5 grid shrink-0 place-items-center w-4 h-4 rounded border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#111] ${
          checked ? "bg-[#111] border-[#111] text-white" : "bg-white border-gray-300 text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
      <span className="min-w-0 text-pretty">{children}</span>
    </label>
  );
}

export function InspectToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <CheckToggle checked={checked} onChange={onChange}>
      Show component details
    </CheckToggle>
  );
}

export function SpecLegend() {
  return (
    <div className="flex items-center gap-3 text-[0.6875rem] text-gray-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-[2px] rounded-full bg-red-500" />
        Dimensions
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-3 h-[2px] rounded-full bg-blue-500" />
        Spacing &amp; flow
      </span>
    </div>
  );
}
