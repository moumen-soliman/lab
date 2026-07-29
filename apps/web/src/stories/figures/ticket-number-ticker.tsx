import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * TICKET NUMBER TICKER figures. Rounded
 * rects are pills, mono text is the id itself, amber marks
 * the copy misses and the lost tail, green marks what the
 * pill keeps.
 * ───────────────────────────────────────────────────────── */

// The Jira itch: clicking the id opens the ticket; the copy affordance
// hands you the whole URL. All you wanted was the number.
export function FigTicketCopyMiss() {
  return (
    <Figure id="tt1" height={128}>
      {/* the issue row */}
      <rect x="40" y="12" width="196" height="28" rx="6" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <text x="50" y="30" fontFamily={MONO} fontSize="9" fill="#111">
        PROJ-142
      </text>
      <line x1="112" y1="26" x2="224" y2="26" stroke="#d1d5db" strokeWidth="2.5" />
      {/* the cursor, right on the id */}
      <path d="M82 34 v13 l3.2 -2.6 2 4.8 2.8 -1.2 -2 -4.8 4.4 -.4 Z" fill="#111" />
      {/* callout spine branching to the two wrong outcomes */}
      <g stroke="#9ca3af" strokeWidth="1" strokeDasharray="2.5 2.5">
        <line x1="52" y1="48" x2="52" y2="104" />
        <line x1="52" y1="68" x2="64" y2="68" />
        <line x1="52" y1="104" x2="64" y2="104" />
      </g>
      {/* outcome 1: the ticket opens */}
      <rect x="64" y="54" width="112" height="28" rx="4" fill={AMBER_FILL} />
      <g stroke="#d1d5db" strokeWidth="2">
        <line x1="72" y1="62" x2="150" y2="62" />
        <line x1="72" y1="69" x2="136" y2="69" />
        <line x1="72" y1="76" x2="144" y2="76" />
      </g>
      {/* outcome 2: the full URL lands in the clipboard */}
      <rect x="64" y="96" width="112" height="16" rx="4" fill={AMBER_FILL} />
      <line x1="72" y1="104" x2="168" y2="104" stroke={AMBER} strokeWidth="2" strokeDasharray="3 3" opacity="0.7" />
      <Guide y={26} label="TICKET ID" x1={242} />
      <Guide y={68} label="MISS → OPENS" color={AMBER} x1={180} />
      <Guide y={104} label="COPY → FULL URL" color={AMBER} x1={180} />
      <Dot x={40} y={12} />
      <Dot x={236} y={12} />
    </Figure>
  );
}

// The experiment: the id as a component of its own. One click, number only.
export function FigCopyPill() {
  return (
    <Figure id="tt2" height={100}>
      <rect x="40" y="24" width="132" height="32" rx="16" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <rect x="48" y="30" width="78" height="20" fill={GREEN_FILL} />
      <text x="54" y="45" fontFamily={MONO} fontSize="11" fill="#111">
        #1042
      </text>
      {/* the copy button, inside the pill */}
      <rect x="134" y="30" width="22" height="20" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <g stroke="#6b7280" strokeWidth="1" fill="none">
        <rect x="140" y="35" width="6" height="6" rx="1" />
        <rect x="143" y="38" width="6" height="6" rx="1" />
      </g>
      {/* click → just the number in the clipboard */}
      <path d="M158 56 C 168 66 174 70 182 74" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M176.5 72 L182 74 L178 78" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="186" y="66" width="44" height="16" fill={GREEN_FILL} />
      <text x="190" y="78" fontFamily={MONO} fontSize="10" fill="#111">
        #1042
      </text>
      <Guide y={40} label="ONE CLICK" x1={178} />
      <Guide y={74} label="NUMBER, NOT URL" x1={234} />
      <Dot x={40} y={24} />
      <Dot x={172} y={24} />
    </Figure>
  );
}

// The second itch: the merge state of the ticket, readable without opening
// anything. GitHub's own four PR states, GitHub's own colours.
export function FigStatusBadge() {
  return (
    <Figure id="tt3" height={120}>
      <rect x="40" y="30" width="150" height="32" rx="16" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <text x="52" y="51" fontFamily={MONO} fontSize="11" fill="#111">
        #1042
      </text>
      {/* the status badge (merged) */}
      <rect x="126" y="36" width="20" height="20" rx="6" fill="rgba(130,80,223,0.10)" stroke="#8250df" strokeWidth="1" />
      <g stroke="#8250df" strokeWidth="1.2" fill="none">
        <circle cx="132" cy="42" r="1.6" />
        <path d="M132 44 v8 M132 46 a7 7 0 0 0 7 5" />
        <circle cx="140" cy="50" r="1.6" />
      </g>
      {/* the copy button beside it */}
      <rect x="152" y="36" width="20" height="20" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <g stroke="#6b7280" strokeWidth="1" fill="none">
        <rect x="157" y="41" width="6" height="6" rx="1" />
        <rect x="160" y="44" width="6" height="6" rx="1" />
      </g>
      {/* the four states it can cycle through */}
      <g strokeWidth="1" fill="none">
        <rect x="64" y="84" width="18" height="18" rx="5" stroke="#1a7f37" fill="rgba(26,127,55,0.08)" />
        <rect x="90" y="84" width="18" height="18" rx="5" stroke="#57606a" fill="rgba(87,96,106,0.08)" />
        <rect x="116" y="84" width="18" height="18" rx="5" stroke="#8250df" fill="rgba(130,80,223,0.08)" />
        <rect x="142" y="84" width="18" height="18" rx="5" stroke="#cf222e" fill="rgba(207,34,46,0.08)" />
      </g>
      <path d="M164 93 h10" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <Guide y={46} label="PR STATE" x1={196} />
      <Guide y={93} label={"GITHUB’S 4 STATES"} x1={178} />
      <Dot x={40} y={30} />
      <Dot x={190} y={30} />
    </Figure>
  );
}

// End-ellipsis keeps the prefix everyone shares and drops the digits that
// tell tickets apart; the SHA / wallet idiom keeps both ends instead.
export function FigMiddleTruncate() {
  return (
    <Figure id="tt4" height={116}>
      {/* end truncation: the identifying tail is gone */}
      <text x="48" y="34" fontFamily={MONO} fontSize="11" fill="#111">
        #10000000…
      </text>
      <rect x="116" y="24" width="32" height="14" fill={AMBER_FILL} />
      <text x="120" y="34" fontFamily={MONO} fontSize="11" fill={AMBER} opacity="0.9">
        0042
      </text>
      <Guide y={30} label="TAIL LOST" color={AMBER} x1={156} />
      <Dia x={42} y={29} />
      {/* middle truncation: both ends survive */}
      <rect x="46" y="72" width="44" height="14" fill={GREEN_FILL} />
      <rect x="93" y="72" width="30" height="14" fill={GREEN_FILL} />
      <text x="48" y="82" fontFamily={MONO} fontSize="11" fill="#111">
        #10000
      </text>
      <text x="87.5" y="82" fontFamily={MONO} fontSize="11" fill="#9ca3af">
        …
      </text>
      <text x="94.5" y="82" fontFamily={MONO} fontSize="11" fill="#111">
        0042
      </text>
      <Guide y={78} label="ENDS KEPT" x1={140} />
      <Guide y={104} label="SHA·WALLET IDIOM" x1={48} />
      <Dot x={42} y={77} />
    </Figure>
  );
}

// The fit is measured, not guessed: a hidden clone binary-searches the
// longest `#start…end` that fits the cap's budget, before paint.
export function FigMeasureBudget() {
  return (
    <Figure id="tt5" height={130}>
      {/* the cap the value must fit inside */}
      <line x1="176" y1="10" x2="176" y2="100" stroke="#111" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.55" />
      {/* the hidden clone the candidates render into */}
      <rect x="40" y="20" width="204" height="76" rx="6" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 3" fill="none" />
      {/* candidate: too wide */}
      <line x1="52" y1="36" x2="176" y2="36" stroke="#d1d5db" strokeWidth="3" />
      <line x1="178" y1="36" x2="232" y2="36" stroke={AMBER} strokeWidth="3" strokeDasharray="3 3" opacity="0.7" />
      <Dia x={46} y={36} />
      {/* candidate: fits, but short */}
      <line x1="52" y1="58" x2="118" y2="58" stroke="#d1d5db" strokeWidth="3" />
      <Dia x={46} y={58} />
      {/* the winner: the last one that fits */}
      <rect x="50" y="72" width="124" height="16" fill={GREEN_FILL} />
      <line x1="52" y1="80" x2="170" y2="80" stroke="#111" strokeWidth="3" />
      <Dot x={46} y={80} />
      <Guide y={10} label="CAP − CHROME" x1={180} />
      <Guide y={36} label="TRY 12 · WIDE" color={AMBER} x1={240} />
      <Guide y={58} label="TRY 6 · FITS" x1={126} />
      <Guide y={80} label="KEEP 9 · MAX FIT" x1={182} />
      <Guide y={112} label="CLONE · PRE-PAINT" x1={40} />
    </Figure>
  );
}

// The run-up: each digit is a reel, a 1em window over a 0-9 strip, snapped
// to zero and released a full turn, settling left→right.
export function FigReelRunUp() {
  return (
    <Figure id="tt6" height={140}>
      {/* the columns that already settled */}
      <g stroke="#9ca3af" strokeWidth="1" fill="none">
        <rect x="48" y="58" width="20" height="26" rx="4" />
        <rect x="74" y="58" width="20" height="26" rx="4" />
        <rect x="100" y="58" width="20" height="26" rx="4" />
      </g>
      <g fontFamily={MONO} fontSize="11" fill="#111" textAnchor="middle">
        <text x="58" y="75">1</text>
        <text x="84" y="75">0</text>
        <text x="110" y="75">4</text>
      </g>
      {/* the reel still rolling: the strip behind the window */}
      <g fontFamily={MONO} fontSize="9" fill="#9ca3af" textAnchor="middle">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
          <text key={n} x="146" y={22 + i * 11}>
            {n}
          </text>
        ))}
      </g>
      <rect x="134" y="35" width="24" height="13" fill="none" stroke="#111" strokeWidth="1.25" />
      {/* the full-turn travel */}
      <path d="M164 22 L164 112" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M161 107 L164 112 L167 107" stroke="#2563eb" strokeWidth="1" fill="none" />
      {/* the settle cascading left→right */}
      <path d="M58 92 C 80 102 102 102 124 94" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" fill="none" />
      <path d="M119 91.5 L124 94 L120.5 98.5" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={16} label="STRIP 0-9 ×2" x1={170} />
      <Guide y={41} label="WINDOW 1CH×1EM" x1={170} />
      <Guide y={98} label="SETTLE L→R" x1={170} />
      <Guide y={118} label="DELAY 55MS × i" x1={170} />
      <Dot x={134} y={35} />
      <Dot x={158} y={35} />
    </Figure>
  );
}
