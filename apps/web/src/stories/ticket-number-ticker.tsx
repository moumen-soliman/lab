import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigTicketCopyMiss,
  FigCopyPill,
  FigStatusBadge,
  FigMiddleTruncate,
  FigMeasureBudget,
  FigReelRunUp,
} from "./figures/ticket-number-ticker";

/** Ticket Number Ticker - the milestones behind the component. */
export const ticketNumberTickerStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "A Jira itch, not a spec",
      figure: <FigTicketCopyMiss />,
      video: {
        src: "/stories/copy-ticket-number.mov",
        alt: "Trying to copy the ticket number BP-2591 out of a Jira breadcrumb: hovering the id underlines it as a link, the button beside it offers Copy link, the next one offers Change work type, and the number ends up selected by hand.",
        aspectRatio: "384 / 144",
        maxWidth: 384,
        caption: (
          <>
            The itch itself: hovering <span className={em}>BP-2591</span> turns it into a link, the button beside it
            offers <span className={em}>Copy link</span>, the next one changes the work type, and the number ends up{" "}
            <span className={em}>selected by hand</span>.
          </>
        ),
      },
      body: (
        <>
          This one came from using <span className={em}>Jira</span> every day. Grabbing a ticket number was weirdly
          hard: click the id and the <span className={em}>ticket opens</span>; reach for the copy affordance and you
          get the <span className={em}>whole URL</span>. All I ever wanted was the number, and there was no clean way
          to take just that.
        </>
      ),
    },
    {
      title: "An experiment on the side",
      figure: <FigCopyPill />,
      body: (
        <>
          Right after building{" "}
          <a
            href="https://github.com/moumen-soliman/task-management"
            className={`${em} underline decoration-subtle-foreground/70 underline-offset-2 transition-colors hover:decoration-foreground`}
            target="_blank"
            rel="noreferrer"
          >
            task-management
          </a>
          , the itch turned into an experiment: why isn&apos;t the ticket id a{" "}
          <span className={em}>component of its own</span>? A pill that hugs the number, with copy as a{" "}
          <span className={em}>first-class, one-click action</span>: the clipboard gets{" "}
          <span className={em}>the number, not a link</span>, and nothing opens by accident.
        </>
      ),
    },
    {
      title: "The merge status, in shortcut",
      figure: <FigStatusBadge />,
      body: (
        <>
          The second itch: knowing <span className={em}>what happened to the ticket&apos;s merge</span> without opening
          anything. So the pill grew a badge speaking a language every developer already reads:{" "}
          <span className={em}>GitHub&apos;s own four PR states</span> in GitHub&apos;s own colours.{" "}
          <span className={em}>Open, draft, merged, closed</span>. The ticket&apos;s fate, at a glance.
        </>
      ),
    },
    {
      title: "Then real ids arrived",
      figure: <FigMiddleTruncate />,
      body: (
        <>
          <span className={em}>#42</span> was easy; twelve-digit ids and webhook-slug names blew past the pill. The
          obvious fix, CSS end-ellipsis, keeps the prefix every ticket shares and{" "}
          <span className={em}>throws away the digits that tell them apart</span>. Commit SHAs and wallet addresses
          solved this long ago: <span className={em}>middle-truncate</span> to <span className={em}>start…end</span>,
          keep both identifying ends, and let hover or copy recover the middle.
        </>
      ),
    },
    {
      title: "Measured, not guessed",
      figure: <FigMeasureBudget />,
      body: (
        <>
          How much survives can&apos;t be guessed in characters; it&apos;s measured in pixels. A{" "}
          <span className={em}>hidden clone</span> with the exact same typography is{" "}
          <span className={em}>binary-searched</span> to the longest <span className={em}>#start…end</span> that fits
          the cap&apos;s budget: the cap <span className={em}>minus the chrome</span>, so adding the status badge
          re-measures the truncation instead of clipping the last characters. All before paint, so the wrong cut never
          flashes.
        </>
      ),
    },
    {
      title: "The odometer run-up",
      figure: <FigReelRunUp />,
      body: (
        <>
          A new ticket should feel like <span className={em}>an event</span>, not a swap. Each digit became a reel: a{" "}
          <span className={em}>1em window over a 0-9 strip</span>, snapped to zero and released a{" "}
          <span className={em}>full turn</span> before landing, each column settling{" "}
          <span className={em}>55ms after the one before it</span>. tabular-nums keeps every column exactly 1ch, so
          nothing shifts while it rolls, or truncates.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://github.com/moumen-soliman/task-management",
      label: "task-management, the project it grew out of",
      note: (
        <>
          the side project that surfaced the itch: ticket ids everywhere, and{" "}
          <span className={em}>no clean way to copy one</span>.
        </>
      ),
    },
    {
      href: "https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests",
      label: "GitHub pull requests: states & colours",
      note: (
        <>
          the badge borrows GitHub&apos;s own vocabulary: the{" "}
          <span className={em}>open / draft / merged / closed</span> glyphs and colours, so the state reads without
          learning anything new.
        </>
      ),
    },
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variant-numeric",
      label: "font-variant-numeric (MDN)",
      note: (
        <>
          the property behind <span className={em}>tabular-nums</span>: it keeps every digit column exactly{" "}
          <span className={em}>1ch</span>, so nothing shifts while the reels roll or the value truncates.
        </>
      ),
    },
    {
      href: "https://animations.dev",
      label: "animations.dev by Emil Kowalski",
      note: (
        <>
          <a
            href="https://x.com/emilkowalski"
            className={`${em} underline decoration-subtle-foreground/70 underline-offset-2 transition-colors hover:decoration-foreground`}
            target="_blank"
            rel="noreferrer"
          >
            Emil Kowalski
          </a>
          &apos;s course on web motion: the way each digit flips, snapping to zero then easing through{" "}
          <span className={em}>one full turn</span>, follows its lessons on animating with intent.
        </>
      ),
    },
  ],
};
