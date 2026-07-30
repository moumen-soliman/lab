import { Figure, Guide, Dot, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * COMMAND PALETTE WITH ARGUMENT CHIPS figures. Small
 * rects in a row are chips: the pale one is the key, the
 * green one is the value the user picked. Amber is the raw
 * query language, and the version where every chip is its
 * own focusable element. Green is what survives: the picked
 * value, and the structure it leaves behind.
 * ───────────────────────────────────────────────────────── */

/** A key chip (pale) or a value chip (green, because the value is the kept context).
 *  `remove` reserves room on the right for the ✕ that takes the chip away again. */
function Chip({
  x,
  y,
  w,
  label,
  value = false,
  remove = false,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  value?: boolean;
  remove?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height="13"
        rx="3"
        fill={value ? GREEN_FILL : "#f4f4f5"}
        stroke={value ? "#86efac" : "#e5e7eb"}
        strokeWidth="1"
      />
      <text
        x={x + (w - (remove ? 12 : 0)) / 2}
        y={y + 8.8}
        fontFamily={MONO}
        fontSize="5.5"
        letterSpacing="0.3"
        fill={value ? "#111" : "#6b7280"}
        textAnchor="middle"
      >
        {label}
      </text>
      {remove && (
        <g stroke="#111" strokeWidth="0.9" strokeLinecap="round">
          <path d={`M${x + w - 9} ${y + 4.5} L${x + w - 5} ${y + 8.5}`} />
          <path d={`M${x + w - 5} ${y + 4.5} L${x + w - 9} ${y + 8.5}`} />
        </g>
      )}
    </g>
  );
}

// Where it came from: GitLab's search bar, where a filter is a key, an
// operator and a value you can see and remove.
export function FigGitlabTokens() {
  return (
    <Figure id="cp1" height={124}>
      <rect x="36" y="16" width="206" height="24" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      {/* the recent-searches button, then the divider GitLab puts after it */}
      <rect x="42" y="21" width="20" height="14" rx="4" fill="#fafafa" stroke="#d1d5db" strokeWidth="1" />
      <circle cx="49" cy="28" r="3.2" stroke="#6b7280" strokeWidth="1" fill="none" />
      <path d="M49 26.4 v1.8 h1.4" stroke="#6b7280" strokeWidth="1" fill="none" />
      <path d="M56.4 26.8 L58 28.4 L59.6 26.8" stroke="#6b7280" strokeWidth="1" fill="none" />
      <line x1="68" y1="18" x2="68" y2="38" stroke="#e5e7eb" strokeWidth="1" />
      {/* key · operator · value */}
      <Chip x={74} y={22} w={36} label="AUTHOR" />
      <Chip x={113} y={22} w={11} label="=" />
      <Chip x={127} y={22} w={78} label="MOUMEN SOLIMAN" value remove />
      {/* the field list it opens */}
      <rect x="138" y="50" width="102" height="60" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.25" />
      {[58, 68, 78, 88, 98].map((y, i) => (
        <g key={y}>
          <circle cx="148" cy={y} r="3" stroke="#9ca3af" strokeWidth="1" fill="none" />
          <line x1="157" y1={y} x2={157 + [38, 44, 34, 46, 40][i]} y2={y} stroke="#d1d5db" strokeWidth="2.5" />
        </g>
      ))}
      <Guide y={10} label="GITLAB SEARCH" x1={246} />
      <Guide y={28} label="KEY · OP · VALUE" x1={246} />
      <Guide y={116} label="THE MODEL I TOOK" x1={40} />
      <Dot x={36} y={16} />
      <Dot x={242} y={16} />
    </Figure>
  );
}

// The design-system requirement, and the tension in it: complex enough for a
// compound query, clear enough that nobody learns a syntax.
export function FigComplexButClear() {
  return (
    <Figure id="cp2" height={122}>
      <rect x="36" y="14" width="206" height="20" fill={AMBER_FILL} />
      <text x="44" y="27" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill={AMBER}>
        author:me AND label:bug AND due:&lt;7d
      </text>
      <Guide y={24} label="A QUERY LANGUAGE" color={AMBER} x1={246} />
      {/* the same query, built by picking */}
      <Chip x={40} y={54} w={32} label="AUTHOR" />
      <Chip x={75} y={54} w={44} label="MOUMEN S." value />
      <text x="130" y="62.8" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#9ca3af">
        AND
      </text>
      <Chip x={150} y={54} w={28} label="LABEL" />
      <Chip x={181} y={54} w={30} label="BUG" value />
      <text x="40" y="84.8" fontFamily={MONO} fontSize="6" letterSpacing="0.3" fill="#9ca3af">
        AND
      </text>
      <Chip x={60} y={76} w={44} label="MILESTONE" />
      <Chip x={107} y={76} w={30} label="16.2" value />
      <Guide y={60} label="SAME QUERY" x1={215} />
      <Guide y={82} label="NOTHING TO LEARN" x1={141} />
      <Guide y={112} label="STILL READABLE" x1={40} />
      <Dot x={40} y={54} />
      <Dot x={211} y={54} />
    </Figure>
  );
}

// What keeps it clear once it gets long: the palette has exactly one
// focusable control for its whole life, and the chips are paint.
export function FigOneTabStop() {
  return (
    <Figure id="cp3" height={132}>
      {/* the obvious build: every chip is focusable, so the tab order fractures */}
      {[48, 90, 132, 174].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y="19" width="42" height="20" rx="5" fill="none" stroke={AMBER} strokeWidth="1" strokeDasharray="3 2" />
          <rect x={x} y="22" width="36" height="14" rx="3" fill="white" stroke="#d1d5db" strokeWidth="1" />
          <text x={x + 18} y="14" fontFamily={MONO} fontSize="5.5" fill={AMBER} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
      <rect x="44" y="44" width="170" height="13" fill={AMBER_FILL} />
      <text x="52" y="52.8" fontFamily={MONO} fontSize="6" letterSpacing="0.4" fill={AMBER}>
        TAB ORDER FRACTURES
      </text>
      <Guide y={29} label="4 TAB STOPS" color={AMBER} x1={218} />
      {/* the shipped build: one input, chips painted inside it */}
      <rect x="40" y="70" width="178" height="30" rx="9" fill="none" stroke="#2563eb" strokeWidth="1.25" strokeDasharray="4 3" />
      <rect x="44" y="74" width="170" height="22" rx="6" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <text x="42" y="66" fontFamily={MONO} fontSize="5.5" fill="#2563eb">
        1
      </text>
      <Chip x={50} y={78} w={34} label="ASSIGN" />
      <Chip x={87} y={78} w={46} label="SARAH CHEN" value />
      <line x1="140" y1="80" x2="140" y2="90" stroke="#111" strokeWidth="1.5" />
      <path d="M136 108 L96 108" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M100 105 L96 108 L100 111" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={85} label="ONE TAB STOP" x1={222} />
      <Guide y={108} label="BACKSPACE POPS" x1={222} />
      <Guide y={124} label="CHIPS ARE PAINT" x1={40} />
      <Dot x={44} y={74} />
      <Dot x={214} y={74} />
    </Figure>
  );
}

// The ending: nothing runs while you build. Apply hands the stack over as
// data, not as a string somebody has to parse.
export function FigJsonOut() {
  return (
    <Figure id="cp4" height={128}>
      <Chip x={36} y={22} w={40} label="ASSIGN TO" />
      <Chip x={79} y={22} w={48} label="SARAH CHEN" value />
      <Chip x={130} y={22} w={34} label="URGENT" value />
      <rect x="36" y="46" width="44" height="15" rx="7.5" fill="#111" />
      <text x="58" y="55.5" fontFamily={MONO} fontSize="5.5" letterSpacing="0.3" fill="white" textAnchor="middle">
        ✓ APPLY
      </text>
      <text x="86" y="55.5" fontFamily={MONO} fontSize="5.5" letterSpacing="0.3" fill="#9ca3af">
        ⌘⏎
      </text>
      <path d="M58 65 L58 70" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M55 67 L58 70 L61 67" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="36" y="74" width="180" height="38" fill={GREEN_FILL} />
      <g fontFamily={MONO} fontSize="5.5" letterSpacing="0.2" fill="#111">
        <text x="44" y="84">[{`{ "id": "assign",`}</text>
        <text x="44" y="94">{`   "assignee": "Sarah Chen",`}</text>
        <text x="44" y="104">{`   "priority": "Urgent" }]`}</text>
      </g>
      <Guide y={28} label="STAGED, NOT RUN" x1={170} />
      <Guide y={53} label="APPLY · ⌘⏎" x1={170} />
      <Guide y={94} label="READY TO POST" x1={222} />
      <Guide y={122} label="NOT A STRING" x1={40} />
      <Dot x={36} y={22} />
      <Dot x={164} y={22} />
    </Figure>
  );
}
