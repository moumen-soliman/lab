import { Figure, Guide, Dot, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * SHARE PERMISSIONS POPOVER figures. The
 * popover is the frame, rows are people, chips are the
 * only live targets. Amber marks where a stray click
 * could grant access; green marks the safe target.
 * ───────────────────────────────────────────────────────── */

// The stakes: this surface hands out access. A wrong click here is not
// a visual glitch; it is someone getting in.
export function FigSensitiveShare() {
  return (
    <Figure id="sp1" height={128}>
      <rect x="40" y="12" width="150" height="104" rx="10" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="52" y1="26" x2="110" y2="26" stroke="#d1d5db" strokeWidth="2.5" />
      <rect x="50" y="34" width="130" height="16" rx="5" fill="white" stroke="#d1d5db" strokeWidth="1" />
      {[58, 76, 94].map((y) => (
        <g key={y}>
          <circle cx="58" cy={y + 4} r="6" fill="white" stroke="#9ca3af" strokeWidth="1" />
          <line x1="70" y1={y + 4} x2="126" y2={y + 4} stroke="#d1d5db" strokeWidth="2.5" />
          <rect x="146" y={y - 2} width="26" height="13" rx="4" fill="white" stroke="#d1d5db" strokeWidth="1" />
        </g>
      ))}
      <rect x="48" y="71" width="134" height="17" fill={AMBER_FILL} />
      <path d="M104 76 v13 l3.2 -2.6 2 4.8 2.8 -1.2 -2 -4.8 4.4 -.4 Z" fill="#111" />
      <Guide y={12} label="SHARE = ACCESS" x1={196} />
      <Guide y={79} label="ONE WRONG CLICK" color={AMBER} x1={196} />
      <Dot x={40} y={12} />
      <Dot x={190} y={12} />
    </Figure>
  );
}

// The guard: rows are inert. Only a specific button acts, so a stray
// click on the person does exactly nothing.
export function FigButtonNotRow() {
  return (
    <Figure id="sp2" height={122}>
      {/* the risky version: the whole row is a target */}
      <rect x="40" y="16" width="176" height="22" rx="6" fill={AMBER_FILL} />
      <circle cx="54" cy="27" r="6" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <line x1="66" y1="27" x2="122" y2="27" stroke="#d1d5db" strokeWidth="2.5" />
      <rect x="178" y="20.5" width="30" height="13" rx="4" fill="white" stroke="#d1d5db" strokeWidth="1" />
      <path d="M138 26 v11 l2.6 -2.1 1.6 3.9 2.3 -1 -1.6 -3.9 3.6 -.3 Z" fill="#111" />
      <Guide y={27} label="ANY CLICK FIRES" color={AMBER} x1={224} />
      {/* the shipped version: the row is inert, the button is the target */}
      <rect x="40" y="64" width="176" height="22" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.25" />
      <circle cx="54" cy="75" r="6" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <line x1="66" y1="75" x2="122" y2="75" stroke="#d1d5db" strokeWidth="2.5" />
      <rect x="178" y="68.5" width="30" height="13" rx="4" fill={GREEN_FILL} stroke="#86efac" strokeWidth="1.25" />
      <path d="M190 79 v11 l2.6 -2.1 1.6 3.9 2.3 -1 -1.6 -3.9 3.6 -.3 Z" fill="#111" />
      <line x1="193" y1="90" x2="193" y2="100" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <Guide y={75} label="ROW INERT" x1={224} />
      <Guide y={100} label="BUTTON ONLY" x1={200} />
      <Dot x={40} y={64} />
      <Dot x={216} y={64} />
    </Figure>
  );
}

// Three different-sized views inside one floating frame: the frame eases
// its width and height between them.
export function FigThreeViews() {
  return (
    <Figure id="sp3" height={126}>
      <rect x="40" y="24" width="52" height="74" rx="8" fill="white" stroke="#111" strokeWidth="1.25" />
      <g stroke="#d1d5db" strokeWidth="2">
        <line x1="48" y1="38" x2="82" y2="38" />
        <line x1="48" y1="52" x2="76" y2="52" />
        <line x1="48" y1="66" x2="80" y2="66" />
      </g>
      <rect x="112" y="34" width="64" height="56" rx="8" fill="white" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <g stroke="#e5e7eb" strokeWidth="2">
        <line x1="122" y1="48" x2="164" y2="48" />
        <line x1="122" y1="62" x2="156" y2="62" />
      </g>
      <rect x="196" y="44" width="52" height="40" rx="8" fill="white" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <line x1="206" y1="58" x2="238" y2="58" stroke="#e5e7eb" strokeWidth="2" />
      <path d="M96 60 L108 60" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M104.5 57 L108 60 L104.5 63" stroke="#2563eb" strokeWidth="1" fill="none" />
      <path d="M180 60 L192 60" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M188.5 57 L192 60 L188.5 63" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={24} label="SHARE LIST" x1={96} />
      <Guide y={34} label="ROLE PICKER" x1={180} />
      <Guide y={44} label="LINK SETTINGS" x1={252} />
      <Guide y={112} label="MORPHS AS ONE" x1={40} />
      <Dot x={40} y={24} />
      <Dot x={92} y={24} />
    </Figure>
  );
}

// The animations.dev pattern: push slides in from the right while the
// frame's measured size eases, and focus is handed somewhere sensible.
export function FigFeedbackPopover() {
  return (
    <Figure id="sp4" height={118}>
      <rect x="40" y="20" width="88" height="56" rx="10" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <g stroke="#d1d5db" strokeWidth="2">
        <line x1="52" y1="36" x2="112" y2="36" />
        <line x1="52" y1="50" x2="100" y2="50" />
      </g>
      <path d="M132 48 L148 48" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M144.5 45 L148 48 L144.5 51" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="152" y="14" width="100" height="76" rx="10" fill="white" stroke="#111" strokeWidth="1.25" />
      <g stroke="#d1d5db" strokeWidth="2">
        <line x1="166" y1="32" x2="234" y2="32" />
        <line x1="166" y1="48" x2="222" y2="48" />
      </g>
      <path d="M246 44 L216 44" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <path d="M220 41 L216 44 L220 47" stroke="#2563eb" strokeWidth="1" fill="none" />
      <rect x="166" y="60" width="40" height="14" rx="4" fill="white" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="186" y1="78" x2="186" y2="100" stroke="#9ca3af" strokeWidth="1" strokeDasharray="2.5 2.5" />
      <Guide y={14} label="SIZE EASES · W+H" x1={256} />
      <Guide y={44} label="IN FROM THE RIGHT" x1={256} />
      <Guide y={100} label="FOCUS HANDED OFF" x1={192} />
      <Dot x={152} y={14} />
      <Dot x={252} y={14} />
    </Figure>
  );
}
