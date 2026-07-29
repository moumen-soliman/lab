import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * SCHEDULE BUILDER figures. Word pills are
 * the sentence, mono rows are real computed dates, amber
 * marks the calendar traps and the motion that got deleted.
 * ───────────────────────────────────────────────────────── */

// The ask: instructors scheduling lectures that repeat, week after week.
export function FigLectureWeeks() {
  return (
    <Figure id="sb1" height={108}>
      <g fontFamily={MONO} fontSize="7" fill="#9ca3af" textAnchor="middle">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <text key={i} x={46 + i * 28} y="20">
            {d}
          </text>
        ))}
      </g>
      <g fill="#fafafa" strokeWidth="1.25">
        <rect x="90" y="28" width="24" height="16" rx="4" stroke="#111" />
        <rect x="146" y="28" width="24" height="16" rx="4" stroke="#111" />
        <rect x="90" y="52" width="24" height="16" rx="4" stroke="#9ca3af" />
        <rect x="146" y="52" width="24" height="16" rx="4" stroke="#9ca3af" />
        <rect x="90" y="76" width="24" height="16" rx="4" stroke="#d1d5db" strokeDasharray="3 3" />
        <rect x="146" y="76" width="24" height="16" rx="4" stroke="#d1d5db" strokeDasharray="3 3" />
      </g>
      <Guide y={36} label="WEEK 1 · TUE+THU" x1={222} />
      <Guide y={60} label="WEEK 2 · SAME" x1={222} />
      <Guide y={84} label="KEEPS REPEATING" x1={222} />
      <Dot x={90} y={28} />
      <Dot x={114} y={28} />
    </Figure>
  );
}

// The survey: full event calendars and a date picker. All solid, and none
// of them answers "when does this lecture repeat?"
export function FigSchedulerSurvey() {
  return (
    <Figure id="sb2" height={130}>
      {/* the big event calendar */}
      <rect x="40" y="12" width="140" height="86" rx="6" fill="white" fillOpacity="0.5" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <line x1="40" y1="26" x2="180" y2="26" stroke="#e5e7eb" strokeWidth="1" />
      <g stroke="#e5e7eb" strokeWidth="1">
        {[64, 88, 112, 136, 160].map((x) => (
          <line key={x} x1={x} y1="26" x2={x} y2="98" />
        ))}
      </g>
      <g fill="#d1d5db">
        <rect x="66" y="34" width="36" height="8" rx="2" />
        <rect x="102" y="52" width="52" height="8" rx="2" />
        <rect x="44" y="70" width="32" height="8" rx="2" />
      </g>
      {/* the date picker */}
      <rect x="196" y="40" width="48" height="48" rx="6" fill="white" fillOpacity="0.5" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <g fill="#d1d5db">
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4, 5, 6].map((c) => (
            <circle key={`${r}-${c}`} cx={201 + c * 6.4} cy={51 + r * 9} r="1.3" />
          )),
        )}
      </g>
      {/* the missing piece */}
      <rect x="40" y="106" width="204" height="14" fill={AMBER_FILL} />
      <text x="52" y="115.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill={AMBER}>
        EVERY WEEK ON …?
      </text>
      <Guide y={20} label="FULL CALENDARS" x1={186} />
      <Guide y={52} label="DATE PICKER" x1={248} />
      <Guide y={113} label="NO RECURRENCE" color={AMBER} x1={248} />
      <Dia x={40} y={12} />
      <Dia x={180} y={12} />
      <Dia x={196} y={40} />
      <Dia x={244} y={40} />
    </Figure>
  );
}

// The clarity answer: the rule is a sentence. Edit one word and the
// survivors glide; nothing re-renders as a new string.
export function FigRuleSentence() {
  const pill = (x: number, y: number, w: number, key: boolean) => ({
    rect: { x, y, width: w, height: 16, rx: 8, fill: "white", stroke: key ? "#9ca3af" : "#d1d5db", strokeWidth: 1 },
    text: { x: x + w / 2, y: y + 11, fill: key ? "#111" : "#6b7280" },
  });
  const words: [string, number, number, number, boolean][] = [
    ["Every", 40, 20, 34, false],
    ["week", 80, 20, 29, true],
    ["on", 115, 20, 20, false],
    ["Tuesday", 141, 20, 44, true],
    ["and", 40, 48, 24, false],
    ["Thursday", 70, 48, 48, true],
    ["at", 124, 48, 20, false],
    ["9:00", 150, 48, 29, true],
    ["AM", 185, 48, 22, false],
  ];
  return (
    <Figure id="sb3" height={108}>
      {words.map(([word, x, y, w, key]) => {
        const p = pill(x, y, w, key);
        return (
          <g key={word}>
            <rect {...p.rect} />
            <text {...p.text} fontFamily={MONO} fontSize="8" textAnchor="middle">
              {word}
            </text>
          </g>
        );
      })}
      {/* the edit: "week" becoming "month" */}
      <path d="M94 38 L94 72" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M91 68 L94 72 L97 68" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="80" y="76" width="36" height="16" rx="8" fill="white" stroke="#2563eb" strokeWidth="1" strokeDasharray="3 2" />
      <text x="98" y="87" fontFamily={MONO} fontSize="8" fill="#2563eb" textAnchor="middle">
        month
      </text>
      {/* the rest of the sentence gliding, not re-entering */}
      <path d="M206 42 L172 42" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M176 39 L172 42 L176 45" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={28} label="READS AS ENGLISH" x1={192} />
      <Guide y={42} label="OTHERS GLIDE" x1={214} />
      <Guide y={84} label="EDIT ONE WORD" x1={124} />
      <Dot x={80} y={20} />
      <Dot x={109} y={20} />
    </Figure>
  );
}

// A sentence can lie; dates can't. The next runs render under the rule,
// computed from the real calendar.
export function FigProofList() {
  const rows = [
    ["TUE SEP 1 · 9:00 AM", 40],
    ["THU SEP 3 · 9:00 AM", 58],
    ["TUE SEP 8 · 9:00 AM", 76],
    ["THU SEP 10 · 9:00 AM", 94],
    ["TUE SEP 15 · 9:00 AM", 112],
  ] as const;
  return (
    <Figure id="sb4" height={130}>
      <line x1="40" y1="18" x2="170" y2="18" stroke="#111" strokeWidth="2.5" />
      <rect x="40" y="32" width="140" height="88" fill={GREEN_FILL} />
      {rows.map(([label, y]) => (
        <g key={label}>
          <circle cx="46" cy={y - 2.5} r="1.5" fill="#9ca3af" />
          <text x="54" y={y} fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#6b7280">
            {label}
          </text>
        </g>
      ))}
      <Guide y={18} label="THE SENTENCE" x1={178} />
      <Guide y={38} label="REAL DATES" x1={188} />
      <Guide y={110} label="THE PROOF" x1={188} />
      <Dot x={40} y={18} />
      <Dot x={170} y={18} />
    </Figure>
  );
}

// The traps a recurrence rule hides: months without a day 31, DST, and
// the policy choice between skipping and clamping.
export function FigCalendarTraps() {
  return (
    <Figure id="sb5" height={132}>
      <text x="40" y="16" fontFamily={MONO} fontSize="7.5" letterSpacing="0.5" fill="#111">
        EVERY MONTH ON DAY 31
      </text>
      <circle cx="46" cy="31.5" r="1.5" fill="#9ca3af" />
      <text x="54" y="34" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#6b7280">
        SAT AUG 31 · 9:00 AM
      </text>
      <rect x="40" y="44" width="156" height="14" fill={AMBER_FILL} />
      <text x="52" y="53.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill={AMBER}>
        SEPTEMBER HAS ONLY 30 DAYS
      </text>
      <circle cx="46" cy="67.5" r="1.5" fill="#9ca3af" />
      <text x="54" y="70" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#6b7280">
        FRI OCT 31 · 9:00 AM
      </text>
      <circle cx="46" cy="85.5" r="1.5" fill="#9ca3af" />
      <text x="54" y="88" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#6b7280">
        TUE MAR 31 · 9:00 AM
      </text>
      <text x="140" y="88" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill={AMBER}>
        GMT+3
      </text>
      <text x="40" y="112" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#9ca3af">
        OR CLAMP → SEP 30
      </text>
      <Guide y={51} label="SKIPPED · HONEST" color={AMBER} x1={204} />
      <Guide y={86} label="DST · SAME 9AM" x1={176} />
      <Guide y={110} label="THE OTHER POLICY" x1={124} />
      <Dot x={40} y={12} />
    </Figure>
  );
}

// The restraint: most motion candidates got deleted; the word glide is
// the one that carries information, so it stayed.
export function FigMotionRestraint() {
  const cut = (label: string, y: number, w: number) => (
    <g key={label}>
      <text x="40" y={y} fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#9ca3af">
        {label}
      </text>
      <line x1="38" y1={y - 2.5} x2={40 + w} y2={y - 2.5} stroke={AMBER} strokeWidth="1.25" />
    </g>
  );
  return (
    <Figure id="sb6" height={116}>
      {cut("BOUNCE IN", 28, 40)}
      {cut("STAGGER EVERY WORD", 48, 78)}
      {cut("PULSE THE NEXT RUN", 68, 78)}
      <rect x="40" y="84" width="136" height="16" fill={GREEN_FILL} />
      <text x="52" y="95" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#111">
        WORD GLIDE · LAYOUT
      </text>
      <path d="M138 92 L158 92" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M154 89 L158 92 L154 95" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={48} label="DELETED" color={AMBER} x1={126} />
      <Guide y={92} label="THE ONE KEPT" x1={184} />
      <Dot x={40} y={84} />
    </Figure>
  );
}
