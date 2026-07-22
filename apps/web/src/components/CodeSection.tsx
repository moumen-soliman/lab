"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { CopyIcon, CheckIcon, ChevronDownIcon } from "../lib/icons";

/* ─────────────────────────────────────────────────────────
 * CODE SECTION — the base layout every component page gets
 *
 *  Install   manager tabs · command line · copy
 *  Usage     the example.tsx beside the component, always open
 *  Source    the installable file, folds out (0fr → 1fr accordion)
 *
 * One motion language: accordion + chevron on the shared
 * smooth-out ease; copy icons cross-fade on the icon ease.
 * ───────────────────────────────────────────────────────── */

// The registry origin the install commands point at. Kept as a constant so a
// preview deploy can be pointed elsewhere without touching every page.
const REGISTRY_ORIGIN = "https://lab.moumen.dev";

type Manager = "moumenlab" | "shadcn" | "pnpm";

const MANAGERS: { id: Manager; label: string }[] = [
  { id: "moumenlab", label: "moumenlab" },
  { id: "shadcn", label: "shadcn" },
  { id: "pnpm", label: "pnpm" },
];

function installCommand(id: Manager, slug: string): string {
  const url = `${REGISTRY_ORIGIN}/r/${slug}.json`;
  if (id === "moumenlab") return `npx moumenlab add ${slug}`;
  if (id === "pnpm") return `pnpm dlx shadcn@latest add ${url}`;
  return `npx shadcn@latest add ${url}`;
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return { copied, copy };
}

// Copy → check cross-fade: both icons stay in the DOM and swap with
// opacity + scale + blur on the shared icon easing, so the swap animates in
// both directions and stays interruptible.
function CopySwapIcon({ copied }: { copied: boolean }) {
  const hidden = "opacity-0 scale-25 blur-[4px]";
  const shown = "opacity-100 scale-100 blur-[0px]";
  return (
    <span className="relative inline-flex h-3.5 w-3.5" aria-hidden="true">
      <span
        className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,scale,filter] duration-200 ease-icon ${copied ? hidden : shown}`}
      >
        <CopyIcon />
      </span>
      <span
        className={`absolute inset-0 inline-flex items-center justify-center transition-[opacity,scale,filter] duration-200 ease-icon ${copied ? shown : hidden}`}
      >
        <CheckIcon />
      </span>
    </span>
  );
}

// Quiet text copy action: looks like a text link, hits like a 40px button
// (invisible pseudo-element padding).
function CopyAction({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="relative inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 select-none transition-colors hover:text-[#111] after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']"
    >
      <CopySwapIcon copied={copied} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// Small uppercase section kicker; gray-500 keeps AA contrast at this size.
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[0.6875rem] font-medium uppercase tracking-wide text-gray-500 select-none">{children}</h2>
  );
}

const CODE_BOX =
  "overflow-auto rounded-xl shadow-border text-[0.8125rem] leading-relaxed [&_pre]:m-0 [&_pre]:p-4 [&_pre]:overflow-visible [&_code]:font-mono";

// All highlighted HTML is produced on the server (shiki) so no highlighter
// ships to the client; the panels just toggle visibility.
export function CodeSection({
  slug,
  source,
  highlightedHtml,
  usage,
  usageHtml,
}: {
  slug: string;
  source: string;
  highlightedHtml: string;
  usage: string | null;
  usageHtml: string | null;
}) {
  const [manager, setManager] = useState<Manager>("moumenlab");
  const [open, setOpen] = useState(false);
  const install = useCopy();
  const code = useCopy();
  const usageCopy = useCopy();
  const command = installCommand(manager, slug);
  const sourceId = useId();

  return (
    <div className="animate-fade-in mt-8 flex flex-col gap-6" style={{ animationDelay: "100ms" }}>
      {/* Install */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <SectionLabel>Install</SectionLabel>
          <div className="flex items-center gap-1">
            {MANAGERS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setManager(m.id)}
                aria-pressed={manager === m.id}
                className={`relative rounded-full px-2.5 py-1 text-xs font-medium select-none transition-[color,background-color,scale] active:scale-[0.96] after:absolute after:inset-x-0 after:-inset-y-2 after:content-[''] ${
                  manager === m.id ? "bg-[#111] text-white" : "text-gray-500 hover:text-[#111] hover:bg-gray-100"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <code className="flex-1 min-w-0 overflow-x-auto rounded-lg bg-gray-950 px-3.5 py-2.5 text-[0.8125rem] text-gray-100 shadow-border whitespace-pre">
            <span aria-hidden="true" className="select-none text-gray-500">
              ${" "}
            </span>
            {command}
          </code>
          <button
            type="button"
            onClick={() => install.copy(command)}
            className="grid w-10 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-border transition-[color,box-shadow,scale] hover:text-[#111] hover:shadow-border-hover active:scale-[0.96]"
            aria-label="Copy install command"
          >
            <CopySwapIcon copied={install.copied} />
          </button>
        </div>
      </section>

      {/* Usage: the example that lives beside the component in the registry -
          short enough to stay open, with its own copy. */}
      {usage && usageHtml && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <SectionLabel>Usage</SectionLabel>
            <CopyAction copied={usageCopy.copied} onCopy={() => usageCopy.copy(usage)} />
          </div>
          <div className={`${CODE_BOX} max-h-[20rem]`} dangerouslySetInnerHTML={{ __html: usageHtml }} />
        </section>
      )}

      {/* Source: folds out with the same accordion the intro uses, so the whole
          page speaks one motion language. Content stays mounted (it is static
          server HTML), the grid row just collapses. */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="select-none">
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={sourceId}
              className="relative inline-flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-wide text-gray-500 transition-colors hover:text-[#111] after:absolute after:-inset-x-2 after:-inset-y-3 after:content-['']"
            >
              <span
                className={`inline-flex [transition:rotate_250ms_var(--ease-smooth-out)] ${open ? "rotate-180" : "rotate-0"}`}
              >
                <ChevronDownIcon />
              </span>
              Source
            </button>
          </h2>
          {open && <CopyAction copied={code.copied} onCopy={() => code.copy(source)} />}
        </div>

        <div
          id={sourceId}
          className="grid grid-rows-[0fr] [transition:grid-template-rows_400ms_var(--ease-smooth-out)] data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none"
          data-open={open ? "true" : "false"}
          aria-hidden={!open}
        >
          <div className="min-h-0 overflow-hidden">
            <div className={`${CODE_BOX} mt-3 max-h-[28rem]`} dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          </div>
        </div>
      </section>
    </div>
  );
}
