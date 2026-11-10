// `npm run sentence-sheet [<html out>]`: design/sentence-sheet-<date>.md, every sentence the
// page would say, for several places and nights, with numbered points for John (PLAN stage 2).
// With an HTML path it also writes the sheet in the fresh-look report's style, for
// make-pdf.mjs (in clockwheel's fresh-look skill) to turn into an A5 PDF.

import { readFileSync, writeFileSync } from 'node:fs'
import { placeNames } from '../src/lib/places.ts'
import { sentences } from '../src/lib/sentences.ts'

const TODAY = '2026-11-10'
const data = JSON.parse(readFileSync(new URL('../src/data/outcodes.json', import.meta.url), 'utf8')) as { outcodes: Record<string, [number, number, string]> }
const CASES: [code: string, date: string, why: string][] = [
  ['RG1', '2026-11-10', 'tonight, just after a new Moon'],
  ['RG1', '2026-11-17', 'a first-quarter Moon that sets before midnight'],
  ['RG1', '2026-11-24', 'a full Moon, up all night'],
  ['RG1', '2026-12-02', 'a Moon that rises during the night'],
  ['RG1', '2027-02-14', 'Jupiter and Mars at their best'],
  ['RG1', '2027-06-21', 'the shortest night: no true night'],
  ['EH1', '2026-11-10', 'tonight, further north'],
  ['EH1', '2027-06-21', 'the shortest night in Edinburgh: only “dark”'],
  ['ZE1', '2026-11-10', 'tonight in Shetland: no towns in reach'],
  ['ZE2', '2027-06-21', 'the shortest night in the north of Shetland'],
  ['TR18', '2027-01-03', 'Venus at its best in the morning; the Quadrantids'],
  ['CF10', '2027-08-12', 'the Perseids; a place shown by its Welsh name'],
  ['RG1', '2027-07-04', 'a new Moon in summer: Moon-free, but only “very dark”'],
]
const POINTS = [
  'The opening in summer. Where the Moon is up throughout (F, J): “No Moon-free night / The Moon is up throughout / (True night is not reached tonight either.)” (agreed, November 10th). Where some of it is Moon-free (H, M): “42m / of Moon-free “dark” night / (“Very dark” and true night are not reached tonight.)”.',
  'The Moon’s phase, in your wording of November 10th: plain words with the proper name beside them, and for the two quarters how far the Moon is round its monthly circuit (B, D, E).',
  'A well-placed planet, as you suggested: “Saturn is well placed from 17:28 to 01:12, and in view for 29m before and 1h 8m after that window.” Lengths are written the site’s way (“29m”, “1h 8m”) rather than “33 minutes”: is that all right?',
  'A direction already given isn’t repeated: “Mars … stands 54° up (five and a half fists) in the same direction as Saturn.” Does that read naturally?',
  'Planets not in view for the same reason are listed together: “Mercury, Venus and Jupiter: not in view tonight, too close to the Sun.” (L)',
  'Meteor showers: “Perseids meteor shower: best tonight. A fair year for this annual event: 2h 2m of the night is Moon-free.” I added “meteor shower” after the name, as “Perseids” alone doesn’t say what it is. All eight showers listed come every year.',
  'Short spells no longer count: in view for less than 15 minutes, or well placed for less than three. Mercury on November 17th (three minutes) is now “not in view”.',
  'Welsh names: where a district in Wales has two names the Welsh one is shown (L: Caerdydd). The towns named in directions are still English (“roughly over Barry”), as the town list has only English names. In Scotland, districts with a Gaelic name show the English one for now (Inverness, not Inbhir Nis): would you like Gaelic there too?',
  '“Looking ahead” trimmed as you set out: the next 30 days; the four big meteor showers (Quadrantids, Eta Aquariids, Perseids, Geminids) three months ahead; the next eclipse of the Sun and of the Moon always, unless it covers less than 15%; a small shower in a poor year, and everything else within a year, under “See more”.',
]

const cases = CASES.map(([code, date, why]) => {
  const [latitude, longitude, listed] = data.outcodes[code]
  const { shown: name, own } = placeNames(code, listed)
  return { code, date, why, name, s: sentences({ latitude, longitude }, own, date) }
})
const md: string[] = [`# Nightreader: the sentences`, '', `Every sentence the page would say, for ${cases.length} places and nights, worked out from real figures. Second version, with John’s changes of November 10th. All wording is draft. Points to check are numbered at the end.`, '']
cases.forEach((c, i) => {
  md.push(`## ${String.fromCharCode(65 + i)}. ${c.name} (${c.code})`, '', `*${c.s.title}: ${c.why}.*`, '', `**Opening:** ${[c.s.opening.figure, c.s.opening.under, c.s.opening.note].filter(Boolean).join(' / ')}`, '', c.s.opening.line, '')
  for (const g of c.s.groups) md.push(`**${g.heading}**`, '', ...g.lines.map((l) => `- ${l}`), '')
})
md.push('## Points for John', '', ...POINTS.map((p, i) => `${i + 1}. ${p}`), '')
writeFileSync(new URL(`../design/sentence-sheet-${TODAY}.md`, import.meta.url), md.join('\n'))

const out = process.argv[2]
if (out) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const html = [`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Nightreader: sentence sheet</title><style>
@font-face{font-family:Caprasimo;src:url('file://{{REPO}}/node_modules/@fontsource/caprasimo/files/caprasimo-latin-400-normal.woff2')}
@font-face{font-family:Figtree;font-weight:400;src:url('file://{{REPO}}/node_modules/@fontsource/figtree/files/figtree-latin-400-normal.woff2')}
@font-face{font-family:Figtree;font-weight:600;src:url('file://{{REPO}}/node_modules/@fontsource/figtree/files/figtree-latin-600-normal.woff2')}
@font-face{font-family:Figtree;font-weight:700;src:url('file://{{REPO}}/node_modules/@fontsource/figtree/files/figtree-latin-700-normal.woff2')}
@page{size:A5;margin:14mm 12mm 16mm}
body{font:400 10.5pt/1.5 Figtree,sans-serif;color:#201e1d;margin:0}
h1{font:400 22pt/1.1 Caprasimo,serif;margin:0 0 4pt}
.sub{color:#5b5550;margin:0 0 10pt;font-size:9.5pt}
h2{font:400 14pt/1.2 Caprasimo,serif;margin:16pt 0 4pt;border-top:1px solid #d9cbb3;padding-top:9pt;break-after:avoid}
h3{font:700 10.5pt/1.3 Figtree,sans-serif;margin:8pt 0 2pt;break-after:avoid}
p{margin:0 0 5pt} ul,ol{margin:0 0 5pt;padding-left:15pt} li{margin:0 0 3pt}
.day{color:#5b5550;font-size:9.5pt;margin:0 0 6pt}
.open{background:#1a2045;color:#f4ead6;border-radius:8pt;padding:8pt 10pt;margin:4pt 0 6pt;break-inside:avoid}
.open b{font:400 17pt/1.1 Caprasimo,serif;display:block}
.open span{font-weight:600;font-size:9.5pt;display:block}
.open i{font-style:normal;font-size:9pt;opacity:.8;display:block}
li{break-inside:avoid}
.note{background:#ebddc5;border-radius:8pt;padding:7pt 9pt;margin:6pt 0 4pt}
</style></head><body>`,
    '<h1>Nightreader: the sentences</h1>',
    `<p class="sub">Every sentence the page would say, for ${cases.length} places and nights, worked out from real figures on Tuesday November 10th 2026.</p>`,
    '<div class="note"><strong>All wording is draft: it is yours to change.</strong> This is the second version, with your changes of November 10th. The points to check are numbered at the end, so you can reply by number. Places are named by Lightreader’s rule, reaching 60 miles where no town lies within 25; where there is still none (Shetland, Scilly), the compass point alone.</div>']
  cases.forEach((c, i) => {
    html.push(`<h2>${String.fromCharCode(65 + i)}. ${esc(c.name)} (${c.code})</h2>`, `<p class="day">${esc(c.s.title)}: ${esc(c.why)}.</p>`,
      `<div class="open"><b>${esc(c.s.opening.figure)}</b><span>${esc(c.s.opening.under)}</span>${c.s.opening.note ? `<i>${esc(c.s.opening.note)}</i>` : ''}</div>`, `<p>${esc(c.s.opening.line)}</p>`)
    for (const g of c.s.groups) html.push(`<div class="group"><h3>${esc(g.heading)}</h3><ul>${g.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>`)
  })
  html.push('<h2>Points for John</h2>', '<ol>', ...POINTS.map((p) => `<li>${esc(p)}</li>`), '</ol>', '</body></html>')
  writeFileSync(out, html.join('\n'))
}
console.log(`Wrote design/sentence-sheet-${TODAY}.md${out ? ` and ${out}` : ''}`)
