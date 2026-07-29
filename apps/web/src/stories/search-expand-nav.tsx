import { type Story, em, storyLink } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigScreenBudget,
  FigBottomBar,
  FigNavInspiration,
  FigTwoStageMorph,
  FigFlipUpgrade,
} from "./figures/search-expand-nav";

/** Search-Expand Navigation Bar - the milestones behind the component. */
export const searchExpandNavStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "Two fixtures eating the screen",
      figure: <FigScreenBudget />,
      body: (
        <>
          At work the layout came with two fixtures: a left sidebar locked at{" "}
          <span className={em}>80px that never extends</span>, and a{" "}
          <span className={em}>floating searchbar</span> sitting over the content. On big monitors, fine. On smaller
          screens, together they taxed the one thing that actually needed the room:{" "}
          <span className={em}>the content</span>.
        </>
      ),
    },
    {
      title: "Combine, then drop to the bottom",
      figure: <FigBottomBar />,
      body: (
        <>
          The move: <span className={em}>fold both into one</span>. Navigation icons, the avatar and search became a
          single <span className={em}>bottom bar</span>. The 80px rail returns to the content, the search stops
          floating over it, and the bar sits where thumbs and eyes already expect it.
        </>
      ),
    },
    {
      title: "The spark",
      figure: <FigNavInspiration />,
      body: (
        <>
          The layout idea was sparked by{" "}
          <a
            href="https://x.com/Techzoneke/status/2065350356830138370"
            className={storyLink}
            target="_blank"
            rel="noreferrer"
          >
            a bottom nav I saw on X
          </a>
          . The resting shape was right: the quiet bar with search waiting at its edge. What it still needed was
          motion that could carry a <span className={em}>professional product</span>.
        </>
      ),
    },
    {
      title: "A two-stage morph",
      figure: <FigTwoStageMorph />,
      body: (
        <>
          Opening plays as <span className={em}>two sequenced stages, one driving property each</span>. First the
          horizontal morph: the search icon <span className={em}>glides left</span> to become the field&apos;s leading
          icon while the rest of the chrome fades. Then the vertical grow: anchored to the bottom, the box{" "}
          <span className={em}>grows upward</span> into a card of recent searches. The travel distance is measured
          from layout, so it stays correct when the bar shrinks on narrow screens.
        </>
      ),
    },
    {
      title: "The flip, my addition",
      figure: <FigFlipUpgrade />,
      body: (
        <>
          On top of the inspiration I added the <span className={em}>flip</span> effect: instead of the search icon
          travelling the whole bar, the first icon <span className={em}>rises and blurs into the search icon in
          place</span>. Shorter distance, less spectacle: it reads{" "}
          <span className={em}>more professional and feels faster</span>. Both effects shipped as a prop, and the flip
          is the one I reach for.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://x.com/Techzoneke/status/2065350356830138370",
      label: "The bottom nav on X (@Techzoneke)",
      note: (
        <>
          the inspiration for the resting shape: nav and search living in{" "}
          <span className={em}>one bottom bar</span>. The flip motion is the part added on top.
        </>
      ),
    },
  ],
};
