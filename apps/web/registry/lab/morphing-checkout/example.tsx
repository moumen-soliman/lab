"use client";

import MorphingCheckout from "./morphing-checkout";

export default function MorphingCheckoutExample() {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Wire onPay to your real charge — return "decline" to fail, anything
          else to succeed. Async is fine (the button spins while it resolves). */}
      <MorphingCheckout
        price="$149.00"
        onPay={async ({ number }) => {
          const res = await fetch("/api/charge", { method: "POST", body: JSON.stringify({ number }) });
          return res.ok ? "success" : "decline";
        }}
      />

      {/* indicator="bar" swaps the segmented tabs for a loading bar that is also
          the tabs; outcome forces the demo verdict without an onPay. */}
      <MorphingCheckout indicator="bar" outcome="decline" />
    </div>
  );
}
