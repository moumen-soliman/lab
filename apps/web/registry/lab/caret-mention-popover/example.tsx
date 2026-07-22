"use client";

import MentionComposer from "./caret-mention-popover";

export default function MentionComposerExample() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      {/* Type @ to mention. Pass your people and handle onSubmit(text, mentions). */}
      <MentionComposer
        people={[
          { name: "Sarah Chen", handle: "sarahchen" },
          { name: "Omar Farouk", handle: "omarfarouk" },
          { name: "June Park", handle: "junepark" },
        ]}
        onSubmit={(text, mentions) => console.log("send", text, mentions)}
      />

      {/* anchor="field" is the usual dropdown shortcut — under the field, not the caret. */}
      <MentionComposer anchor="field" />
    </div>
  );
}
