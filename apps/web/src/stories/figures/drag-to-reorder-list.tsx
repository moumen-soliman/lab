import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * DRAG-TO-REORDER LIST figures. Dashed rows are
 * empty slots, the solid row is the card in hand. Amber is
 * the jump a plain commit would cause; green is what the
 * drag keeps hold of, by pointer or by key.
 * ───────────────────────────────────────────────────────── */

/** The grip's three rules, drawn at the left edge of a row. */
function Grip({ x, y }: { x: number; y: number }) {
  return (
    <g stroke="#9ca3af" strokeWidth="1.25">
      <line x1={x} y1={y} x2={x + 8} y2={y} />
      <line x1={x} y1={y + 3} x2={x + 8} y2={y + 3} />
      <line x1={x} y1={y + 6} x2={x + 8} y2={y + 6} />
    </g>
  );
}

// The card follows the pointer with nothing in between, and the row it
// displaces glides exactly one slot out of the way.
export function FigRawFollow() {
  return (
    <Figure id="dr1" height={116}>
      {[16, 34, 52, 70].map((y) => (
        <rect key={y} x="44" y={y} width="136" height="14" rx="4" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 2" />
      ))}
      {/* the card in hand, lifted clear of the slot boundary it is crossing */}
      <rect x="56" y="44" width="136" height="16" rx="4" fill="white" stroke="#111" strokeWidth="1.25" />
      <Grip x={62} y={49} />
      <path d="M76 54 v11 l2.6 -2.1 1.6 3.9 2.3 -1 -1.6 -3.9 3.6 -.3 Z" fill="#111" />
      {/* the displaced row, gliding one slot down */}
      <path d="M198 52 L198 68" stroke="#16a34a" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M195 65 L198 68 L201 65" stroke="#16a34a" strokeWidth="1" fill="none" />
      <rect x="44" y="94" width="136" height="14" fill={GREEN_FILL} />
      <text x="52" y="103.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.4" fill="#111">
        NO EASING IN BETWEEN
      </text>
      <Guide y={12} label="FOUR SLOTS" x1={204} />
      <Guide y={52} label="RAW POINTER Y" x1={206} />
      <Guide y={70} label="SIBLING GLIDES" x1={206} />
      <Guide y={101} label="HAND = CARD" x1={186} />
      <Dot x={56} y={44} />
      <Dot x={192} y={44} />
    </Figure>
  );
}

// The drop is where a reorder normally jumps: the commit re-renders the list,
// so the card is put back at its old pixels and animated home.
export function FigFlipDrop() {
  return (
    <Figure id="dr2" height={112}>
      <rect x="44" y="16" width="110" height="14" rx="4" fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 2" />
      <rect x="44" y="38" width="110" height="16" rx="4" fill="white" stroke="#111" strokeWidth="1.25" />
      <Grip x={50} y={43} />
      <rect x="44" y="62" width="110" height="14" rx="4" fill="none" stroke="#9ca3af" strokeWidth="1" strokeDasharray="3 2" />
      {/* two hops, so neither arrow crosses the card it is describing */}
      <path d="M99 31 L99 36" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M96 33 L99 36 L102 33" stroke="#2563eb" strokeWidth="1" fill="none" />
      <path d="M99 55 L99 60" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M96 57 L99 60 L102 57" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="44" y="84" width="110" height="14" fill={AMBER_FILL} />
      <text x="52" y="93.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.4" fill={AMBER}>
        A PLAIN COMMIT JUMPS
      </text>
      <Guide y={23} label="FIRST: OLD RECT" x1={160} />
      <Guide y={46} label="INVERT TO IT" x1={160} />
      <Guide y={69} label="PLAY HOME" x1={160} />
      <Guide y={91} label="NOTHING JUMPS" x1={160} />
      <Dia x={44} y={16} />
      <Dia x={154} y={16} />
      <Dot x={44} y={38} />
      <Dot x={154} y={38} />
    </Figure>
  );
}

// The same reorder with no pointer at all: the grip is a real button, three
// keys drive it, and every move is spoken.
export function FigKeyboardTwin() {
  return (
    <Figure id="dr3" height={128}>
      <rect x="44" y="20" width="140" height="18" rx="5" fill="white" stroke="#d1d5db" strokeWidth="1.25" />
      <rect x="48" y="23" width="16" height="12" rx="3" fill="none" stroke="#2563eb" strokeWidth="1.25" strokeDasharray="3 2" />
      <Grip x={52} y={26} />
      <line x1="72" y1="29" x2="128" y2="29" stroke="#d1d5db" strokeWidth="2.5" />
      {[
        { y: 50, key: "SPACE", does: "GRABS" },
        { y: 66, key: "↑ ↓", does: "MOVES" },
        { y: 82, key: "ESC", does: "CANCELS" },
      ].map((row) => (
        <g key={row.y}>
          <rect x="44" y={row.y} width="34" height="12" rx="3" fill="#f4f4f5" stroke="#e5e7eb" strokeWidth="1" />
          <text x="61" y={row.y + 8.4} fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#111" textAnchor="middle">
            {row.key}
          </text>
          <text x="84" y={row.y + 8.4} fontFamily={MONO} fontSize="6" letterSpacing="0.4" fill="#6b7280">
            {row.does}
          </text>
        </g>
      ))}
      <rect x="44" y="100" width="150" height="14" fill={GREEN_FILL} />
      <text x="52" y="109.5" fontFamily={MONO} fontSize="6.5" letterSpacing="0.4" fill="#111">
        MOVED TO POSITION 3
      </text>
      <Guide y={29} label="GRIP TAKES FOCUS" x1={190} />
      <Guide y={68} label="ONE KEY EACH" x1={140} />
      <Guide y={107} label="MOVE ANNOUNCED" x1={200} />
      <Guide y={122} label="WITHOUT A MOUSE" x1={44} />
      <Dot x={44} y={20} />
      <Dot x={184} y={20} />
    </Figure>
  );
}
