import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL, LABEL_X } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * UNLIMITED NESTED MENU figures. Rounded rects are menus,
 * line segments are rows, and depth reads as panels stacked
 * down and to the right. Amber marks where the flat menu
 * and the fly-out ran out of room; green marks the context
 * the stack keeps.
 * ───────────────────────────────────────────────────────── */

// The menu that no longer fits: rows run past the limit line into amber.
export function FigWallOfRows() {
  return (
    <Figure id="sf1" height={140}>
      <rect x="40" y="10" width="132" height="102" rx="8" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="52" y1="24" x2="152" y2="24" />
        <line x1="52" y1="38" x2="136" y2="38" />
        <line x1="52" y1="52" x2="156" y2="52" />
        <line x1="52" y1="66" x2="130" y2="66" />
        <line x1="52" y1="80" x2="148" y2="80" />
        <line x1="52" y1="94" x2="140" y2="94" />
      </g>
      <rect x="40" y="112" width="132" height="22" fill={AMBER_FILL} />
      <g stroke="#d1d5db" strokeWidth="2.5" strokeDasharray="3 3">
        <line x1="52" y1="120" x2="146" y2="120" />
        <line x1="52" y1="128" x2="132" y2="128" />
      </g>
      <Guide y={10} label="MENU TOP" />
      <Guide y={112} label="LIMIT" />
      <text x={LABEL_X} y="126" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill={AMBER}>
        MORE OPTIONS
      </text>
      <Dot x={40} y={10} />
      <Dot x={172} y={10} />
      <Dot x={40} y={112} />
      <Dot x={172} y={112} />
    </Figure>
  );
}

// The 2022 reference: you can trace the outline, but there is no source.
export function FigPriorArt() {
  return (
    <Figure id="sf2" height={112}>
      <rect x="40" y="10" width="132" height="88" rx="8" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" fill="white" fillOpacity="0.5" />
      <g stroke="#d1d5db" strokeWidth="2.5" strokeDasharray="3 3">
        <line x1="52" y1="26" x2="130" y2="26" />
        <line x1="52" y1="42" x2="118" y2="42" />
        <line x1="52" y1="74" x2="124" y2="74" />
      </g>
      <text x="106" y="66" fontFamily={MONO} fontSize="18" fill="#9ca3af" textAnchor="middle">
        ?
      </text>
      <Guide y={10} label="SEEN IN 2022" />
      <Guide y={98} label="NO SOURCE" />
      <Dia x={40} y={10} />
      <Dia x={172} y={10} />
      <Dia x={40} y={98} />
      <Dia x={172} y={98} />
    </Figure>
  );
}

// Fly-outs handle a sub-menu or two fine; the pattern was never built for
// unbounded depth; past level two, every next panel is a question mark.
export function FigFlyoutDeadEnd() {
  return (
    <Figure id="sf3" height={142}>
      <rect x="126" y="48" width="126" height="88" rx="6" fill={AMBER_FILL} />
      <g>
        <rect x="24" y="14" width="60" height="56" rx="6" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
        <line x1="33" y1="27" x2="66" y2="27" stroke="#d1d5db" strokeWidth="2.5" />
        <line x1="33" y1="41" x2="58" y2="41" stroke="#d1d5db" strokeWidth="2.5" />
        <path d="M68 51 l5 5 l-5 5" stroke="#9ca3af" strokeWidth="1.5" />
      </g>
      <g>
        <rect x="78" y="34" width="60" height="56" rx="6" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
        <line x1="87" y1="47" x2="120" y2="47" stroke="#d1d5db" strokeWidth="2.5" />
        <line x1="87" y1="61" x2="112" y2="61" stroke="#d1d5db" strokeWidth="2.5" />
        <path d="M122 71 l5 5 l-5 5" stroke="#9ca3af" strokeWidth="1.5" />
      </g>
      <g>
        <rect x="132" y="54" width="60" height="56" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.25" strokeDasharray="3 3" />
        <line x1="141" y1="67" x2="172" y2="67" stroke="#e5e7eb" strokeWidth="2.5" />
        <path d="M176 91 l5 5 l-5 5" stroke="#d1d5db" strokeWidth="1.5" />
      </g>
      <g opacity="0.55">
        <rect x="186" y="74" width="60" height="56" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.25" strokeDasharray="3 3" />
        <text x="216" y="106" fontFamily={MONO} fontSize="13" fill="#d1d5db" textAnchor="middle">
          ?
        </text>
      </g>
      <Dot x={24} y={14} />
      <Dot x={84} y={14} />
      <Dia x={132} y={54} />
      <Dia x={186} y={74} />
      <Guide y={14} label="LEVEL 1 · OK" x1={88} x2={270} />
      <Guide y={34} label="LEVEL 2 · OK" x1={142} x2={270} />
      <Guide y={54} label="LEVEL 3 · ?" color={AMBER} x1={196} x2={270} />
      <Guide y={74} label="LEVEL N · ?" color={AMBER} x1={250} x2={270} />
    </Figure>
  );
}

// The sketch: the stack idea, drawn before it earned solid ink.
export function FigSketch() {
  return (
    <Figure id="sf4" height={128}>
      <rect x="40" y="12" width="110" height="64" rx="8" stroke="#d1d5db" strokeWidth="1.25" strokeDasharray="4 3" />
      <g stroke="#e5e7eb" strokeWidth="2.5" strokeDasharray="3 3">
        <line x1="52" y1="26" x2="130" y2="26" />
        <line x1="52" y1="60" x2="118" y2="60" />
      </g>
      <line x1="52" y1="44" x2="124" y2="44" stroke="#d1d5db" strokeWidth="2.5" strokeDasharray="3 3" />
      <rect x="64" y="44" width="110" height="72" rx="8" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" fill="white" fillOpacity="0.85" />
      <g stroke="#d1d5db" strokeWidth="2.5" strokeDasharray="3 3">
        <line x1="76" y1="58" x2="152" y2="58" />
        <line x1="76" y1="74" x2="140" y2="74" />
        <line x1="76" y1="90" x2="148" y2="90" />
        <line x1="76" y1="104" x2="134" y2="104" />
      </g>
      <Dia x={40} y={12} />
      <Dia x={150} y={12} />
      <Dia x={64} y={44} />
      <Dia x={174} y={44} />
      <Dia x={64} y={116} />
      <Dia x={174} y={116} />
      <Guide y={12} label="DRAFT 01" />
      <Guide y={44} label="STACK IN PLACE" />
    </Figure>
  );
}

// The breadcrumb trial: the trail knows the path, but back drops the stack.
export function FigBreadcrumb() {
  return (
    <Figure id="sf5" height={140}>
      <rect x="40" y="10" width="132" height="108" rx="8" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <g stroke="#111" strokeWidth="2.5">
        <line x1="52" y1="22" x2="66" y2="22" />
        <line x1="74" y1="22" x2="88" y2="22" />
        <line x1="96" y1="22" x2="110" y2="22" />
      </g>
      <path d="M68.5 18.5 l3.5 3.5 l-3.5 3.5 M90.5 18.5 l3.5 3.5 l-3.5 3.5" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="44" y1="30" x2="168" y2="30" stroke="#e5e7eb" strokeWidth="1" />
      <rect x="44" y="36" width="124" height="74" fill={AMBER_FILL} />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="52" y1="46" x2="150" y2="46" />
        <line x1="52" y1="60" x2="136" y2="60" />
        <line x1="52" y1="74" x2="154" y2="74" />
        <line x1="52" y1="88" x2="130" y2="88" />
        <line x1="52" y1="102" x2="144" y2="102" />
      </g>
      <Guide y={22} label="PATH TRAIL" x1={172} x2={270} />
      <line x1="172" y1="73" x2="270" y2="73" stroke="#111" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.55" />
      <text x={LABEL_X} y="75.5" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill={AMBER}>
        LOST ON BACK
      </text>
      <Dot x={52} y={22} />
      <Dot x={110} y={22} />
    </Figure>
  );
}

// The stack: levels line up like metrics; every parent is one click away.
export function FigStack() {
  return (
    <Figure id="sf6" height={136}>
      <rect x="40" y="12" width="156" height="20" fill={GREEN_FILL} />
      <rect x="40" y="32" width="156" height="20" fill={GREEN_FILL} />
      <g opacity="0.25">
        <rect x="40" y="12" width="132" height="56" rx="8" fill="white" stroke="#111" strokeWidth="1.25" />
        <line x1="52" y1="24" x2="140" y2="24" stroke="#111" strokeWidth="2.5" />
      </g>
      <g opacity="0.5">
        <rect x="52" y="32" width="132" height="56" rx="8" fill="white" stroke="#111" strokeWidth="1.25" />
        <line x1="64" y1="44" x2="152" y2="44" stroke="#111" strokeWidth="2.5" />
      </g>
      <rect x="64" y="52" width="132" height="72" rx="8" fill="white" stroke="#111" strokeWidth="1.25" />
      <line x1="76" y1="66" x2="140" y2="66" stroke="#111" strokeWidth="3" />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="76" y1="82" x2="164" y2="82" />
        <line x1="76" y1="96" x2="152" y2="96" />
        <line x1="76" y1="110" x2="158" y2="110" />
      </g>
      <Guide y={12} label="LEVEL 0" />
      <Guide y={32} label="LEVEL 1" />
      <Guide y={52} label="LEVEL 2 · OPEN" color="#111" />
      <Dot x={64} y={52} />
      <Dot x={196} y={52} />
    </Figure>
  );
}

// The one motion that stayed: the clicked row becomes the next header.
export function FigMorph() {
  return (
    <Figure id="sf7" height={128}>
      <rect x="40" y="10" width="120" height="76" rx="8" fill="#fafafa" stroke="#d1d5db" strokeWidth="1.25" />
      <line x1="52" y1="24" x2="140" y2="24" stroke="#e5e7eb" strokeWidth="2.5" />
      <line x1="52" y1="40" x2="116" y2="40" stroke="#111" strokeWidth="3" />
      <line x1="52" y1="56" x2="132" y2="56" stroke="#e5e7eb" strokeWidth="2.5" />
      <rect x="76" y="52" width="120" height="64" rx="8" fill="white" stroke="#111" strokeWidth="1.25" />
      <line x1="88" y1="66" x2="152" y2="66" stroke="#111" strokeWidth="3" />
      <g stroke="#d1d5db" strokeWidth="2.5">
        <line x1="88" y1="82" x2="172" y2="82" />
        <line x1="88" y1="96" x2="160" y2="96" />
      </g>
      <path d="M118 40 C 138 40 148 48 152 60" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M148.5 55.5 L152 60 L146.5 61.5" stroke="#2563eb" strokeWidth="1" />
      <Guide y={40} label="ROW" x1={164} x2={270} />
      <Guide y={66} label="= HEADER" color="#111" x1={200} x2={270} />
      <Dot x={52} y={40} />
      <Dot x={116} y={40} />
      <Dot x={88} y={66} />
      <Dot x={152} y={66} />
    </Figure>
  );
}
