import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * INERTIAL WHEEL LIST figures. Rows narrow as they
 * leave the centre, the way the drum's scale and rotation
 * do; the two rules across the middle are the selection
 * frame. Amber is the second source of truth this build
 * refuses to keep; green is the row the scroll position
 * already names.
 * ───────────────────────────────────────────────────────── */

// The thing it is chasing: the alarm drum, biggest and sharpest at the
// centre, dissolving at the rim.
export function FigDrum() {
  const rows = [
    { y: 30, w: 80, label: "05 : 30", fill: "#d1d5db" },
    { y: 46, w: 96, label: "06 : 30", fill: "#9ca3af" },
    { y: 62, w: 110, label: "07 : 30", fill: "#111" },
    { y: 78, w: 96, label: "08 : 30", fill: "#9ca3af" },
    { y: 94, w: 80, label: "09 : 30", fill: "#d1d5db" },
  ];
  return (
    <Figure id="iw1" height={130}>
      {rows.map((row) => (
        <g key={row.y}>
          <rect x={110 - row.w / 2} y={row.y} width={row.w} height="14" rx="4" fill={row.y === 62 ? GREEN_FILL : "none"} stroke={row.y === 62 ? "#86efac" : "#e5e7eb"} strokeWidth="1" />
          <text x="110" y={row.y + 9.6} fontFamily={MONO} fontSize={row.y === 62 ? "8" : "7"} letterSpacing="0.4" fill={row.fill} textAnchor="middle">
            {row.label}
          </text>
        </g>
      ))}
      {/* the selection frame, the way the picker draws it */}
      <g stroke="#86efac" strokeWidth="1.25">
        <line x1="44" y1="60" x2="176" y2="60" />
        <line x1="44" y1="78" x2="176" y2="78" />
      </g>
      <Guide y={22} label="THE ALARM DRUM" x1={182} />
      <Guide y={69} label="CENTRE IS PICKED" x1={182} />
      <Guide y={101} label="ROTATEX ±38°" x1={182} />
      <Guide y={122} label="ONLY PAINT" x1={44} />
      <Dot x={55} y={62} />
      <Dot x={165} y={62} />
    </Figure>
  );
}

// Where the state lives. Keeping an index beside the scroll position gives
// you two things that can disagree; deriving it gives you one.
export function FigScrollIsState() {
  return (
    <Figure id="iw2" height={120}>
      <rect x="36" y="12" width="176" height="26" fill={AMBER_FILL} />
      <rect x="42" y="16" width="62" height="18" rx="4" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <text x="73" y="27.5" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#6b7280" textAnchor="middle">
        SCROLLTOP
      </text>
      <rect x="144" y="16" width="62" height="18" rx="4" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <text x="175" y="27.5" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#6b7280" textAnchor="middle">
        INDEX = 3
      </text>
      <g stroke={AMBER} strokeWidth="1.25" strokeLinecap="round">
        <path d="M118 21 L130 33" />
        <path d="M130 21 L118 33" />
      </g>
      <Guide y={25} label="TWO CAN DISAGREE" color={AMBER} x1={216} />
      {/* one source, and the index read back out of it */}
      <rect x="42" y="56" width="72" height="18" rx="4" fill={GREEN_FILL} stroke="#86efac" strokeWidth="1.25" />
      <text x="78" y="67.5" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#111" textAnchor="middle">
        SCROLLTOP
      </text>
      {/* the index is read back out of it, so the arrow points at the formula */}
      <path d="M78 78 L78 86" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M75 83 L78 86 L81 83" stroke="#2563eb" strokeWidth="1" fill="none" />
      <text x="40" y="98" fontFamily={MONO} fontSize="7" letterSpacing="0.3" fill="#111">
        round(scrollTop / itemH)
      </text>
      <Guide y={65} label="ONE SOURCE" x1={216} />
      <Guide y={96} label="NEVER STORED" x1={158} />
      <Guide y={112} label="SCROLL IS STATE" x1={40} />
      <Dot x={42} y={56} />
      <Dot x={114} y={56} />
    </Figure>
  );
}

// Why a fling can't land between two items, and what commits the value when
// the engine has no scrollend to give.
export function FigSnapSettle() {
  return (
    <Figure id="iw3" height={116}>
      {/* the snap points */}
      <line x1="64" y1="16" x2="64" y2="94" stroke="#e5e7eb" strokeWidth="1" />
      {[20, 38, 56, 74, 90].map((y) => (
        <line key={y} x1="50" y1={y} x2="78" y2={y} stroke={y === 56 ? "#16a34a" : "#d1d5db"} strokeWidth={y === 56 ? 1.75 : 1.25} />
      ))}
      {/* the fling runs long, then the snap pulls it back onto the centre point */}
      <path d="M96 22 L96 74" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M93 71 L96 74 L99 71" stroke="#2563eb" strokeWidth="1" fill="none" />
      <path d="M108 74 L108 58" stroke="#16a34a" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M105 61 L108 58 L111 61" stroke="#16a34a" strokeWidth="1" fill="none" />
      <path d="M82 56 L104 56" stroke="#16a34a" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <rect x="118" y="88" width="118" height="14" fill={GREEN_FILL} />
      <text x="126" y="97.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.4" fill="#111">
        SCROLLEND · 140MS
      </text>
      <Guide y={16} label="SNAP MANDATORY" x1={122} />
      <Guide y={56} label="LANDS ON A TICK" x1={122} />
      <Guide y={95} label="OR A QUIET TIMER" x1={240} />
      <Guide y={110} label="ALWAYS SETTLES" x1={44} />
      <Dia x={64} y={20} />
      <Dia x={64} y={90} />
    </Figure>
  );
}
