# Hover-Expand Icon Strip

Icons in a fixed-width box that expand on hover or Tab while the others squeeze to fit.

- Demo: https://lab.moumen.dev/components/hover-expand-icon-strip
- Install: `npx moumenlab add hover-expand-icon-strip` — or `npx shadcn@latest add https://lab.moumen.dev/r/hover-expand-icon-strip.json`
- Dependencies: motion
- Registry dependencies: https://lab.moumen.dev/r/lab-theme.json
- Installs to: `components/lab/hover-expand-icon-strip.tsx`

## Usage

```tsx
"use client";

import type { ReactNode } from "react";
import ExpandingIconStrip, { type IconStripItem } from "./hover-expand-icon-strip";

export const STRIP_ITEMS: IconStripItem[] = [
  { label: "Home", icon: <HomeIcon /> },
  { label: "Search", icon: <SearchIcon /> },
  { label: "Library", icon: <LibraryIcon /> },
  { label: "Profile", icon: <ProfileIcon /> },
];

export default function ExpandingIconStripExample() {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Default: 320px box — hover or Tab a panel and the others squeeze. */}
      <ExpandingIconStrip items={STRIP_ITEMS} onSelect={(item) => console.log(item.label)} />

      {/* Any fixed width; the panels share whatever box you give them. */}
      <ExpandingIconStrip items={STRIP_ITEMS.slice(0, 3)} width={240} />
    </div>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function HomeIcon() {
  return (
    <Svg>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </Svg>
  );
}

function LibraryIcon() {
  return (
    <Svg>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

function ProfileIcon() {
  return (
    <Svg>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </Svg>
  );
}
```

## Source — `components/lab/hover-expand-icon-strip.tsx`

```tsx
"use client";

// Hover-expand icon strip — a design-engineered fixed-width row.
//
// N icons (3–4) share one fixed-width box. Hovering a panel grows it while the
// others squeeze to make room, so the row's outer width never changes. The
// motion is a pure `flex-grow` tween (1 → 5) inside a `flex-basis: 0` row.
// Keyboard parity: focus-visible expands a panel exactly like hover (motion's
// whileFocus), so tabbing the strip feels the same as mousing it.
//
// The label reveal is deliberately asymmetric: it enters late (a ~90ms delay
// gives the panel room to open before the text lands, so no crushed clipped word
// mid-expansion) with opacity + rise + blur, and exits fast with no delay so it
// ducks out before the shrinking panel squeezes it — each variant carries its
// own transition. Inspect (blueprint) mode swaps the name for live math.
//
// Animation: motion/react (variants propagate hover/focus from the panel to its
// icon and label). Requires the lab-theme tokens. Fully Tailwind, no CSS files.

import type { ReactNode } from "react";
import { motion, MotionConfig, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface IconStripItem {
  label: string;
  icon: ReactNode;
}

const iconVariants: Variants = {
  rest: { y: 0, transition: { duration: 0.35, ease: EASE } },
  expanded: { y: "-0.5rem", transition: { duration: 0.35, ease: EASE } },
};

const labelVariants: Variants = {
  rest: {
    opacity: 0,
    y: "0.25rem",
    filter: "blur(3px)",
    transition: { duration: 0.15, ease: "easeIn" },
  },
  expanded: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE, delay: 0.09 },
  },
};

export default function ExpandingIconStrip({
  items,
  width = 320,
  inspect = false,
  onSelect,
}: {
  items: IconStripItem[];
  width?: number;
  inspect?: boolean;
  onSelect?: (item: IconStripItem) => void;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className={
          "relative flex gap-2 h-16" +
          (inspect
            ? " outline outline-[1.5px] outline-dashed outline-[#3b82f6] outline-offset-[0.375rem] rounded-[0.25rem]"
            : "")
        }
        data-inspect={inspect ? "true" : "false"}
        style={{ width: `${width}px`, maxWidth: "100%" }}
      >
        {items.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            initial="rest"
            animate="rest"
            whileHover="expanded"
            whileFocus="expanded"
            whileTap={{ scale: 0.96 }}
            variants={{ rest: { flexGrow: 1 }, expanded: { flexGrow: 5 } }}
            transition={{
              flexGrow: { duration: 0.35, ease: EASE },
              scale: { duration: 0.15, ease: "easeOut" },
            }}
            className={
              "group/item relative shrink basis-0 min-w-0 flex items-center justify-center px-2 overflow-hidden rounded-[0.875rem] bg-[#f4f4f5] text-gray-500 " +
              "[transition:background-color_250ms_ease,color_250ms_ease] " +
              "hover:bg-[#111] hover:text-white focus-visible:bg-[#111] focus-visible:text-white " +
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]" +
              (inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444] -outline-offset-2" : "")
            }
            aria-label={item.label}
            onClick={() => onSelect?.(item)}
          >
            <motion.span
              className="flex-none inline-flex"
              variants={inspect ? undefined : iconVariants}
            >
              {item.icon}
            </motion.span>

            {inspect ? (
              // Live math: the annotation follows the value it measures (flex-grow 1 → 5).
              <span
                className="absolute bottom-[0.375rem] left-1/2 -translate-x-1/2 text-[0.625rem] font-semibold text-[#dc2626] whitespace-nowrap pointer-events-none tabular-nums after:content-['flex:_1'] group-hover/item:after:content-['flex:_5'] group-focus-visible/item:after:content-['flex:_5']"
                aria-hidden="true"
              />
            ) : (
              <motion.span
                className="absolute left-0 right-0 bottom-[0.4375rem] text-center text-xs font-medium whitespace-nowrap"
                variants={labelVariants}
              >
                {item.label}
              </motion.span>
            )}
          </motion.button>
        ))}

        {inspect && (
          <span className="absolute bottom-[calc(100%+0.75rem)] left-0 px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium text-[#2563eb] whitespace-nowrap bg-white border border-[#bfdbfe] rounded-[0.25rem] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
            {`Fixed width · ${width}px`}
          </span>
        )}
      </div>
    </MotionConfig>
  );
}
```
