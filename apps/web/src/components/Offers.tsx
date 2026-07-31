import type { CSSProperties } from "react";

/* The joke behind the joke. Pull the `why` out of the landing paragraph and
   this is what fills the space it left: a slow stream of messages from
   companies who read the whole thing instead of copying it, and would now
   like a word.

   Every message is built the way Slack builds one - avatar tile, sender in
   semibold with the clock time on its baseline, body wrapped under the name,
   reactions where a thread picked one up - and all of it ragged left.

   Nothing here reproduces anyone's logo. The tile is Slack's own fallback for
   a member with no photo: an initial on a flat color. `logos.tsx` holds this
   repo to shipping third-party lockups whole and framed, and artwork redrawn
   from memory for a gag is exactly what that rule exists to stop.

 * ─────────────────────────────────────────────────────────
 * OFFER STORYBOARD (per message, looping)
 *
 *    0%   parked 30% of its drift on the far side, invisible
 *   14%   landed, on the same arrival curve the page itself uses
 *   72%   still drifting, linear, AWAY from the middle of the viewport
 *  100%   gone, and it starts over
 *
 * Sixteen messages, sixteen durations sharing no common factor, so the stream
 * falls out of phase within a minute and stops reading as a loop.
 * ───────────────────────────────────────────────────────── */

interface Offer {
  /** The whole identity, set in Geist like every other name on this site. */
  sender: string;
  /** Slack's no-photo fallback: an initial on a flat color. Never a mark. Two
   *  letters where one would collide - GitHub and GreatFrontend share a G. */
  initial: string;
  /** Brand-adjacent, then darkened until white type on it clears 4.5:1. Six of
   *  these started at the published brand color and failed; a tile nobody can
   *  read is worth less than a tile that is a shade off. */
  tile: string;
  /** A clock time, not "2m ago" - Slack stamps messages, it doesn't age them. */
  time: string;
  message: string;
  /** Emoji and count, on the few that a thread picked up. */
  reactions?: [string, number][];
  /** Where the message parks, as absolute insets. See SPACING below. */
  spot: CSSProperties;
  /** Signed pixels: negative drifts up, positive drifts down. */
  drift: number;
  seconds: number;
  delay: number;
  /** The copy column is centered and 448px wide, so a message can only sit
   *  beside it on a viewport with real gutters. */
  gutter?: string;
}

/* ── SPACING ───────────────────────────────────────────────────────────────
   Sixteen cards floating in front of each other is a collision problem, and
   the tempting answer is wrong. "They all drift away from the middle, so
   neighbours travel together and hold their gap" only holds if they move in
   step, and these deliberately do not: each one runs its own duration off its
   own delay, so at any instant the upper card can be at the very start of its
   cycle while the lower one is at the very end.

   Take the worst case instead. A card lives between `-0.3 x drift`, where it
   enters, and `+drift`, where it leaves. Put the upper card at its lowest and
   the lower card at its highest on the same frame, and for a shared drift D:

       gap  >=  card height  +  1.3 x D

   Measured, the tallest card is 93px. At D = 20 a same-side pair needs 119px,
   and the ladder is 14% of the viewport - 126px at 900px tall - which clears
   it by 7px. Both columns run 2, 16, 30, 44, 58, 72, 86. The outermost slot
   on each takes D = 32, since the only pair it has to answer to is a full 14%
   below it.

   Direction is still away from the middle, which is what turns the pair
   straddling the halfway mark into the easy case rather than another tight one.

   Fourteen slots, sixteen messages: the last two sit centered in the bands
   above and below the copy, where the two columns leave a clean 272px of room
   between them at every width from `xl` up.

   Which tier a card belongs to is about the copy, not about other cards. The
   centered column is 448px wide and ~360px tall, so only the extreme top and
   bottom slots are clear at every width. `sm` buys the next slot in each band,
   and the middle band needs the real gutters that arrive at `xl`.
   ────────────────────────────────────────────────────────────────────────── */
const OFFERS: Offer[] = [
  {
    sender: "Anthropic",
    initial: "A",
    tile: "#b06046",
    time: "9:02",
    message: "Read all of it, dead ends included. Learned more than you did.",
    reactions: [
      ["👀", 4],
      ["🔥", 2],
    ],
    spot: { left: "5%", top: "2%" },
    drift: -32,
    seconds: 10,
    delay: 0.4,
  },
  {
    sender: "animations.dev",
    initial: "a",
    tile: "#7c3aed",
    time: "9:26",
    message: "Stepped through your easings frame by frame. Interview?",
    reactions: [["🎬", 9]],
    spot: { left: "42%", top: "2%" },
    drift: -32,
    seconds: 15,
    delay: 2.9,
    gutter: "hidden xl:block",
  },
  {
    sender: "Vercel",
    initial: "V",
    tile: "#111111",
    time: "9:14",
    message: "Read it, copied none of it. Come ship the next one here.",
    spot: { right: "5%", top: "2%" },
    drift: -32,
    seconds: 12,
    delay: 1.3,
    gutter: "hidden sm:block",
  },
  {
    sender: "OpenAI",
    initial: "O",
    tile: "#0d8467",
    time: "9:31",
    message: "Read the stories, not just the source. Felt something.",
    spot: { left: "6%", top: "16%" },
    drift: -20,
    seconds: 13,
    delay: 2.2,
    gutter: "hidden xl:block",
  },
  {
    sender: "Cursor",
    initial: "C",
    tile: "#2f2f2f",
    time: "9:47",
    message: "Tabbed through the whole repo. Nothing left to autocomplete.",
    reactions: [["😭", 7]],
    spot: { right: "4%", top: "16%" },
    drift: -20,
    seconds: 11,
    delay: 3.1,
    gutter: "hidden xl:block",
  },
  {
    sender: "Linear",
    initial: "L",
    tile: "#5e6ad2",
    time: "10:05",
    message: "Filed HIRE-1. Priority urgent. Assignee: you.",
    reactions: [["✅", 3]],
    spot: { left: "4%", top: "30%" },
    drift: -20,
    seconds: 14,
    delay: 0.9,
    gutter: "hidden xl:block",
  },
  {
    sender: "Stripe",
    initial: "S",
    tile: "#635bff",
    time: "10:18",
    message: "Payment link attached. You fill in the number.",
    spot: { right: "4%", top: "30%" },
    drift: -20,
    seconds: 12.5,
    delay: 3.8,
    gutter: "hidden xl:block",
  },
  {
    sender: "Mintlify",
    initial: "M",
    tile: "#0c865a",
    time: "10:33",
    message: "We already sponsor you. Now we would like to hire you.",
    spot: { left: "4%", top: "44%" },
    drift: -20,
    seconds: 9.5,
    delay: 1.8,
    gutter: "hidden xl:block",
  },
  {
    sender: "GreatFrontend",
    initial: "GF",
    tile: "#4338ca",
    time: "10:52",
    message: "We teach this pattern. You wrote it first. Awkward.",
    reactions: [["🎓", 5]],
    spot: { right: "4%", top: "44%" },
    drift: -20,
    seconds: 14.5,
    delay: 4.6,
    gutter: "hidden xl:block",
  },
  {
    sender: "Interface Craft",
    initial: "IC",
    tile: "#07809d",
    time: "11:03",
    message: "Read every storyboard comment. Interview? We bring the dials.",
    spot: { left: "4%", top: "58%" },
    drift: 20,
    seconds: 12.2,
    delay: 4.1,
    gutter: "hidden xl:block",
  },
  {
    sender: "Neon",
    initial: "N",
    tile: "#067a4a",
    time: "11:09",
    message: "Branched a whole database just to read the source.",
    spot: { right: "4%", top: "58%" },
    drift: 20,
    seconds: 11.5,
    delay: 2.7,
    gutter: "hidden xl:block",
  },
  {
    sender: "X",
    initial: "X",
    tile: "#177abe",
    time: "11:24",
    message: "Quote-posted the blueprint. 400 replies arguing about easing.",
    reactions: [["💀", 31]],
    spot: { left: "4%", top: "72%" },
    drift: 20,
    seconds: 10.5,
    delay: 3.5,
    gutter: "hidden xl:block",
  },
  {
    sender: "basement.studio",
    initial: "b",
    tile: "#4d7c0f",
    time: "11:47",
    message: "Your easing curves ruined our standup. Twice.",
    spot: { right: "4%", top: "72%" },
    drift: 20,
    seconds: 13.5,
    delay: 1.5,
    gutter: "hidden xl:block",
  },
  {
    sender: "Figma",
    initial: "F",
    tile: "#d3441a",
    time: "12:16",
    message: "Read the blueprint twice. Auto-layout has notes.",
    spot: { left: "5%", top: "86%" },
    drift: 32,
    seconds: 12.8,
    delay: 2.4,
    gutter: "hidden sm:block",
  },
  {
    sender: "GitHub",
    initial: "G",
    tile: "#181717",
    time: "12:41",
    message: "Starred it twice. Two accounts. Don’t ask.",
    reactions: [["⭐", 12]],
    spot: { right: "5%", top: "86%" },
    drift: 32,
    seconds: 11.8,
    delay: 0.7,
  },
  {
    sender: "Raycast",
    initial: "R",
    tile: "#c74d4d",
    time: "12:58",
    message: "Your palette opens faster than ours. Come explain how.",
    spot: { left: "42%", top: "86%" },
    drift: 32,
    seconds: 13.2,
    delay: 3.3,
    gutter: "hidden xl:block",
  },
];

/* The layer is `fixed` at -z-10, which puts it above the page's background and
   below every element in normal flow, so nothing here needs a z-index of its
   own and no stacking context has to be invented for the content.

   It stays mounted whether the egg is open or not and pauses rather than
   unmounting: a paused animation costs nothing per frame, and keeping the DOM
   lets closing the egg fade the stream out instead of blinking it away. */
export function Offers({ open }: { open: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-[400ms] ease-arrive ${
        open ? "opacity-100 delay-300" : "opacity-0 delay-0"
      }`}
    >
      {OFFERS.map(({ sender, initial, tile, time, message, reactions, spot, drift, seconds, delay, gutter }) => (
        <div
          key={sender}
          // Concentric: 18px outer against 10px of padding leaves the avatar
          // tile exactly 8px, which is also the radius Slack gives it.
          //
          // `text-left` is not cosmetic. The page centers everything, and
          // centered copy is the one thing that would give this away as page
          // copy rather than something that arrived from somewhere else.
          //
          // `select-none` because this is decor, not content: cmd+A on the
          // landing page should hand back the paragraph, not fifteen fake
          // job offers.
          //
          // Under reduced motion the stream simply exists - every message
          // landed, nothing drifting. An infinite loop is the one thing that
          // setting is actually asking not to see.
          className={`animate-offer absolute w-[17rem] max-w-[calc(100vw-3rem)] rounded-[18px] bg-white p-2.5 text-left select-none shadow-[var(--shadow-border),var(--shadow-lift)] motion-reduce:animate-none ${gutter ?? ""}`}
          style={
            {
              ...spot,
              "--offer-drift": `${drift}px`,
              animationDuration: `${seconds}s`,
              animationDelay: `${delay}s`,
              animationPlayState: open ? "running" : "paused",
            } as CSSProperties
          }
        >
          <div className="flex gap-2.5">
            <span
              className="mt-px flex size-8 shrink-0 items-center justify-center rounded-lg text-[0.8125rem] font-semibold text-white"
              style={{ backgroundColor: tile }}
            >
              {initial}
            </span>

            {/* min-w-0 so a long sender truncates instead of forcing the
                column wider than the card. */}
            <div className="min-w-0 flex-1">
              {/* Baseline-aligned, not centered: the time sits on the sender's
                  baseline the way it does in a real message list, which is
                  what keeps two different sizes reading as one line. Both run
                  in Geist - Slack stamps its times in the body face, and the
                  card already carries enough going on without a third. */}
              <p className="flex items-baseline gap-1.5">
                <span className="truncate text-[0.8125rem] font-semibold text-[#111]">{sender}</span>
                <span className="shrink-0 text-[0.6875rem] text-gray-400 tabular-nums">{time}</span>
              </p>
              <p className="mt-0.5 text-[0.8125rem] leading-normal text-gray-500 text-pretty">{message}</p>

              {reactions ? (
                <p className="mt-1 flex flex-wrap gap-1">
                  {reactions.map(([emoji, count]) => (
                    <span
                      key={emoji}
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[0.6875rem] leading-tight shadow-[var(--shadow-border)]"
                    >
                      <span>{emoji}</span>
                      <span className="text-gray-500 tabular-nums">{count}</span>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
