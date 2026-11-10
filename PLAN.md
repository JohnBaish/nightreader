# Nightreader: the staged build

One stage at a time, each shown to John before the next. Nothing is public yet: there is no
Vercel project.

## Stage 0: design, spec and plan — done (November 9th 2026)

Mock-ups agreed (`design/mockups/`, https://claude.ai/artifact/UDWU52EtUoMi9d7JYEMB57),
`SPEC.md`, this file.

## Stage 1: the figures — started November 9th 2026

1. **Done:** `src/lib/night.ts` (how dark the night gets and its fallbacks, the Moon and
   Moon-free time, the planets and the two-level in-view rule, fists) and `src/lib/ahead.ts`
   (phases, eclipses, planets at their best, meteor showers), on Lightreader's `sun.ts`.
2. **Done:** Great Britain's postcode districts (`src/data/outcodes.json`, from Refueller).
3. **Done:** `npm run check` (15 checks) and `npm run figures-sheet`
   (`design/figures-sheet-2026-11-10.md`: five places from Penzance to Lerwick).
4. **Done:** John answered SPEC §12's first four questions (November 9th 2026).
5. **Done (November 10th):** the meteor shower list checked against the International Meteor
   Organization's 2027 calendar, and the peak times corrected. **To do:**
   eclipse and planet dates compared with a published source; the stars' terms read.
6. **Done:** the town list for Great Britain (`npm run towns`). **To do:** the stars and lines
   prepared as a small file (stage 4 needs it).
7. **To do:** how long a year of nights takes on a phone (about 365 Moon searches).

## Stage 2: the sentences

Every sentence the page says, as plain functions with checks, and a sentence sheet for John:
the opening, the Moon, each planet's line with its place and fists, "Looking ahead".

**Started November 10th 2026:** `src/lib/sentences.ts`, and the sentence sheet
(`npm run sentence-sheet [<html>]`; `design/sentence-sheet-2026-11-10.md` and `.pdf`) is with
John, with 16 numbered points. Next: his wording, then stage 3.

**Done November 10th 2026:** the wording agreed with John over three rounds (SPEC §12).

## Stage 3: the page, with "The sky tonight"

The app (Vite, React and TypeScript, as Lightreader), the postcode box, the Ember look, the
opening and the first picture. Checked at 1200px, 390px and 844 by 390 with touch.

**Built November 10th 2026** on branch `claude/adoring-davinci-drczxf`, for John to look at
(pictures in `design/previews/stage3/`). Not merged.

## Stage 4: "Where to look"

The view south with its slider, towns, stars and fists.

**Built November 10th 2026** on branch `claude/adoring-davinci-drczxf` (pictures in
`design/previews/stage4/`). Not merged.

## Stage 5: "The year in darkness"

The year picture with its keys and the chosen night's figures.

**Built November 10th 2026** on branch `claude/adoring-davinci-drczxf` (pictures in
`design/previews/stage5/`). Not merged.

## Stage 6: "Looking ahead"

The list, with meteor showers.

**Done** with stage 3 (November 10th 2026): the trimmed list with "See more".

## Stage 7: finishing and launch

"About these figures", credits, favicon, link preview, search, the domain, Web Analytics,
`/fresh-look`, the hub card and the overview. A testing stage only if John asks for one.

## Dates to remember

None yet.
