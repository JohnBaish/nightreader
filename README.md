# Nightreader

What you can see in the night sky from your postcode in Great Britain, tonight and through the
year. A sister tool to [Lightreader](https://lightreader.baish.net/), by John Baish. Not live yet.

- `SPEC.md`: what it is and does.
- `PLAN.md`: the staged build.
- `CLAUDE.md`: working notes and the log.
- `design/mockups/`: the agreed mock-ups and what builds them.

Commands: `npm ci`, then `npm run check`, `npm run typecheck`, `npm run figures-sheet`.

Calculated with [Astronomy Engine](https://github.com/cosinekitty/astronomy) (MIT licence).
Postcode districts and towns: contains OS data © Crown Copyright and database rights 2026;
contains Royal Mail data © Royal Mail copyright and database right 2026; contains National
Statistics data © Crown copyright and database right 2026. Star files in
`design/mockups/stars/` are from d3-celestial (BSD licence, included there).
