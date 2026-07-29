import type { ReactNode } from "react";
import type { StoryStep, StoryReference } from "../components/StorySection";

/* The vocabulary every story file shares: the Story shape the registry
 * consumes, plus the two text classes the prose leans on. */

export type Story = {
  steps: StoryStep[];
  references?: StoryReference[];
  /** The key to the figures' tinted bands, drawn under the timeline. */
  legend?: ReactNode;
};

/** Emphasis inside story prose: the phrase that carries the point. */
export const em = "font-medium text-[#111]";

/** An inline link in story prose, underlined in the page's quiet grey. */
export const storyLink = `${em} underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-[#111]`;
