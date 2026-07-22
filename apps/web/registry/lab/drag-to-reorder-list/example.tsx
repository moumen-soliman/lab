"use client";

import { useState } from "react";
import DragReorderList, { type ReorderItem } from "./drag-to-reorder-list";

const TASKS: ReorderItem[] = [
  { id: "design", label: "Design review", meta: "figma" },
  { id: "mention", label: "Ship mention popover", meta: "lab" },
  { id: "staging", label: "Deploy staging", meta: "vercel" },
  { id: "changelog", label: "Write changelog", meta: "notion" },
  { id: "announce", label: "Announce release", meta: "social" },
];

export default function DragReorderListExample() {
  // Controlled: hold the order yourself and persist it in onReorder.
  const [items, setItems] = useState(TASKS);
  return (
    <div className="flex flex-col items-center gap-6">
      <DragReorderList items={items} onReorder={setItems} />

      {/* flip={false} is the hard-snap comparison — same math, no glides. */}
      <DragReorderList defaultItems={TASKS.slice(0, 3)} flip={false} />
    </div>
  );
}
