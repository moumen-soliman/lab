"use client";

import OtpInput from "./otp-segmented-input";

// Wire your real check through `verify` — sync or async. Return true and the
// cells cascade green; false and the row shakes, drops the digits, and hands
// the caret back:
//
//   <OtpInput
//     verify={async (code) => {
//       const res = await fetch("/api/verify-otp", { method: "POST", body: code });
//       return res.ok;
//     }}
//   />
export default function OtpInputExample() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Default: six digits, verified against your adapter (or the `code` prop). */}
      <OtpInput verify={(code) => code === "246810"} />

      {/* Masked — paints • instead of the digit, the value stays untouched. */}
      <OtpInput mask />

      {/* Split 3-3, the way SMS codes are read aloud. */}
      <OtpInput group />

      {/* Any length — the group gap lands at the halfway point. */}
      <OtpInput length={4} code="2468" group />
    </div>
  );
}
