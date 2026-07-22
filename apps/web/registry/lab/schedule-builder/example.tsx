"use client";

import ScheduleBuilder from "./schedule-builder";

// The rule is the component's value — read it out through onRuleChange and
// serialize it however your backend wants (it maps 1:1 onto RRULE).
export default function ScheduleBuilderExample() {
  return (
    <div className="flex flex-wrap items-start gap-10">
      {/* Default: RRULE semantics — "day 31" SKIPS months without one (ghost rows). */}
      <ScheduleBuilder
        defaultRule={{ freq: "weekly", weekdays: [1, 3, 5], hour: 8 }}
        onRuleChange={(rule) => console.log("rule", rule)}
      />

      {/* clamp: the other real-world month-end policy — day 31 becomes the 30th.
          occurrences controls how many upcoming runs prove the rule;
          morph={false} swaps the word glide for instant text. */}
      <ScheduleBuilder
        defaultRule={{ freq: "monthly", monthDay: 31 }}
        clamp
        occurrences={3}
      />
    </div>
  );
}
