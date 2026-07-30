import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import { FigGitlabTokens, FigComplexButClear, FigOneTabStop, FigJsonOut } from "./figures/command-palette";

/** Command Palette with Argument Chips - the milestones behind the component. */
export const commandPaletteStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "Taken from GitLab's search bar",
      figure: <FigGitlabTokens />,
      body: (
        <>
          This one is <span className={em}>GitLab&apos;s idea</span>, not mine. Their search does not ask you to write a
          query; it hands you a field list and turns each pick into a token you can read and remove:{" "}
          <span className={em}>a key, an operator, a value</span>. I wanted that model in a design system, as one
          component.
        </>
      ),
    },
    {
      title: "Complex and clear at the same time",
      figure: <FigComplexButClear />,
      body: (
        <>
          The requirement pulled in two directions. Search had to handle{" "}
          <span className={em}>compound queries</span>, several fields at once, and it had to stay legible to people who
          would never learn a syntax. A text query gets you the first and loses the second. Chips get you both:{" "}
          <span className={em}>you pick instead of typing</span>, and the result reads back as itself.
        </>
      ),
    },
    {
      title: "One focusable control, chips are paint",
      figure: <FigOneTabStop />,
      body: (
        <>
          What keeps a long query clear is that it never fragments. Give every chip its own focusable element and{" "}
          <span className={em}>Tab order, Backspace and screen-reader context all break mid-query</span>. So the palette
          has exactly <span className={em}>one focusable control, the input</span>, for its whole life. Chips are render
          output: <span className={em}>Backspace on an empty query pops the last one</span>, even back across an
          &ldquo;and&rdquo;, and clicking a chip rewinds to that slot.
        </>
      ),
    },
    {
      title: "It hands over data, not a string",
      figure: <FigJsonOut />,
      body: (
        <>
          A finished command <span className={em}>stages</span> instead of running, so one session builds the whole
          compound and <span className={em}>nothing fires until ✓ Apply</span> (⌘⏎). What Apply passes on is the point:
          each clause leaves as its command <span className={em}>id</span> plus a value per{" "}
          <span className={em}>named slot</span>, so the query arrives at the backend as{" "}
          <span className={em}>structure</span>, with nothing left to parse.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://design.gitlab.com/components/token/",
      label: "Token, GitLab Pajamas design system",
      note: (
        <>
          the chip this component is built on: a keyword that filters, with the value it carries and{" "}
          <span className={em}>its own remove button</span>.
        </>
      ),
      image: {
        src: "/stories/gitlab.png",
        alt: "GitLab search bar with an Author = Moumen Soliman token, and the field list open below it: Assignee, Reviewer, Merged by, Approver, Approved by, Milestone, Label, Release, My reaction, Draft",
        width: 1486,
        height: 1018,
      },
    },
    {
      href: "https://design.gitlab.com/patterns/filtering/",
      label: "Filtering, GitLab Pajamas design system",
      note: (
        <>
          the pattern side of it: matching the filter UI to{" "}
          <span className={em}>how complex the data actually is</span>, which is the argument for chips over a text
          query.
        </>
      ),
    },
  ],
};
