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
              "group/item relative shrink basis-0 min-w-0 flex items-center justify-center px-2 overflow-hidden rounded-[0.875rem] bg-muted text-muted-foreground " +
              "[transition:background-color_250ms_ease,color_250ms_ease] " +
              "hover:bg-primary hover:text-primary-foreground focus-visible:bg-primary focus-visible:text-primary-foreground " +
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" +
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
