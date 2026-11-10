# Prompt for the first fresh-look review of Nightreader

Paste everything below the line into a new Claude Code session on `JohnBaish/nightreader`.

---

/fresh-look

This is the first fresh look at Nightreader (repo `JohnBaish/nightreader`, live at
https://nightreader.baish.net/), which went live on November 10th 2026. Please review `main`
as it stands, using the fresh-look procedure in `.claude/skills/fresh-look/SKILL.md`, and
change nothing until I've answered.

Before you start, read in this order: `CLAUDE.md` (the layout notes and the whole log),
`SPEC.md`, `PLAN.md` and `HOUSE-STYLE.md`. Nightreader deliberately departs from the house
style in places for beauty's sake (SPEC §2): it is dark for everyone, has its own colours
(Ember), uses 24-hour times ("21:24") and has no light/dark switch. Don't report those as
faults; do say if one of them causes a real problem.

What matters most to me:

1. **How it looks.** The value of Nightreader is in its pictures: "The sky tonight", "Where
   and when to look" (with its slider and, on a phone, the sideways swipe) and "The year in
   darkness". Look at each one closely at every size.
2. **Whether the figures and sentences are right.** Try a spread of places and nights, for
   example Reading tonight, Reading at midsummer, Edinburgh, Lerwick (Shetland), a Welsh
   postcode, a Cornish one, a full Moon and a new Moon, a meteor shower peak, the night the
   clocks change, and a night with no true night. Read every sentence the page produces for
   them. Check facts against a published source where you can, and say plainly what you
   couldn't check. No made-up figures.
3. **Phones.** Check at 1200px, at 390px with touch, and at 844 by 390 with touch (a phone
   held sideways), as the procedure says. Also try the narrowest phones (320px wide).
4. **The postcode box and messages:** empty, a word, a full postcode, just the first half,
   a Northern Ireland postcode, one that doesn't exist, Change and Cancel, reloading.
5. **"Copy" and "Share"** on the three pictures, and the "About these figures" box.
6. **Speed:** how long tonight and the year take to appear, especially with the browser
   slowed to phone speed.
7. **Privacy:** confirm nothing I type leaves the device (only the page's own files and
   Vercel's anonymous visit statistics should be requested).

Things already known, so no need to report them as new: the star catalogue's terms couldn't
be read (CDS was offline after a cybersecurity incident); eclipse and planet dates haven't
been checked against a published source; a real iPhone and Safari couldn't be tried.

Please send the report in the usual numbered layout, in the chat and as the A5 PDF, with
the "Suggested order" section placing every item. After I reply, log my decisions in
`CLAUDE.md` and update the project tracker (`projects/nightreader.md` and its line in
`INDEX.md` in `JohnBaish/baish.net-directory`, running `node site/check-tracker.mjs` there
first).
