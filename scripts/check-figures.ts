// `npm run check`: the night's figures (src/lib/night.ts, ahead.ts) and the postcode list.
// Expected values were worked out with Astronomy Engine 2.1.19 on November 9th 2026 and read
// through in design/figures-sheet-2026-11-09.md; Moon times were compared with MET Norway.
// A change of library version or of a rule shows up here.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SHOWERS, lunarEclipses, meteorShowers, moonPhases, oppositions, solarEclipses, sunReaches } from '../src/lib/ahead.ts'
import { clock, duration } from '../src/lib/format.ts'
import { LOW, WELL, fists, moonLook, moonUp, night, nights, sky, sunDepthNeeded } from '../src/lib/night.ts'
import { placeNames } from '../src/lib/places.ts'
import { PHASE_MEANS, opening, sentences } from '../src/lib/sentences.ts'
import { dayFigures, type Place } from '../src/lib/sun.ts'
import { describeToward } from '../src/lib/towns.ts'
import { ukParts } from '../src/lib/ukTime.ts'

let passed = 0
function check(name: string, fn: () => void) { fn(); passed++; console.log(`ok  ${name}`) }

const data = JSON.parse(readFileSync(new URL('../src/data/outcodes.json', import.meta.url), 'utf8')) as { credits: string[]; outcodes: Record<string, [number, number, string]> }
const place = (code: string): Place => { const [latitude, longitude] = data.outcodes[code]; return { latitude, longitude } }
const RG1 = place('RG1'), ZE1 = place('ZE1'), EH1 = place('EH1')
const hm = (ms: number) => duration(ms).replace(/ /g, ' ')

check('the postcode list covers Great Britain, not Northern Ireland', () => {
  assert.equal(Object.keys(data.outcodes).length, 2863)
  for (const code of ['RG1', 'ZE1', 'EH1', 'CF10', 'TR18']) assert.ok(data.outcodes[code], code)
  assert.ok(!Object.keys(data.outcodes).some((c) => c.startsWith('BT')))
  assert.equal(data.credits.length, 3)
})

check('Reading tonight (new Moon): true night 18:19 to 05:17, all of it Moon-free', () => {
  const n = night(RG1, '2026-11-09')
  assert.equal(n.darkest!.kind, 'true night')
  assert.equal(`${clock(n.darkest!.from)} ${clock(n.darkest!.to)}`, '18:19 05:17')
  assert.equal(hm(n.darkMs), '10h 59m')
  assert.equal(n.moonFreeMs, n.darkMs)
})

check('first quarter (November 17th): the Moon sets at 23:33 and 5h 56m is Moon-free', () => {
  const n = night(RG1, '2026-11-17')
  assert.equal(hm(n.moonFreeMs), '5h 56m')
  assert.equal(clock(n.moonUp[0].to), '23:33')
  // MET Norway gives moonrise 13:16 and moonset 23:32 (seconds dropped) for this day
  const up = moonUp(RG1, new Date('2026-11-17T00:00:00Z'), new Date('2026-11-18T00:00:00Z'))
  assert.equal(up.length, 1)
  assert.ok(Math.abs(up[0].from.getTime() - Date.parse('2026-11-17T13:16:30Z')) < 60_000)
  assert.ok(Math.abs(up[0].to.getTime() - Date.parse('2026-11-17T23:32:30Z')) < 60_000)
})

check('full Moon (November 24th): none of true night is Moon-free', () => {
  const n = night(RG1, '2026-11-24')
  assert.equal(n.moonFreeMs, 0)
  assert.ok(n.moonLit > 0.99)
})

check('Moon-free time is never more than the dark stretch, and never negative, for a year', () => {
  for (const n of nights(RG1, '2026-11-09', 365)) assert.ok(n.moonFreeMs >= 0 && n.moonFreeMs <= n.darkMs, n.date)
})

check('Reading has no true night from May 23rd to July 19th 2027 (as Lightreader), and falls back to very dark', () => {
  const all = nights(RG1, '2027-05-15', 75)
  const without = all.filter((n) => n.darkest?.kind !== 'true night')
  assert.equal(without[0].date, '2027-05-23')
  assert.equal(without[without.length - 1].date, '2027-07-19')
  assert.equal(without.length, 58)
  assert.ok(without.every((n) => n.darkest?.kind === 'very dark'))
})

check('further north the fallback goes one step more: Edinburgh and Lerwick only reach "dark" on June 21st', () => {
  assert.equal(night(EH1, '2027-06-21').darkest!.kind, 'dark')
  const lerwick = night(ZE1, '2027-06-21')
  assert.equal(lerwick.darkest!.kind, 'dark')
  assert.equal(hm(lerwick.darkMs), '1h 21m')
})

check('the Moon as it looks: first quarter is half lit, bright edge down to the right in the evening', () => {
  const look = moonLook(RG1, new Date('2026-11-17T18:25:00Z'))
  assert.equal(look.phase, 'First quarter')
  assert.ok(Math.abs(look.lit - 0.53) < 0.01)
  assert.ok(look.tilt < -90 && look.tilt > -130, String(look.tilt))
})

check('the in-view rule: two heights, and a darker sky for fainter planets', () => {
  assert.deepEqual([WELL, LOW], [20, 10])
  assert.deepEqual([-4.6, -2.1, 0.4, 1.9].map(sunDepthNeeded), [3, 4.5, 6, 9])
  assert.deepEqual([40, 54, 12, 4].map(fists), [4, 5.5, 1, 0.5])
})

check('Reading tonight: Saturn well placed in the south, Venus only low, Mercury and the Moon not in view', () => {
  const s = Object.fromEntries(sky(RG1, '2026-11-09').map((b) => [b.name, b]))
  assert.equal(s.Saturn.level, 'well')
  assert.equal(`${clock(s.Saturn.best!.at)} ${Math.round(s.Saturn.best!.altitude)}`, '21:24 40')
  assert.equal(`${clock(s.Saturn.wellPlaced[0].from)} ${clock(s.Saturn.wellPlaced[0].to)}`, '17:32 01:16')
  assert.equal(s.Venus.level, 'low')
  assert.equal(s.Mars.level, 'well')
  assert.equal(s.Jupiter.level, 'well')
  assert.equal(s.Mercury.why, 'too close to the Sun')
  assert.equal(s.Moon.why, 'below the horizon all night')
})

check('the same planets stand lower from Lerwick', () => {
  const s = Object.fromEntries(sky(ZE1, '2026-11-09').map((b) => [b.name, b]))
  assert.equal(Math.round(s.Saturn.best!.altitude), 31)
  assert.equal(s.Venus.level, 'low')
})

check('looking ahead from Reading: phases, eclipses and oppositions', () => {
  const from = new Date('2026-11-09T12:00:00Z')
  const phases = moonPhases(from, 2)
  assert.equal(`${phases[1].phase} ${ukParts(phases[1].at).date} ${clock(phases[1].at)}`, 'Full Moon 2026-11-24 14:54')
  const sun = solarEclipses(RG1, from, 1)[0]
  assert.equal(`${ukParts(sun.peak).date} ${clock(sun.begin)} ${clock(sun.peak)} ${clock(sun.end)} ${Math.round(sun.covered * 100)}`, '2027-08-02 09:03 09:59 10:58 42')
  const moon = lunarEclipses(RG1, from, 3)
  assert.deepEqual(moon.map((e) => `${e.kind} ${ukParts(e.peak).date}`), ['partial 2028-01-12', 'total 2028-12-31', 'total 2029-06-26'])
  assert.deepEqual(oppositions(from).map((o) => `${o.name} ${ukParts(o.at).date}`), ['Jupiter 2027-02-11', 'Mars 2027-02-19', 'Saturn 2027-10-18'])
})

check('meteor shower peaks match the International Meteor Organization\u2019s 2027 calendar', () => {
  // its own times for 2027 (UT): Quadrantids January 4th 03:25, Leonids November 18th 06h, Ursids December 23rd 04h
  const from = new Date('2026-12-25T00:00:00Z')
  const near = (longitude: number, iso: string, minutes: number) => assert.ok(Math.abs(sunReaches(longitude, from).getTime() - Date.parse(iso)) < minutes * 60_000, iso)
  near(283.15, '2027-01-04T03:25:00Z', 15)
  near(235.27, '2027-11-18T06:00:00Z', 30)
  near(270.7, '2027-12-23T04:00:00Z', 45)
  assert.deepEqual(SHOWERS.map((s) => s.perHour), [80, 18, 50, 110, 20, 15, 150, 10])
})

check('each meteor shower gets the night nearest its peak', () => {
  const m = Object.fromEntries(meteorShowers(RG1, new Date('2026-11-09T12:00:00Z')).map((s) => [s.name, s]))
  assert.equal(`${ukParts(m.Geminids.peak).date} ${m.Geminids.night.date} ${hm(m.Geminids.night.moonFreeMs)}`, '2026-12-14 2026-12-14 8h 40m')
  assert.equal(`${ukParts(m.Quadrantids.peak).date} ${m.Quadrantids.night.date}`, '2027-01-04 2027-01-03')
  assert.equal(`${ukParts(m.Perseids.peak).date} ${m.Perseids.night.date}`, '2027-08-13 2027-08-12')
  assert.equal(m.Ursids.night.moonFreeMs, 0)
})

check('directions name real places across Great Britain, never your own place', () => {
  assert.equal(describeToward(RG1, 180, 'Reading'), ', between Bordon and Alton (near Hook)')
  assert.equal(describeToward(RG1, 181.7, 'Reading'), ', roughly over Alton') // Saturn at its highest tonight
  assert.ok(!describeToward(RG1, 0, 'Reading').includes('Reading'))
  assert.match(describeToward(EH1, 250, 'Edinburgh'), /between|roughly over/)
  assert.equal(describeToward(ZE1, 90, 'Lerwick'), '') // east of Lerwick is the sea
  // where nothing lies within 25 miles the reach grows to 60: east of Inverness
  assert.equal(describeToward(place('IV1'), 90, 'Inverness'), ', between Elgin and Charlestown of Aberlour')
})

check('a shower peaking tonight is found, not skipped to next year', () => {
  // from midday on August 12th 2027 the Perseids' peak is 20 hours away (08:19 UTC on the 13th)
  assert.equal(sunReaches(140.0, new Date('2027-08-12T12:27:00Z')).toISOString().slice(0, 16), '2027-08-13T08:19')
  assert.equal(sunReaches(140.0, new Date('2027-08-13T08:30:00Z')).getUTCFullYear(), 2028)
  const from = dayFigures(place('CF10'), '2027-08-12').noon
  assert.equal(meteorShowers(place('CF10'), from)[0].name, 'Perseids')
})

check('the sentences: Reading on November 10th, a full Moon, midsummer, and a shower tonight', () => {
  const a = sentences(RG1, 'Reading', '2026-11-10')
  assert.deepEqual(a.opening, { figure: '11h\u00a02m', under: 'of Moon-free true night', note: '', line: 'True night runs from 18:17 to 05:19, 11h\u00a02m in all. The Moon stays down throughout.' })
  assert.deepEqual(a.groups[0].lines, ['New Moon, 3% lit. At new Moon the Moon lies between us and the Sun, so its lit side faces away from us.', 'It stays below the horizon all night.'])
  assert.equal(Object.keys(PHASE_MEANS).length, 8)
  assert.equal(a.groups[1].lines[4], 'Mercury: not in view tonight, too close to the Sun.')
  assert.equal(opening(night(RG1, '2026-11-24')).figure, 'No Moon-free night')
  // summer: the opening says which kinds of night aren't reached
  assert.deepEqual(opening(night(RG1, '2027-06-21')), { figure: 'No Moon-free night', under: 'The Moon is up throughout', note: '(True night is not reached tonight either.)', line: 'The sky is \u201cvery dark\u201d from 23:26 to 02:45, 3h\u00a019m in all. The Moon is up throughout.' })
  const h = opening(night(EH1, '2027-06-21'))
  assert.deepEqual([h.figure, h.under, h.note], ['42m', 'of Moon-free \u201cdark\u201d night', '(\u201cVery dark\u201d and true night are not reached tonight.)'])
  // a well-placed planet; a direction already given isn't repeated; like reasons together
  assert.equal(a.groups[1].lines[0], 'Saturn is well placed from 17:28 to 01:12, and in view for 29m before and 1h\u00a08m after that window. At its highest, at 21:20, it stands 40° up (four fists) in the south, between Bordon and Alton (near Hook).')
  assert.match(a.groups[1].lines[1], /^Mars is well placed from 01:21 to 06:38, and in view for 1h\u00a05m before that\. .* in the same direction as Saturn\.$/)
  const l = sentences(place('CF10'), 'Cardiff', '2027-08-12').groups
  assert.ok(l[1].lines.includes('Mercury, Venus and Jupiter: not in view tonight, too close to the Sun.'))
  assert.ok(l[2].lines.includes('Perseids meteor shower: best tonight. A fair year for this annual event: 2h\u00a02m of the night is Moon-free.'))
  // a spell of a few minutes doesn't count: Mercury on November 17th was in view for three
  assert.equal(sentences(RG1, 'Reading', '2026-11-17').groups[1].lines[4], 'Mercury: not in view tonight, too low while the sky is dark.')
  assert.ok(sentences(RG1, 'Reading', '2027-08-12').groups[2].lines.some((x) => x.endsWith('Looking at the Sun without proper protection is dangerous and should be avoided.')))
  assert.ok(sentences(RG1, 'Reading', '2026-11-24').groups[2].lines.includes('Full Moon: today (November 24th).'))
  for (const g of a.groups) for (const l of g.lines) assert.ok(!/undefined|NaN|null/.test(l), l)
})

check('place names: Welsh in Wales, one name elsewhere, the English name kept for directions', () => {
  assert.deepEqual(placeNames('CF10', 'Cardiff / Caerdydd'), { shown: 'Caerdydd', own: 'Cardiff' })
  assert.deepEqual(placeNames('SA1', 'Abertawe / Swansea'), { shown: 'Abertawe', own: 'Swansea' })
  assert.deepEqual(placeNames('IV1', 'Inverness / Inbhir Nis'), { shown: 'Inverness', own: 'Inverness' })
  assert.deepEqual(placeNames('RG1', 'Reading'), { shown: 'Reading', own: 'Reading' })
})

check('Looking ahead shows 30 days, big showers three months and both eclipses; the rest is folded', () => {
  const g = sentences(RG1, 'Reading', '2026-11-10').groups
  assert.deepEqual(g[2].lines.map((l) => l.split(':')[0]), ['Leonids meteor shower', 'Best mornings for Mercury', 'Full Moon', 'New Moon', 'Geminids meteor shower', 'Quadrantids meteor shower', 'Eclipse of the Sun'])
  assert.ok(g[3].lines.some((l) => l.startsWith('Eclipse of the Moon: January 12th 2028.'))) // 3% covered: under the fold
  assert.equal(g[3].lines[0].split(':')[0], 'Ursids meteor shower') // a small shower 42 days off
  assert.equal(g[3].lines.length, 10)
})

console.log(`\n${passed} checks passed`)
