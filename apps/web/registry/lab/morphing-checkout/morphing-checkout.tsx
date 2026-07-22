"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

// Morphing checkout flow — a three-step card payment (card → billing → confirm)
// where ONE container appears to animate `height: auto` between steps.
//
// The body's height is always an explicit px measured off the active panel
// (useLayoutEffect + ResizeObserver); motion eases it. Everything else is
// transform/opacity: the outgoing step exits softly while the incoming one's
// fields cascade in, direction-aware. The other hard constraints:
//
//   · CARET-PRESERVING MASK. The number re-formats every keystroke (4-4-4-4, or
//     4-6-5 for an Amex); the caret is put back by counting the DIGITS before it
//     (the only characters the user owns), so it never jumps.
//   · LUHN. The checksum validated live — a full number that fails shakes; one
//     that passes gets a quiet green check.
//   · 3D FLIP. Two stacked faces under perspective/preserve-3d/backface-hidden;
//     focusing the CVC rotates the card 180° (Amex prints its code on the FRONT,
//     so an Amex never flips — the detection is real).
//   · PAY MORPH. Paying FLIPs the button's width to a circle (measured px → rem,
//     imperative) while label → spinner → drawn check cross-fade. A decline
//     lands a red drawn ✕ with one shake, then eases back for another try.
//
// Pass `onPay` to run the real charge. Animation via motion/react; honours
// prefers-reduced-motion. Requires the lab-theme tokens. Fully Tailwind.

const EASE = [0.22, 1, 0.36, 1] as const;
const EASE_ICON = [0.2, 0, 0, 1] as const;
const STEP_NAMES = ["card", "billing", "confirm", "paid"];

const BRANDS: Record<string, { label: string; length: number; cvc: number; cvcName: string; groups: number[] }> = {
  visa: { label: "Visa", length: 16, cvc: 3, cvcName: "CVC", groups: [4, 4, 4, 4] },
  mastercard: { label: "Mastercard", length: 16, cvc: 3, cvcName: "CVC", groups: [4, 4, 4, 4] },
  amex: { label: "Amex", length: 15, cvc: 4, cvcName: "CID", groups: [4, 6, 5] },
  unknown: { label: "Card", length: 16, cvc: 3, cvcName: "CVC", groups: [4, 4, 4, 4] },
};

export interface CheckoutState {
  step: string;
  brand: string;
  number: string;
  side: string;
  status: string;
  height: number | null;
}

const detectBrand = (d: string) => (/^3[47]/.test(d) ? "amex" : /^4/.test(d) ? "visa" : /^(5[1-5]|2[2-7])/.test(d) ? "mastercard" : "unknown");

function luhnValid(digits: string) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = +digits[digits.length - 1 - i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function formatGroups(digits: string, groups: number[]) {
  const out: string[] = [];
  let i = 0;
  for (const size of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + size));
    i += size;
  }
  return out.join(" ");
}

const formatExpiry = (d: string) => (d.length <= 1 ? d : `${d.slice(0, 2)}/${d.slice(2)}`);

function caretAfterDigit(masked: string, n: number) {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < masked.length; i++) {
    if (/\d/.test(masked[i])) {
      seen += 1;
      if (seen === n) return i + 1;
    }
  }
  return masked.length;
}

function hopSeparators(event: React.KeyboardEvent<HTMLInputElement>) {
  const el = event.currentTarget;
  const { selectionStart, selectionEnd, value } = el;
  if (selectionStart == null || selectionStart !== selectionEnd) return;
  if (event.key === "Backspace" && /\D/.test(value[selectionStart - 1] ?? "")) el.setSelectionRange(selectionStart - 1, selectionStart - 1);
  else if (event.key === "Delete" && /\D/.test(value[selectionStart] ?? "")) el.setSelectionRange(selectionStart + 1, selectionStart + 1);
}

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const INPUT =
  "w-full h-10 px-3 rounded-lg bg-white text-[#111] text-sm shadow-border [transition:box-shadow_200ms_ease] placeholder:text-gray-400 hover:shadow-border-hover focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-[#111] aria-[invalid=true]:shadow-[0_0_0_1px_#fca5a5,0_1px_2px_-1px_rgba(220,38,38,0.12)] aria-[invalid=true]:focus:outline-[#dc2626]";
const LABEL = "text-[0.6875rem] font-medium tracking-[0.02em] text-gray-500";

export default function MorphingCheckout({
  price = "$149.00",
  morph = true,
  inspect = false,
  prefill = null,
  outcome = "success",
  indicator = "tabs",
  onPay,
  onStateChange,
}: {
  price?: string;
  morph?: boolean;
  inspect?: boolean;
  prefill?: { key: number; number: string } | null;
  /** "success" | "decline" — or return it from onPay. */
  outcome?: "success" | "decline";
  indicator?: "tabs" | "bar";
  /** Your real charge. Return "decline" to fail; anything else succeeds. */
  onPay?: (details: { number: string; expiry: string; cvc: string; name: string }) => Promise<"success" | "decline"> | void;
  onStateChange?: (state: CheckoutState) => void;
}) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState<{ step: number; dir: number } | null>(null);
  const [dir, setDir] = useState(1);
  const [animate, setAnimate] = useState(false);
  const [maxStep, setMaxStep] = useState(0);

  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvcRaw, setCvcRaw] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const [cvcFocus, setCvcFocus] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "failed" | "paid">("idle");
  const [payError, setPayError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [shake, setShake] = useState(0); // bump to trigger a nav/number shake
  const [bodyH, setBodyH] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const payRef = useRef<HTMLButtonElement>(null);
  const payIdleW = useRef(0);
  const caretRef = useRef<{ node: HTMLInputElement; pos: number } | null>(null);
  const leaveTimer = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const bodyFirstRef = useRef(true);
  const reduced = useReducedMotion();

  const brand = detectBrand(number);
  const spec = BRANDS[brand];
  const cvc = cvcRaw.slice(0, spec.cvc);
  const last4 = number.slice(-4);
  const numberComplete = number.length === spec.length;
  const numberValid = numberComplete && luhnValid(number);
  const numberState = number.length === 0 ? "empty" : numberValid ? "valid" : numberComplete ? "fails Luhn" : "incomplete";
  const expiryValid = (() => {
    if (expiry.length !== 4) return false;
    const mm = +expiry.slice(0, 2);
    if (mm < 1 || mm > 12) return false;
    const now = new Date();
    const year = 2000 + +expiry.slice(2);
    return year > now.getFullYear() || (year === now.getFullYear() && mm >= now.getMonth() + 1);
  })();
  const flipped = cvcFocus && brand !== "amex" && status === "idle";

  const clearError = (key: string) => setErrors((prev) => (prev[key] ? { ...prev, [key]: null } : prev));

  function navigate(next: number, { force = false } = {}) {
    if (next === step) return;
    if (!force && status !== "idle") return;
    const d = next > step ? 1 : -1;
    if (morph && !reducedMotion()) {
      setLeaving({ step, dir: d });
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setLeaving(null), 240);
      setAnimate(true);
    } else {
      setLeaving(null);
      setAnimate(false);
    }
    setDir(d);
    setStep(next);
    setMaxStep((m) => Math.max(m, next));
    requestAnimationFrame(() => panelRef.current?.querySelector("input")?.focus({ preventScroll: true }));
  }
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    const measure = () => setBodyH(panel.offsetHeight);
    measure();
    requestAnimationFrame(() => {
      bodyFirstRef.current = false;
    });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    observer?.observe(panel);
    return () => observer?.disconnect();
  }, [step]);

  useLayoutEffect(() => {
    const pending = caretRef.current;
    if (!pending) return;
    caretRef.current = null;
    if (pending.node && document.activeElement === pending.node) pending.node.setSelectionRange(pending.pos, pending.pos);
  });

  function handleNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    const digitsBefore = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, "").length;
    let digits = el.value.replace(/\D/g, "");
    const nextBrand = detectBrand(digits);
    digits = digits.slice(0, BRANDS[nextBrand].length);
    const masked = formatGroups(digits, BRANDS[nextBrand].groups);
    caretRef.current = { node: el, pos: caretAfterDigit(masked, Math.min(digitsBefore, digits.length)) };
    setNumber(digits);
    clearError("number");
  }

  function handleExpiryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const el = event.target;
    let digitsBefore = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, "").length;
    let digits = el.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length === 1 && digits > "1") {
      digits = `0${digits}`;
      digitsBefore += 1;
    }
    const masked = formatExpiry(digits);
    caretRef.current = { node: el, pos: caretAfterDigit(masked, Math.min(digitsBefore, digits.length)) };
    setExpiry(digits);
    clearError("expiry");
  }

  useEffect(() => {
    if (numberComplete && !numberValid) {
      setErrors((prev) => ({ ...prev, number: "This number fails its Luhn checksum" }));
      setShake((s) => s + 1);
    }
  }, [numberComplete, numberValid]);

  function validateStep(current: number) {
    const errs: Record<string, string> = {};
    if (current === 0) {
      if (!numberValid) errs.number = numberComplete ? "This number fails its Luhn checksum" : "Enter the full card number";
      if (!expiryValid) errs.expiry = "Enter a valid future date";
      if (cvc.length !== spec.cvc) errs.cvc = `Enter the ${spec.cvc}-digit ${spec.cvcName}`;
    }
    if (current === 1) {
      if (!name.trim()) errs.name = "Required";
      if (!address.trim()) errs.address = "Required";
      if (!city.trim()) errs.city = "Required";
      if (!zip.trim()) errs.zip = "Required";
    }
    return errs;
  }

  function handlePrimary() {
    if (status !== "idle") return;
    if (step === 2) {
      pay();
      return;
    }
    const errs = validateStep(step);
    if (Object.values(errs).some(Boolean)) {
      setErrors((prev) => ({ ...prev, ...errs }));
      setShake((s) => s + 1);
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus({ preventScroll: true }));
      return;
    }
    navigate(step + 1);
  }

  async function pay() {
    const btn = payRef.current;
    if (btn) {
      payIdleW.current = btn.getBoundingClientRect().width;
      btn.style.width = `${payIdleW.current}px`;
      void btn.offsetWidth;
      btn.style.width = "2.75rem";
    }
    setPayError(null);
    setStatus("processing");
    const verdict = (await Promise.resolve(onPay?.({ number, expiry, cvc, name }))) ?? outcome;
    timersRef.current.push(
      window.setTimeout(() => {
        if (verdict === "decline") {
          setStatus("failed");
          timersRef.current.push(
            window.setTimeout(() => {
              if (payRef.current) payRef.current.style.width = `${payIdleW.current}px`;
              setStatus("idle");
              setPayError("Your card was declined. Try a different card.");
              timersRef.current.push(
                window.setTimeout(() => {
                  if (payRef.current) payRef.current.style.width = "";
                }, 450),
              );
            }, 1400),
          );
          return;
        }
        setStatus("paid");
        timersRef.current.push(window.setTimeout(() => navigateRef.current(3, { force: true }), 1000));
      }, 1500),
    );
  }

  function reset() {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    if (payRef.current) payRef.current.style.width = "";
    setStatus("idle");
    setPayError(null);
    setNumber("");
    setExpiry("");
    setCvcRaw("");
    setName("");
    setAddress("");
    setCity("");
    setZip("");
    setErrors({});
    setMaxStep(0);
    navigate(0, { force: true });
  }

  useEffect(() => {
    if (!prefill?.key) return;
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    if (payRef.current) payRef.current.style.width = "";
    const digits = String(prefill.number ?? "").replace(/\D/g, "");
    const b = detectBrand(digits);
    setStatus("idle");
    setPayError(null);
    setNumber(digits.slice(0, BRANDS[b].length));
    setExpiry("1229");
    setCvcRaw(b === "amex" ? "4424" : "442");
    setErrors({});
    navigateRef.current(0, { force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill?.key]);

  useEffect(
    () => () => {
      timersRef.current.forEach(window.clearTimeout);
      window.clearTimeout(leaveTimer.current);
    },
    [],
  );

  useEffect(() => {
    onStateChange?.({
      step: STEP_NAMES[step],
      brand,
      number: numberState,
      side: flipped ? "back" : "front",
      status,
      height: bodyH == null ? null : Math.round(bodyH),
    });
  }, [step, brand, numberState, flipped, status, bodyH, onStateChange]);

  // Direction-aware field cascade. Motion when animating, plain otherwise.
  function StepChild({ i, className, children }: { i: number; className?: string; children: ReactNode }) {
    if (!animate || reduced) return <div className={className}>{children}</div>;
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, x: dir * 16, filter: "blur(3px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.38, ease: EASE, delay: i * 0.04 }}
      >
        {children}
      </motion.div>
    );
  }

  function ErrorMsg({ id, children }: { id?: string; children: ReactNode }) {
    return (
      <motion.p className="text-xs text-[#dc2626]" id={id} initial={{ opacity: 0, y: "-0.25rem" }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        {children}
      </motion.p>
    );
  }

  function renderStep(s: number, ghost = false) {
    const id = (base: string) => (ghost ? `${base}-ghost` : base);
    if (s === 0) {
      return (
        <>
          <StepChild i={0} className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor={id("mc-number")}>Card number</label>
            <motion.div className="relative" animate={shake && !ghost ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.32, ease: "easeInOut" }} key={`ns-${shake}`}>
              <input
                id={id("mc-number")}
                className={`${INPUT} tabular-nums`}
                type="text"
                value={formatGroups(number, spec.groups)}
                onChange={handleNumberChange}
                onKeyDown={hopSeparators}
                placeholder={brand === "amex" ? "3782 822463 10005" : "4242 4242 4242 4242"}
                inputMode="numeric"
                autoComplete="cc-number"
                spellCheck={false}
                aria-invalid={errors.number ? "true" : undefined}
                aria-describedby={errors.number ? id("mc-number-err") : undefined}
              />
              <motion.span
                className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex text-[#16a34a] pointer-events-none"
                initial={false}
                animate={numberValid ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: EASE_ICON }}
              >
                <ValidIcon />
              </motion.span>
              {inspect && !ghost && <SpecLabel className="bottom-[calc(100%+0.25rem)] right-0 border-[#fecaca] text-[#dc2626]">groups {spec.groups.join("-")} · caret by digit index</SpecLabel>}
            </motion.div>
            {errors.number && <ErrorMsg id={id("mc-number-err")}>{errors.number}</ErrorMsg>}
          </StepChild>
          <StepChild i={1} className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor={id("mc-expiry")}>Expiry</label>
              <input id={id("mc-expiry")} className={`${INPUT} tabular-nums`} type="text" value={formatExpiry(expiry)} onChange={handleExpiryChange} onKeyDown={hopSeparators} placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" spellCheck={false} aria-invalid={errors.expiry ? "true" : undefined} aria-describedby={errors.expiry ? id("mc-expiry-err") : undefined} />
              {errors.expiry && <ErrorMsg id={id("mc-expiry-err")}>{errors.expiry}</ErrorMsg>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor={id("mc-cvc")}>{spec.cvcName}</label>
              <input id={id("mc-cvc")} className={`${INPUT} tabular-nums`} type="text" value={cvc} onChange={(e) => { setCvcRaw(e.target.value.replace(/\D/g, "").slice(0, spec.cvc)); clearError("cvc"); }} onFocus={() => setCvcFocus(true)} onBlur={() => setCvcFocus(false)} placeholder={"•".repeat(spec.cvc)} inputMode="numeric" autoComplete="cc-csc" spellCheck={false} aria-invalid={errors.cvc ? "true" : undefined} aria-describedby={errors.cvc ? id("mc-cvc-err") : undefined} />
              {errors.cvc && <ErrorMsg id={id("mc-cvc-err")}>{errors.cvc}</ErrorMsg>}
            </div>
          </StepChild>
        </>
      );
    }
    if (s === 1) {
      const field = (i: number, key: string, label: string, val: string, set: (v: string) => void, placeholder: string, ac: string, numeric = false) => (
        <StepChild i={i} className="flex flex-col gap-1.5">
          <label className={LABEL} htmlFor={id(`mc-${key}`)}>{label}</label>
          <input id={id(`mc-${key}`)} className={numeric ? `${INPUT} tabular-nums` : INPUT} type="text" value={val} onChange={(e) => { set(e.target.value); clearError(key); }} placeholder={placeholder} autoComplete={ac} spellCheck={false} aria-invalid={errors[key] ? "true" : undefined} />
          {errors[key] && <ErrorMsg>{errors[key]}</ErrorMsg>}
        </StepChild>
      );
      return (
        <>
          {field(0, "name", "Name on card", name, setName, "Ada Lovelace", "cc-name")}
          {field(1, "address", "Street address", address, setAddress, "42 Analytical Engine Way", "street-address")}
          <StepChild i={2} className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor={id("mc-city")}>City</label>
              <input id={id("mc-city")} className={INPUT} type="text" value={city} onChange={(e) => { setCity(e.target.value); clearError("city"); }} placeholder="London" autoComplete="address-level2" spellCheck={false} aria-invalid={errors.city ? "true" : undefined} />
              {errors.city && <ErrorMsg>{errors.city}</ErrorMsg>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor={id("mc-zip")}>ZIP</label>
              <input id={id("mc-zip")} className={`${INPUT} tabular-nums`} type="text" value={zip} onChange={(e) => { setZip(e.target.value); clearError("zip"); }} placeholder="10118" autoComplete="postal-code" spellCheck={false} aria-invalid={errors.zip ? "true" : undefined} />
              {errors.zip && <ErrorMsg>{errors.zip}</ErrorMsg>}
            </div>
          </StepChild>
        </>
      );
    }
    if (s === 2) {
      return (
        <>
          <StepChild i={0}>
            <dl className="flex flex-col">
              <SumRow dt="Card">{spec.label} •••• {last4}</SumRow>
              <SumRow dt="Expires"><span className="tabular-nums">{formatExpiry(expiry)}</span></SumRow>
              <SumRow dt="Name">{name.trim()}</SumRow>
              <SumRow dt="Billing">{address.trim()}, {city.trim()} {zip.trim()}</SumRow>
              <SumRow dt="Total" total><span className="tabular-nums">{price}</span></SumRow>
            </dl>
          </StepChild>
          <StepChild i={1}><p className="text-xs text-gray-400">Demo checkout - nothing is charged.</p></StepChild>
        </>
      );
    }
    return (
      <>
        <StepChild i={0}>
          <div>
            <h3 className="text-[0.9375rem] font-semibold text-[#111]">Payment complete</h3>
            <p className="mt-1.5 text-[0.8125rem] text-gray-500">Charged <span className="tabular-nums">{price}</span> to {spec.label} •••• {last4}</p>
          </div>
        </StepChild>
        <StepChild i={1}><p className="text-xs text-gray-400">A receipt is on its way to your inbox. Probably.</p></StepChild>
      </>
    );
  }

  const tabs = ["Card", "Billing", "Confirm"];
  const p = (Math.min(step, 2) + 1) / 3;

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full max-w-[22rem] relative">
        <div className="relative p-4 rounded-3xl bg-white shadow-border">
          {/* Live preview — presentational, hidden from AT. */}
          <div className="relative [perspective:62.5rem] mb-4">
            <motion.div className="relative aspect-[1.586] [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6, ease: EASE }} aria-hidden="true">
              <div className="absolute inset-0 flex flex-col [backface-visibility:hidden] rounded-lg overflow-hidden text-[#111] bg-[linear-gradient(135deg,#f9fafb,#f0f1f3_55%,#f6f7f8)] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_6px_-3px_rgba(0,0,0,0.08)] p-[1.125rem] justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-8 h-6 rounded-[0.375rem] bg-[linear-gradient(135deg,#e4e4e7,#c6c6cc)]" />
                  <span className="grid place-items-center min-w-12 h-6">
                    <BrandMark active={brand === "unknown"} className="text-black/30"><GenericCardIcon /></BrandMark>
                    <BrandMark active={brand === "visa"} className="text-[0.9375rem] font-extrabold italic tracking-[0.04em]">VISA</BrandMark>
                    <BrandMark active={brand === "mastercard"}><i className="w-[1.125rem] h-[1.125rem] rounded-full bg-[#3f3f46]" /><i className="w-[1.125rem] h-[1.125rem] rounded-full bg-[#a1a1aa] opacity-90 -ml-[0.4375rem]" /></BrandMark>
                    <BrandMark active={brand === "amex"} className="px-[0.3125rem] py-0.5 rounded bg-[#3f3f46] text-white text-[0.5625rem] font-bold tracking-[0.08em]">AMEX</BrandMark>
                  </span>
                </div>
                {brand === "amex" && (
                  <div className="absolute top-[3.25rem] right-[1.125rem] flex items-baseline gap-1.5 text-[0.6875rem]">
                    <span className={MINI}>CID</span>
                    <span className="tabular-nums"><PopChars value={cvc.padEnd(spec.cvc, "•")} /></span>
                  </div>
                )}
                <div className="flex gap-[0.75ch] text-[1.0625rem] tabular-nums tracking-[0.06em] [text-shadow:0_1px_0_rgba(255,255,255,0.8)]">
                  {(() => {
                    let consumed = 0;
                    return spec.groups.map((size, gi) => {
                      const chunk = number.slice(consumed, consumed + size).padEnd(size, "•");
                      consumed += size;
                      return <span className="inline-flex" key={gi}><PopChars value={chunk} /></span>;
                    });
                  })()}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="min-w-0 overflow-hidden text-[0.6875rem] font-medium tracking-[0.12em] whitespace-nowrap"><PopChars value={(name.trim() || "Your name").toUpperCase()} /></span>
                  <span className="flex items-baseline gap-1.5 text-[0.6875rem] whitespace-nowrap">
                    <span className={MINI}>Valid thru</span>
                    <span className="tabular-nums"><PopChars value={expiry ? formatExpiry(expiry).padEnd(5, "•") : "••/••"} /></span>
                  </span>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col [backface-visibility:hidden] rounded-lg overflow-hidden bg-[linear-gradient(135deg,#f9fafb,#f0f1f3_55%,#f6f7f8)] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_2px_6px_-3px_rgba(0,0,0,0.08)] [transform:rotateY(180deg)]">
                <div className="h-9 mt-[1.125rem] bg-[#d4d4d8]" />
                <div className="flex items-center justify-end h-7 mx-[1.125rem] mt-4 px-2.5 rounded [background:repeating-linear-gradient(0deg,#fff,#fff_3px,#f0f1f3_3px,#f0f1f3_4px)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)] text-[#111] text-[0.8125rem] italic">
                  <span className="tabular-nums"><PopChars value={cvc.padEnd(spec.cvc, "•")} /></span>
                </div>
                <p className="my-2 mx-[1.125rem] text-[0.5625rem] tracking-[0.08em] uppercase text-black/40">Security code</p>
              </div>
            </motion.div>
            {inspect && (
              <>
                <span className="absolute inset-0 z-[5] pointer-events-none border-[1.5px] border-dashed border-[#ef4444] rounded-lg" />
                <SpecLabel className="top-2 left-1/2 -translate-x-1/2 border-[#fecaca] text-[#dc2626]">rotateY({flipped ? "180" : "0"}deg) · preserve-3d</SpecLabel>
              </>
            )}
          </div>

          {/* Step indicator */}
          {indicator === "bar" ? (
            <nav className="mb-4" aria-label="Checkout steps">
              <div className="grid grid-cols-3">
                {tabs.map((label, index) => (
                  <button key={label} type="button" className={`relative h-8 rounded-md text-xs font-medium [transition:color_200ms_ease] after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1 ${step === index ? "text-[#111]" : index > maxStep ? "text-gray-400" : "text-gray-500"} enabled:hover:text-[#111] disabled:cursor-default focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#111]`} aria-current={step === index ? "step" : undefined} disabled={index === step || index > maxStep || status !== "idle"} onClick={() => navigate(index)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="h-1 mt-1.5 rounded-full bg-gray-100 overflow-hidden" aria-hidden="true">
                <motion.span className={`block h-full rounded-full ${step === 3 ? "bg-[#16a34a]" : "bg-[#111]"}`} animate={{ x: `${(1 - p) * -100}%` }} transition={morph && !reduced ? { duration: 0.38, ease: EASE } : { duration: 0 }} />
              </div>
            </nav>
          ) : (
            <nav className="relative grid grid-cols-3 p-1 mb-4 rounded-full bg-gray-100" aria-label="Checkout steps">
              <motion.span className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-white shadow-border" aria-hidden="true" animate={{ x: `${Math.min(step, 2) * 100}%` }} transition={morph && !reduced ? { duration: 0.38, ease: EASE } : { duration: 0 }} />
              {tabs.map((label, index) => (
                <button key={label} type="button" className={`relative z-[1] h-8 rounded-full text-xs font-medium [transition:color_200ms_ease] after:content-[''] after:absolute after:inset-x-0 after:-inset-y-1 ${step === index ? "text-[#111]" : "text-gray-500"} enabled:hover:text-[#111] disabled:cursor-default focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#111]`} aria-current={step === index ? "step" : undefined} disabled={index === step || index > maxStep || status !== "idle"} onClick={() => navigate(index)}>
                  {label}
                </button>
              ))}
            </nav>
          )}

          <motion.div className="relative overflow-hidden" animate={{ height: bodyH ?? "auto" }} transition={!morph || reduced || bodyFirstRef.current ? { duration: 0 } : { duration: 0.38, ease: EASE }}>
            {leaving && (
              <motion.div className="absolute top-0 left-0 right-0 flex flex-col gap-3.5 p-0.5 pointer-events-none" initial={{ opacity: 1, x: 0 }} animate={{ opacity: 0, x: leaving.dir * -12, filter: "blur(2px)" }} transition={{ duration: 0.18, ease: "easeIn" }} aria-hidden="true" inert>
                {renderStep(leaving.step, true)}
              </motion.div>
            )}
            <div key={step} ref={panelRef} className="flex flex-col gap-3.5 p-0.5">
              {renderStep(step)}
            </div>
            {inspect && (
              <>
                <span className="absolute inset-0 z-[5] pointer-events-none border-[1.5px] border-dashed border-[#3b82f6] rounded-lg" />
                <SpecLabel className="bottom-1 right-1 border-[#bfdbfe] text-[#2563eb]">height: {bodyH == null ? "auto" : `${Math.round(bodyH)}px`} · measured → eased</SpecLabel>
              </>
            )}
          </motion.div>

          <div className="relative flex items-center justify-between gap-3 min-h-11 mt-4">
            <button
              type="button"
              className={`h-11 px-3.5 rounded-full text-[0.8125rem] font-medium text-gray-500 [transition:color_200ms_ease,background-color_200ms_ease,opacity_250ms_var(--ease-icon),scale_150ms_ease-out] hover:text-[#111] hover:bg-gray-100 active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] ${step === 0 || (status !== "idle" && step !== 3) ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              tabIndex={step === 0 || (status !== "idle" && step !== 3) ? -1 : 0}
              onClick={() => (step === 3 ? reset() : navigate(step - 1))}
            >
              {step === 3 ? "Start over" : "Back"}
            </button>
            <motion.div className="ml-auto" animate={shake || status === "failed" ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }} transition={{ duration: 0.32, ease: "easeInOut", delay: status === "failed" ? 0.2 : 0 }} key={`pshake-${shake}-${status}`}>
              <button
                type="button"
                ref={payRef}
                className="relative grid place-items-center h-11 min-w-11 rounded-full overflow-hidden whitespace-nowrap bg-[#111] text-white [transition:width_420ms_var(--ease-smooth-out),background-color_300ms_ease,scale_150ms_ease-out] active:enabled:scale-[0.96] disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111] data-[status=paid]:bg-[#16a34a] data-[status=failed]:bg-[#dc2626]"
                data-status={status}
                disabled={status !== "idle"}
                aria-busy={status === "processing"}
                onClick={handlePrimary}
              >
                <motion.span className="[grid-area:1/1] inline-flex items-center gap-[0.4375rem] px-5 text-sm font-medium" initial={false} animate={status === "idle" ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }} transition={{ duration: 0.25, ease: EASE_ICON }}>
                  {step >= 2 ? (<><LockIcon /> Pay <span className="tabular-nums">{price}</span></>) : "Continue"}
                </motion.span>
                <PayIcon show={status === "processing"}>
                  <motion.span className="w-[1.125rem] h-[1.125rem] rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }} />
                </PayIcon>
                <PayIcon show={status === "paid"}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: status === "paid" ? 1 : 0 }} transition={{ duration: 0.32, delay: 0.12, ease: EASE }} />
                  </svg>
                </PayIcon>
                <PayIcon show={status === "failed"}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <motion.path d="M7 7l10 10" initial={{ pathLength: 0 }} animate={{ pathLength: status === "failed" ? 1 : 0 }} transition={{ duration: 0.18, delay: 0.12, ease: EASE }} />
                    <motion.path d="M17 7L7 17" initial={{ pathLength: 0 }} animate={{ pathLength: status === "failed" ? 1 : 0 }} transition={{ duration: 0.18, delay: 0.26, ease: EASE }} />
                  </svg>
                </PayIcon>
              </button>
            </motion.div>
            {inspect && status !== "idle" && <SpecLabel className="bottom-[calc(100%+0.4rem)] right-0 border-[#fecaca] text-[#dc2626]">width: measured px → 2.75rem</SpecLabel>}
          </div>

          {payError && <motion.p className="mt-3 text-xs text-[#dc2626]" role="alert" initial={{ opacity: 0, y: "-0.25rem" }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}>{payError}</motion.p>}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {status === "processing" ? "Processing payment" : status === "paid" ? "Payment complete" : status === "failed" ? "Payment declined" : `Step ${Math.min(step, 2) + 1} of 3: ${["card details", "billing address", "confirm and pay"][Math.min(step, 2)]}`}
        </p>
      </div>
    </MotionConfig>
  );
}

const MINI = "text-[0.5rem] font-medium tracking-[0.1em] uppercase text-black/40";

function BrandMark({ active, className = "", children }: { active: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.span className={`[grid-area:1/1] inline-flex items-center ${className}`} initial={false} animate={active ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }} transition={{ duration: 0.25, ease: EASE_ICON }}>
      {children}
    </motion.span>
  );
}

function PayIcon({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <motion.span className="absolute left-1/2 top-1/2 inline-flex" style={{ x: "-50%", y: "-50%" } as CSSProperties} initial={false} animate={show ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }} transition={{ duration: 0.25, ease: EASE_ICON }} aria-hidden="true">
      {children}
    </motion.span>
  );
}

function SumRow({ dt, total, children }: { dt: string; total?: boolean; children: ReactNode }) {
  return (
    <div className={`flex justify-between gap-4 py-[0.4375rem] text-[0.8125rem] [&+&]:border-t [&+&]:border-gray-100 ${total ? "font-semibold" : ""}`}>
      <dt className={total ? "text-[#111]" : "text-gray-500"}>{dt}</dt>
      <dd className={`min-w-0 text-right [overflow-wrap:anywhere] ${total ? "text-[#111]" : "text-[#111] font-medium"}`}>{children}</dd>
    </div>
  );
}

function SpecLabel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`absolute z-[6] whitespace-nowrap rounded-[0.25rem] border bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums ${className}`}>{children}</span>;
}

// Embossed card repaints per character: each span keyed by position + value, so
// a changed character remounts and pops in while tabular neighbours hold still.
function PopChars({ value }: { value: string }) {
  return (
    <>
      {value.split("").map((char, index) => {
        const dim = char === "•";
        if (dim) return <span key={`${index}-${char}`} className="inline-block min-w-[1ch] text-center text-black/[0.28]">{char}</span>;
        return (
          <motion.span key={`${index}-${char}`} className="inline-block min-w-[1ch] text-center" initial={{ opacity: 0, y: "0.3em", scale: 0.9, filter: "blur(2px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.24, ease: EASE }}>
            {char === " " ? " " : char}
          </motion.span>
        );
      })}
    </>
  );
}

function GenericCardIcon() { return <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1" y="1" width="20" height="14" rx="2.5" /><line x1="1" y1="5.5" x2="21" y2="5.5" /></svg>; }
function ValidIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>; }
function LockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>; }
