"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import MorphingCheckout, { type CheckoutState } from "@/registry/lab/morphing-checkout/morphing-checkout";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

const PRESETS = [
  { label: "Visa", number: "4242 4242 4242 4242" },
  { label: "Mastercard", number: "5555 5555 5555 4444" },
  { label: "Amex", number: "3782 822463 10005" },
  { label: "Fails Luhn", number: "4242 4242 4242 4241" },
];

export function MorphingCheckoutShowcase() {
  const [checkoutInstant, setCheckoutInstant] = useState(false);
  const [checkoutDecline, setCheckoutDecline] = useState(false);
  const [checkoutBarSteps, setCheckoutBarSteps] = useState(false);
  const [inspectCheckout, setInspectCheckout] = useState(false);
  const [checkoutPrefill, setCheckoutPrefill] = useState<{ key: number; number: string } | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: "card",
    brand: "unknown",
    number: "empty",
    side: "front",
    status: "idle",
    height: null,
  });
  const handleCheckoutState = useCallback((state: CheckoutState) => setCheckoutState(state), []);
  const handlePreset = (preset: { number: string }) => setCheckoutPrefill((prev) => ({ key: (prev?.key ?? 0) + 1, number: preset.number }));

  return (
    <>
      <ShowcaseIntro title="Morphing Checkout Flow" delay={40} defaultOpen>
        A three-step card payment where the container appears to animate <code className="text-foreground">height: auto</code>{" "}
        - the active step is measured and the box <span className="font-medium text-foreground">eases to its px</span> while
        steps slide past each other. The field re-masks on every keystroke (<code className="text-foreground">4-4-4-4</code>,
        or <code className="text-foreground">4-6-5</code> the moment it detects an Amex) yet the{" "}
        <span className="font-medium text-foreground">caret never jumps</span>: it is put back by counting the digits before
        it, the only characters you actually own. Full numbers are checked against{" "}
        <span className="font-medium text-foreground">Luhn</span>, brand detection cross-fades the logo on a live card that{" "}
        <span className="font-medium text-foreground">flips in 3D</span> when you focus the CVC (an Amex never flips - its
        code lives on the front), and paying <span className="font-medium text-foreground">FLIPs the button&apos;s width</span>{" "}
        from measured px into a spinner circle, then a drawn check. Tick{" "}
        <span className="font-medium text-foreground">Decline the payment</span> and the same circle lands on a{" "}
        <span className="font-medium text-foreground">red ✕</span> instead, shakes once, and eases back for another try.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button key={preset.label} type="button" onClick={() => handlePreset(preset)} className="px-2.5 py-1 text-xs rounded-full font-medium bg-muted text-body-foreground hover:bg-accent transition-colors">
              {preset.label}
            </button>
          ))}
        </div>
        <CheckToggle checked={checkoutBarSteps} onChange={setCheckoutBarSteps}>
          Progress bar steps <span className="text-subtle-foreground">- a loading bar that is also the tabs</span>
        </CheckToggle>
        <CheckToggle checked={checkoutInstant} onChange={setCheckoutInstant}>
          Instant steps <span className="text-subtle-foreground">- no height morph or slides, for comparison</span>
        </CheckToggle>
        <CheckToggle checked={checkoutDecline} onChange={setCheckoutDecline}>
          Decline the payment <span className="text-subtle-foreground">- the issuer says no, to see the failure path</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectCheckout} onChange={setInspectCheckout} />
          {inspectCheckout && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-start justify-center rounded-2xl border px-6 py-8 transition-colors ${
          inspectCheckout ? `${SPEC_GRID} bg-card border-blue-200` : "bg-muted/40 border-border"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <MorphingCheckout
          morph={!checkoutInstant}
          inspect={inspectCheckout}
          prefill={checkoutPrefill}
          outcome={checkoutDecline ? "decline" : "success"}
          indicator={checkoutBarSteps ? "bar" : "tabs"}
          onStateChange={handleCheckoutState}
        />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-muted-foreground" style={{ animationDelay: "90ms" }}>
        {inspectCheckout ? (
          <>
            height <code className="text-foreground">auto → {checkoutState.height ? `${checkoutState.height}px` : "measured"}</code>{" "}
            · caret remap by digit index · <code className="text-foreground">rotateY(180deg)</code> · pay{" "}
            <code className="text-foreground">px → 2.75rem</code>
          </>
        ) : (
          <>
            Step: <span className="font-medium text-foreground">{checkoutState.step}</span>
            {" · "}Brand: <span className="font-medium text-foreground">{checkoutState.brand}</span>
            {" · "}Number: <span className="font-medium text-foreground">{checkoutState.number}</span>
            {" · "}Side: <span className="font-medium text-foreground">{checkoutState.side}</span>
            {checkoutState.status !== "idle" && (
              <>
                {" "}
                ·{" "}
                <span className="font-medium text-foreground">
                  {checkoutState.status === "processing" ? "Processing…" : checkoutState.status === "failed" ? "Declined" : "Paid"}
                </span>
              </>
            )}
          </>
        )}
      </p>
    </>
  );
}
