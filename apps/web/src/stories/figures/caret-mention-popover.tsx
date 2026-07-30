import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * CARET-ANCHORED MENTION POPOVER figures. Grey line
 * segments are wrapped text, the black tick is the caret.
 * Amber is the "@" that must not open anything, and the
 * roster that suggests everybody. Green is the trigger that
 * counts and the shortlist it should be.
 * ───────────────────────────────────────────────────────── */

// Detecting a real mention: the "@" only counts at a boundary, so an email
// address never opens the popover.
export function FigRealAt() {
  return (
    <Figure id="cm1" height={112}>
      {/* the one that must stay shut */}
      <rect x="40" y="16" width="104" height="18" fill={AMBER_FILL} />
      <text x="46" y="28.5" fontFamily={MONO} fontSize="9" fill="#6b7280">
        me@example.com
      </text>
      <line x1="56.5" y1="31.5" x2="64.5" y2="31.5" stroke={AMBER} strokeWidth="1.5" />
      <Guide y={25} label="NOT A MENTION" color={AMBER} x1={148} />
      {/* the one that counts */}
      <rect x="40" y="52" width="70" height="18" fill={GREEN_FILL} />
      <text x="46" y="64.5" fontFamily={MONO} fontSize="9" fill="#111">
        hey @sar
      </text>
      <line x1="103" y1="55" x2="103" y2="67" stroke="#111" strokeWidth="1.5" />
      <line x1="67.5" y1="67.5" x2="75.5" y2="67.5" stroke="#16a34a" strokeWidth="1.5" />
      <Guide y={61} label="SPACE, THEN @" x1={116} />
      {/* the rule itself */}
      <text x="40" y="94" fontFamily={MONO} fontSize="7" letterSpacing="0.3" fill="#111">
        {String.raw`(?:^|[\s([{])@([\w-]*)$`}
      </text>
      <Guide y={104} label="BOUNDARY OR START" x1={40} />
      <Dot x={40} y={52} />
      <Dot x={110} y={52} />
    </Figure>
  );
}

// A textarea only gives you a character index, so an invisible mirror takes the
// field's own width and typography and reports where the caret landed.
export function FigMirrorWidth() {
  return (
    <Figure id="cm2" height={130}>
      {/* the field: wrapped text, caret mid-line */}
      <rect x="40" y="22" width="160" height="46" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="48" y1="32" x2="192" y2="32" />
        <line x1="48" y1="44" x2="146" y2="44" />
      </g>
      <line x1="152" y1="38" x2="152" y2="50" stroke="#111" strokeWidth="1.5" />
      {/* the shared width both the mirror and the clamp are built from */}
      <g stroke="#2563eb" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.8">
        <line x1="40" y1="14" x2="40" y2="112" />
        <line x1="200" y1="14" x2="200" y2="112" />
      </g>
      {/* the popover, clamped to the field's right edge, origin still at the caret */}
      <rect x="118" y="74" width="82" height="34" rx="6" fill={GREEN_FILL} stroke="#86efac" strokeWidth="1.25" />
      {[82, 92, 102].map((y) => (
        <g key={y}>
          <circle cx="128" cy={y} r="2.6" stroke="#9ca3af" strokeWidth="1" fill="none" />
          <line x1="136" y1={y} x2={136 + [40, 32, 36][[82, 92, 102].indexOf(y)]} y2={y} stroke="#d1d5db" strokeWidth="2.5" />
        </g>
      ))}
      <path d="M152 52 L152 72" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M149 69 L152 72 L155 69" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={14} label="SAME WRAP WIDTH" x1={204} />
      <Guide y={44} label="CARET = OFFSET" x1={204} />
      <Guide y={90} label="CLAMPED INSIDE" x1={204} />
      <Guide y={122} label="ORIGIN AT THE @" x1={40} />
      <Dia x={40} y={22} />
      <Dia x={200} y={22} />
      <Dot x={118} y={74} />
      <Dot x={200} y={74} />
    </Figure>
  );
}

// What is still weak: the list offers the whole roster where it should offer
// the few people already in this thread.
export function FigListShortlist() {
  return (
    <Figure id="cm3" height={116}>
      {/* every name in the workspace */}
      <rect x="36" y="14" width="80" height="88" rx="6" fill={AMBER_FILL} stroke="rgba(217,119,6,0.35)" strokeWidth="1" />
      {[24, 38, 52, 66, 80, 94].map((y) => (
        <g key={y}>
          <circle cx="48" cy={y} r="3.4" stroke="#9ca3af" strokeWidth="1" fill="white" />
          <line x1="57" y1={y} x2={57 + [44, 38, 46, 36, 42, 40][[24, 38, 52, 66, 80, 94].indexOf(y)]} y2={y} stroke="#d1d5db" strokeWidth="2.5" />
        </g>
      ))}
      <path d="M126 58 L154 58" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M150 55 L154 58 L150 61" stroke="#2563eb" strokeWidth="1" fill="none" />
      {/* only the people in this conversation */}
      <rect x="162" y="36" width="80" height="46" rx="6" fill={GREEN_FILL} stroke="#86efac" strokeWidth="1.25" />
      {[48, 62, 76].map((y) => (
        <g key={y}>
          <circle cx="174" cy={y - 3} r="3.4" stroke="#16a34a" strokeWidth="1" fill="white" />
          <line x1="183" y1={y - 3} x2={183 + [44, 38, 42][[48, 62, 76].indexOf(y)]} y2={y - 3} stroke="#d1d5db" strokeWidth="2.5" />
        </g>
      ))}
      <Guide y={10} label="WHOLE ROSTER" color={AMBER} x1={246} />
      <Guide y={58} label="THIS THREAD ONLY" x1={246} />
      <Guide y={110} label="STILL TO BUILD" x1={40} />
      <Dot x={162} y={36} />
      <Dot x={242} y={36} />
    </Figure>
  );
}
