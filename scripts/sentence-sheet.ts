// `npm run sentence-sheet [<html out>]`: design/sentence-sheet-<date>.md, every sentence the
// page would say, for several places and nights, with numbered points for John (PLAN stage 2).
// With an HTML path it also writes the sheet in the fresh-look report's style, for
// make-pdf.mjs (in clockwheel's fresh-look skill) to turn into an A5 PDF.

import { readFileSync, writeFileSync } from 'node:fs'
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
  ['CF10', '2027-08-12', 'the Perseids; a place with a double name'],
]
const POINTS = [
  'The opening figure and the words under it: “10h 59m / of Moon-free true night”, “No Moon-free night / The Moon is up for the whole of true night”, and in summer “of Moon-free “very dark””. Do the quotation marks round “very dark” and “dark” work, or would you rather a coloured tag as Lightreader has?',
  'The sentence beside the Moon: “True night runs from 18:19 to 05:17, 10h 59m in all. The Moon stays down throughout.” and its variants (“sets at 23:33; the sky is at its darkest after that”).',
  'A safety net: “No darkness tonight / Half-light all night”, with “The Sun stays close below the horizon, so the sky never gets dark.” Not seen in these examples: even the north of Shetland gets an hour of “dark” at midsummer.',
  'The Moon’s lines: rising and setting with their directions, and “At its highest during the night, at 00:11, it stands 65° up (six and a half fists) in the south …”.',
  'A well-placed planet: “Saturn is well placed from 17:31 to 01:12 (in view from 16:59 to 02:20). At its highest, at 21:20, it stands 40° up (four fists) in the south, roughly over Alton.” Is giving both spans too much?',
  'A low planet: “Venus is low: in view from … to …, at best 15° up (one and a half fists) in the south-east, …. It needs a clear horizon.”',
  'A planet not in view: “Mercury: not in view tonight, too close to the Sun.” / “too low while the sky is dark” / “below the horizon all night”.',
  'Degrees and fists together, “40° up (four fists)”: both, or fists only in the sentence with degrees left to the picture?',
  'Looking ahead: the Moon’s next new and full by date only. Would you like the time of day too?',
  'Eclipses: the wording, and the safety sentence on an eclipse of the Sun (“Never look at the Sun without proper eclipse glasses.”).',
  'Planets at their best: “Jupiter at its best: February 11th, when it is opposite the Sun, at its brightest and up all night.” and “Best mornings for Venus: around January 3rd, when it is furthest from the Sun.”',
  'Meteor showers: the next one always, and any other within about 100 days. The verdicts (my rule, for you to change): “a very good year” with no Moon at all, “a good year” when three-quarters or more of the night is Moon-free, “a fair year” from about a third, otherwise “a poor year”.',
  'Dates follow Lightreader: no weekday, except in brackets when one to six days ahead; the year only when more than 300 days away.',
  'Short spells. Some are only minutes long: on November 17th Mercury is “in view from 06:46 to 06:49” and Venus “well placed from 07:01 to 07:10” (case B). Shall a spell shorter than, say, 15 minutes not count?',
  'Directions repeat: three planets can all be highest “in the south, between Bordon and Alton (near Hook)” on the same night (case A). True, but repetitive. Keep the towns on every line, or only where the direction differs from the line before?',
  'Double names such as “Cardiff / Caerdydd” come from the postcode list. Lightreader shows one name; shall Nightreader show the English name only?',
]

const cases = CASES.map(([code, date, why]) => {
  const [latitude, longitude, name] = data.outcodes[code]
  return { code, date, why, name, s: sentences({ latitude, longitude }, name.split('/')[0].trim(), date) }
})
const md: string[] = [`# Nightreader: the sentences`, '', `Every sentence the page would say, for ${cases.length} places and nights, worked out from real figures. All wording is draft: it is yours to change. Points to settle are numbered at the end.`, '']
cases.forEach((c, i) => {
  md.push(`## ${String.fromCharCode(65 + i)}. ${c.name} (${c.code})`, '', `*${c.s.title}: ${c.why}.*`, '', `**Opening:** ${c.s.opening.figure} / ${c.s.opening.under}`, '', c.s.opening.line, '')
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
.open span{font-weight:600;font-size:9.5pt}
li{break-inside:avoid}
.note{background:#ebddc5;border-radius:8pt;padding:7pt 9pt;margin:6pt 0 4pt}
</style></head><body>`,
    '<h1>Nightreader: the sentences</h1>',
    `<p class="sub">Every sentence the page would say, for ${cases.length} places and nights, worked out from real figures on Tuesday November 10th 2026.</p>`,
    '<div class="note"><strong>All wording is draft: it is yours to change.</strong> The points to settle are numbered at the end, so you can reply by number. Places are named by Lightreader’s rule, reaching 60 miles where no town lies within 25; where there is still none (Shetland, Scilly), the compass point alone.</div>']
  cases.forEach((c, i) => {
    html.push(`<h2>${String.fromCharCode(65 + i)}. ${esc(c.name)} (${c.code})</h2>`, `<p class="day">${esc(c.s.title)}: ${esc(c.why)}.</p>`,
      `<div class="open"><b>${esc(c.s.opening.figure)}</b><span>${esc(c.s.opening.under)}</span></div>`, `<p>${esc(c.s.opening.line)}</p>`)
    for (const g of c.s.groups) html.push(`<div class="group"><h3>${esc(g.heading)}</h3><ul>${g.lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul></div>`)
  })
  html.push('<h2>Points for John</h2>', '<ol>', ...POINTS.map((p) => `<li>${esc(p)}</li>`), '</ol>', '</body></html>')
  writeFileSync(out, html.join('\n'))
}
console.log(`Wrote design/sentence-sheet-${TODAY}.md${out ? ` and ${out}` : ''}`)
