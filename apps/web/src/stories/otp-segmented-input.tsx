import { type Story, em } from "./shared";
import { FigureLegend } from "./figures/primitives";
import {
  FigOtpMoment,
  FigGlanceDistance,
  FigSixInputsTrap,
  FigOneRealInput,
  FigMeaningMotion,
  FigTwoEndings,
} from "./figures/otp-segmented-input";

/** OTP Segmented Input - the milestones behind the component. */
export const otpSegmentedInputStory: Story = {
  legend: <FigureLegend />,
  steps: [
    {
      title: "An experiment on one moment",
      figure: <FigOtpMoment />,
      body: (
        <>
          This one was pure <span className={em}>experiment</span>. OTP inputs are everywhere, so I picked that one
          small, universal moment, typing a six-digit code, and asked how good the interaction could get. The whole
          component really exists for <span className={em}>the two seconds after the last digit lands</span>.
        </>
      ),
    },
    {
      title: "Designed for eyes that are elsewhere",
      figure: <FigGlanceDistance />,
      body: (
        <>
          The detail that drove everything: when a code arrives, you are looking at{" "}
          <span className={em}>your phone, not the screen</span>, and sometimes the phone is across the desk. So the
          result can&apos;t be a toast in a corner. Right or wrong has to read{" "}
          <span className={em}>from a distance</span>, in color and motion big enough to catch you even when your eyes
          are elsewhere.
        </>
      ),
    },
    {
      title: "The six-inputs trap",
      figure: <FigSixInputsTrap />,
      body: (
        <>
          The version everyone demos is <span className={em}>six inputs wired together with JS focus hops</span>. It
          looks right and behaves wrong: iOS offers SMS autofill to <span className={em}>one</span> field, so it
          can&apos;t fill six; paste needs bespoke splitting; screen readers announce{" "}
          <span className={em}>six unlabeled boxes</span>; half the keyboard gets re-invented.
        </>
      ),
    },
    {
      title: "Secretly one input",
      figure: <FigOneRealInput />,
      body: (
        <>
          So this build stretches <span className={em}>one real input invisibly over the whole row</span> and paints
          the cells underneath from its value. Everything hard becomes free:{" "}
          <span className={em}>SMS autofill just works</span>, paste just works, and backspace and arrows are the{" "}
          <span className={em}>native caret</span>, not a re-implementation. Professional starts with &quot;it
          works&quot;.
        </>
      ),
    },
    {
      title: "The animation challenge",
      figure: <FigMeaningMotion />,
      body: (
        <>
          Animations are normally <span className={em}>not good all the time</span>, especially on professional sites,
          where they read as toys. The challenge was motion that is{" "}
          <span className={em}>easy to understand and professional at once</span>. The rule that survived: every
          movement must state a fact. Anything decorative got cut.
        </>
      ),
    },
    {
      title: "Two endings, both unmistakable",
      figure: <FigTwoEndings />,
      body: (
        <>
          Right: the cells <span className={em}>cascade green left to right</span>, one cell at a time. Wrong: the row{" "}
          <span className={em}>shakes</span>, the digits <span className={em}>drop out one by one</span>, then the
          field clears and hands the caret back so the retry starts instantly. You can tell which ending happened from
          across the desk, without reading a word.
        </>
      ),
    },
  ],
  references: [
    {
      href: "https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/OTP",
      label: "One-time passwords (MDN)",
      note: (
        <>
          the ground rules of OTP authentication: what the flow expects from the client, and why a{" "}
          <span className={em}>real, autofillable input</span> matters more than any styling.
        </>
      ),
    },
    {
      href: "https://blog.designary.com/p/automatically-validate-one-time-passcodes",
      label: "Automatically validate one-time passcodes (Designary)",
      note: (
        <>
          the UX case for <span className={em}>verifying the moment the last digit lands</span>: no submit button,
          the component checks the code and answers on its own.
        </>
      ),
    },
  ],
};
