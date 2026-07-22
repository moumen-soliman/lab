import type { ComponentType } from "react";
import { NestedMenuShowcase } from "./showcases/unlimited-nested-menu-showcase";
import { TicketNumberShowcase } from "./showcases/ticket-number-ticker-showcase";
import { UploadStagingShowcase } from "./showcases/file-upload-staging-showcase";
import { ScheduleBuilderShowcase } from "./showcases/schedule-builder-showcase";
import { OtpInputShowcase } from "./showcases/otp-segmented-input-showcase";
import { SharePopoverShowcase } from "./showcases/share-permissions-popover-showcase";
import { CommandPaletteShowcase } from "./showcases/command-palette-showcase";
import { MorphingCheckoutShowcase } from "./showcases/morphing-checkout-showcase";
import { SearchExpandNavShowcase } from "./showcases/search-expand-nav-showcase";
import { DragReorderListShowcase } from "./showcases/drag-to-reorder-list-showcase";
import { MentionComposerShowcase } from "./showcases/caret-mention-popover-showcase";
import { ExpandingIconStripShowcase } from "./showcases/hover-expand-icon-strip-showcase";
import { WheelListShowcase } from "./showcases/inertial-wheel-list-showcase";
// @scaffold:import (pnpm new:component inserts showcase imports above this line)

// slug → live demo component. Imported only by the detail page, so showcase
// code never lands in the home-grid bundle. `pnpm new:component` wires new
// entries in via the markers below.
export const showcases: Record<string, ComponentType> = {
  "unlimited-nested-menu": NestedMenuShowcase,
  "ticket-number-ticker": TicketNumberShowcase,
  "file-upload-staging": UploadStagingShowcase,
  "schedule-builder": ScheduleBuilderShowcase,
  "otp-segmented-input": OtpInputShowcase,
  "share-permissions-popover": SharePopoverShowcase,
  "command-palette": CommandPaletteShowcase,
  "morphing-checkout": MorphingCheckoutShowcase,
  "search-expand-nav": SearchExpandNavShowcase,
  "drag-to-reorder-list": DragReorderListShowcase,
  "caret-mention-popover": MentionComposerShowcase,
  "hover-expand-icon-strip": ExpandingIconStripShowcase,
  "inertial-wheel-list": WheelListShowcase,
  // @scaffold:entry (pnpm new:component inserts entries above this line)
};
