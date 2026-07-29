import { Figure, Guide, Dot, Dia, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * SEARCH-EXPAND NAV figures. The wide rects
 * are the bar, circles are nav icons, amber marks the two
 * fixtures that taxed the screen, green marks the space
 * the content got back.
 * ───────────────────────────────────────────────────────── */

// The starting point at work: a fixed 80px rail plus a search pill
// floating over the content. Together they tax the screen.
export function FigScreenBudget() {
  return (
    <Figure id="sn1" height={128}>
      <rect x="40" y="12" width="24" height="104" rx="4" fill={AMBER_FILL} stroke="#9ca3af" strokeWidth="1.25" />
      {[28, 46, 64].map((y) => (
        <circle key={y} cx="52" cy={y} r="3.5" fill="white" stroke="#9ca3af" strokeWidth="1" />
      ))}
      <g stroke="#e5e7eb" strokeWidth="2.5">
        <line x1="76" y1="28" x2="230" y2="28" />
        <line x1="76" y1="44" x2="214" y2="44" />
        <line x1="76" y1="76" x2="206" y2="76" />
        <line x1="76" y1="92" x2="226" y2="92" />
        <line x1="76" y1="108" x2="198" y2="108" />
      </g>
      <rect x="117" y="49" width="106" height="24" rx="12" fill="none" stroke={AMBER} strokeWidth="1" strokeDasharray="3 3" />
      <rect x="120" y="52" width="100" height="18" rx="9" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <circle cx="132" cy="61" r="3" fill="none" stroke="#6b7280" strokeWidth="1.25" />
      <line x1="134.5" y1="63.5" x2="137" y2="66" stroke="#6b7280" strokeWidth="1.25" />
      <Guide y={16} label="RAIL · 80PX" color={AMBER} x1={70} />
      <Guide y={61} label="SEARCH FLOATS" color={AMBER} x1={228} />
      <Guide y={108} label="CONTENT SQUEEZED" x1={206} />
      <Dia x={40} y={12} />
      <Dia x={64} y={12} />
    </Figure>
  );
}

// The move: fold rail and search into one bottom bar. The 80px comes
// back to the content; nothing floats over it anymore.
export function FigBottomBar() {
  return (
    <Figure id="sn2" height={136}>
      <rect x="40" y="12" width="24" height="100" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1.25" strokeDasharray="4 3" />
      <rect x="44" y="24" width="196" height="64" fill={GREEN_FILL} />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="48" y1="32" x2="232" y2="32" />
        <line x1="48" y1="48" x2="216" y2="48" />
        <line x1="48" y1="64" x2="224" y2="64" />
        <line x1="48" y1="80" x2="208" y2="80" />
      </g>
      <rect x="60" y="100" width="160" height="24" rx="12" fill="white" stroke="#111" strokeWidth="1.25" />
      {[74, 90, 106].map((cx) => (
        <circle key={cx} cx={cx} cy="112" r="4" fill="none" stroke="#9ca3af" strokeWidth="1.25" />
      ))}
      <circle cx="124" cy="112" r="4.5" fill="#d1d5db" />
      <circle cx="204" cy="111" r="3.5" fill="none" stroke="#111" strokeWidth="1.25" />
      <line x1="206.5" y1="113.5" x2="209.5" y2="116.5" stroke="#111" strokeWidth="1.25" />
      <Guide y={16} label="RAIL REMOVED" x1={70} />
      <Guide y={56} label="CONTENT WINS" x1={248} />
      <Guide y={112} label="ONE BOTTOM BAR" x1={226} />
      <Dot x={60} y={100} />
      <Dot x={220} y={100} />
    </Figure>
  );
}

// The spark: a bottom nav seen on X. The resting shape was right; the
// motion is the part that got rebuilt.
export function FigNavInspiration() {
  return (
    <Figure id="sn3" height={112}>
      <rect x="40" y="12" width="150" height="84" rx="8" fill="white" fillOpacity="0.5" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <g stroke="#e5e7eb" strokeWidth="2.5" strokeDasharray="3 3">
        <line x1="52" y1="28" x2="170" y2="28" />
        <line x1="52" y1="42" x2="152" y2="42" />
      </g>
      <rect x="52" y="66" width="126" height="18" rx="9" fill="none" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="3 3" />
      {[64, 78, 92].map((cx) => (
        <circle key={cx} cx={cx} cy="75" r="3.5" fill="none" stroke="#d1d5db" strokeWidth="1.25" />
      ))}
      <circle cx="164" cy="74" r="3" fill="none" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="166" y1="76.5" x2="168.5" y2="79" stroke="#9ca3af" strokeWidth="1.25" />
      <Guide y={12} label="SEEN ON X" x1={196} />
      <Guide y={75} label="RESTING BAR" x1={196} />
      <Guide y={104} label="THE SPARK" x1={40} />
      <Dia x={40} y={12} />
      <Dia x={190} y={12} />
    </Figure>
  );
}

// The open, in two sequenced stages: the horizontal morph, then the
// vertical grow. One driving property each.
export function FigTwoStageMorph() {
  return (
    <Figure id="sn4" height={150}>
      {/* stage 1: the icon glides left while the chrome fades */}
      <rect x="40" y="22" width="176" height="24" rx="12" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      {[54, 70, 86].map((cx) => (
        <circle key={cx} cx={cx} cy="34" r="4" fill="none" stroke="#e5e7eb" strokeWidth="1.25" />
      ))}
      <circle cx="102" cy="34" r="4.5" fill="#f3f4f6" />
      <circle cx="200" cy="33" r="3.5" fill="none" stroke="#111" strokeWidth="1.25" />
      <line x1="202.5" y1="35.5" x2="205.5" y2="38.5" stroke="#111" strokeWidth="1.25" />
      <path d="M190 34 L60 34" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M64 31 L60 34 L64 37" stroke="#2563eb" strokeWidth="1" fill="none" />
      {/* stage 2: anchored to the bottom, the box grows upward */}
      <rect x="40" y="66" width="176" height="40" rx="8" fill="white" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <g stroke="#e5e7eb" strokeWidth="2">
        <line x1="52" y1="80" x2="150" y2="80" />
        <line x1="52" y1="94" x2="130" y2="94" />
      </g>
      <rect x="40" y="112" width="176" height="24" rx="12" fill="white" stroke="#111" strokeWidth="1.25" />
      <circle cx="54" cy="124" r="3.5" fill="none" stroke="#111" strokeWidth="1.25" />
      <line x1="56.5" y1="126.5" x2="59.5" y2="129.5" stroke="#111" strokeWidth="1.25" />
      <line x1="68" y1="124" x2="180" y2="124" stroke="#d1d5db" strokeWidth="2" />
      <path d="M201 121 l6 6 M207 121 l-6 6" stroke="#9ca3af" strokeWidth="1.25" />
      <path d="M228 110 L228 70" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M225 74 L228 70 L231 74" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={34} label="STAGE 1 · GLIDE" x1={224} />
      <Guide y={66} label="STAGE 2 · GROW ↑" x1={244} />
      <Guide y={124} label="ANCHORED BOTTOM" x1={224} />
      <Guide y={144} label="ONE PROP EACH" x1={40} />
      <Dot x={40} y={112} />
      <Dot x={216} y={112} />
    </Figure>
  );
}

// The addition: instead of the icon travelling the whole bar, the first
// icon rises and blurs into the search icon in place.
export function FigFlipUpgrade() {
  return (
    <Figure id="sn5" height={120}>
      {/* travel: the full-bar journey */}
      <rect x="40" y="18" width="176" height="22" rx="11" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <circle cx="200" cy="29" r="3.5" fill="none" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="202.5" y1="31.5" x2="205.5" y2="34.5" stroke="#9ca3af" strokeWidth="1.25" />
      <path d="M190 29 L58 29" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M62 26 L58 29 L62 32" stroke="#9ca3af" strokeWidth="1" fill="none" />
      {/* flip: the swap happens in place */}
      <rect x="40" y="64" width="176" height="22" rx="11" fill="white" stroke="#111" strokeWidth="1.25" />
      <rect x="44" y="58" width="22" height="32" rx="5" fill={GREEN_FILL} />
      <circle cx="55" cy="80" r="4" fill="none" stroke="#9ca3af" strokeWidth="1.25" opacity="0.45" />
      <path d="M55 74 L55 64" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M52 67 L55 64 L58 67" stroke="#2563eb" strokeWidth="1" fill="none" />
      <circle cx="55" cy="70" r="3.5" fill="none" stroke="#111" strokeWidth="1.25" />
      <line x1="57.5" y1="72.5" x2="60.5" y2="75.5" stroke="#111" strokeWidth="1.25" />
      <g stroke="#93c5fd" strokeWidth="1">
        <line x1="63" y1="63" x2="66" y2="60" />
        <line x1="65" y1="68" x2="69" y2="66" />
      </g>
      <Guide y={29} label="TRAVEL · FULL BAR" x1={224} />
      <Guide y={75} label="FLIP · IN PLACE" x1={224} />
      <Guide y={104} label="SHORTER = FASTER" x1={40} />
      <Dot x={40} y={64} />
      <Dot x={216} y={64} />
    </Figure>
  );
}
