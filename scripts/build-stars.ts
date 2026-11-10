// `npm run stars`: src/data/stars.json, the stars and constellation lines for "Where to look"
// (SPEC §6.2), from the d3-celestial files kept in design/mockups/stars/ (BSD licence; its
// star data is from the Hipparcos catalogue as extended in XHIP). Positions are turned from
// the equator of 2000 to the equator of 2027, near enough for some years (the sky's slow
// drift is about a seventieth of a degree a year).
//   stars: [right ascension°, declination°, magnitude, colour (B−V), name?]  brightest first
//   lines: each a run of [right ascension°, declination°]

import { readFileSync, writeFileSync } from 'node:fs'
import { Body, DefineStar, Equator, Observer } from 'astronomy-engine'

const FAINTEST = 4.7, SOUTHMOST = -40, NAMED_TO = 1.6
const dir = new URL('../design/mockups/stars/', import.meta.url)
const read = (f: string) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
const epoch = new Date(Date.UTC(2027, 0, 1)), anywhere = new Observer(52, -1, 0)
const ofDate = (raDeg: number, dec: number): [number, number] => {
  DefineStar(Body.Star1, (((raDeg % 360) + 360) % 360) / 15, dec, 1000)
  const e = Equator(Body.Star1, epoch, anywhere, true, false)
  return [+(e.ra * 15).toFixed(2), +e.dec.toFixed(2)]
}
type Feature = { id: string; properties: { mag: number; bv: string }; geometry: { coordinates: [number, number] } }
const names = read('d3c-starnames.json') as Record<string, { name: string }>
const stars = (read('d3c-stars.6.json').features as Feature[])
  .filter((f) => f.properties.mag <= FAINTEST && f.geometry.coordinates[1] > SOUTHMOST)
  .sort((a, b) => a.properties.mag - b.properties.mag)
  .map((f) => {
    const row: (number | string)[] = [...ofDate(...f.geometry.coordinates), f.properties.mag, +(+f.properties.bv || 0.6).toFixed(2)]
    if (f.properties.mag < NAMED_TO && names[f.id]?.name) row.push(names[f.id].name)
    return row
  })
const lines: [number, number][][] = []
for (const f of read('d3c-constellations.lines.json').features as { geometry: { coordinates: [number, number][][] } }[])
  for (const seg of f.geometry.coordinates) if (!seg.every((c) => c[1] < SOUTHMOST)) lines.push(seg.map((c) => ofDate(c[0], c[1])))

writeFileSync(new URL('../src/data/stars.json', import.meta.url), JSON.stringify({
  note: 'Stars to magnitude 4.7 and constellation lines, equator of 2027 (scripts/build-stars.ts), from d3-celestial.',
  credit: 'Stars and constellation lines from d3-celestial (Olaf Frohn, BSD licence), from the Hipparcos catalogue.',
  stars, lines,
}))
console.log(`Wrote src/data/stars.json: ${stars.length} stars (${stars.filter((s) => s[4]).map((s) => s[4]).join(', ')}), ${lines.length} lines`)
