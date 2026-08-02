import type { SVGProps } from "react";

function Icon({ className = "w-4 h-4", children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </Icon>
  );
}

export function ArrowRightIcon() {
  return (
    <Icon>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </Icon>
  );
}

export function ChevronDownIcon() {
  return (
    <Icon className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </Icon>
  );
}

export function CheckIcon() {
  return (
    <Icon className="w-3 h-3">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </Icon>
  );
}

export function CopyIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <Icon className={className}>
      <rect x="9" y="9" width="11" height="11" rx="2" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Icon>
  );
}

/* The two star states for the "Star on GitHub" swap. Same 5-point geometry in
 * both, mirror-symmetric about x=12, so the filled one lands exactly on top of
 * the outline with no drift during the cross-fade. All coordinates absolute:
 * an implicit relative continuation after an `L` silently flips to absolute,
 * which is how hand-written star paths usually break. */
const STAR_PATH =
  "M12 2.75 L14.83 8.49 L21.17 9.41 L16.58 13.88 L17.67 20.19 L12 17.2 L6.33 20.19 L7.42 13.88 L2.83 9.41 L9.17 8.49 Z";

export function StarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Icon className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={STAR_PATH} />
    </Icon>
  );
}

export function StarFilledIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Icon className={className} fill="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={STAR_PATH} />
    </Icon>
  );
}

export function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Icon className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" strokeWidth="2" />
      <path strokeLinecap="round" strokeWidth="2" d="m20 20-3.9-3.9" />
    </Icon>
  );
}

/* The theme pair, drawn to the same optical weight so the cross-fade between
 * them is a change of shape and never a change of density. The sun's rays stop
 * at 24 like every other icon's extents, and the moon is a crescent cut from a
 * disc rather than a filled arc, so both read at 16px. */
export function SunIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Icon className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.25" strokeWidth="2" />
      <path
        strokeLinecap="round"
        strokeWidth="2"
        d="M12 2.5v2.25M12 19.25v2.25M21.5 12h-2.25M4.75 12H2.5M18.72 5.28l-1.59 1.59M6.87 17.13l-1.59 1.59M18.72 18.72l-1.59-1.59M6.87 6.87 5.28 5.28"
      />
    </Icon>
  );
}

export function MoonIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <Icon className={className} aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.25 14.32A8.5 8.5 0 0 1 9.68 3.75a8.5 8.5 0 1 0 10.57 10.57Z"
      />
    </Icon>
  );
}

export function PlayIcon() {
  return (
    <svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

// The moumenlab mark, inlined for surfaces that need it to inherit the text
// colour or animate. The homepage instead points at /logo.svg so the identity
// has one source; keep this in step with that file if the mark changes.
export function LabMark({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g fill="currentColor">
        <path d="M16 25C12.2 21 12.2 14.5 16 11C19.8 14.5 19.8 21 16 25Z" transform="rotate(-52 16 25)" />
        <path d="M16 25C11.5 20 11.5 11.5 16 7C20.5 11.5 20.5 20 16 25Z" />
        <path d="M16 25C12.2 21 12.2 14.5 16 11C19.8 14.5 19.8 21 16 25Z" transform="rotate(52 16 25)" />
        <circle cx="16" cy="26" r="2.5" />
      </g>
    </svg>
  );
}

export function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
