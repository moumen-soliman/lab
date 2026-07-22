"use client";

import type { ReactNode } from "react";
import NestedMenu, { type NestedMenuItem } from "./unlimited-nested-menu";

export default function NestedMenuExample() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      {/* Default: drill any branch and its children stack over the menu. */}
      <NestedMenu
        items={MENU_ITEMS}
        rootTitle="Actions"
        triggerLabel="Move file"
        onSelect={(item, path) => console.log("picked", item.label, "from", path.join(" › "))}
      />

      {/* align="end" pins the popup's right edge to the trigger (menus near the
          screen's right side); dim={false} keeps parent panels at full strength. */}
      <NestedMenu items={MENU_ITEMS} align="end" dim={false} triggerLabel="Options" />

      {/* animate={false}: instant open/drill/close, for dense tooling UIs. It can
          also be controlled — pass `open` + `onOpenChange`. */}
      <NestedMenu items={MENU_ITEMS} animate={false} triggerLabel="Quick menu" />
    </div>
  );
}

// A realistic "act on this file" menu: a deep folder tree (proves the depth is
// unbounded) plus sibling actions. A folder WITH children is a branch (opens a
// sub-panel); without, a leaf (a pickable target).
export const MENU_ITEMS: NestedMenuItem[] = [
  {
    id: "move", label: "Move to", icon: <FolderIcon />, items: [
      {
        id: "workspace", label: "Workspace", icon: <GridIcon />, items: [
          {
            id: "design", label: "Design", icon: <PenIcon />, items: [
              {
                id: "brand", label: "Brand", icon: <SparkleIcon />, items: [
                  {
                    id: "y2026", label: "2026", icon: <CalendarIcon />, items: [
                      {
                        id: "q1", label: "Q1 campaign", icon: <MegaphoneIcon />, items: [
                          { id: "launch", label: "Launch assets", icon: <RocketIcon /> },
                          { id: "social", label: "Social", icon: <ShareNodesIcon /> },
                          { id: "press", label: "Press kit", icon: <FileTextIcon /> },
                        ],
                      },
                      { id: "q2", label: "Q2 campaign", icon: <TargetIcon /> },
                    ],
                  },
                  { id: "logos", label: "Logos", icon: <ImageIcon /> },
                ],
              },
              { id: "productui", label: "Product UI", icon: <LayoutIcon /> },
            ],
          },
          {
            id: "eng", label: "Engineering", icon: <CodeIcon />, items: [
              { id: "frontend", label: "Frontend", icon: <MonitorIcon /> },
              { id: "backend", label: "Backend", icon: <DatabaseIcon /> },
            ],
          },
          { id: "personal", label: "Personal", icon: <UserIcon /> },
        ],
      },
    ],
  },
  {
    id: "status", label: "Set status", icon: <FlagIcon />, items: [
      { id: "todo", label: "Todo" },
      { id: "doing", label: "In progress" },
      { id: "review", label: "In review" },
      { id: "done", label: "Done" },
    ],
  },
  {
    id: "assign", label: "Assign to", icon: <UserIcon />, items: [
      { id: "sarah", label: "Sarah Chen" },
      { id: "marcus", label: "Marcus Lee" },
      { id: "priya", label: "Priya Patel" },
      { id: "you", label: "You" },
    ],
  },
  { id: "copy", label: "Copy link", icon: <LinkIcon />, hint: "⌘L" },
  { id: "dupe", label: "Duplicate", icon: <CopyIcon />, hint: "⌘D" },
  { id: "delete", label: "Delete", icon: <TrashIcon />, danger: true, hint: "⌫" },
];

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function FolderIcon() { return <Svg><path d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-7.5l-2-2H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z" /></Svg>; }
function FlagIcon() { return <Svg><path d="M4 22V4M4 4h11l-1.5 3.5L15 11H4" /></Svg>; }
function UserIcon() { return <Svg><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></Svg>; }
function LinkIcon() { return <Svg><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></Svg>; }
function CopyIcon() { return <Svg><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Svg>; }
function TrashIcon() { return <Svg><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6M14 11v6" /></Svg>; }
function GridIcon() { return <Svg><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></Svg>; }
function PenIcon() { return <Svg><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></Svg>; }
function SparkleIcon() { return <Svg><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z" /></Svg>; }
function CalendarIcon() { return <Svg><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></Svg>; }
function MegaphoneIcon() { return <Svg><path d="m3 11 16-5v12L3 14Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></Svg>; }
function TargetIcon() { return <Svg><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></Svg>; }
function RocketIcon() { return <Svg><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /></Svg>; }
function ShareNodesIcon() { return <Svg><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" /></Svg>; }
function FileTextIcon() { return <Svg><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /><path d="M9 13h6M9 17h5" /></Svg>; }
function ImageIcon() { return <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.8" /><path d="m21 15-4.5-4.5L6 21" /></Svg>; }
function LayoutIcon() { return <Svg><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></Svg>; }
function CodeIcon() { return <Svg><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></Svg>; }
function MonitorIcon() { return <Svg><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></Svg>; }
function DatabaseIcon() { return <Svg><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" /><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></Svg>; }
