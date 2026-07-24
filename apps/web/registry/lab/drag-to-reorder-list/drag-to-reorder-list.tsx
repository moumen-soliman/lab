"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MotionConfig, animate, motion, useReducedMotion, type MotionValue, motionValue } from "motion/react";

// Drag-to-reorder list with FLIP.
//
// Three motion systems working together without fighting, all driven through
// motion/react's motion values:
//
//   1. The dragged card follows the pointer RAW — its y motion value is
//      `jump()`ed straight from the pointermove handler (no easing: any easing
//      between hand and card reads as lag; no React render on the hot path).
//   2. Siblings glide out of the way: as the dragged card crosses slot
//      boundaries each displaced sibling's y is `animate()`d exactly one slot —
//      retargetable, so reversing mid-glide just works.
//   3. The drop is a FLIP: capture First rects before the commit, let React
//      reflow, then Invert each card back to its old screen pixels and
//      `animate()` it home. Nothing jumps.
//
// Plus rubber-banding past the ends (4:1 damped), pointer capture, multi-touch
// protection, and a full keyboard path (grip → Space grabs → arrows move →
// Escape cancels) narrated to screen readers. Requires the lab-theme tokens.
// Fully Tailwind, no CSS files.

const DRAG_THRESHOLD = 4;
const EASE = [0.22, 1, 0.36, 1] as const;
const MOVE = { duration: 0.2, ease: EASE } as const;
const LIFT = { duration: 0.16, ease: EASE } as const;

export interface ReorderItem {
  id: string;
  label: string;
  meta?: string;
}

export interface ReorderState {
  order: string[];
  dragging: string | null;
  from: number | null;
  to: number | null;
  grabbed: boolean;
  lastMove: { label: string; from: number; to: number } | null;
}

interface DragData {
  row: HTMLLIElement;
  pointerId: number;
  index: number;
  startY: number;
  active: boolean;
  slot: number;
  to: number;
  rows?: HTMLLIElement[];
}

export default function DragReorderList({
  items: controlledItems,
  defaultItems = DEFAULT_ITEMS,
  onReorder,
  flip = true,
  inspect = false,
  onStateChange,
}: {
  /** Controlled item order; pair with onReorder. Omit for uncontrolled. */
  items?: ReorderItem[];
  defaultItems?: ReorderItem[];
  onReorder?: (items: ReorderItem[]) => void;
  /** false = hard snap, no glides/FLIP. */
  flip?: boolean;
  inspect?: boolean;
  onStateChange?: (state: ReorderState) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(controlledItems ?? defaultItems);
  const items = controlledItems ?? uncontrolled;
  const setItems = (updater: (list: ReorderItem[]) => ReorderItem[]) => {
    const next = updater(items);
    if (controlledItems === undefined) setUncontrolled(next);
    onReorder?.(next);
  };

  const [dragging, setDragging] = useState<{ id: string; from: number } | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [grabbed, setGrabbed] = useState<{ id: string; from: number } | null>(null);
  const [lastMove, setLastMove] = useState<{ label: string; from: number; to: number } | null>(null);
  const [announce, setAnnounce] = useState("");

  const listRef = useRef<HTMLUListElement>(null);
  const flipRectsRef = useRef<Map<string, DOMRect> | null>(null);
  const dragRef = useRef<DragData | null>(null);
  const grabSnapshotRef = useRef<ReorderItem[] | null>(null);
  const justDraggedRef = useRef(false);
  // One y motion value per row id — the single writing channel for all three
  // motion systems, so they can never fight over a transform.
  const yMapRef = useRef(new Map<string, MotionValue<number>>());
  const slotYRef = useRef(motionValue(0));
  const reduced = useReducedMotion();

  const yFor = (id: string) => {
    let mv = yMapRef.current.get(id);
    if (!mv) {
      mv = motionValue(0);
      yMapRef.current.set(id, mv);
    }
    return mv;
  };

  const rowNodes = () => [...(listRef.current?.querySelectorAll<HTMLLIElement>("[data-reorder-item]") ?? [])];
  const glide = (mv: MotionValue<number>, to: number) => {
    if (flip && !reduced) animate(mv, to, MOVE);
    else mv.jump(to);
  };

  // FLIP: after any commit that captured First rects, zero everyone, measure the
  // clean layout, invert, then animate() home.
  useLayoutEffect(() => {
    const prev = flipRectsRef.current;
    flipRectsRef.current = null;
    const list = listRef.current;
    if (!prev || !list) return;
    const rows = rowNodes();
    for (const row of rows) yFor(row.dataset.id!).jump(0);
    void list.offsetWidth;
    if (flip && !reduced) {
      for (const row of rows) {
        const before = prev.get(row.dataset.id!);
        if (!before) continue;
        const dy = before.top - row.getBoundingClientRect().top;
        if (dy) {
          const mv = yFor(row.dataset.id!);
          mv.jump(dy); // Invert: hold the old pixels
          animate(mv, 0, MOVE); // Play: glide home
        }
      }
    }
  }, [items, flip, reduced]);

  useEffect(() => {
    onStateChange?.({
      order: items.map((item) => item.label),
      dragging: dragging ? items.find((item) => item.id === dragging.id)?.label ?? null : null,
      from: dragging?.from ?? grabbed?.from ?? null,
      to: dragging ? target : grabbed ? items.findIndex((item) => item.id === grabbed.id) : null,
      grabbed: Boolean(grabbed),
      lastMove,
    });
  }, [items, dragging, target, grabbed, lastMove, onStateChange]);

  function moveItem(list: ReorderItem[], from: number, to: number) {
    const next = [...list];
    const [picked] = next.splice(from, 1);
    next.splice(to, 0, picked);
    return next;
  }

  function commitOrder(from: number, to: number) {
    const list = listRef.current;
    if (!list) return;
    const rects = new Map<string, DOMRect>();
    for (const row of rowNodes()) rects.set(row.dataset.id!, row.getBoundingClientRect());
    flipRectsRef.current = rects;
    const moved = items[from];
    setItems((current) => moveItem(current, from, to));
    setLastMove({ label: moved.label, from: from + 1, to: to + 1 });
  }

  function handlePointerDown(event: React.PointerEvent<HTMLLIElement>, index: number) {
    if (dragRef.current) return;
    if (event.button !== undefined && event.button !== 0) return;
    const row = event.currentTarget;
    row.setPointerCapture(event.pointerId);
    dragRef.current = { row, pointerId: event.pointerId, index, startY: event.clientY, active: false, slot: 0, to: index };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLLIElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dy = event.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return;
      const rows = rowNodes();
      drag.active = true;
      drag.slot = rows.length > 1 ? rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().top : rows[0].offsetHeight;
      drag.rows = rows;
      slotYRef.current.jump(drag.index * drag.slot);
      setDragging({ id: drag.row.dataset.id!, from: drag.index });
      setTarget(drag.index);
    }
    const max = (items.length - 1 - drag.index) * drag.slot;
    const min = -drag.index * drag.slot;
    let offset = dy;
    if (offset > max) offset = max + (offset - max) / 4;
    if (offset < min) offset = min + (offset - min) / 4;
    // The hand gets no easing: jump(), never animate().
    yFor(drag.row.dataset.id!).jump(offset);

    const to = Math.max(0, Math.min(items.length - 1, Math.round((drag.index * drag.slot + Math.max(min, Math.min(max, dy))) / drag.slot)));
    if (to !== drag.to) {
      drag.to = to;
      setTarget(to);
      if (flip && !reduced) slotYRef.current && animate(slotYRef.current, to * drag.slot, MOVE);
      else slotYRef.current.jump(to * drag.slot);
      drag.rows!.forEach((row, j) => {
        if (row === drag.row) return;
        let shift = 0;
        if (drag.index < j && j <= to) shift = -drag.slot;
        if (to <= j && j < drag.index) shift = drag.slot;
        glide(yFor(row.dataset.id!), shift);
      });
    }
  }

  function settleAll(drag: DragData) {
    glide(yFor(drag.row.dataset.id!), 0);
    drag.rows?.forEach((row) => {
      if (row !== drag.row) glide(yFor(row.dataset.id!), 0);
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLLIElement>) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.pointerId) return;
    dragRef.current = null;
    if (!drag.active) return;
    justDraggedRef.current = true;
    setDragging(null);
    setTarget(null);
    if (drag.to !== drag.index) commitOrder(drag.index, drag.to);
    else settleAll(drag);
  }

  function cancelPointerDrag() {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    if (!drag.active) return;
    justDraggedRef.current = true;
    setDragging(null);
    setTarget(null);
    settleAll(drag);
  }

  useEffect(() => {
    if (!dragging) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancelPointerDrag();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [dragging]);

  function handleGripKeyDown(event: { key: string; preventDefault: () => void }, index: number) {
    const item = items[index];
    const isGrabbed = grabbed?.id === item.id;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (isGrabbed) {
        setGrabbed(null);
        grabSnapshotRef.current = null;
        setAnnounce(`${item.label} dropped at position ${index + 1} of ${items.length}.`);
      } else {
        setGrabbed({ id: item.id, from: index });
        grabSnapshotRef.current = items;
        setAnnounce(`${item.label} grabbed at position ${index + 1} of ${items.length}. Use arrow keys to move, Space to drop, Escape to cancel.`);
      }
    } else if (isGrabbed && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      const to = event.key === "ArrowUp" ? index - 1 : index + 1;
      if (to < 0 || to >= items.length) return;
      commitOrder(index, to);
      setAnnounce(`${item.label} moved to position ${to + 1} of ${items.length}.`);
      requestAnimationFrame(() => {
        listRef.current?.querySelectorAll<HTMLButtonElement>("[data-reorder-grip]")[to]?.focus();
      });
    } else if (isGrabbed && event.key === "Escape") {
      event.preventDefault();
      const snapshot = grabSnapshotRef.current;
      grabSnapshotRef.current = null;
      setGrabbed(null);
      if (snapshot && snapshot !== items) {
        const from = items.findIndex((entry) => entry.id === item.id);
        const to = snapshot.findIndex((entry) => entry.id === item.id);
        commitOrder(from, to);
      }
      setAnnounce(`Reorder cancelled. ${item.label} is back at its original position.`);
    }
  }

  const slotHeights = () => {
    const rows = rowNodes();
    return {
      slot: rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 56,
      cardH: rows[0]?.offsetHeight ?? 48,
    };
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full max-w-80" data-inspect={inspect ? "true" : "false"}>
        <ul
          className={`relative flex flex-col gap-2${inspect ? " outline outline-[1.5px] outline-dashed outline-[#3b82f6] outline-offset-[6px]" : ""}`}
          ref={listRef}
          role="list"
          aria-label="Release checklist, reorderable"
        >
          {items.map((item, index) => {
            const isDragged = dragging?.id === item.id;
            const isGrabbed = grabbed?.id === item.id;
            const lifted = isDragged || isGrabbed;
            return (
              <motion.li
                key={item.id}
                data-id={item.id}
                data-reorder-item
                className={`relative touch-none select-none ${lifted ? "z-10" : ""}`}
                style={{ y: yFor(item.id) }}
                onPointerDown={(event) => handlePointerDown(event, index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={cancelPointerDrag}
              >
                <motion.div
                  className={`flex items-center gap-2.5 py-2.5 pl-2 pr-3.5 bg-card rounded-xl ${lifted ? "cursor-grabbing" : "cursor-grab"}${
                    lifted && inspect ? " outline outline-[1.5px] outline-dashed outline-[#ef4444]" : ""
                  }`}
                  initial={false}
                  animate={
                    lifted
                      ? { scale: 1.02, boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 12px 28px -10px rgba(0,0,0,0.28)" }
                      : { scale: 1, boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06), 0 2px 4px 0 rgba(0,0,0,0.04)" }
                  }
                  transition={LIFT}
                >
                  <button
                    type="button"
                    data-reorder-grip
                    className="grid place-items-center w-9 h-9 rounded-lg text-muted-foreground/70 cursor-grab [transition:background-color_200ms_ease,color_200ms_ease] hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                    aria-label={`Reorder ${item.label}, position ${index + 1} of ${items.length}${isGrabbed ? ", grabbed" : ""}`}
                    aria-pressed={isGrabbed}
                    onKeyDown={(event) => handleGripKeyDown(event, index)}
                    onClick={(event) => {
                      if (justDraggedRef.current) {
                        justDraggedRef.current = false;
                        return;
                      }
                      if (event.detail > 0) handleGripKeyDown({ key: " ", preventDefault: () => {} }, index);
                    }}
                  >
                    <GripIcon />
                  </button>
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                    {item.meta && <span className="text-[0.6875rem] text-muted-foreground/70">{item.meta}</span>}
                  </span>
                  <span className="flex-none text-xs font-medium text-muted-foreground/70 tabular-nums" aria-hidden="true">
                    {index + 1}
                  </span>
                </motion.div>
                {inspect && isDragged && (
                  <span className="absolute bottom-[calc(100%+0.3rem)] left-0 z-20 whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
                    y: pointer Δy via mv.jump(), no easing · rubber past ends
                  </span>
                )}
              </motion.li>
            );
          })}

          {inspect &&
            dragging &&
            target !== null &&
            (() => {
              const { cardH } = slotHeights();
              return (
                <motion.span
                  className="absolute top-0 left-0 right-0 border-[1.5px] border-dashed border-[#f59e0b] rounded-xl pointer-events-none z-[5]"
                  style={{ y: slotYRef.current, height: cardH }}
                  aria-hidden="true"
                >
                  <span className="absolute top-1/2 -right-1.5 translate-x-full -translate-y-1/2 whitespace-nowrap rounded-[0.25rem] border border-[#fde68a] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#b45309] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                    drop slot {target + 1}
                  </span>
                </motion.span>
              );
            })()}
        </ul>

        <span className="sr-only" aria-live="polite">
          {announce}
        </span>

        {inspect && (
          <span className="absolute top-[calc(100%+0.65rem)] left-0 z-20 whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none">
            siblings shift ±1 slot · drop = FLIP: measure → invert → animate()
          </span>
        )}
      </div>
    </MotionConfig>
  );
}

const DEFAULT_ITEMS: ReorderItem[] = [
  { id: "design", label: "Design review", meta: "figma" },
  { id: "mention", label: "Ship mention popover", meta: "lab" },
  { id: "staging", label: "Deploy staging", meta: "vercel" },
  { id: "changelog", label: "Write changelog", meta: "notion" },
  { id: "announce", label: "Announce release", meta: "social" },
];

function GripIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="5" r="1.7" />
      <circle cx="15" cy="5" r="1.7" />
      <circle cx="9" cy="12" r="1.7" />
      <circle cx="15" cy="12" r="1.7" />
      <circle cx="9" cy="19" r="1.7" />
      <circle cx="15" cy="19" r="1.7" />
    </svg>
  );
}
