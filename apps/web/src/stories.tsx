import type { Story } from "./stories/shared";
import { unlimitedNestedMenuStory } from "./stories/unlimited-nested-menu";
import { ticketNumberTickerStory } from "./stories/ticket-number-ticker";
import { fileUploadStagingStory } from "./stories/file-upload-staging";
import { scheduleBuilderStory } from "./stories/schedule-builder";
import { otpSegmentedInputStory } from "./stories/otp-segmented-input";
import { sharePermissionsPopoverStory } from "./stories/share-permissions-popover";
import { searchExpandNavStory } from "./stories/search-expand-nav";
import { morphingCheckoutStory } from "./stories/morphing-checkout";
import { commandPaletteStory } from "./stories/command-palette";
import { caretMentionPopoverStory } from "./stories/caret-mention-popover";
import { dragToReorderListStory } from "./stories/drag-to-reorder-list";
import { inertialWheelListStory } from "./stories/inertial-wheel-list";

export type { Story } from "./stories/shared";

// slug → the milestones behind the component. Only components with a story
// get the section; everything else renders the page unchanged. Each story
// lives in its own file under ./stories, with its figures under ./stories/figures.
export const stories: Record<string, Story> = {
  "unlimited-nested-menu": unlimitedNestedMenuStory,
  "ticket-number-ticker": ticketNumberTickerStory,
  "file-upload-staging": fileUploadStagingStory,
  "schedule-builder": scheduleBuilderStory,
  "otp-segmented-input": otpSegmentedInputStory,
  "share-permissions-popover": sharePermissionsPopoverStory,
  "search-expand-nav": searchExpandNavStory,
  "morphing-checkout": morphingCheckoutStory,
  "command-palette": commandPaletteStory,
  "caret-mention-popover": caretMentionPopoverStory,
  "drag-to-reorder-list": dragToReorderListStory,
  "inertial-wheel-list": inertialWheelListStory,
};

export function getStory(slug: string): Story | null {
  return stories[slug] ?? null;
}
