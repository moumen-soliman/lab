import { Figure, Guide, Dot, Dia, MONO, AMBER, AMBER_FILL, GREEN_FILL } from "./primitives";

/* ─────────────────────────────────────────────────────────
 * FILE UPLOAD STAGING figures. Squares are
 * tiles, rings are progress arcs, amber marks failures and
 * the things the tab is not allowed to do, green marks the
 * tiles that made it.
 * ───────────────────────────────────────────────────────── */

// The design-system ask: a dropzone plus a place for files to live after.
export function FigStagingRequest() {
  return (
    <Figure id="fu1" height={126}>
      <rect x="40" y="12" width="156" height="44" rx="8" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" strokeDasharray="4 3" />
      <g stroke="#6b7280" strokeWidth="1.5" fill="none">
        <path d="M118 44 V28" />
        <path d="M112 34 l6 -6 6 6" />
        <path d="M104 46 h28" />
      </g>
      <g fill="none" strokeWidth="1.25">
        <rect x="40" y="68" width="34" height="34" rx="6" stroke="#9ca3af" />
        <rect x="82" y="68" width="34" height="34" rx="6" stroke="#9ca3af" />
        <rect x="124" y="68" width="34" height="34" rx="6" stroke="#d1d5db" strokeDasharray="3 3" />
        <rect x="166" y="68" width="34" height="34" rx="6" stroke="#d1d5db" strokeDasharray="3 3" />
      </g>
      <g stroke="#d1d5db" strokeWidth="2">
        <line x1="48" y1="94" x2="66" y2="94" />
        <line x1="90" y1="94" x2="108" y2="94" />
      </g>
      <Guide y={34} label="DROP · BROWSE" x1={202} />
      <Guide y={85} label="STAGED TILES" x1={206} />
      <Dot x={40} y={12} />
      <Dot x={196} y={12} />
      <Dia x={124} y={68} />
      <Dia x={200} y={68} />
    </Figure>
  );
}

// The constraint that shaped everything: one tab, open all day, files
// trickling in, and no reload or popup allowed to reset the state.
export function FigLongLivedTab() {
  return (
    <Figure id="fu2" height={124}>
      {/* the browser chrome, one active tab */}
      <rect x="40" y="12" width="190" height="18" rx="4" fill="#fafafa" stroke="#9ca3af" strokeWidth="1.25" />
      <rect x="46" y="15" width="34" height="12" rx="3" fill="white" stroke="#111" strokeWidth="1" />
      <rect x="86" y="15" width="28" height="12" rx="3" fill="none" stroke="#d1d5db" strokeWidth="1" />
      <rect x="120" y="15" width="28" height="12" rx="3" fill="none" stroke="#d1d5db" strokeWidth="1" />
      {/* the day: files landing on the same timeline */}
      <line x1="48" y1="64" x2="230" y2="64" stroke="#d1d5db" strokeWidth="1.5" />
      <g strokeWidth="1.25" fill="white">
        <rect x="58" y="50" width="8" height="8" rx="2" stroke="#86efac" />
        <rect x="94" y="50" width="8" height="8" rx="2" stroke="#9ca3af" />
        <rect x="130" y="50" width="8" height="8" rx="2" stroke="#dc2626" />
        <rect x="168" y="50" width="8" height="8" rx="2" stroke="#9ca3af" />
        <rect x="204" y="50" width="8" height="8" rx="2" stroke="#d1d5db" strokeDasharray="2.5 2.5" />
      </g>
      <g stroke="#d1d5db" strokeWidth="1">
        <line x1="62" y1="58" x2="62" y2="64" />
        <line x1="98" y1="58" x2="98" y2="64" />
        <line x1="134" y1="58" x2="134" y2="64" />
        <line x1="172" y1="58" x2="172" y2="64" />
        <line x1="208" y1="58" x2="208" y2="64" />
      </g>
      {/* the two escapes the requirement takes away: reload and the popup */}
      <g stroke="#9ca3af" strokeWidth="1.5" fill="none">
        <path d="M156 98 A7 7 0 1 1 152 91.4" />
        <path d="M156.5 89.5 l-0.8 3.6 l-3.5 -1" />
      </g>
      <line x1="141" y1="107" x2="159" y2="89" stroke={AMBER} strokeWidth="1.5" />
      <rect x="176" y="90" width="20" height="16" rx="2" fill="white" stroke="#9ca3af" strokeWidth="1.25" />
      <line x1="178" y1="94.5" x2="194" y2="94.5" stroke="#d1d5db" strokeWidth="1" />
      <line x1="172" y1="110" x2="200" y2="86" stroke={AMBER} strokeWidth="1.5" />
      <Guide y={21} label="ONE TAB · ALL DAY" x1={234} />
      <Guide y={54} label="FILES KEEP COMING" x1={218} />
      <Guide y={98} label="NO RELOAD · POPUP" color={AMBER} x1={204} />
      <Dot x={46} y={15} />
      <Dot x={80} y={15} />
    </Figure>
  );
}

// Focus one: done and not-yet must read at a glance. Four rows, four
// states, and the failed one says exactly where it stopped.
export function FigStateGlance() {
  const C = 2 * Math.PI * 10;
  return (
    <Figure id="fu3" height={144}>
      {/* queued: the gray track, waiting */}
      <circle cx="56" cy="24" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <line x1="76" y1="22" x2="150" y2="22" stroke="#d1d5db" strokeWidth="2.5" />
      {/* uploading: the arc drawing, live percent */}
      <circle cx="56" cy="56" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle
        cx="56" cy="56" r="10" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - 0.62)} transform="rotate(-90 56 56)"
      />
      <line x1="76" y1="54" x2="150" y2="54" stroke="#d1d5db" strokeWidth="2.5" />
      {/* done: green edge, the check drawn in */}
      <rect x="40" y="76" width="126" height="24" fill={GREEN_FILL} />
      <circle cx="56" cy="88" r="10" fill="none" stroke="#86efac" strokeWidth="2.5" />
      <path d="M51.5 88.5 l3 3 l6 -7" stroke="#16a34a" strokeWidth="2" fill="none" />
      <line x1="76" y1="86" x2="150" y2="86" stroke="#d1d5db" strokeWidth="2.5" />
      {/* error: red arc frozen where it stopped */}
      <rect x="40" y="108" width="126" height="24" fill={AMBER_FILL} />
      <circle cx="56" cy="120" r="10" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle
        cx="56" cy="120" r="10" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - 0.43)} transform="rotate(-90 56 120)"
      />
      <line x1="76" y1="118" x2="150" y2="118" stroke="#d1d5db" strokeWidth="2.5" />
      <Guide y={24} label="QUEUED" x1={160} />
      <Guide y={56} label="UPLOADING · 62%" x1={160} />
      <Guide y={88} label="DONE · CHECK" x1={160} />
      <Guide y={120} label="FROZEN AT 43%" color={AMBER} x1={160} />
      <Dot x={56} y={14} />
    </Figure>
  );
}

// Honest progress: jittery like a real network, a stall now and then,
// but forward only, and 100 is the only way to complete.
export function FigHonestProgress() {
  return (
    <Figure id="fu4" height={128}>
      <line x1="44" y1="16" x2="44" y2="104" stroke="#d1d5db" strokeWidth="1" />
      <line x1="44" y1="104" x2="240" y2="104" stroke="#d1d5db" strokeWidth="1" />
      <line x1="44" y1="20" x2="210" y2="20" stroke="#d1d5db" strokeWidth="1" strokeDasharray="3 3" />
      <path
        d="M48 104 L58 99 L64 96 L72 95 L80 88 L88 86 L96 85 L100 85 L124 85 L132 77 L140 74 L148 67 L156 65 L164 58 L172 52 L180 47 L188 39 L196 33 L204 26 L210 22"
        stroke="#111" strokeWidth="1.5" fill="none"
      />
      <text x="112" y="79" fontFamily={MONO} fontSize="6" letterSpacing="0.5" fill="#6b7280" textAnchor="middle">
        STALL
      </text>
      <Guide y={20} label="100 = ONLY DONE" x1={214} />
      <Guide y={104} label="FORWARD ONLY" x1={244} />
      <Dia x={48} y={104} />
      <Dot x={210} y={22} />
    </Figure>
  );
}

// Retry resumes from the frozen percent; the arc never rewinds, because
// an arc that rewinds tells the customer their progress was fake.
export function FigRetryResume() {
  const C = 2 * Math.PI * 16;
  return (
    <Figure id="fu5" height={116}>
      {/* the failure, frozen at 43 */}
      <circle cx="80" cy="56" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
      <circle
        cx="80" cy="56" r="16" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - 0.43)} transform="rotate(-90 80 56)"
      />
      <g stroke="#dc2626" strokeWidth="1.5" fill="none">
        <path d="M85 56 A5 5 0 1 1 82.2 51.6" />
        <path d="M86 49.5 l-0.6 3.4 l-3.2 -0.8" />
      </g>
      <text x="80" y="94" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill={AMBER} textAnchor="middle">
        43%
      </text>
      {/* the retry, picking up where it stopped */}
      <path d="M104 52 C 130 36 150 36 166 50" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" fill="none" />
      <path d="M161 47 L166 50 L162.5 54.5" stroke="#2563eb" strokeWidth="1" fill="none" />
      <circle cx="190" cy="56" r="16" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round" />
      <path d="M182.5 57 l4.5 4.5 l9.5 -11" stroke="#16a34a" strokeWidth="2.5" fill="none" />
      <text x="190" y="94" fontFamily={MONO} fontSize="7" letterSpacing="0.5" fill="#6b7280" textAnchor="middle">
        100%
      </text>
      <Guide y={16} label="RETRY → RESUME" x1={150} />
      <Guide y={70.5} label="NO REWIND" x1={212} />
      <Dot x={86.8} y={70.5} />
      <Dia x={196.8} y={70.5} />
    </Figure>
  );
}

// The footer verbs a long-lived list needs: retry every red tile at once,
// sweep the green ones away, and let the survivors glide.
export function FigBatchVerbs() {
  const C = 2 * Math.PI * 5;
  return (
    <Figure id="fu6" height={150}>
      {/* the grid after a few hours: done, failed, still going */}
      <g fill="white" strokeWidth="1.25">
        <rect x="40" y="16" width="40" height="34" rx="6" stroke="#86efac" strokeDasharray="3 3" />
        <rect x="88" y="16" width="40" height="34" rx="6" stroke="rgba(220,38,38,0.5)" />
        <rect x="136" y="16" width="40" height="34" rx="6" stroke="#86efac" strokeDasharray="3 3" />
        <rect x="40" y="56" width="40" height="34" rx="6" stroke="#86efac" strokeDasharray="3 3" />
        <rect x="88" y="56" width="40" height="34" rx="6" stroke="rgba(220,38,38,0.5)" />
        <rect x="136" y="56" width="40" height="34" rx="6" stroke="#9ca3af" />
      </g>
      <g stroke="#e5e7eb" strokeWidth="2">
        <line x1="48" y1="41" x2="72" y2="41" />
        <line x1="96" y1="41" x2="120" y2="41" />
        <line x1="144" y1="41" x2="168" y2="41" />
        <line x1="48" y1="81" x2="72" y2="81" />
        <line x1="96" y1="81" x2="120" y2="81" />
        <line x1="144" y1="81" x2="168" y2="81" />
      </g>
      <g fill="none">
        <path d="M57 28.5 l2.5 2.5 l5 -6" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M153 28.5 l2.5 2.5 l5 -6" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M57 68.5 l2.5 2.5 l5 -6" stroke="#16a34a" strokeWidth="1.5" />
        <circle cx="108" cy="28" r="5" stroke="#dc2626" strokeWidth="1.5" strokeDasharray={`${C * 0.43} ${C}`} transform="rotate(-90 108 28)" />
        <circle cx="108" cy="68" r="5" stroke="#dc2626" strokeWidth="1.5" strokeDasharray={`${C * 0.61} ${C}`} transform="rotate(-90 108 68)" />
        <circle cx="156" cy="68" r="5" stroke="#111" strokeWidth="1.5" strokeDasharray={`${C * 0.5} ${C}`} transform="rotate(-90 156 68)" />
      </g>
      {/* the verbs */}
      <rect x="40" y="108" width="64" height="18" rx="9" fill="white" stroke="#111" strokeWidth="1" />
      <text x="72" y="119.5" fontFamily={MONO} fontSize="6" letterSpacing="0.5" fill="#111" textAnchor="middle">
        RETRY FAILED
      </text>
      <rect x="112" y="108" width="60" height="18" rx="9" fill="white" stroke="#9ca3af" strokeWidth="1" />
      <text x="142" y="119.5" fontFamily={MONO} fontSize="6" letterSpacing="0.5" fill="#6b7280" textAnchor="middle">
        CLEAR DONE
      </text>
      <path d="M70 106 C 80 100 100 96 106 92" stroke="#2563eb" strokeWidth="1" strokeDasharray="2.5 2.5" fill="none" />
      <path d="M101.5 92.5 L106 92 L104.5 96.5" stroke="#2563eb" strokeWidth="1" fill="none" />
      <Guide y={22} label="2 FAILED → RETRY" color={AMBER} x1={184} />
      <Guide y={64} label="3 DONE → CLEAR" x1={184} />
      <Guide y={117} label="BATCH VERBS" x1={180} />
      <Guide y={140} label="SURVIVORS GLIDE" x1={40} />
      <Dot x={136} y={56} />
    </Figure>
  );
}
