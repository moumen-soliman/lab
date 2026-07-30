import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * MORPHING CHECKOUT FLOW figures. The big rounded
 * rect is the one card the whole flow lives in, the thin
 * track under the tabs is the progress bar, and the pill at
 * the bottom right is the pay button. Ghost copies offset
 * left and right are a shake. Amber is the version that
 * jumped or failed; green is the container that survives
 * every step.
 * ───────────────────────────────────────────────────────── */

/** The flow's contents, sketched inside a box of any size: card, bar, fields, button. */
function BoxContents({ x, y, w, h, fill = 1 }: { x: number; y: number; w: number; h: number; fill?: number }) {
  const inner = w - 16;
  return (
    <g>
      <rect x={x + 8} y={y + 8} width={inner} height="22" rx="3" fill="#f4f4f5" stroke="#e5e7eb" strokeWidth="1" />
      <rect x={x + 8} y={y + 36} width={inner} height="3" rx="1.5" fill="#e5e7eb" />
      <rect x={x + 8} y={y + 36} width={(inner * fill) / 3} height="3" rx="1.5" fill="#111" />
      <rect x={x + 8} y={y + 46} width={inner} height="9" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x={x + 8} y={y + 59} width={inner} height="9" rx="2" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <rect x={x + w - 34} y={y + h - 18} width="26" height="10" rx="5" fill="#111" />
    </g>
  );
}

// Where it started: one component in a design system I built, correct and
// flat. This build is the same three steps with the motion rebuilt.
export function FigFromDesignSystem() {
  return (
    <Figure id="mc1" height={132}>
      {/* the design system it shipped in */}
      <rect x="36" y="14" width="84" height="98" rx="10" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      {[26, 52, 78].map((y) =>
        [44, 78].map((x) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width="30"
            height="18"
            rx="4"
            fill={x === 44 && y === 52 ? GREEN_FILL : "white"}
            stroke={x === 44 && y === 52 ? "#86efac" : "#e5e7eb"}
            strokeWidth={x === 44 && y === 52 ? 1.25 : 1}
          />
        )),
      )}
      <path d="M126 61 L158 61" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M154 58 L158 61 L154 64" stroke="#2563eb" strokeWidth="1" fill="none" />
      {/* the enhanced build */}
      <rect x="164" y="14" width="86" height="98" rx="12" fill="white" stroke="#111" strokeWidth="1.25" />
      <BoxContents x={164} y={14} w={86} h={98} />
      <Guide y={6} label="DESIGN SYSTEM" x1={124} />
      <Guide y={61} label="ENHANCED HERE" x1={254} />
      <Guide y={120} label="SAME 3 STEPS" x1={40} />
      <Dia x={36} y={14} />
      <Dia x={120} y={14} />
      <Dot x={164} y={14} />
      <Dot x={250} y={14} />
    </Figure>
  );
}

// The constraint that drove everything: stay small. One 22rem card, so the
// same component sits in a page or drops into a popup unchanged.
export function FigSmallEnough() {
  return (
    <Figure id="mc2" height={142}>
      {/* in a page */}
      <rect x="32" y="20" width="96" height="104" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4 3" />
      <rect x="40" y="32" width="80" height="80" rx="8" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <BoxContents x={40} y={32} w={80} h={80} />
      {/* in a popup, over its dimmed backdrop */}
      <rect x="142" y="20" width="104" height="104" rx="8" fill="#f4f4f5" stroke="#d1d5db" strokeWidth="1" />
      <rect x="154" y="32" width="80" height="80" rx="8" fill={GREEN_FILL} stroke="#86efac" strokeWidth="1.25" />
      <BoxContents x={154} y={32} w={80} h={80} />
      <Guide y={14} label="SMALL BY DESIGN" x1={40} />
      <Guide y={72} label="POPUP · SAME BOX" x1={250} />
      <Guide y={130} label="22REM MAX WIDTH" x1={40} />
      <Dia x={40} y={32} />
      <Dia x={120} y={32} />
      <Dot x={154} y={32} />
      <Dot x={234} y={32} />
    </Figure>
  );
}

// Small means the steps can't be screens. The box measures the active panel
// and eases to its px while the steps slide past each other.
export function FigOneBoxMorphs() {
  return (
    <Figure id="mc3" height={152}>
      {/* the flat version: three screens, and the page jumps between them */}
      <rect x="36" y="10" width="206" height="52" fill={AMBER_FILL} />
      {[40, 108, 176].map((x) => (
        <rect key={x} x={x} y="16" width="58" height="40" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      ))}
      <g stroke="#9ca3af" strokeWidth="1" fill="none">
        <path d="M100 36 L106 36 M103 33 L106 36 L103 39" />
        <path d="M168 36 L174 36 M171 33 L174 36 L171 39" />
      </g>
      <Guide y={36} label="3 SCREENS · JUMP" color={AMBER} x1={246} />
      {/* the shipped version: one container, measured then eased */}
      <path d="M52 76 L138 76" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M134 73 L138 76 L134 79" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="40" y="86" width="110" height="48" rx="8" fill={GREEN_FILL} stroke="#111" strokeWidth="1.25" />
      <g stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 3">
        <line x1="40" y1="106" x2="150" y2="106" />
        <line x1="40" y1="120" x2="150" y2="120" />
      </g>
      <Guide y={76} label="STEPS SLIDE PAST" x1={154} />
      <Guide y={106} label="MEASURED → EASED" x1={154} />
      <Guide y={142} label="3 HEIGHTS, 1 BOX" x1={40} />
      <Dot x={40} y={86} />
      <Dot x={150} y={86} />
    </Figure>
  );
}

// A payment wants to read formal, so the tabs get a second life as a
// progress bar: 1/3, 2/3, 3/3, green once the charge lands.
export function FigFormalBar() {
  return (
    <Figure id="mc4" height={136}>
      {/* the casual read: tabs in a pill */}
      <rect x="40" y="16" width="170" height="18" rx="9" fill="#f4f4f5" />
      <rect x="42" y="18" width="55" height="14" rx="7" fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <g fontFamily={MONO} fontSize="5.5" letterSpacing="0.4" textAnchor="middle">
        <text x="69" y="27.5" fill="#111">CARD</text>
        <text x="126" y="27.5" fill="#9ca3af">BILLING</text>
        <text x="183" y="27.5" fill="#9ca3af">CONFIRM</text>
      </g>
      <Guide y={25} label="TABS · CASUAL" x1={214} />
      {/* the formal read: the same three labels over a filling track */}
      <g fontFamily={MONO} fontSize="5.5" letterSpacing="0.4" textAnchor="middle" fill="#9ca3af">
        <text x="69" y="56">CARD</text>
        <text x="126" y="56">BILLING</text>
        <text x="183" y="56">CONFIRM</text>
      </g>
      {[
        { y: 66, fill: 57, color: "#111" },
        { y: 82, fill: 113, color: "#111" },
        { y: 98, fill: 170, color: "#16a34a" },
      ].map((track) => (
        <g key={track.y}>
          <rect x="40" y={track.y} width="170" height="4" rx="2" fill="#e5e7eb" />
          <rect x="40" y={track.y} width={track.fill} height="4" rx="2" fill={track.color} />
        </g>
      ))}
      <rect x="40" y="94" width="170" height="12" fill={GREEN_FILL} />
      <Guide y={68} label="1/3 · 2/3 · 3/3" x1={214} />
      <Guide y={100} label="PAID → GREEN" x1={214} />
      <Guide y={124} label="STEP = PROGRESS" x1={40} />
      <Dot x={40} y={16} />
      <Dot x={210} y={16} />
    </Figure>
  );
}

// A red border is information, not a feeling. Failures shake, and the shake
// is scoped to whatever is actually wrong.
export function FigShakeScope() {
  return (
    <Figure id="mc5" height={144}>
      {/* the number field shakes alone when a complete number fails Luhn */}
      {[48, 56].map((x) => (
        <rect key={x} x={x} y="20" width="140" height="22" rx="5" fill="none" stroke="rgba(220,38,38,0.22)" strokeWidth="1.25" />
      ))}
      <rect x="52" y="20" width="140" height="22" rx="5" fill="white" stroke="#dc2626" strokeWidth="1.25" />
      <text x="62" y="34.5" fontFamily={MONO} fontSize="9" fill="#111">
        4242 4242 4242 4241
      </text>
      <g stroke={AMBER} strokeWidth="1" fill="none">
        <path d="M40 31 h8 M40 31 l3 -2.5 M40 31 l3 2.5" />
        <path d="M204 31 h-8 M204 31 l-3 -2.5 M204 31 l-3 2.5" />
      </g>
      <rect x="52" y="48" width="86" height="14" fill={AMBER_FILL} />
      <text x="60" y="58" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill={AMBER}>
        LUHN ✗
      </text>
      <Guide y={12} label="±4PX · 320MS" x1={210} />
      <Guide y={55} label="FIELD SHAKES" color={AMBER} x1={210} />
      {/* the primary button shakes when the step won't validate, or the issuer says no */}
      {[136, 144].map((x) => (
        <rect key={x} x={x} y="78" width="64" height="22" rx="11" fill="rgba(17,17,17,0.14)" />
      ))}
      <rect x="140" y="78" width="64" height="22" rx="11" fill="#111" />
      <text x="172" y="92.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="white" textAnchor="middle">
        CONTINUE
      </text>
      <rect x="96" y="106" width="108" height="14" fill={AMBER_FILL} />
      <text x="104" y="116" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill={AMBER}>
        STEP INVALID · DECLINED
      </text>
      <Guide y={89} label="BUTTON SHAKES" color={AMBER} x1={214} />
      <Guide y={134} label="ONCE, THEN STILL" x1={40} />
      <Dot x={52} y={20} />
      <Dot x={192} y={20} />
    </Figure>
  );
}

// The charge has its own progress: the button's measured width collapses to a
// circle, then answers, then hands the retry back in place.
export function FigPayMorph() {
  return (
    <Figure id="mc6" height={146}>
      {/* idle → processing → paid */}
      <rect x="36" y="20" width="76" height="20" rx="10" fill="#111" />
      <text x="74" y="33.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="white" textAnchor="middle">
        PAY $149.00
      </text>
      <path d="M118 30 L134 30" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M130 27 L134 30 L130 33" stroke="#2563eb" strokeWidth="1" fill="none" />
      <circle cx="148" cy="30" r="10" fill="#111" />
      <circle cx="148" cy="30" r="5.5" stroke="rgba(255,255,255,0.32)" strokeWidth="2" fill="none" />
      <path d="M148 24.5 A5.5 5.5 0 0 1 153.5 30" stroke="white" strokeWidth="2" fill="none" />
      <path d="M164 30 L180 30" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M176 27 L180 30 L176 33" stroke="#2563eb" strokeWidth="1" fill="none" />
      <circle cx="194" cy="30" r="10" fill="#16a34a" />
      <path d="M189 30 l3.5 3.5 L200 26" stroke="white" strokeWidth="2" fill="none" />
      <Guide y={20} label="PX → 2.75REM" x1={210} />
      <Guide y={40} label="LABEL → SPIN → ✓" x1={210} />
      {/* declined → shake → back to the full-width button */}
      {[142, 154].map((x) => (
        <circle key={x} cx={x} cy="74" r="10" fill="rgba(220,38,38,0.16)" />
      ))}
      <circle cx="148" cy="74" r="10" fill="#dc2626" />
      <g stroke="white" strokeWidth="2" strokeLinecap="round">
        <path d="M144 70 L152 78" />
        <path d="M152 70 L144 78" />
      </g>
      <path d="M164 74 L178 74" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M174 71 L178 74 L174 77" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="178" y="64" width="68" height="20" rx="10" fill="none" stroke="#111" strokeWidth="1.25" strokeDasharray="4 3" />
      <text x="212" y="77.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="#111" textAnchor="middle">
        PAY $149.00
      </text>
      <Guide y={74} label="✕ · SHAKE · BACK" color={AMBER} x1={250} />
      <rect x="36" y="100" width="150" height="16" fill={GREEN_FILL} />
      <text x="46" y="110.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="#111">
        RETRY WITHOUT LEAVING
      </text>
      <Guide y={108} label="NO DEAD END" x1={192} />
      <Guide y={136} label="FOUR STATES" x1={40} />
      <Dot x={36} y={20} />
      <Dot x={112} y={20} />
    </Figure>
  );
}
