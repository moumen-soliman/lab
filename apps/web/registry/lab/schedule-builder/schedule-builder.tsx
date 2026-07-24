"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, motion } from "motion/react";

// Schedule builder — a recurrence rule assembled as a live English sentence,
// with the next N REAL occurrences underneath.
//
// The domain is the hard part: recurrence looks like dropdowns but is full of
// calendar traps, and this build refuses to fake any of them:
//
//   · Month boundaries. "Every month on day 31" cannot run in September.
//     RRULE semantics SKIP the month (and the list shows a ghost row saying
//     so); the `clamp` prop switches to the other real-world policy, where
//     day 31 becomes Sep 30.
//   · DST. Runs are built from local wall-clock components (year, month,
//     day, hour), so "9:00 AM" stays 9:00 AM across a daylight-saving jump —
//     the UTC offset is printed on every row and flagged when it differs
//     from the first run's.
//   · Nth-weekday math. "The 2nd Tuesday" and "the last Friday" are computed
//     from the month's first/last day, never by scanning.
//
// The sentence morphs word-by-word: words are keyed by text + occurrence and
// carry motion's `layout` — surviving words glide to their new positions while
// new words blur in. Change "week" to "month" and "at 9:00 AM" slides left
// instead of re-rendering; the sentence reads as one object being edited, not
// a string being replaced.
//
// Read the rule out through `onRuleChange` (it is the component's value).
// Animation via motion/react; honours prefers-reduced-motion. Requires the
// lab-theme tokens. Fully Tailwind, no CSS files.

const EASE = [0.22, 1, 0.36, 1] as const;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINALS: { value: number | "last"; label: string }[] = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: "last", label: "last" },
];

export interface ScheduleRule {
  freq: "daily" | "weekly" | "monthly";
  interval: number;
  weekdays: number[];
  monthMode: "date" | "nth";
  monthDay: number;
  ordinal: number | "last";
  weekday: number;
  hour: number;
  minute: number;
}

export interface ScheduleBuilderState {
  sentence: string;
  next: string | null;
  skips: number;
  dstChanges: number;
  freq: ScheduleRule["freq"];
}

type RunEntry =
  | { kind: "run"; date: Date; clamped?: boolean }
  | { kind: "skip"; key: string; label: string; month: number };

const DEFAULT_RULE: ScheduleRule = {
  freq: "weekly",
  interval: 1,
  weekdays: [2, 4], // Tue + Thu
  monthMode: "date",
  monthDay: 31, // deliberately the gnarly default — skips appear immediately
  ordinal: 2,
  weekday: 2,
  hour: 9,
  minute: 0,
};

const monthName = (date: Date) => date.toLocaleString("en-US", { month: "long" });


function offsetLabel(date: Date) {
  const mins = -date.getTimezoneOffset();
  const sign = mins >= 0 ? "+" : "-";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

function timeLabel(hour: number, minute: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")}`;
}

// "2nd Tuesday of month m" — computed from the month's first day; "last"
// walks back from the month's last day. A 1st-4th always exists.
function nthWeekdayOf(year: number, month: number, ordinal: number | "last", weekday: number, hour: number, minute: number) {
  if (ordinal === "last") {
    const last = new Date(year, month + 1, 0);
    const back = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - back, hour, minute);
  }
  const first = new Date(year, month, 1);
  const forward = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + forward + (ordinal - 1) * 7, hour, minute);
}

const startOfWeek = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
const WEEK_MS = 7 * 86400000;

// The next `count` occurrences, plus ghost entries for months a day-of-month
// rule has to skip. Everything is built from LOCAL date components, so DST is
// handled by the platform, not re-derived.
function computeRuns(rule: ScheduleRule, now: Date, count: number, clamp: boolean): RunEntry[] {
  const { freq, interval, weekdays, monthMode, monthDay, ordinal, weekday, hour, minute } = rule;
  const out: RunEntry[] = [];
  let runs = 0;

  if (freq === "daily") {
    const c = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
    if (c <= now) c.setDate(c.getDate() + interval);
    while (runs < count) {
      out.push({ kind: "run", date: new Date(c) });
      runs += 1;
      c.setDate(c.getDate() + interval); // setDate keeps local wall-clock across DST
    }
  } else if (freq === "weekly") {
    const anchor = startOfWeek(now); // this week starts the interval cycle
    for (let i = 0; i < 800 && runs < count; i += 1) {
      const cand = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute);
      if (!weekdays.includes(cand.getDay())) continue;
      const weeksAway = Math.round((startOfWeek(cand).getTime() - anchor.getTime()) / WEEK_MS); // round() absorbs the DST hour
      if (weeksAway % interval !== 0) continue;
      if (cand <= now) continue;
      out.push({ kind: "run", date: cand });
      runs += 1;
    }
  } else {
    for (let i = 0; i < 36 && runs < count; i += 1) {
      const year = now.getFullYear();
      const month = now.getMonth() + i;
      if (monthMode === "date") {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (monthDay > daysInMonth) {
          if (clamp) {
            const cand = new Date(year, month, daysInMonth, hour, minute);
            if (cand > now) {
              out.push({ kind: "run", date: cand, clamped: true });
              runs += 1;
            }
          } else if (new Date(year, month + 1, 0, 23, 59) > now) {
            // RRULE semantics: the month simply has no day 31 — say so.
            out.push({
              kind: "skip",
              key: `skip-${year}-${month}`,
              label: `${monthName(new Date(year, month, 1))} has only ${daysInMonth} days`,
              month,
            });
          }
          continue;
        }
        const cand = new Date(year, month, monthDay, hour, minute);
        if (cand > now) {
          out.push({ kind: "run", date: cand });
          runs += 1;
        }
      } else {
        const cand = nthWeekdayOf(year, month, ordinal, weekday, hour, minute);
        if (cand > now) {
          out.push({ kind: "run", date: cand });
          runs += 1;
        }
      }
    }
  }
  return out;
}

// The sentence as a word list. Punctuation rides on its word — keys are
// text + occurrence, so a surviving "at" keeps its identity and glides
// instead of re-entering.
function sentenceWords(rule: ScheduleRule) {
  const { freq, interval, weekdays, monthMode, monthDay, ordinal, weekday, hour, minute } = rule;
  const words = ["Every"];
  if (freq === "daily") {
    if (interval === 1) words.push("day");
    else words.push(String(interval), "days");
  } else if (freq === "weekly") {
    if (interval === 1) words.push("week");
    else words.push(String(interval), "weeks");
    words.push("on");
    const names = [...weekdays].sort((a, b) => a - b).map((d) => WEEKDAYS[d]);
    names.forEach((name, index) => {
      if (index === names.length - 1 && names.length > 1) words.push("and");
      words.push(index < names.length - 2 ? `${name},` : name);
    });
  } else {
    words.push("month", "on");
    if (monthMode === "date") words.push("day", String(monthDay));
    else words.push("the", ORDINALS.find((o) => o.value === ordinal)!.label, WEEKDAYS[weekday]);
  }
  words.push("at", timeLabel(hour, minute), hour < 12 ? "AM" : "PM");
  const seen: Record<string, number> = {};
  return words.map((word) => ({ word, key: `${word}·${(seen[word] = (seen[word] ?? 0) + 1)}` }));
}

const SEG_BTN =
  "h-7 px-2.5 rounded-md bg-transparent text-muted-foreground text-xs font-medium cursor-pointer transition-[background-color,color,scale] duration-150 aria-pressed:bg-primary aria-pressed:text-primary-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const STEP_BTN =
  "w-7 h-7 rounded-lg bg-transparent text-muted-foreground text-sm cursor-pointer transition-[background-color,color,scale] duration-150 hover:enabled:bg-accent hover:enabled:text-foreground active:enabled:scale-[0.96] disabled:opacity-35 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const SELECT =
  "h-7 px-1.5 rounded-lg bg-background shadow-border text-foreground text-xs font-medium cursor-pointer outline-none transition-shadow duration-150 hover:shadow-border-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ROW_LABEL = "w-14 flex-none text-[0.6875rem] font-semibold tracking-[0.06em] uppercase text-muted-foreground/70";

export default function ScheduleBuilder({
  defaultRule,
  onRuleChange,
  occurrences = 5,
  morph = true,
  clamp = false, // month-end policy: false = RRULE skip · true = clamp to last day
  inspect = false,
  onStateChange,
}: {
  /** Seed the builder with a partial rule; the rest falls back to the default. */
  defaultRule?: Partial<ScheduleRule>;
  /** The component's value: fires with the full rule on every edit. */
  onRuleChange?: (rule: ScheduleRule) => void;
  /** How many upcoming runs to prove the rule with. */
  occurrences?: number;
  morph?: boolean;
  clamp?: boolean;
  inspect?: boolean;
  onStateChange?: (state: ScheduleBuilderState) => void;
}) {
  const [rule, setRule] = useState<ScheduleRule>({ ...DEFAULT_RULE, ...defaultRule });
  // Entrances are gated behind the first paint — on mount the sentence just is.
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  const words = useMemo(() => sentenceWords(rule), [rule]);
  const sentenceText = words.map((w) => w.word).join(" ");
  // `now` is pinned per rule-change so the list doesn't jitter between renders.
  const runs = useMemo(() => computeRuns(rule, new Date(), occurrences, clamp), [rule, clamp, occurrences]);
  const firstRun = runs.find((entry): entry is Extract<RunEntry, { kind: "run" }> => entry.kind === "run");
  const baseOffset = firstRun ? offsetLabel(firstRun.date) : null;
  const dstChanges = runs.filter((entry) => entry.kind === "run" && offsetLabel(entry.date) !== baseOffset).length;
  const skips = runs.filter((entry) => entry.kind === "skip").length;

  const set = (patch: Partial<ScheduleRule>) => setRule((prev) => ({ ...prev, ...patch }));

  function toggleWeekday(day: number) {
    setRule((prev) => {
      if (prev.weekdays.includes(day)) {
        if (prev.weekdays.length === 1) return prev; // a weekly rule needs a day
        return { ...prev, weekdays: prev.weekdays.filter((d) => d !== day) };
      }
      return { ...prev, weekdays: [...prev.weekdays, day] };
    });
  }

  useEffect(() => {
    onRuleChange?.(rule);
  }, [rule, onRuleChange]);

  useEffect(() => {
    onStateChange?.({
      sentence: sentenceText,
      next: firstRun
        ? `${firstRun.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${timeLabel(firstRun.date.getHours(), firstRun.date.getMinutes())} ${firstRun.date.getHours() < 12 ? "AM" : "PM"}`
        : null,
      skips,
      dstChanges,
      freq: rule.freq,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentenceText, firstRun?.date?.getTime(), skips, dstChanges, rule.freq, onStateChange]);

  const runFmt = (date: Date) =>
    date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full max-w-[22rem] flex flex-col gap-3.5">
        {/* The sentence — words are the animated unit, not the string. Real
            spaces between the spans, so selection, copy and screen readers get
            "Every week…", not "Everyweek…". Surviving keys glide via layout;
            new keys blur in. */}
        <p
          className="m-0 min-h-[3.2em] text-lg leading-[1.5] font-medium tracking-[-0.01em] text-foreground"
          aria-live="polite"
        >
          {words.map(({ word, key }, index) => (
            <span key={key}>
              {index > 0 && " "}
              <motion.span
                layout={morph ? "position" : false}
                initial={mountedRef.current && morph ? { opacity: 0, filter: "blur(2px)", y: "0.3em" } : false}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ layout: { duration: 0.3, ease: EASE }, duration: 0.24, ease: EASE }}
                className={`inline-block${inspect ? " outline-1 outline-dashed outline-[#93c5fd] outline-offset-1 rounded-[2px]" : ""}`}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </p>

        {/* ── Controls ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-2 min-h-8">
            <span className={ROW_LABEL}>Repeats</span>
            <div className="inline-flex gap-[2px] p-[2px] rounded-lg bg-muted" role="group" aria-label="Frequency">
              {(["daily", "weekly", "monthly"] as const).map((freq) => (
                <button key={freq} type="button" className={SEG_BTN} aria-pressed={rule.freq === freq} onClick={() => set({ freq })}>
                  {freq[0].toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {rule.freq !== "monthly" && (
            <div className="flex items-center flex-wrap gap-2 min-h-8">
              <span className={ROW_LABEL}>Every</span>
              <div className="inline-flex items-center rounded-lg bg-background shadow-border" role="group" aria-label="Interval">
                <button type="button" className={STEP_BTN} aria-label="Less often" disabled={rule.interval <= 1} onClick={() => set({ interval: rule.interval - 1 })}>
                  −
                </button>
                <span className="min-w-6 text-center text-[0.8125rem] font-medium text-foreground tabular-nums">{rule.interval}</span>
                <button type="button" className={STEP_BTN} aria-label="More often" disabled={rule.interval >= 6} onClick={() => set({ interval: rule.interval + 1 })}>
                  +
                </button>
              </div>
              <span className="text-xs font-medium text-muted-foreground/70">
                {rule.freq === "daily" ? (rule.interval === 1 ? "day" : "days") : rule.interval === 1 ? "week" : "weeks"}
              </span>
            </div>
          )}

          {rule.freq === "weekly" && (
            <div className="flex items-center flex-wrap gap-2 min-h-8">
              <span className={ROW_LABEL}>On</span>
              <div className="inline-flex gap-1" role="group" aria-label="Weekdays">
                {WEEKDAYS.map((name, day) => (
                  <button
                    key={name}
                    type="button"
                    className="w-7 h-7 rounded-full bg-muted text-muted-foreground text-[0.6875rem] font-semibold cursor-pointer transition-[background-color,color,scale] duration-150 aria-pressed:bg-primary aria-pressed:text-primary-foreground active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    aria-pressed={rule.weekdays.includes(day)}
                    aria-label={name}
                    onClick={() => toggleWeekday(day)}
                  >
                    {name[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {rule.freq === "monthly" && (
            <div className="flex items-center flex-wrap gap-2 min-h-8">
              <span className={ROW_LABEL}>On</span>
              <div className="inline-flex gap-[2px] p-[2px] rounded-lg bg-muted" role="group" aria-label="Monthly mode">
                <button type="button" className={SEG_BTN} aria-pressed={rule.monthMode === "date"} onClick={() => set({ monthMode: "date" })}>
                  A date
                </button>
                <button type="button" className={SEG_BTN} aria-pressed={rule.monthMode === "nth"} onClick={() => set({ monthMode: "nth" })}>
                  A weekday
                </button>
              </div>
              {rule.monthMode === "date" ? (
                <div className="inline-flex items-center rounded-lg bg-background shadow-border" role="group" aria-label="Day of month">
                  <button type="button" className={STEP_BTN} aria-label="Earlier day" disabled={rule.monthDay <= 1} onClick={() => set({ monthDay: rule.monthDay - 1 })}>
                    −
                  </button>
                  <span className="min-w-6 text-center text-[0.8125rem] font-medium text-foreground tabular-nums">{rule.monthDay}</span>
                  <button type="button" className={STEP_BTN} aria-label="Later day" disabled={rule.monthDay >= 31} onClick={() => set({ monthDay: rule.monthDay + 1 })}>
                    +
                  </button>
                </div>
              ) : (
                <>
                  <select
                    className={SELECT}
                    value={String(rule.ordinal)}
                    aria-label="Which one"
                    onChange={(e) => set({ ordinal: e.target.value === "last" ? "last" : Number(e.target.value) })}
                  >
                    {ORDINALS.map((o) => (
                      <option key={o.label} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <select className={SELECT} value={rule.weekday} aria-label="Weekday" onChange={(e) => set({ weekday: Number(e.target.value) })}>
                    {WEEKDAYS.map((name, day) => (
                      <option key={name} value={day}>
                        {name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}

          <div className="flex items-center flex-wrap gap-2 min-h-8">
            <span className={ROW_LABEL}>At</span>
            <select
              className={SELECT}
              value={rule.hour % 12 === 0 ? 12 : rule.hour % 12}
              aria-label="Hour"
              onChange={(e) => {
                const h12 = Number(e.target.value) % 12;
                set({ hour: rule.hour < 12 ? h12 : h12 + 12 });
              }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <select className={SELECT} value={rule.minute} aria-label="Minutes" onChange={(e) => set({ minute: Number(e.target.value) })}>
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  :{String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
            <div className="inline-flex gap-[2px] p-[2px] rounded-lg bg-muted" role="group" aria-label="AM or PM">
              <button type="button" className={SEG_BTN} aria-pressed={rule.hour < 12} onClick={() => set({ hour: rule.hour % 12 })}>
                AM
              </button>
              <button type="button" className={SEG_BTN} aria-pressed={rule.hour >= 12} onClick={() => set({ hour: (rule.hour % 12) + 12 })}>
                PM
              </button>
            </div>
          </div>
        </div>

        {/* ── The proof: real occurrences, ghosts for skipped months ── */}
        <div className="border-t border-border pt-2.5">
          <p className="m-0 mb-1.5 text-[0.625rem] font-semibold tracking-[0.06em] uppercase text-muted-foreground/70">
            Next {runs.filter((r) => r.kind === "run").length} runs
          </p>
          <ol className="flex flex-col gap-0.5 m-0 p-0 list-none">
            {runs.map((entry, index) =>
              entry.kind === "skip" ? (
                <motion.li
                  key={entry.key}
                  initial={{ opacity: 0, y: "0.25rem", filter: "blur(1px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.24, ease: EASE, delay: index * 0.03 }}
                  className="flex items-center justify-between gap-3 px-1.5 py-[0.3125rem] rounded-lg text-xs text-muted-foreground/70 border border-dashed border-foreground/10"
                >
                  <span>{entry.label}</span>
                  <span className="text-[0.625rem] font-semibold tracking-[0.04em] uppercase">skipped</span>
                </motion.li>
              ) : (
                <motion.li
                  key={entry.date.getTime()}
                  initial={{ opacity: 0, y: "0.25rem", filter: "blur(1px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.24, ease: EASE, delay: index * 0.03 }}
                  className="flex items-center justify-between gap-3 px-1.5 py-[0.3125rem] rounded-lg text-[0.8125rem] text-foreground"
                >
                  <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {runFmt(entry.date)}
                    {entry.clamped && (
                      <span className="ml-1.5 text-[0.625rem] font-semibold tracking-[0.04em] uppercase text-[#d97706]">clamped</span>
                    )}
                  </span>
                  <span className="inline-flex items-baseline gap-1.5 flex-none text-muted-foreground tabular-nums">
                    {timeLabel(entry.date.getHours(), entry.date.getMinutes())} {entry.date.getHours() < 12 ? "AM" : "PM"}
                    <span
                      className={
                        offsetLabel(entry.date) !== baseOffset
                          ? "text-[0.6875rem] text-[#d97706] font-semibold"
                          : "text-[0.6875rem] text-muted-foreground/70"
                      }
                    >
                      {offsetLabel(entry.date)}
                    </span>
                  </span>
                </motion.li>
              ),
            )}
          </ol>
        </div>

        {/* Blueprint annotations (blue = the word glide, red = the calendar math). */}
        {inspect && (
          <>
            <span className="absolute bottom-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#bfdbfe] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#2563eb] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              words keyed text+occurrence · layout glide 300ms
            </span>
            <span className="absolute top-[calc(100%+0.4rem)] left-0 z-[6] whitespace-nowrap rounded-[0.25rem] border border-[#fecaca] bg-white px-[0.3125rem] py-[0.0625rem] text-[0.625rem] font-medium leading-normal tracking-[0.01em] text-[#dc2626] shadow-[0_1px_2px_rgba(0,0,0,0.08)] pointer-events-none tabular-nums">
              occurrences computed, never added · offsets straight from Date
            </span>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
