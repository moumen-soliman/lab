"use client";

import { useState } from "react";
import TicketNumber from "./ticket-number-ticker";

export default function TicketNumberExample() {
  // Bump runKey whenever a "new ticket" lands and the digits run up like an
  // odometer.
  const [runKey, setRunKey] = useState(0);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Default: hugs the value, grows to the cap, then middle-truncates. */}
      <TicketNumber value="#100284" runKey={runKey} />

      {/* GitHub PR status badge, driven by your data ("open" | "draft" | "merged" | "closed"). */}
      <TicketNumber value="#1042" status="merged" />

      {/* width="fixed": every pill shares one footprint — steady columns in lists. */}
      <TicketNumber value="#7" width="fixed" status="open" />

      {/* Text ids work too: spaces become dashes, long ones truncate to start…end
          with the full value on hover. copyable={false} drops the copy button;
          maxWidth moves the truncation cap. */}
      <TicketNumber value="#billing webhook retry timeout 2026" maxWidth="16rem" copyable={false} />

      <button
        type="button"
        onClick={() => setRunKey((key) => key + 1)}
        className="rounded-full bg-[#111] px-4 py-2 text-xs font-medium text-white transition-[background-color,scale] hover:bg-[#333] active:scale-[0.96]"
      >
        Run the numbers
      </button>
    </div>
  );
}
