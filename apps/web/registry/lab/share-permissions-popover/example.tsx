"use client";

import SharePopover from "./share-permissions-popover";

// Seed it with your collaborators and wire onShare to persist every change
// (invite / role / remove / link scope).
export default function SharePopoverExample() {
  return (
    <SharePopover
      docTitle="Q3 Launch Plan"
      owner={{ name: "Moumen Soliman", email: "moumen@acme.co" }}
      people={[
        { id: "sarah", name: "Sarah Chen", email: "sarah@acme.co" },
        { id: "omar", name: "Omar Farouk", email: "omar@acme.co" },
        { id: "june", name: "June Park", email: "june@acme.co" },
      ]}
      initialRoles={{ sarah: "full", omar: "edit", june: "view" }}
      onShare={(event) => console.log(event.type, event.detail)}
    />
  );
}
