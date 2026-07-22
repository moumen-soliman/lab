"use client";

import { useCallback, useState } from "react";
import { ShowcaseIntro, CheckToggle, InspectToggle, SpecLegend } from "./shared";
import OtpInput, { type OtpInputState } from "@/registry/lab/otp-segmented-input/otp-segmented-input";

const SPEC_GRID =
  "bg-[linear-gradient(to_right,rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[length:0.5rem_0.5rem]";

export function OtpInputShowcase() {
  const [otpMask, setOtpMask] = useState(false);
  const [otpGroup, setOtpGroup] = useState(false);
  const [inspectOtp, setInspectOtp] = useState(false);
  const [otpPrefill, setOtpPrefill] = useState<{ key: number; code: string } | null>(null);
  const [otpState, setOtpState] = useState<OtpInputState>({
    length: 0,
    caret: { start: 0, end: 0 },
    state: "idle",
    attempts: 0,
    focused: false,
  });
  const handleOtpState = useCallback((state: OtpInputState) => setOtpState(state), []);
  const otpPresets = [
    { label: "Autofill 246810 - the right code", code: "246810" },
    { label: "Autofill 246-811 - one digit off", code: "246-811" },
  ];
  const handleOtpPreset = (preset: { code: string }) => {
    setOtpPrefill((prev) => ({ key: (prev?.key ?? 0) + 1, code: preset.code }));
  };

  return (
    <>
      <ShowcaseIntro title="OTP Segmented Input" delay={40} defaultOpen>
        Six boxes that are secretly <span className="font-medium text-[#111]">one real input</span> - the hard version
        nobody demos. The input is stretched invisibly over the row (transparent text and caret, never hidden, so{" "}
        <code className="text-[#111]">autocomplete=&quot;one-time-code&quot;</code> SMS autofill and paste just work),
        and the cells are <span className="font-medium text-[#111]">painted from its value</span>. The active cell is{" "}
        <span className="font-medium text-[#111]">derived from the native selection</span>, never stored beside it: ←/→
        move the real caret and the highlight follows, Backspace walks backwards for free, and{" "}
        <span className="font-medium text-[#111]">select-all paints all six cells</span> because a selection range maps
        to a cell range. Paste <code className="text-[#111]">246 810</code> or <code className="text-[#111]">246-810</code>{" "}
        - one normalize pass strips the junk. Six digits verify on their own: the right code{" "}
        <span className="font-medium text-[#111]">cascades green</span> left to right, a wrong one{" "}
        <span className="font-medium text-[#111]">shakes once, then the digits drop out one by one</span> before the
        caret comes back. The blueprint toggle tints the hidden input&apos;s glyphs red - they are letter-spaced to sit
        exactly under the cells.
      </ShowcaseIntro>

      <div className="animate-fade-in mb-4 flex flex-col gap-3" style={{ animationDelay: "60ms" }}>
        <div className="flex flex-wrap gap-2">
          {otpPresets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleOtpPreset(preset)}
              className="px-2.5 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors tabular-nums"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <CheckToggle checked={otpMask} onChange={setOtpMask}>
          Mask digits <span className="text-gray-400">- paint • instead of the number, value untouched</span>
        </CheckToggle>
        <CheckToggle checked={otpGroup} onChange={setOtpGroup}>
          Split 3-3 <span className="text-gray-400">- grouped the way SMS codes are read aloud</span>
        </CheckToggle>
        <div className="flex items-center justify-between gap-4">
          <InspectToggle checked={inspectOtp} onChange={setInspectOtp} />
          {inspectOtp && <SpecLegend />}
        </div>
      </div>

      <section
        className={`animate-fade-in relative flex items-center justify-center rounded-2xl border px-6 py-12 min-h-[180px] transition-colors ${
          inspectOtp ? `${SPEC_GRID} bg-white border-blue-200` : "bg-gray-50/60 border-gray-200"
        }`}
        style={{ animationDelay: "70ms" }}
      >
        <OtpInput mask={otpMask} group={otpGroup} prefill={otpPrefill} inspect={inspectOtp} onStateChange={handleOtpState} />
      </section>

      <p className="animate-fade-in mt-4 text-center text-sm text-gray-500 break-words" style={{ animationDelay: "90ms" }}>
        {inspectOtp ? (
          <>
            input <code className="text-[#111]">color: transparent</code> · selection{" "}
            <code className="text-[#111]">
              {otpState.caret.start}..{otpState.caret.end}
            </code>{" "}
            · shake <code className="text-[#111]">380ms</code> · clear stagger <code className="text-[#111]">45ms</code>
          </>
        ) : (
          <>
            State: <span className="font-medium text-[#111]">{otpState.state}</span>
            {" · "}
            <span className="font-medium text-[#111] tabular-nums">{otpState.length}/6</span>
            {otpState.focused && (
              <>
                {" "}
                · caret{" "}
                <span className="font-medium text-[#111] tabular-nums">
                  {otpState.caret.start === otpState.caret.end
                    ? otpState.caret.start
                    : `${otpState.caret.start}..${otpState.caret.end}`}
                </span>
              </>
            )}
            {" · "}attempts <span className="font-medium text-[#111] tabular-nums">{otpState.attempts}</span>
          </>
        )}
      </p>
    </>
  );
}
