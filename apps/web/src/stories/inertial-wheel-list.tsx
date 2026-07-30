import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import { FigDrum, FigScrollIsState, FigSnapSettle } from "./figures/inertial-wheel-list";

/** Inertial Wheel List - the milestones behind the component. */
export const inertialWheelListStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "The iOS alarm drum",
      figure: <FigDrum />,
      body: (
        <>
          The target was the wheel you spin to set an alarm on iOS:{" "}
          <span className={em}>biggest and sharpest at the centre</span>, dissolving at the rim, and it keeps moving
          after you let go.
        </>
      ),
    },
    {
      title: "The scroll position is the state",
      figure: <FigScrollIsState />,
      body: (
        <>
          Nothing here is scroll-jacked and no library fakes the physics. It is a{" "}
          <span className={em}>plain overflow-y list</span>, so the browser and your thumb own the momentum, and{" "}
          <span className={em}>snap mandatory</span> plus <span className={em}>snap-align center</span> land every fling
          on an item. The selection is then <span className={em}>read back out of scrollTop</span>, never stored beside
          it, so the two can&apos;t disagree.
        </>
      ),
    },
    {
      title: "The drum is paint, and the settle is defensive",
      figure: <FigSnapSettle />,
      body: (
        <>
          Each row takes its rotation, scale and opacity from{" "}
          <span className={em}>how far it is from the centre</span>, through motion values that update{" "}
          <span className={em}>outside the React render</span>; the rim is a mask, so items dissolve instead of
          clipping. And because <span className={em}>scrollend doesn&apos;t fire in every engine</span>, a 140ms quiet
          timer commits the same value.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-snap-type",
      label: "scroll-snap-type (MDN)",
      note: (
        <>
          the one declaration doing the hardest part: <span className={em}>mandatory</span> means the scroller{" "}
          <span className={em}>must</span> come to rest on a snap point, so a fling can never stop between two items.
        </>
      ),
    },
  ],
};
