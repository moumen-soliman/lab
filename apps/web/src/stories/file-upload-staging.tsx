import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigStagingRequest,
  FigLongLivedTab,
  FigStateGlance,
  FigHonestProgress,
  FigRetryResume,
  FigBatchVerbs,
} from "./figures/file-upload-staging";

/** File Upload Staging - the milestones behind the component. */
export const fileUploadStagingStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "A design-system ticket",
      figure: <FigStagingRequest />,
      body: (
        <>
          This one was born inside a <span className={em}>design system</span> I was building at work. The ask sounded
          simple: a file upload staging area. But the screen it was heading for is one customers{" "}
          <span className={em}>keep open all day</span>, so a dropzone alone was never going to be the component.
        </>
      ),
    },
    {
      title: "The tab that never closes",
      figure: <FigLongLivedTab />,
      body: (
        <>
          The requirement that shaped everything: the staging area lives in a tab that{" "}
          <span className={em}>mostly never closes</span>. Customers keep working in it, so there is{" "}
          <span className={em}>no refresh</span> to flush state and <span className={em}>no popup</span> to open and
          close and quietly reset things. Files keep arriving while older ones are still settling, and the component
          has to keep its own pipeline honest for hours.
        </>
      ),
    },
    {
      title: "Done and not-yet, at a glance",
      figure: <FigStateGlance />,
      body: (
        <>
          Focus one was clarity: <span className={em}>what is done and what is not yet</span>, without reading. Every
          tile is its own little machine: queued waits gray, uploading draws the ring with a live percent, done gets a{" "}
          <span className={em}>green edge and a check that draws itself in</span>, and failed goes red saying exactly
          where it stopped: <span className={em}>failed at 43%</span>.
        </>
      ),
    },
    {
      title: "Progress that never lies",
      figure: <FigHonestProgress />,
      body: (
        <>
          For &quot;done&quot; to mean anything, the ring has to be honest. Progress jitters like a real network and
          sometimes <span className={em}>stalls a beat</span>, but it{" "}
          <span className={em}>never moves backwards</span>, and <span className={em}>100 is the only way to
          complete</span>. Failures are decided up front, not rolled every frame, so the same file fails at the same
          point.
        </>
      ),
    },
    {
      title: "Retry resumes, never rewinds",
      figure: <FigRetryResume />,
      body: (
        <>
          In a long-lived tab a failure can&apos;t be a dead end. Retry re-queues the tile and{" "}
          <span className={em}>resumes from the frozen percent</span>: the arc never rewinds, because an arc that
          rewinds tells the customer their progress was fake. Concurrency stays{" "}
          <span className={em}>capped at 2</span>, so the pipeline reads as a pipeline instead of everything blasting
          to 100 at once.
        </>
      ),
    },
    {
      title: "Batch verbs for a long day",
      figure: <FigBatchVerbs />,
      body: (
        <>
          Focus two: after a few hours the grid is full of history, so the footer got{" "}
          <span className={em}>verbs, not icons</span>. <span className={em}>Retry failed</span> re-queues every red
          tile at once, <span className={em}>Clear done</span> sweeps the green ones away, and the survivors{" "}
          <span className={em}>glide into their new spots</span> instead of jump-cutting. The list keeps living; the
          tab stays open.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://motion.dev/docs/react-layout-animations",
      label: "Layout animations in Motion",
      note: (
        <>
          the <code className="text-[#111]">layout</code> prop behind the grid: on any list change the surviving
          tiles <span className={em}>glide to their new spots</span> instead of jump-cutting.
        </>
      ),
    },
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController",
      label: "AbortController (MDN)",
      note: (
        <>
          how removal stays honest in real mode: deleting a tile mid-flight{" "}
          <span className={em}>aborts the actual transfer</span>, not just the tile.
        </>
      ),
    },
  ],
};
