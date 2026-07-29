import { type Story, em, storyLink } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigLectureWeeks,
  FigSchedulerSurvey,
  FigRuleSentence,
  FigProofList,
  FigCalendarTraps,
  FigMotionRestraint,
} from "./figures/schedule-builder";

/** Schedule Builder - the milestones behind the component. */
export const scheduleBuilderStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "A design-system requirement",
      figure: <FigLectureWeeks />,
      body: (
        <>
          Another one from the design system, this time for an <span className={em}>educational platform</span>:
          instructors needed to <span className={em}>schedule lectures and courses with students</span>. The challenge
          was never the feature list. It was making a scheduler that is{" "}
          <span className={em}>easy to understand, easy to deal with, and clear</span>, without any unnecessary UI
          tweaks or animation for its own sake.
        </>
      ),
    },
    {
      title: "What I looked at before starting",
      figure: <FigSchedulerSurvey />,
      body: (
        <>
          I surveyed the usual suspects first:{" "}
          <a href="https://mui.com/x/react-scheduler/" className={storyLink} target="_blank" rel="noreferrer">
            MUI X Scheduler
          </a>
          ,{" "}
          <a href="https://fullcalendar.io/docs/shadcn" className={storyLink} target="_blank" rel="noreferrer">
            FullCalendar
          </a>{" "}
          and{" "}
          <a href="https://ui.shadcn.com/docs/components/radix/calendar" className={storyLink} target="_blank" rel="noreferrer">
            shadcn&apos;s calendar
          </a>
          . All solid, and all <span className={em}>calendars</span>: big event grids and date pickers. None of them
          answers the instructor&apos;s actual question, which is{" "}
          <span className={em}>&quot;when does this lecture repeat?&quot;</span> The missing piece was a rule builder,
          not another calendar.
        </>
      ),
    },
    {
      title: "A sentence, not a grid",
      figure: <FigRuleSentence />,
      body: (
        <>
          The clarity answer: the rule assembles as a <span className={em}>live English sentence</span>.{" "}
          <span className={em}>Every week on Tuesday and Thursday at 9:00 AM</span>. That is how an instructor already
          says it out loud, so that is what the component shows. Editing a control changes{" "}
          <span className={em}>one word</span>, and the surviving words slide to their new places, so the sentence
          reads as one object being edited, not a string being replaced.
        </>
      ),
    },
    {
      title: "Proof under the promise",
      figure: <FigProofList />,
      body: (
        <>
          A sentence can lie; dates can&apos;t. Under the rule the component lists the{" "}
          <span className={em}>next real occurrences</span>, computed from the actual calendar. If the rule is wrong,
          the instructor sees it in the list <span className={em}>before the students do</span>.
        </>
      ),
    },
    {
      title: "The calendar traps",
      figure: <FigCalendarTraps />,
      body: (
        <>
          Recurrence looks like dropdowns but is full of traps, and this build refuses to fake them.{" "}
          <span className={em}>Every month on day 31</span> cannot run in September: the list shows a ghost row saying
          so, or the <span className={em}>clamp</span> policy moves it to the 30th. Across a daylight-saving jump{" "}
          <span className={em}>9:00 AM stays 9:00 AM</span>, with the GMT offset printed on every row. And{" "}
          <span className={em}>the 2nd Tuesday</span> is computed from the month&apos;s first day, never found by
          scanning.
        </>
      ),
    },
    {
      title: "Restraint as a feature",
      figure: <FigMotionRestraint />,
      body: (
        <>
          The requirement said <span className={em}>no unnecessary tweaks</span>, and that shaped the motion budget:
          most animation candidates got deleted before they shipped. What stayed is the{" "}
          <span className={em}>word glide</span>, the one movement that carries information. Entrances wait for the
          first paint, reduced motion is honoured, and everything else just updates.{" "}
          <span className={em}>Clear beats clever.</span>
        </>
      ),
    },
  ],
};
