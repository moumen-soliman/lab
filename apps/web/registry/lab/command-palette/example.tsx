"use client";

import type { ReactNode } from "react";
import CommandPalette, { type Command } from "./command-palette";

// Commands are data: label + icon + shortcut + typed argument slots, each with
// its own options and a `message` for the applied summary. Pass your own and
// handle onApply(clauses) to run the compound.
export default function CommandPaletteExample() {
  return <CommandPalette commands={COMMANDS} onApply={(clauses) => console.log("apply", clauses)} />;
}

const PEOPLE = [
  { value: "Sarah Chen", hint: "Design" },
  { value: "Omar Farouk", hint: "Engineering" },
  { value: "June Park", hint: "Product" },
  { value: "Maya Lindberg", hint: "Engineering" },
  { value: "Leo Okafor", hint: "Data" },
];
const PRIORITIES = [
  { value: "Urgent", dot: "#dc2626" },
  { value: "High", dot: "#f59e0b" },
  { value: "Medium", dot: "#3b82f6" },
  { value: "Low", dot: "#9ca3af" },
];
const PROJECTS = [{ value: "Website Redesign" }, { value: "Mobile App" }, { value: "Design System" }, { value: "Billing Service" }];
const LABELS = [
  { value: "Bug", dot: "#dc2626" },
  { value: "Feature", dot: "#3b82f6" },
  { value: "Improvement", dot: "#10b981" },
  { value: "Docs", dot: "#8b5cf6" },
  { value: "Chore", dot: "#9ca3af" },
];

function dueOptions() {
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
  const day = (offset: number) => fmt.format(new Date(Date.now() + offset * 86400000));
  return [
    { value: "Today", hint: day(0) },
    { value: "Tomorrow", hint: day(1) },
    { value: "Next week", hint: day(7) },
    { value: "Next month", hint: day(30) },
    { value: "No due date" },
  ];
}

export const COMMANDS: Command[] = [
  {
    id: "assign",
    label: "Assign to",
    icon: <CommandIcon name="user" />,
    shortcut: "A",
    slots: [
      { name: "assignee", prompt: "Assign to whom", kind: "person", options: PEOPLE },
      { name: "priority", prompt: "With what priority", kind: "dot", options: PRIORITIES },
    ],
    message: (v) => `Assigned to ${v[0].value} · ${v[1].value} priority`,
  },
  {
    id: "due",
    label: "Set due date",
    icon: <CommandIcon name="calendar" />,
    shortcut: "D",
    slots: [{ name: "due", prompt: "When is it due", kind: "plain", options: dueOptions() }],
    message: (v) => (v[0].value === "No due date" ? "Due date cleared" : `Due ${v[0].value.toLowerCase()}${v[0].hint ? ` · ${v[0].hint}` : ""}`),
  },
  {
    id: "move",
    label: "Move to project",
    icon: <CommandIcon name="folder" />,
    shortcut: "M",
    slots: [{ name: "project", prompt: "Which project", kind: "plain", options: PROJECTS }],
    message: (v) => `Moved to ${v[0].value}`,
  },
  {
    id: "label",
    label: "Add label",
    icon: <CommandIcon name="tag" />,
    shortcut: "L",
    slots: [{ name: "label", prompt: "Which label", kind: "dot", options: LABELS }],
    message: (v) => `Labeled ${v[0].value}`,
  },
  { id: "copy", label: "Copy issue link", icon: <CommandIcon name="link" />, shortcut: "⌘C", slots: [], message: () => "Link copied to clipboard" },
  { id: "subscribe", label: "Subscribe to updates", icon: <CommandIcon name="bell" />, shortcut: "S", slots: [], message: () => "Subscribed to this issue" },
  { id: "archive", label: "Archive issue", icon: <CommandIcon name="archive" />, danger: true, slots: [], message: () => "Issue archived" },
];

function CommandIcon({ name }: { name: string }): ReactNode {
  const p = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "user") return <svg {...p}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === "calendar") return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
  if (name === "folder") return <svg {...p}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
  if (name === "tag") return <svg {...p}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>;
  if (name === "link") return <svg {...p}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
  if (name === "bell") return <svg {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
  return <svg {...p}><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" /><path d="M10 12h4" /></svg>;
}
