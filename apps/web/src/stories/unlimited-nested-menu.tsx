import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigWallOfRows,
  FigPriorArt,
  FigFlyoutDeadEnd,
  FigSketch,
  FigBreadcrumb,
  FigStack,
  FigMorph,
} from "./figures/unlimited-nested-menu";

/** Unlimited Nested Menu - the milestones behind the component. */
export const unlimitedNestedMenuStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "A job request, not an experiment",
      figure: <FigWallOfRows />,
      body: (
        <>
          This one didn&apos;t start in the lab. At work, a screen had an action menu that was{" "}
          <span className={em}>already big</span>, and the ticket asked for more options. Cramming them in would turn
          the menu into a wall of rows, so the real question became:{" "}
          <span className={em}>how does a menu grow without sprawling?</span>
        </>
      ),
    },
    {
      title: "Looking for prior art",
      figure: <FigPriorArt />,
      body: (
        <>
          I went looking for anyone who had taken menu depth seriously; almost nobody had. The closest was an{" "}
          <span className={em}>iOS-style dropdown</span> a design engineer built back in{" "}
          <span className={em}>2022</span>: the feel was exactly right, but it was never open-sourced, so there was no
          code to learn from.
        </>
      ),
    },
    {
      title: "The shadcn/ui & Base UI dead end",
      figure: <FigFlyoutDeadEnd />,
      body: (
        <>
          First instinct: reach for the libraries. <span className={em}>shadcn/ui&apos;s dropdown menu</span>, then{" "}
          <span className={em}>Base UI&apos;s menu</span>. Nothing wrong with either; they handle{" "}
          <span className={em}>a sub-menu or two</span> beautifully. They just were{" "}
          <span className={em}>never built for real depth</span>: the fly-out pattern has no answer for a menu that
          keeps going, and forcing it there kept breaking down.
        </>
      ),
    },
    {
      title: "Back to the sketchbook",
      figure: <FigSketch />,
      body: (
        <>
          {/* TODO: name + link the inspiration here when ready */}
          With nothing to fork, I started from a sketch instead of a library, inspired by that iOS-style menu: depth
          shouldn&apos;t fly out, it should <span className={em}>stack in place</span>. Then I built it level by level.
        </>
      ),
    },
    {
      title: "First trial: breadcrumbs",
      figure: <FigBreadcrumb />,
      body: (
        <>
          The first working version shipped as the{" "}
          <a
            href="https://ui.tripled.work/components/native-action-dropdown"
            className={`${em} underline decoration-gray-300 underline-offset-2 transition-colors hover:decoration-[#111]`}
            target="_blank"
            rel="noreferrer"
          >
            Native Action Dropdown
          </a>
          , with a <span className={em}>breadcrumb</span> showing where you are. It held up until you tried to go back:
          the breadcrumb told you where you were, but stepping back meant{" "}
          <span className={em}>losing the menu you&apos;d drilled through</span>.
        </>
      ),
    },
    {
      title: "Levels, rebuilt as a stack",
      figure: <FigStack />,
      body: (
        <>
          So the levels became <span className={em}>panels</span>. Each branch opens right under the row you clicked,
          the row&apos;s label becomes the new panel&apos;s header, and every parent stays behind,{" "}
          <span className={em}>dimmed</span>. Going back is one click on a panel you can already see:{" "}
          <span className={em}>nothing gets lost</span>.
        </>
      ),
    },
    {
      title: "Then the animation came out",
      figure: <FigMorph />,
      body: (
        <>
          The first cut animated everything; most of it got deleted. What stayed is the one movement that carries
          information: the <span className={em}>row morphing into the panel header</span>, so you can see where each
          level came from. A menu is a tool: it should feel{" "}
          <span className={em}>fast before it feels fancy</span>.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://developer.apple.com/design/human-interface-guidelines/menus",
      label: "iOS nested menus, Apple Human Interface Guidelines",
      note: (
        <>
          the native pattern the stacked panels borrow from: submenus opening{" "}
          <span className={em}>in place</span> with parents kept behind, dimmed.
        </>
      ),
    },
    {
      // TODO: add href (the design engineer's site) + their name and X profile when found;
      // this is the 2022 prior-art build from step 2 of the story.
      label: "iOS-style dropdown menu (design engineer, 2022)",
      note: (
        <>
          the closest prior art out there: the <span className={em}>feel</span> this component chases, built as a
          polished demo but never open-sourced.
        </>
      ),
      image: {
        src: "/ios-showcase.png",
        alt: "iOS nested menu: the WhatsApp sub-panel stacked over the dimmed Message panel behind it",
        width: 755,
        height: 912,
      },
    },
    {
      href: "https://youtu.be/loKm4JcT4U4?t=903",
      label: "Jhey Tompkins, Design Engineering at Config 2024 (video, from 15:03)",
      note: (
        <>
          the part on <span className={em}>CSS anchor positioning</span>: <code className="text-[#111]">position-anchor</code>{" "}
          letting a dropdown place itself and flip to either side of its trigger based on the viewport.
        </>
      ),
    },
  ],
};
