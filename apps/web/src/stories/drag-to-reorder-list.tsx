import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import { FigRawFollow, FigFlipDrop, FigKeyboardTwin } from "./figures/drag-to-reorder-list";

/** Drag-to-Reorder List - the milestones behind the component. */
export const dragToReorderListStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "The card has to feel held",
      figure: <FigRawFollow />,
      body: (
        <>
          Any easing between your hand and the card reads as <span className={em}>lag</span>, so the dragged card&apos;s
          y is pushed straight from the pointer with <span className={em}>nothing in between</span> and no React render
          on the way. The rows it displaces are the opposite: each one{" "}
          <span className={em}>glides exactly one slot</span>, and reversing mid-glide just retargets.
        </>
      ),
    },
    {
      title: "The drop is where it usually breaks",
      figure: <FigFlipDrop />,
      body: (
        <>
          Committing the new order re-renders the list, and the card{" "}
          <span className={em}>jumps to wherever the DOM put it</span>. So the drop is a{" "}
          <span className={em}>FLIP</span>: measure every rect first, let the reflow happen, put each card back at{" "}
          <span className={em}>its old screen pixels</span>, then animate it home.
        </>
      ),
    },
    {
      title: "It works fully from the keyboard",
      figure: <FigKeyboardTwin />,
      body: (
        <>
          A reorder that only exists under a pointer is half a component. The grip is a{" "}
          <span className={em}>real focusable button</span>: <span className={em}>Space grabs</span>, arrows move,{" "}
          <span className={em}>Escape cancels</span>, Space drops. Every move is{" "}
          <span className={em}>announced through a live region</span>, so the new position is stated rather than only
          shown.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture",
      label: "setPointerCapture (MDN)",
      note: (
        <>
          what keeps the drag attached once the pointer leaves the row: events stay{" "}
          <span className={em}>targeted at the card</span> until release, so a fast drag never gets dropped mid-air.
        </>
      ),
    },
    {
      href: "https://www.easing.dev",
      label: "Easing Graphs",
      note: (
        <>
          where the one curve in here got picked. The glide and the FLIP drop both run on{" "}
          <span className={em}>cubic-bezier(0.22, 1, 0.36, 1)</span>, and its graph is{" "}
          <span className={em}>nearly flat by the halfway mark</span>, so a row covers most of its slot immediately and
          then settles. Compare Expo Out and Swift Out against the softer Quad and Cubic curves to see why the gentler
          ones read as sliding instead.
        </>
      ),
    },
  ],
};
