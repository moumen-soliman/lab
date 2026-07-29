import { type Story, em, storyLink } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigSensitiveShare,
  FigButtonNotRow,
  FigThreeViews,
  FigFeedbackPopover,
} from "./figures/share-permissions-popover";

/** Share & Permissions Popover - the milestones behind the component. */
export const sharePermissionsPopoverStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "A job requirement, and a sensitive one",
      figure: <FigSensitiveShare />,
      body: (
        <>
          Another job requirement, and the most sensitive surface of them all:{" "}
          <span className={em}>sharing and permissions</span>. This popover hands out access to real documents and real
          people. A wrong click here is not a visual glitch, it is{" "}
          <span className={em}>someone getting access they shouldn&apos;t have</span>, and that risk shaped the
          interaction rules before any visuals.
        </>
      ),
    },
    {
      title: "Nothing fires on the row",
      figure: <FigButtonNotRow />,
      body: (
        <>
          The guard: <span className={em}>no click by mistake</span>. A fully clickable row is one stray click away
          from changing someone&apos;s access, so here the rows themselves are{" "}
          <span className={em}>inert</span>. Every action lives on a{" "}
          <span className={em}>specific button</span>: a person&apos;s role opens through its own small control at the
          row&apos;s edge, and clicking anywhere else on the person does exactly nothing.
        </>
      ),
    },
    {
      title: "Three views, one surface",
      figure: <FigThreeViews />,
      body: (
        <>
          The share list, a person&apos;s role picker and the link settings are{" "}
          <span className={em}>three different-sized panels inside one floating element</span>. The frame measures each
          view and eases its <span className={em}>width and height</span> between them, so swapping reads as one
          surface changing shape, not three popovers taking turns. Escape backs out{" "}
          <span className={em}>one layer at a time</span>.
        </>
      ),
    },
    {
      title: "The animations.dev pattern",
      figure: <FigFeedbackPopover />,
      body: (
        <>
          For the motion I followed the <span className={em}>steps/feedback popover</span> pattern from{" "}
          <a href="https://animations.dev" className={storyLink} target="_blank" rel="noreferrer">
            animations.dev
          </a>
          : push slides the next view in <span className={em}>from the right</span>, pop returns from the left, and the
          size morph carries the change. The focus trap survives every swap, handing focus somewhere sensible:{" "}
          <span className={em}>the current role on push, the row&apos;s button on pop, the trigger on close</span>.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://animations.dev",
      label: "animations.dev by Emil Kowalski",
      note: (
        <>
          the steps/feedback popover this component&apos;s motion follows: the{" "}
          <span className={em}>directional slide between views</span> inside one frame that eases its own size.
        </>
      ),
    },
  ],
};
