// The site's own words, in one place.
//
// The landing page (app/page.tsx) is the source: its wordmark, its headline,
// its paragraph. Everything that quotes the site back at someone - the <title>,
// the meta description, the OpenGraph and Twitter cards, the generated social
// image - reads from here instead of keeping its own copy. Three surfaces had
// already drifted apart before this existed; the social image was still
// promising "each one does one thing well", a sentence the page had dropped.
//
// If the landing's pitch changes, edit PITCH_PARTS, then regenerate the card
// and bump the ?v= on `ogImage` below so crawlers refetch it:
//   pnpm --filter web build && pnpm --filter web start
//   curl -s localhost:3000/og > apps/web/public/og-lab.png

const NAME = "moumenlab";
const TAGLINE = "Less is more";

// The landing's two claims, compressed: what these components are, and the
// reason to stay past copy-paste. Kept under 130 characters so the social card
// still sets in three lines at 28px.
//
// Written as segments, not a sentence, because it has to render twice: the
// social card inks the same phrases the landing page sets in font-medium, and
// meta descriptions take the plain join. One list, so the emphasis can never
// end up quoting a sentence the description no longer says.
//
// Every boundary falls on a word, punctuation included, because the card
// renders one <span> per WORD. Satori lays a flex container out as items, not
// as flowing text, so phrase-level spans would refuse to break mid-phrase and
// the paragraph would set ragged. Word-level items wrap the way text does.
export const PITCH_PARTS: { text: string; strong?: boolean }[] = [
  { text: "A small lab of" },
  { text: "the components we build every day,", strong: true },
  { text: "rethought for better feel.", strong: true },
  { text: "Stay for" },
  { text: "how each one was built,", strong: true },
  { text: "dead ends included." },
];

/** One span per word, in reading order, each carrying its run's weight. */
export const pitchWords = () =>
  PITCH_PARTS.flatMap((part) => part.text.split(" ").map((word) => ({ word, strong: part.strong === true })));

const PITCH = PITCH_PARTS.map((part) => part.text).join(" ");

export const site = {
  name: NAME,
  tagline: TAGLINE,
  /** Homepage <title>. Sub-pages use the "%s | moumenlab" template. */
  title: `${NAME} - ${TAGLINE}`,
  /** Search and social. The stack tail sits last, where a ~160ch truncation
   *  costs nothing: by then the sentence has already made its case. The card
   *  renders PITCH_PARTS without this tail; a 1200×630 image does not need
   *  keyword freight. */
  description: `${PITCH} React, Tailwind, shadcn registry.`,
  /** Bump the ?v= when the card art or its copy changes, so crawlers refetch. */
  ogImage: "/og-lab.png?v=3",
} as const;
