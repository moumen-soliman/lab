import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigFromDesignSystem,
  FigSmallEnough,
  FigOneBoxMorphs,
  FigFormalBar,
  FigShakeScope,
  FigPayMorph,
} from "./figures/morphing-checkout";

/** Morphing Checkout Flow - the milestones behind the component. */
export const morphingCheckoutStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "An enhancement, not a new idea",
      figure: <FigFromDesignSystem />,
      body: (
        <>
          This one already existed. I built a card checkout inside a{" "}
          <span className={em}>design system</span>, and it was correct: the right fields, the right validation, the
          right order. It just moved like a form. Every step replaced the one before it and the box{" "}
          <span className={em}>snapped to its new size</span>. So this build keeps the three steps and the fields
          exactly as they shipped, and rebuilds <span className={em}>everything about how it moves</span>.
        </>
      ),
    },
    {
      title: "The constraint was staying small",
      figure: <FigSmallEnough />,
      body: (
        <>
          The rule I set before touching the motion: it has to stay{" "}
          <span className={em}>small</span>. One card, capped at <span className={em}>22rem</span>, no full-page
          layout, nothing that depends on the space around it. That is what lets the same component sit in a page or{" "}
          <span className={em}>drop into a popup</span> with no second version to maintain. Small also decided the hard
          part: at this size the three steps cannot be three screens.
        </>
      ),
    },
    {
      title: "One box that changes its own height",
      figure: <FigOneBoxMorphs />,
      body: (
        <>
          So the container fakes <span className={em}>height: auto</span>. The active panel is measured (
          <span className={em}>useLayoutEffect</span> plus a <span className={em}>ResizeObserver</span>) and the box
          eases to that exact px, while the outgoing step blurs out and the incoming fields{" "}
          <span className={em}>cascade in, direction-aware</span>. The box is the only thing that resizes, which is
          also what makes it safe in a popup: nothing around it reflows.
        </>
      ),
    },
    {
      title: "Formal, so progress is a bar",
      figure: <FigFormalBar />,
      body: (
        <>
          A payment is not a place to be playful. Tabs in a pill are fine for a settings panel, but here they read{" "}
          <span className={em}>casual</span>, so there is a second indicator: the same three labels sit over a thin
          track that fills <span className={em}>a third, two thirds, all of it</span>, and turns{" "}
          <span className={em}>green when the charge lands</span>. It is the step indicator and the progress bar at
          once, and nothing decorative moves anywhere in the card.
        </>
      ),
    },
    {
      title: "Errors have to feel like errors",
      figure: <FigShakeScope />,
      body: (
        <>
          A red border is information. It is not a <span className={em}>feeling</span>, and money is exactly where a
          mistake should feel like one. So failures <span className={em}>shake</span>: 4px, 320ms, once, never
          repeating. What matters is that the shake is <span className={em}>scoped to what is wrong</span>. The number
          field shakes on its own the moment a complete number fails{" "}
          <span className={em}>Luhn</span>, before you reach for Continue. The primary button shakes when the step
          won&apos;t validate, and focus jumps to the first bad field.
        </>
      ),
    },
    {
      title: "The button carries the charge",
      figure: <FigPayMorph />,
      body: (
        <>
          Paying is the one wait in the flow, so the button becomes its own progress: its{" "}
          <span className={em}>measured width collapses into a 2.75rem circle</span> while the label cross-fades to a
          spinner, then the circle answers. Success draws a check on green. A decline draws a{" "}
          <span className={em}>red ✕, shakes once</span>, then eases back out to the full-width Pay button with the
          reason underneath, so the retry is <span className={em}>exactly where your cursor already is</span>. No dead
          end, no new screen.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://en.wikipedia.org/wiki/Luhn_algorithm",
      label: "Luhn algorithm",
      note: (
        <>
          the checksum every real card number satisfies: why a number can be{" "}
          <span className={em}>the right length and still wrong</span>, and the reason the field can reject it live
          instead of waiting for the server.
        </>
      ),
    },
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
      label: "prefers-reduced-motion (MDN)",
      note: (
        <>
          the escape hatch the whole component is wired to: the height morph, the slides and{" "}
          <span className={em}>the shakes</span> all switch off, and the three steps still work as a plain form.
        </>
      ),
    },
  ],
};
