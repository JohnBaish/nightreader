# Nightreader — working notes

**What you can see in the night sky from your postcode, tonight and through the year.** A
sister tool to Lightreader (`JohnBaish/lightreader`), for `nightreader.baish.net` (to be set
up). Repo `JohnBaish/nightreader` (public, created November 10th 2026); the work began on
November 9th parked inside Lightreader's repo.

Read these first, in this order:

1. `SPEC.md`: what Nightreader is and does (what's agreed, what's proposed, open questions).
2. `PLAN.md`: the staged build. Work one stage at a time.
3. The mock-ups John agreed: https://claude.ai/artifact/UDWU52EtUoMi9d7JYEMB57 (source in
   `design/mockups/`; rebuild with `node design/mockups/data.mjs` then `build.mjs`).
4. `HOUSE-STYLE.md` in `JohnBaish/clockwheel` (the master copy; not yet copied here). Nightreader may depart from
   it for beauty's sake (SPEC §2): dark for everyone, its own colours.

Key points:

- John is not a developer. Explain plainly and briefly, say what he needs to do, and use
  British spelling. He decides the wording.
- Agree before building anything significant. Show rendered options at computer and phone
  widths. Questions in numbered batches.
- **The value is in how it looks.** Take time over it; show John pictures.
- **No made-up figures**, in mock-ups too: real stars, real towns, real times.
- **Nothing is sent:** every calculation runs on the device.
- Check in a real browser at 1200px, 390px with touch and 844 by 390 with touch, and say what
  couldn't be checked.
- Times are 24-hour ("21:24"), as Lightreader. Dates month first ("November 9th").
- A dated log entry below for every change.
- **Project tracker:** `projects/nightreader.md` in `JohnBaish/baish.net-directory`.

## Layout

- `src/lib/night.ts`: one night's figures (darkest stretch and its fallbacks, the Moon,
  Moon-free time, the planets "in view", fists). `src/lib/ahead.ts`: looking ahead (phases,
  eclipses, planets at their best, meteor showers).
- `src/lib/sun.ts`, `ukTime.ts`, `format.ts`, `geo.ts`, `words.ts`: copied from Lightreader
  (commit `8ea2e16`), unchanged.
- `src/data/outcodes.json`: Great Britain's postcode districts, copied from Refueller
  (`data/outcodes.json`, made October 30th 2026).
- `src/lib/towns.ts` (Lightreader's, with the reach growing to 60 miles where nothing lies
  within 25) and `src/data/towns.json` (`npm run towns <Refueller's data/places.json>`).
- `src/lib/sentences.ts`: every sentence the page says (wording agreed with John, November 10th 2026).
  `scripts/sentence-sheet.ts` (`npm run sentence-sheet [<html>]`).
- **The page:** `src/App.tsx`, `src/components/` (`MoonFace`, `SkyTonight`, `WhereToLook`, `YearInDarkness`, `PostcodeBox`),
  `shareImage.ts` with `ShareButton.tsx`, `src/lib/tonight.ts` and `yearView.ts` with their worker and `useTonight.ts`, `skyColour.ts`, `postcode.ts`,
  `src/styles/global.css`. `src/data/stars.json` (`npm run stars`). `npm run dev`, `npm run build`, `npm run lint`.
- `scripts/check-figures.ts` (`npm run check`), `scripts/figures-sheet.ts`
  (`npm run figures-sheet [YYYY-MM-DD]`). `npm run typecheck`.
- `design/mockups/`: the agreed mock-up page and what builds it. `design/figures-sheet-*.md`.

## Log

### 2026-11-10 — link-preview picture B, with John's tagline (merged to `main`)

**John:** B, with "The planets from your postcode, tonight and through the year." **What:**
`design/og-nightreader.html` (was `-b`; A removed), rendered to `public/og-nightreader.png`
(1200 by 630; Caprasimo 400 and Figtree 600 confirmed loaded). `index.html` gains `og:` and
`twitter:` tags (title "Nightreader", that line, the picture and the address on
`https://nightreader.baish.net/`, so previews work once the address is set up). `noindex` stays
until launch.

### 2026-11-10 — link-preview picture: two drafts (design only)

`design/og-nightreader-a.html` and `-b.html`, from Lightreader's (same layout, sizes and fonts
loaded by path, both confirmed loaded): favicon B drawn large, "Nightreader", and a draft
tagline "The night sky from your postcode, tonight and through the year." A on the family's
cream, B on Nightreader's indigo. Pictures `design/previews/og-nightreader-a.png`, `-b.png` and
both together in `og-nightreader-options.png`. Nothing wired in.

### 2026-11-10 — favicon B; "About" in a shaded box; a clearer line before the footer (merged to `main`)

**John:** favicon B; "About these figures" in a shaded box like Hindcaster's; a horizontal line
before the footer; the rest agreed; merge. **What:** `public/favicon.svg` (option B, copied from
`design/favicon-options/b-crescent-night.svg`), linked from `index.html`. `.about` is now a box in
`--raise` with rounded corners and a hairline edge (as Hindcaster's `card about`), heading
inside it. The footer already had a faint hairline above it; it's now clearer (cream at 32%).
Everything since the last merge (About, credits, visit statistics, favicon) merged to `main`.

### 2026-11-10 — favicon options (design only)

Three options in `design/favicon-options/`, drawn to the house recipe (48 by 48, circle r=21):
A, an ink crescent and a terracotta star on cream with a terracotta ring (as the family);
B, a cream crescent and star on Nightreader's own indigo, terracotta ring; C, a cream crescent on
solid terracotta (like Backtimer). `design/favicon-options.html` shows them at 16, 32, 48 and
96px beside the eight other baish.net icons, in light and dark browser tabs; pictures
`design/previews/favicon-options.png` and `-1x.png`. Nothing wired in.

### 2026-11-10 — "About these figures", credits, visit statistics (branch `claude/gracious-wright-pc7vy5`, not merged)

**John's wording:** "Moon-free" just "means the Moon is below the horizon"; the directions
paragraph his ("Named towns are included in that direction if they are within 25 miles, or
within 60 miles when towns are sparse."); the last paragraph opens "We assume a flat, open
horizon."; the rest as drafted. **What:** `src/components/About.tsx`, after "Looking ahead":
the five sky words with their technical names and a swatch of each (Lightreader's lines), then
six short paragraphs. Footer credits: stars "from d3-celestial by Olaf Frohn (BSD licence),
from XHIP, an extended Hipparcos compilation (Anderson and Francis, 2012)", and "Meteor shower
peaks from the International Meteor Organization". `@vercel/analytics` 2.0.1 (Hindcaster's),
with the part after "#" removed from what it sends (`main.tsx`); the footer gains Hindcaster's
visit statistics sentence. John still has to switch Web Analytics on in Vercel.
**Star terms:** the XHIP ReadMe (read on CDS's Harvard mirror, John having allowed it) has no
licence or acknowledgement section; CDS's general rules page still won't load (connection
reset). **Verified:** `npm run check` (23, exit code read), typecheck, lint, build; Chromium at
1200px, 390px with touch and 844 by 390 with touch: no errors, no sideways scrolling, nothing
asked of any host but the page's own. **On the way:** a command to stop the preview server
matched its own text and stopped itself (no harm). Pictures in `design/previews/about/`.

### 2026-11-10 — the star data's terms: not yet readable (notes only)

d3-celestial's own licence (BSD, Olaf Frohn 2015) read and fine with a credit; its stars are from
XHIP (Anderson and Francis, 2012), held by CDS Strasbourg (VizieR V/137D). John allowed
`vizier.cds.unistra.fr` and `cdsarc.cds.unistra.fr`, but CDS is partly offline after a
cybersecurity incident (its notice is dated November 9th 2026): the usage rules and the
catalogue's ReadMe return "This page is currently unavailable". Its mirror at Harvard
(`vizier.cfa.harvard.edu`) is blocked here. The magnetic north figure isn't needed (John).

### 2026-11-10 — stage 7 started; "Delete merged branches" workflow added

**John:** move to testing in the tracker (done) and go on to stage 7. First, the task noted for
it: `.github/workflows/tidy-branches.yml` copied unchanged from clockwheel (Run workflow only,
nothing scheduled; deletes only branches already wholly on `main`).

### 2026-11-10 — the opening no longer repeats the night's length (merged to `main`)

**John:** "True night runs from 18:11 to 05:14, 11h 3m in all. The Moon stays down
throughout." needn't say the length, as the big figure above says it; check the other phases.
**What:** `opening()` leaves out ", … in all" only when the Moon is down throughout (then the
big figure is the same length). When the Moon is up for part of the dark (the big figure is
the Moon-free part) or all of it ("No Moon-free night"), the total is new, so it stays.
Checked by walking every night from November 10th to December 9th 2026 and June 8th to July
7th 2027 at Reading, midsummer at Edinburgh and Shetland: nothing else changes and no
sentence reads oddly. **Verified:** `npm run check` (23, exit code read; the old line updated,
a part-Moon night added), typecheck, lint, build; Chromium at the three sizes, Reading and
Lerwick: no errors, no sideways scrolling.

### 2026-11-10 — a note for stage 7 (notes only)

**John:** note the "Delete merged branches" task for stage 7. Added to PLAN.md's stage 7: copy
the workflow from clockwheel, then use it to delete `claude/adoring-davinci-drczxf` and
`claude/gracious-wright-pc7vy5` (both fully merged).

### 2026-11-10 — option C for "Copy"; everything since stage 5 merged to `main`

**John:** C ("You've solved it"), and "Share" on a phone. **What:** the buttons sit in rows
already there on a computer (the heading row of "The sky tonight", the end of the time row,
the end of the year's line of figures); phones as before. The `?copy=` switch, options A and B
and their extra copies of the button removed. `claude/gracious-wright-pc7vy5` merged into `main`
(fast-forward): the shorter planet lines, "Where and when to look", the layout, the Sun key,
the footer and "Copy"/"Share" all go live. SPEC §6 notes the buttons.
**Verified:** `npm run check` (23, exit code read), typecheck, lint, build; in Chromium at
1200px, 390px with touch and 844 by 390 with touch, Reading and Lerwick: no errors, no sideways
scrolling, the line beside each heading level on a computer; all three pictures copied (1200px)
or saved (touch). **Couldn't be checked:** a real phone's share sheet; Safari.

### 2026-11-10 — "Copy" and "Share"; three places for the button on a computer (same branch, not merged)

**John:** on a computer the buttons fall awkwardly; just "Copy" (a break with the house style's
"Copy chart"), and options for moving them. **What:** the button reads "Copy" on a computer and
"Share" on a touch screen. Three mock-ups in the real page behind `?copy=a`, `b` or `c` (set in
`main.tsx`; without it the page is as it was; to remove once John chooses): A, at the right of
each heading row; B, over each picture's top-right corner; C, in a row already there (the
heading row for "The sky tonight", the time row for "Where and when to look", the night's
figures for "The year in darkness"). Each place holds its own copy of the button (`.cp-*` in
`global.css`), shown by the option; phones are unchanged. Pictures in `design/previews/copy/`.
**Found and fixed on the way:** in B the year picture's own drawing rule caught the button's
icon and squashed it. **Verified:** `npm run check` (23, exit code read), typecheck, lint,
build; in Chromium at 1200px, all four layouts: no errors, no sideways scrolling, all three
pictures copied in each; at 390px and 844 by 390 with touch: "Share", as before.

### 2026-11-10 — larger Suns in the key; the copy buttons moved (same branch, not merged)

**John:** keep the "not in view" lines; the dark look for the copied pictures is right; no copy
button for the Moon. Larger Suns in the sky's key (now 28px, with rays on the daylight Sun; the
Moons drawn at the same size to keep the two keys level). On a phone, "Share chart" for "Where
and when to look" sits beside the time (on a computer it stays under the picture; the button is
in the page twice, one shown at each width). Under "The year in darkness" the button now comes
after the key, at every width.
**Verified:** `npm run check` (23, exit code read), typecheck, lint, build; in Chromium at
1200px, 390px with touch and 844 by 390 with touch, Reading and Lerwick: no errors, no
sideways scrolling; all three pictures copied or saved again. Close-ups in `design/previews/tidy/`.

### 2026-11-10 — shorter planet lines, "Where and when to look", layout, sun key, footer, "Copy chart" (branch `claude/gracious-wright-pc7vy5`, not merged)

**John:** the planets' lines cut right down ("Saturn is well placed from 17:28 to 01:12, and at
its highest at 21:20." / "Venus is low: in view from 06:12 to 06:59."; the lines saying why a
planet isn't in view are kept, for John to confirm); the degrees after the fists in the list
("four fists (40°)"); "Where to look" becomes "Where and when to look"; the fists note now ends
"Compass readings are from true north." and the longer true-north sentence is gone; the line
beside each heading level with it on a computer; notes, sentences and the footer the full
width; the two keys side by side, the sky's now with a Sun sinking below the horizon to match
the Moons; "Moon down" a dashed ring; the footer 12px and centred, as the other tools; and
"Copy chart" / "Share chart" under the three pictures, as Lightreader's.

**What:** `planetLines()` (no place or height now: those are in the picture's list);
`SkyKey()` in `YearInDarkness.tsx`; `src/lib/shareImage.ts` and `ShareButton.tsx` (from
Lightreader): the picture is made from what's drawn on the page, in the Ember colours, with
"NIGHTREADER", the heading, the place, the night (and the slider's time, or the chosen night's
figures), and the credits; on a touch screen to the share sheet, on a computer copied. A click
or tap on the year picture now holds the chosen night (pointing alone still shows it), so it can
be copied; a tap away still goes back to tonight.

**Verified:** `npm run check` (23, exit code read; the planets' check updated to the new
wording), typecheck, lint, build. In Chromium at 1200px, 390px with touch and 844 by 390 with
touch, Reading and Lerwick: no errors, no sideways scrolling; buttons 40px (44px on touch);
the line beside each heading exactly level on a computer and sideways; all three pictures
copied (read back from the clipboard) on a computer and saved on touch (headless browsers can't
share), with a summer night held on the year picture. **Found and fixed on the way:** the saved
picture's own download link counted as a "tap away" and put the year back to tonight.
Pictures in `design/previews/tidy/`. **Couldn't be checked:** a real phone's share sheet;
Safari's clipboard.

### 2026-11-10 — stage 5's wording agreed; merged to `main`

**John:** the stage 5 wording is agreed, except that "The steps in March and October are the
clocks changing." goes; "Working out the year…" stays. Sentence removed from
`YearInDarkness.tsx`; `claude/adoring-davinci-drczxf` merged into `main` (fast-forward).
**Verified:** `npm run check` (23, exit code read), typecheck, lint, build.

### 2026-11-10 — a prompt for the next session (notes only, on the branch)

John is moving to a new session. `design/prompt-continue-2026-11-10.md` is what he pastes in:
where things stand (stage 5 on the branch, not merged and not yet seen by him on the
preview), what's still open, and how he likes to work.

### 2026-11-10 — stage 5: "The year in darkness" (branch `claude/adoring-davinci-drczxf`, not merged)

**John:** go ahead with stage 5.

**What:**
- `src/lib/yearView.ts`: for 365 nights from tonight, the Sun's height and the moonlight
  every ten minutes of UK clock time from 15:00 to 09:00 (one byte each), each night's
  darkest stretch and Moon-free time (from `nights()`), the new and full Moons, and the runs
  of nights without true night and without "very dark". About a second in Node; the worker
  sends tonight first, then the year, so the page isn't held up.
- `src/components/YearInDarkness.tsx`, from the agreed mock-up: the picture on a canvas,
  hours and months, a disc for each full Moon and a ring for each new one, an accent line on
  the chosen night (tonight until a night is pointed at or tapped; a tap away goes back), the
  line of figures above, the two keys (the sky; moonlight by phase), and notes beneath.
- **Draft wording for John:** the line of figures ("True night 18:17 to 05:19 · 11h 2m of it
  Moon-free · Moon 3% lit"; "No true night: “very dark” 23:25 to 02:45 · none of it Moon-free
  · …"; "No true night: only “dark” …"; "Half-light all night"); the notes ("From May 23rd to
  July 19th the sky over Reading never reaches true night, so those weeks are measured by
  “very dark” instead."; for the north, "From May 11th to August 1st it doesn’t reach “very
  dark” either, only “dark”."); "Working out the year…".

**Verified:** `npm run check` (23, exit code read; the commit waits on it), typecheck, lint,
build. In Chromium at 1200px, 390px with touch and 844 by 390 with touch, Reading and
Lerwick: no errors, no sideways scrolling; the year appears about a second and a half after
the page opens; the picture 500px tall on a computer, 360px on a phone, 320px on a
390px-tall screen; pointing (computer) and tapping (phone) change the line of figures.
Pictures in `design/previews/stage5/`.
**Couldn't be checked:** a real phone (the time the year takes there; dragging a finger
along the picture); Safari. **Noticed:** from Lerwick in midwinter the Sun sets about 15:00
and rises about 09:00, the very edges of the picture.

### 2026-11-10 — compass readings (choice C), a note on true north, credits off the first screen (merged to `main`)

**John:** C (a small dial with the reading); no reading in the sentences under "The sky
tonight"; a line in the notes about which north; the credits not shown until a postcode is
chosen, as Lightreader. **What:** each line of "Where to look" ends with one small label
holding the dial and the reading ("116° SE"); Claude put the two together in one label, where
the mock-up had the dial before the words. The mock-up switch, and options A and B, are gone.
Under the fists note (draft, for John): "Compass readings are from true north. A phone’s
compass shows magnetic north unless it is set to true north; in Britain the two differ only
slightly at present." (the size of the difference not checked against a source, so no figure
is given). **Verified:** `npm run check` (22, exit code read), typecheck, lint, build; the
first visit and Reading at 1200px, 390px with touch and 844 by 390 with touch: no errors, no
sideways scrolling; the first visit shows only the project paragraph.

### 2026-11-10 — compass readings: three mock-ups (branch only, not merged)

For John's request. In the real page behind `?compass=a`, `b` or `c` (`COMPASS_MOCK` in
`WhereToLook.tsx`; without it the page is as live; to remove once he chooses): A, the reading
as a small label after the direction ("116° SE", as a phone's compass shows it); B, A plus a
scale of degrees along the horizon of the picture; C, A plus a small dial with a needle.
Readings are from true north; a phone's compass shows magnetic north unless set to true
north, about a degree different in Britain at present (not checked against a source).
Pictures in `design/previews/compass/`. Checked at 1200px and 390px with touch: no errors,
no sideways scrolling.

### 2026-11-10 — the footer's two paragraphs swapped (merged to `main`)

**John** (after seeing the live page): the credits first, then the paragraph about the
project beneath them. Done in `src/App.tsx`. He also asked for mock-ups of ways to show
compass readings (as on a phone's compass, "96° E"), with no compass technology in the page.
**Verified:** `npm run check` (22, exit code read), typecheck, lint, build.

### 2026-11-10 — stages 3 and 4 merged to `main`

**John:** "Very low in the west, …" is right for now; drop the line about towns where there
are none (done: Lerwick's reads "Facing south, with east on the left and west on the right.
Slide through the night."); merge to `main`; hold before stage 5 so he can look.
`claude/adoring-davinci-drczxf` fast-forwarded into `main`, so Vercel's main build now has a
page (on its Vercel address; search engines asked to stay away). The branch is left in place
as this session's working branch. **Verified:** `npm run check` (22, exit code read),
typecheck, lint, build; Lerwick and Reading at 1200px and 390px with touch: the line as above,
no errors, no sideways scrolling.

### 2026-11-10 — stage 4: "Where to look" (same branch, not merged)

**John:** stage 3 approved ("Nothing to change"), so on to stage 4.

**What:**
- `src/components/WhereToLook.tsx`, from the agreed mock-up: the view south on a canvas (the
  sky, the Sun's glow, real stars and constellation lines, fading with twilight and
  moonlight) with the Moon, planets, their paths, the towns and the compass words drawn over
  it; a ruler of fists at the left; the slider from sunset to sunrise, opening on now if it's
  night, else a little way into the darkest stretch; the list beneath (direction, towns,
  fists). On a phone the picture is wider than the screen with true shapes, opens on south
  and is swiped (option B).
- `scripts/build-stars.ts` (`npm run stars`) writes `src/data/stars.json` (868 stars to
  magnitude 4.7, 17 named, 121 lines; 11 KB compressed, fetched only when the picture is
  drawn) from the d3-celestial files, turned to the equator of 2027.
- `tonight.ts`: the night's figures gain each body's direction, the Moon's tilt and the
  sidereal time. `towns.ts`: `townsRound()` for the horizon (25 miles, or 60 where fewer than
  three lie within 25).
- A planet shows by the agreed rule for how dark the sky must be. One below 10° is drawn but
  its line in the list is dimmed and reads "Very low in the west, …" (Claude's, for John).
- The footer gains a draft star credit.

**Verified:** `npm run check` (22, exit code read; the commit step waits on it), typecheck,
lint, build. In Chromium at 1200px, 390px with touch and 844 by 390 with touch, five nights
and places (Reading tonight, by day, at full Moon, at midsummer; Lerwick): no errors, no
sideways scrolling; the picture 365px tall on a computer, 426px on a phone (opening on
south), 301px on a 390px-tall screen; the slider moved by keyboard to 03:15 changes the
clock, the picture and the list. Pictures in `design/previews/stage4/`.
**On the way:** a new check's example was a wrong guess of mine (Inverness has eight towns
within 25 miles); it now uses Wick and Lerwick, with the real results.
**Couldn't be checked:** a real phone (swiping the picture, dragging the slider); Safari.
**Still open before launch:** the star data's own terms (the files are BSD; the catalogue
behind them is ESA's Hipparcos) and the credit's wording. **Noticed:** from Lerwick the
horizon has no towns at all, so the strip under the sky is empty and the line "The towns
along the horizon…" doesn't apply there.

### 2026-11-10 — Vercel project created; stage 3 approved (same branch)

**John:** created the Vercel project; "Nothing to change. It looks fantastic." `main` has no
page yet, so its first build is expected to fail until stage 3 is merged (as Lightreader's
did). This entry is the push that starts the branch's own preview; its address, by the house
pattern (not opened from here): `https://nightreader-git-claude-adoring-davinci-drczxf-john-baish.vercel.app`.
Next: stage 4, "Where to look".

### 2026-11-10 — stage 3's wording, from John (same branch, not merged)

**John:** the first visit's heading as drafted; its line "Proper darkness tonight, with the
Moon out of the way, and the visible planets, anywhere in Great Britain." (the full stop is
Claude's); "Each arc is the height of the Moon or a planet: …"; the footer as drafted; "…in the
open data used by Nightreader." He'd like to try it himself: a Vercel project is his next step
(his message was cut short after "Yes please, I'm").
**Verified:** `npm run check` (21, exit code read), typecheck, lint, build.

### 2026-11-10 — stage 3: the page, with "The sky tonight" (branch `claude/adoring-davinci-drczxf`, not merged)

**John:** agreed the "poor year" rule; go ahead with stage 3.

**What:** the app, set up as Lightreader's (Vite, React, TypeScript, oxlint; fonts self-hosted).
- `src/App.tsx`: the header with the postcode pill and Change; a first visit's heading, line and
  postcode box; the opening (the Moon drawn at its true phase and tilt beside the one figure);
  the Moon's sentences; "The sky tonight" with the planets' sentences, each marked in its
  arc's colour; "Looking ahead" with "See more"; the footer. The postcode is kept after "#"
  and on the device (`nightreader.postcode`).
- `src/components/SkyTonight.tsx`: the picture from the agreed mock-up, now from the real
  code: solid where a body is in view by the agreed rule (so short spells don't show), a
  "Now" line, the bracket named for the darkest the sky gets ("VERY DARK" in summer), and
  the time and heights under a finger or the mouse. Never taller than a sideways phone.
- `src/lib/tonight.ts` (which night is "tonight": last night's until sunrise; the heights every
  five minutes), worked out in a worker (about a quarter of a second in Node);
  `skyColour.ts` (the Ember ramp); `postcode.ts` (Great Britain; Northern Ireland explained).
- **Draft wording for John:** the first visit's heading and line; the postcode messages; the
  line under "The sky tonight"; "Working out tonight’s sky…"; the footer (no visit
  statistics are mentioned, as there are none yet).
- Not yet: favicon, search and link-preview tags (stage 7; the page asks search engines to
  stay away for now); no Vercel project, so no preview link.

**Verified:** `npm run check` (21, exit code read), `npm run typecheck`, lint clean, build.
In Chromium at 1200px, 390px with touch and 844 by 390 with touch: the first visit, Reading
tonight, Reading at midsummer, Edinburgh by day, Caerdydd on the Perseids' night, Sandwick at
midsummer: no errors, no sideways scrolling, all four font styles loaded, the picture 330px
tall on a 390px-tall screen. Typing: nothing, a word, BT1 1AA, ZZ99, "cf10 1ab"; reload;
Change and Cancel; See more; a new "#EH1": all as expected, the box 16px and the button 44px,
no request to anywhere but the page's own files. Pictures in `design/previews/stage3/`.
**On the way:** one new check held a wrong guess of mine (that the new Moon is below the
horizon for the whole picture; it is up in the 40 minutes shown before sunset); the commit
step stopped, as it now should, and the check was corrected to the real figures.
**Couldn't be checked:** a real phone; Safari; speed on a phone. **Noticed:** the main script
is 174 KB compressed (the postcode and town lists and Astronomy Engine); could be slimmed.

### 2026-11-10 — the sentences settled

**John:** new and full Moon's shorter sentences and the circuit sentence on the two quarters
only are right; a small meteor shower in a poor year goes under "See more" (built: the four
smaller showers, when the verdict is "a poor year", however near). Stage 2's wording is agreed;
John may still want to see some of it on the page. Next: stage 3.
**Verified:** `npm run check` (20, exit code read), `npm run typecheck`.

### 2026-11-10 — the Moon's phase in John's wording

**John:** plain words with the proper name beside them ("A growing Moon, bulging in its phase
between half and full (waxing gibbous), 84% lit."); the two quarters also say how far the Moon
is round its monthly circuit. `phaseLine()` in `sentences.ts` replaces `PHASE_MEANS`;
`moonLook()` gains `round`. New Moon and full Moon keep the shorter sentences (Claude's reading
of "as is", told to John). **Verified:** `npm run check` (19, exit code read), typecheck.

### 2026-11-10 — small eclipses folded; "See more"; the summer opening agreed

**John:** an eclipse covering less than 15% goes under the fold; the fold is "See more"; F and
J read "No Moon-free night / The Moon is up throughout / (True night is not reached tonight
either.)". The Moon phase sentences are being worked through in the thread (he wants the
explanations kept, without the words on how much is lit); nothing built for those yet.
`SMALL_ECLIPSE` in `sentences.ts`.

**Mistake, logged openly (the second time):** I committed and pushed this (`a5b1012`) while one
check was failing; the commit step didn't wait on the check's result. The failing check was
right: a small eclipse more than a year off (the Moon's, January 12th 2028) had dropped out of
the list altogether instead of going under the fold. Fixed in the next commit; the next
eclipse of each kind is now always listed, above or below the fold. From now on the commit
runs only if the check's exit code is 0.

**Verified:** `npm run check` (19, exit code read), `npm run typecheck`.

### 2026-11-10 — "Looking ahead" trimmed

**John:** 30 days, with a fold; eclipses always; the four big meteor showers three months
ahead, the others within 30 days; Mercury and Venus kept, by the same rule. Also: points 3 to
8 of the second sheet agreed (no Gaelic). Still open, put to him in the thread: the summer
opening when the Moon is up throughout (F and J imply the wrong cause), and the Moon phase
wording (plain words first, the proper name in brackets, no explaining the percentage).

**What:** `aheadLines()` returns `soon` and `later` (`SOON_DAYS`, `BIG_SHOWER_DAYS`,
`BIG_SHOWER_PER_HOUR`); the fold holds everything else within a year, all eight showers
included. Reading tonight: eight lines shown, nine folded. Sheet and PDF remade.

**Verified:** `npm run check` (19, exit code read), `npm run typecheck`.

### 2026-11-10 — the sentences, second version: John's changes

**John:** the eclipse safety sentence ("Looking at the Sun without proper protection is
dangerous and should be avoided."); a description after each Moon phase's name; planets not in
view for the same reason listed together; meteor showers "for this annual event"; the summer
opening reworked; a well-placed planet as "well placed from … to …, and in view for 29m before
and 1h 8m after that window"; degrees and fists both; new and full Moon by date only; a spell
in view for less than 15 minutes, or well placed for less than three, doesn't count; a
direction given once only; Welsh place names in Wales. Points 2 to 4, 6, 7 and 11 to 13 agreed.
"Looking ahead" to be trimmed together (not done).

**What:** `sentences.ts` (`PHASE_MEANS`, `planetLines()`, the opening's `note`); `night.ts`
(`MIN_IN_VIEW`, `MIN_WELL`); new `src/lib/places.ts` (`placeNames()`: the Welsh half of a
double name in Wales, the English half kept for directions; Gaelic not shown yet, asked).
The sheet remade (13 cases, nine points; one new case, a summer new Moon) as `.md` and `.pdf`.
Claude's additions, flagged to John: "meteor shower" after each shower's name; lengths the
site's way ("29m"); "in the same direction as Saturn".

**Verified:** `npm run check` (18, exit code read), `npm run typecheck`; the figures sheet
is unchanged by the short-spell rule; PDF fonts loaded; pages 13, 14, 23 and 24 looked at.

### 2026-11-10 — stage 2 started: the sentences, and a sheet for John

**John:** islands with no towns in reach get the compass point alone; the "Looking ahead" list
is "spot on"; start stage 2, with the sheet as a PDF.

**What:** `src/lib/sentences.ts` (the opening, the Moon, each planet, "Looking ahead"; dates by
Lightreader's rule) and `scripts/sentence-sheet.ts` (`npm run sentence-sheet [<html>]`):
`design/sentence-sheet-2026-11-10.md` and `.pdf` (A5, 23 pages, made with the fresh-look
`make-pdf.mjs` and Lightreader's fonts), 12 places and nights, 16 numbered points. All wording
is draft. SPEC §7 and §12 and PLAN updated.

**A real fault found by reading the sheet, and fixed:** a meteor shower peaking tonight was
missing from "Looking ahead" (the Quadrantids on January 3rd, the Perseids on August 12th).
Astronomy Engine's search, asked to look 370 days ahead, skipped a crossing only hours away
and gave next year's. `sunReaches()` now works from the Sun's own position (equinox of 2000)
and doesn't use that search. Every peak time in the figures sheet is unchanged (it was made
from dates well before each peak).

**Changed on reading it through:** "At its highest during the night" (was "after dark", wrong
for a Moon highest at dawn); the summer fallback as one sentence; "today (November 24th)",
"best tonight" and "around now" for things happening on the night itself.

**Verified:** `npm run check` (17, exit code read; new: a peak tonight is found, and the
sentences for four real nights), `npm run typecheck`; every PDF font loaded; pages 1 to 3, 11,
12, 18, 19, 22 and 23 looked at. **Couldn't be checked:** as before (eclipse and planet dates
against a published source; the stars' terms).

### 2026-11-10 — moved to its own repo; meteor dates corrected; directions reach 60 miles

**John:** created `JohnBaish/nightreader`; allowed `www.imo.net`; happy for directions to reach
60 miles where towns are sparse.

**What:**
- Everything moved here from Lightreader's `design/nightreader/` and pushed as `main` (nothing
  is public: no site, no Vercel project). The folder is removed from Lightreader's branch.
- **Meteor showers checked against the International Meteor Organization's 2027 calendar**
  (IMO INFO(3-26), Table 5). All eight peak points were right. The rates are now its figures
  (Quadrantids 80, was 110; Perseids 110, was 100), and each shower's radiant is recorded.
- **A real fault found by that check, and corrected:** the list's peak points are measured
  from the equinox of 2000, and Astronomy Engine's search measures from the equinox of the
  date. Every peak time was about nine hours early. `sunReaches()` in `ahead.ts` now works
  from the equinox of 2000: the Quadrantids come out at 03:34 on January 4th 2027 against the
  calendar's 03:25, the Leonids 06:08 against 06h, the Ursids 04:30 against 04h, the Perseids
  08:19 against "08h to 10h". The Eta Aquariids come out six hours after the calendar's 09h
  (a broad peak, given to a tenth of a degree). Two nights changed from what John was told on
  November 9th: the Geminids' best night is December 14th (8h 40m Moon-free, not the 13th
  with 9h 52m), and the Eta Aquariids' is May 6th.
- `describeToward()` tries 25 miles, then 60 (`FAR_MILES`). East of Inverness now reads
  "between Elgin and Charlestown of Aberlour". Lerwick still gets the compass point alone:
  Shetland's only town is Lerwick itself.
- The mock-up builder now uses this repo's own town list. The figures sheet is remade as
  `design/figures-sheet-2026-11-10.md` (the November 9th one, with the early meteor times, is
  removed).

**Verified:** `npm run check` (15, with the exit code read; new: peaks against the calendar's
own 2027 times, the 60-mile reach), `npm run typecheck`; the mock-up page rebuilds here.
**Couldn't be checked:** eclipse and planet dates against a published source; the stars' terms;
speed on a phone.

### 2026-11-09 — John's answers; faint eclipses out; the town list for Great Britain

**John:** yes to the far-north fallback and to the four Sun-depth numbers; faint eclipses of the
Moon left out ("I think so"); phase names fine as they are; the repo tomorrow.

**What:** `lunarEclipses()` leaves out penumbral eclipses, so Reading's next is the partial one
on January 12th 2028. `scripts/build-towns.ts` (`npm run towns <Refueller's data/places.json>`)
writes `src/data/towns.json`: 2,092 places (1,426 towns and cities, 666 smaller places districts
are named after; 2,800 of 2,863 districts matched). `src/lib/towns.ts` copied from Lightreader
unchanged. SPEC §3, §5, §7, §8 and §12 and PLAN updated; the figures sheet remade.

**Found:** in the Highlands and islands the rule's 25 miles rarely reaches a town: from Lerwick
every direction tried, and from Inverness four of five, give the compass point alone. Edinburgh
and Cardiff read well ("between Loanhead and Penicuik (near Roslin)", "roughly over Barry").
Put to John (SPEC §12.2).

**Mistakes, logged openly:** an apostrophe in a check's name broke the file. Then I committed
and pushed while one check was failing, and wrote "14 checks" here: the run's result was hidden
by the command I used. The failing check was my own wrong expectation (1.7° west of south the
towns rule gives "roughly over Alton", not "between Bordon and Alton"); the code was right. The
check now holds both real results, and the next commit corrects it. All 14 pass.

**Verified:** `npm run check` (14), `npm run typecheck`. **Couldn't be checked:** the meteor
shower list (`www.imo.net` isn't allowed in this session).

### 2026-11-09 — spec and plan; stage 1 started: the figures

**John:** agreed all of Claude's suggestions (two heights for "in view" with a darker sky for
fainter planets; "No Moon-free night"; meteor showers in "Looking ahead"; Great Britain from
the start), and asked for the spec, the plan and a start on stage 1.

**What:** `SPEC.md`, `PLAN.md`, this file. `src/lib/night.ts` and `ahead.ts`; the sun, time
and format code from Lightreader; Refueller's postcode districts; 13 checks; the figures
sheet (`design/figures-sheet-2026-11-09.md`). The mock-up files moved to `design/mockups/`.

**Found:**
- With the two-height rule Venus counts tonight, but only as "low" (15° up at 06:57).
- From Edinburgh and Lerwick the midsummer sky only reaches "dark", so the fallback needs a
  step beyond "very dark" (SPEC §3.3, proposed).
- Moon-free time is now exact (from moonrise and moonset), where the mock-ups sampled each
  minute; the two agree to the minute (10h 59m, 5h 56m, none).
- MET Norway's moonrise and moonset for Reading on November 17th (13:16, 23:32, seconds
  dropped) against ours (13:17:00, 23:32:47); November 24th's agree to the minute too.
- A faint ("penumbral") eclipse of the Moon is the next one listed (February 20th 2027);
  proposed to leave those out.

**Mistakes on the way:** one expectation in the new checks was my guess (4° as one fist; the
rule gives half a fist, rightly); corrected to the real result. A type slip in `ahead.ts`
caught by the type check.

**Verified:** `npm run check` (13), `npm run typecheck`; raising "well placed" to 25° on
purpose made the checks fail, then restored. Lightreader's own lint is still clean. No page
yet, so nothing in a browser.
**Couldn't be checked:** the meteor shower list (only the Quadrantids' figure confirmed);
eclipse and planet dates against a published source; speed on a phone.

### 2026-11-09 — the mock-ups

Four rounds with John the same day (colours: Ember; the opening figure smaller; "Where to
look" with a slider, towns, real stars and fists; option B on a phone; a key for moonlight).
Details in `README.md`.
