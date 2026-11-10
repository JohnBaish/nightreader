# Prompt to continue Nightreader in a new session (written November 10th 2026)

Paste everything below the line into a new session that has `JohnBaish/nightreader` attached
(and, for the tracker and the house style, `JohnBaish/baish.net-directory` and
`JohnBaish/clockwheel`).

---

Please carry on with Nightreader, in the repo `JohnBaish/nightreader`. It's a sister tool to
Lightreader: what you can see in the night sky from a postcode in Great Britain, tonight and
through the year. Its value is in how beautiful it looks.

Before doing anything, read in this order: `CLAUDE.md` (the working notes and the dated log,
newest first), `SPEC.md`, `PLAN.md`, and `HOUSE-STYLE.md` in `JohnBaish/clockwheel`.
Nightreader may depart from the house style for beauty's sake: it is dark for everyone, in
its own "Ember" colours.

Where things stand:

1. Stages 1 to 4 are finished and merged to `main`, which Vercel builds: the figures, the
   sentences (all wording agreed with me), the page with the postcode box, the opening,
   "The sky tonight", "Where to look" with compass readings, and "Looking ahead".
2. Stage 5, "The year in darkness", is built on the branch `claude/adoring-davinci-drczxf`
   and NOT merged. I haven't yet looked at it on the branch's Vercel preview. Its draft
   wording is listed in the top log entry of `CLAUDE.md`. Ask me whether to merge it, and for
   my changes to that wording.
3. Stage 6 was done with stage 3.
4. Stage 7 is next once stage 5 is settled: "About these figures", the credits, the favicon,
   the link preview, search wording, the `nightreader.baish.net` address, Web Analytics, a
   `/fresh-look` review, the baish.net hub card and the overview. The page currently asks
   search engines to stay away; that comes off at launch.

Still open, to raise with me at a sensible moment:

- The note on true north under "Where to look" is draft wording, and the size of the
  difference between true and magnetic north in Britain hasn't been checked against a source.
- The terms of the star catalogue behind the star files (Hipparcos, through d3-celestial)
  haven't been read, and the star credit in the footer is a draft.
- Eclipse and planet dates haven't been compared with a published source.
- Nothing has been checked on a real phone or in Safari.
- The footer doesn't mention visit statistics, because there are none yet.

How I like to work: I'm not a developer, so explain plainly and briefly in British English and
tell me what I need to do. Agree before building anything significant, and show me rendered
pictures at computer and phone widths. Put questions in numbered batches. I decide the
wording. No made-up figures, even in mock-ups. Nothing a visitor types may leave their
device. Accuracy matters more than speed.

Three standing rules from this project's log: run `npm run check`, the type check, lint and the
build before every commit, and only commit if the check's exit code is 0; check in a real
browser at 1200px, 390px with touch and 844 by 390 with touch, and say what couldn't be
checked; add a dated entry to `CLAUDE.md` for every change, with mistakes logged openly.
When something significant changes, update `projects/nightreader.md` and its line in
`INDEX.md` in `JohnBaish/baish.net-directory`, running `node site/check-tracker.mjs` there
first.

Please start by telling me, briefly, what you've read and what you think the next step is.
