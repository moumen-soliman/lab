import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import { FigRealAt, FigMirrorWidth, FigListShortlist } from "./figures/caret-mention-popover";

/** Caret-Anchored Mention Popover - the milestones behind the component. */
export const caretMentionPopoverStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "An experiment about one character",
      figure: <FigRealAt />,
      body: (
        <>
          No origin story here, just a question: how do you know an{" "}
          <span className={em}>&ldquo;@&rdquo; means a mention</span>? Only at a boundary, it turns out. The one in{" "}
          <span className={em}>me@example.com</span> must open nothing, so the trigger is the @ that follows{" "}
          <span className={em}>the start of the text, a space, or an opening bracket</span>, and it has to be the token
          the caret is sitting in right now.
        </>
      ),
    },
    {
      title: "The other half is the box's width",
      figure: <FigMirrorWidth />,
      body: (
        <>
          A textarea won&apos;t say where its caret is: <span className={em}>selectionStart is a character index</span>,
          no x or y. So an invisible mirror takes the field&apos;s{" "}
          <span className={em}>exact width and typography</span>, wraps the text the same way, and reports the caret&apos;s
          offset. Width decides the rest too: the popover{" "}
          <span className={em}>clamps to the box</span> and flips above when the viewport runs out, while its origin
          stays pointed at the @.
        </>
      ),
    },
    {
      title: "The list is the part still to build",
      figure: <FigListShortlist />,
      body: (
        <>
          Being honest about where this stops: the popover offers{" "}
          <span className={em}>the whole roster</span>. It should offer <span className={em}>three or four people</span>,
          and only the ones <span className={em}>already in the conversation this box belongs to</span>. Relevance
          is the enhancement, and it is not in here yet.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement/selectionStart",
      label: "selectionStart (MDN)",
      note: (
        <>
          the whole constraint in one property: a <span className={em}>character index and nothing else</span>, which is
          why the caret&apos;s position has to be measured rather than read.
        </>
      ),
    },
  ],
};
