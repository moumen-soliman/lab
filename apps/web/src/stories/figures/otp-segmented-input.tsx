import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * OTP SEGMENTED INPUT figures. Small rects
 * are the code cells, red dashes are the one real input,
 * green is the accepted cascade, amber is the rejection
 * and everything the six-inputs version breaks.
 * ───────────────────────────────────────────────────────── */

// The experiment: one tiny universal moment, the two seconds after the
// last digit lands.
export function FigOtpMoment() {
  return (
    <Figure id="ot1" height={100}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={40 + i * 30}
          y="24"
          width="24"
          height="32"
          rx="6"
          fill="#fafafa"
          stroke={i === 3 ? "#111" : "#d1d5db"}
          strokeWidth="1.25"
        />
      ))}
      <g fontFamily={MONO} fontSize="13" fill="#111" textAnchor="middle">
        <text x="52" y="45">2</text>
        <text x="82" y="45">4</text>
        <text x="112" y="45">6</text>
      </g>
      <line x1="142" y1="31" x2="142" y2="49" stroke="#111" strokeWidth="1.5" />
      <Guide y={24} label="SIX CELLS" x1={220} />
      <Guide y={40} label="CARET · CELL 4" x1={220} />
      <Dot x={130} y={24} />
      <Dot x={154} y={24} />
    </Figure>
  );
}

// The driving detail: the code is on the phone, the eyes are on the phone,
// and the screen still has to be readable from a distance.
export function FigGlanceDistance() {
  return (
    <Figure id="ot2" height={118}>
      {/* the phone, where the attention is */}
      <rect x="44" y="20" width="30" height="54" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <rect x="50" y="30" width="18" height="11" rx="3" fill="#fafafa" stroke="#d1d5db" strokeWidth="1" />
      <text x="59" y="37.5" fontFamily={MONO} fontSize="5" fill="#6b7280" textAnchor="middle">
        246810
      </text>
      {/* the screen, far away, still broadcasting the result */}
      <rect x="130" y="24" width="104" height="64" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="182" y1="88" x2="182" y2="96" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="168" y1="96" x2="196" y2="96" stroke="#9ca3af" strokeWidth="1.25" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect
          key={i}
          x={140 + i * 15}
          y="48"
          width="12"
          height="16"
          rx="3"
          fill={i < 3 ? GREEN_FILL : "white"}
          stroke={i < 3 ? "#86efac" : "#d1d5db"}
          strokeWidth="1.25"
        />
      ))}
      <path d="M78 42 C 96 32 112 34 128 42" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" fill="none" />
      <Guide y={18} label="CODE ON PHONE" x1={80} />
      <Guide y={56} label="RESULT READS FAR" x1={238} />
      <Guide y={106} label="EYES AWAY · CLEAR" x1={40} />
      <Dia x={44} y={20} />
      <Dia x={74} y={20} />
      <Dot x={130} y={24} />
      <Dot x={234} y={24} />
    </Figure>
  );
}

// The version everyone demos: six inputs and JS focus hops. Looks right,
// fights the platform on autofill, paste and accessibility.
export function FigSixInputsTrap() {
  return (
    <Figure id="ot3" height={116}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={40 + i * 30} y="30" width="24" height="30" rx="5" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path d={`M${54 + i * 30} 28 C ${60 + i * 30} 20 ${64 + i * 30} 20 ${70 + i * 30} 28`} stroke="#9ca3af" strokeWidth="1" fill="none" />
          <path d={`M${66.5 + i * 30} 24.5 L${70 + i * 30} 28 L${65.5 + i * 30} 28.5`} stroke="#9ca3af" strokeWidth="1" fill="none" />
        </g>
      ))}
      <rect x="40" y="76" width="174" height="26" fill={AMBER_FILL} />
      <g fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill={AMBER}>
        <text x="50" y="92">AUTOFILL ✗</text>
        <text x="110" y="92">PASTE ✗</text>
        <text x="162" y="92">A11Y ✗</text>
      </g>
      <Guide y={22} label="5 FOCUS HOPS" x1={220} />
      <Guide y={45} label="SIX INPUTS" x1={220} />
      <Guide y={89} label="EVERYTHING FIGHTS" color={AMBER} x1={220} />
      <Dia x={40} y={30} />
      <Dia x={214} y={30} />
    </Figure>
  );
}

// The hard version: one real input stretched invisibly over the row, cells
// painted underneath. Autofill, paste and the native caret come free.
export function FigOneRealInput() {
  const digits = ["2", "4", "6", "8", "1", "0"];
  return (
    <Figure id="ot4" height={120}>
      {digits.map((d, i) => (
        <g key={i}>
          <rect x={40 + i * 30} y="36" width="24" height="32" rx="6" fill="#fafafa" stroke="#d1d5db" strokeWidth="1.25" />
          <text x={52 + i * 30} y="57" fontFamily={MONO} fontSize="13" fill="#9ca3af" textAnchor="middle">
            {d}
          </text>
        </g>
      ))}
      <rect x="36" y="30" width="184" height="44" rx="8" fill="none" stroke="#dc2626" strokeWidth="1.25" strokeDasharray="4 3" />
      <rect x="40" y="92" width="176" height="16" fill={GREEN_FILL} />
      <text x="48" y="102.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="#111">
        AUTOFILL ✓ · PASTE ✓ · CARET ✓
      </text>
      <Guide y={30} label="1 REAL INPUT" color="#dc2626" x1={224} />
      <Guide y={52} label="CELLS = PAINT" x1={224} />
      <Guide y={100} label="ALL FREE" x1={224} />
      <Dot x={36} y={30} />
      <Dot x={220} y={30} />
    </Figure>
  );
}

// The professional-motion budget: decoration gets cut; the two movements
// that state a fact stay.
export function FigMeaningMotion() {
  const cut = (label: string, y: number, w: number) => (
    <g key={label}>
      <text x="40" y={y} fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#9ca3af">
        {label}
      </text>
      <line x1="38" y1={y - 2.5} x2={40 + w} y2={y - 2.5} stroke={AMBER} strokeWidth="1.25" />
    </g>
  );
  return (
    <Figure id="ot5" height={126}>
      {cut("CONFETTI ON SUCCESS", 26, 80)}
      {cut("BOUNCE EVERY KEYSTROKE", 46, 92)}
      {cut("GLOW PULSE THE ROW", 66, 78)}
      <rect x="40" y="82" width="150" height="14" fill={GREEN_FILL} />
      <text x="52" y="92" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="#111">
        CASCADE = ACCEPTED
      </text>
      <rect x="40" y="100" width="150" height="14" fill={GREEN_FILL} />
      <text x="52" y="110" fontFamily={MONO} fontSize="6.5" letterSpacing="0.5" fill="#111">
        SHAKE+DROP = REJECTED
      </text>
      <Guide y={46} label="DECORATION · CUT" color={AMBER} x1={140} />
      <Guide y={96} label="MOTION = MEANING" x1={196} />
      <Dot x={40} y={82} />
    </Figure>
  );
}

// The two endings, both readable from across the desk: green sweeps left
// to right, or the row shakes and the digits fall out.
export function FigTwoEndings() {
  const greenDigits = ["2", "4", "6", "8", "1", "0"];
  return (
    <Figure id="ot6" height={148}>
      {/* right: the cascade */}
      {greenDigits.map((d, i) => (
        <g key={i}>
          <rect
            x={40 + i * 26}
            y="14"
            width="22"
            height="28"
            rx="5"
            fill={i < 4 ? GREEN_FILL : "white"}
            stroke={i < 4 ? "#86efac" : "#d1d5db"}
            strokeWidth="1.25"
          />
          <text x={51 + i * 26} y="33" fontFamily={MONO} fontSize="12" fill={i < 4 ? "#16a34a" : "#111"} textAnchor="middle">
            {d}
          </text>
        </g>
      ))}
      <path d="M44 50 L146 50" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M142 47 L146 50 L142 53" stroke="#2563eb" strokeWidth="1" fill="none" />
      {/* wrong: the shake, then the drop */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={45 + i * 26} y="70" width="22" height="28" rx="5" fill="white" stroke="rgba(220,38,38,0.5)" strokeWidth="1.25" />
      ))}
      <g fontFamily={MONO} fontSize="12" fill="#6b7280" textAnchor="middle">
        <text x="134" y="89">8</text>
        <text x="160" y="89">1</text>
        <text x="186" y="89">0</text>
      </g>
      <g stroke="#dc2626" strokeWidth="1" fill="none">
        <path d="M34 64 h8 M34 64 l3 -2.5 M34 64 l3 2.5" />
        <path d="M30 58 h8 M38 58 l-3 -2.5 M38 58 l-3 2.5" />
      </g>
      <rect x="45" y="104" width="88" height="18" fill={AMBER_FILL} />
      <g fontFamily={MONO} fontSize="11" fill="#9ca3af" textAnchor="middle">
        <text x="56" y="117">2</text>
        <text x="82" y="118">4</text>
        <text x="108" y="116">6</text>
      </g>
      <g stroke="#d1d5db" strokeWidth="1" strokeDasharray="2 2">
        <line x1="56" y1="98" x2="56" y2="106" />
        <line x1="82" y1="98" x2="82" y2="107" />
        <line x1="108" y1="98" x2="108" y2="105" />
      </g>
      <Guide y={22} label="RIGHT · CASCADE" x1={200} />
      <Guide y={50} label="L → R · 55MS" x1={160} />
      <Guide y={78} label="WRONG · SHAKE" color={AMBER} x1={205} />
      <Guide y={114} label="DIGITS DROP OUT" color={AMBER} x1={185} />
      <Guide y={138} label="CARET HANDED BACK" x1={40} />
      <Dot x={40} y={14} />
      <Dot x={140} y={14} />
    </Figure>
  );
}
