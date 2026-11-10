// Every sentence the page says (PLAN stage 2), as plain functions of a place and a night, so
// John can read and reword them in the sentence sheet before any page is built. The wording
// is draft until he agrees it.

import { elongations, lunarEclipses, meteorShowers, moonPhases, oppositions, solarEclipses } from './ahead.ts'
import { clock, compassPoint, duration, longDate, ordinal } from './format.ts'
import { fists, moonLook, night, sky, type InView, type Night, type Span } from './night.ts'
import { dayFigures, type Place } from './sun.ts'
import { describeToward } from './towns.ts'
import { addDays, ukParts } from './ukTime.ts'
import { numberWord } from './words.ts'

export type Group = { heading: string; lines: string[] }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)

/** A date inside a sentence, as Lightreader writes them: "December 14th"; the weekday in
 *  brackets when it's one to six days ahead; the year when it's more than 300 days away. */
export function dayIn(date: string, today: string): string {
  const d = new Date(date + 'T12:00:00Z'), away = daysBetween(today, date)
  const base = `${MONTHS[d.getUTCMonth()]} ${ordinal(d.getUTCDate())}`
  if (away >= 1 && away <= 6) return `${base} (${WEEKDAYS[d.getUTCDay()]})`
  return Math.abs(away) > 300 ? `${base} ${d.getUTCFullYear()}` : base
}
const ukDate = (at: Date) => ukParts(at).date
/** A date after a colon: "today (November 24th)" on the day itself. */
const onDay = (date: string, today: string) => (date === today ? `today (${dayIn(date, today)})` : dayIn(date, today))

/** "four fists", "one and a half fists", "half a fist". */
export function fistWords(altitude: number): string {
  const f = fists(altitude), whole = Math.floor(f), half = f - whole > 0
  if (f < 0.5) return 'less than half a fist'
  if (!whole) return 'half a fist'
  return `${numberWord(whole)}${half ? ' and a half' : ''} fist${f === 1 ? '' : 's'}`
}
const span = (s: Span) => `${clock(s.from)} to ${clock(s.to)}`
const WORD = { 'true night': 'true night', 'very dark': '“very dark”', dark: '“dark”' } as const
const up = (s: string) => s[0].toUpperCase() + s.slice(1)

/** The opening: the big figure, the words under it, and the sentence beside the Moon. */
export function opening(n: Night): { figure: string; under: string; line: string } {
  if (!n.darkest) return { figure: 'No darkness tonight', under: 'Half-light all night', line: 'The Sun stays close below the horizon, so the sky never gets dark.' }
  const kind = WORD[n.darkest.kind], none = n.moonFreeMs < 30_000, all = n.darkMs - n.moonFreeMs < 30_000
  const runs = n.darkest.kind === 'true night'
    ? `True night runs from ${clock(n.darkest.from)} to ${clock(n.darkest.to)}, ${duration(n.darkMs)} in all.`
    : `There’s no true night tonight: the darkest the sky gets is ${kind}, from ${clock(n.darkest.from)} to ${clock(n.darkest.to)}, ${duration(n.darkMs)} in all.`
  const inDark = n.moonUp.filter((s) => s.to > n.darkest!.from && s.from < n.darkest!.to)
  let moon: string
  if (none) moon = 'The Moon is up throughout.'
  else if (all) moon = 'The Moon stays down throughout.'
  else if (inDark.length === 1 && inDark[0].from <= n.darkest.from) moon = `The Moon sets at ${clock(inDark[0].to)}; the sky is at its darkest after that.`
  else if (inDark.length === 1 && inDark[0].to >= n.darkest.to) moon = `The Moon rises at ${clock(inDark[0].from)}; the sky is at its darkest before that.`
  else moon = `The Moon is up ${inDark.map((s) => `from ${span(s)}`).join(' and ')}.`
  return none
    ? { figure: 'No Moon-free night', under: `The Moon is up for the whole of ${kind}`, line: `${runs} ${moon}` }
    : { figure: duration(n.moonFreeMs), under: `of Moon-free ${kind}`, line: `${runs} ${moon}` }
}

const where = (place: Place, own: string, azimuth: number) => `in the ${compassPoint(azimuth)}${describeToward(place, azimuth, own)}`

/** The Moon tonight: its phase, its rising and setting, and its highest point after dark. */
export function moonLines(place: Place, own: string, n: Night, moon: InView): string[] {
  const look = moonLook(place, n.darkest ? new Date((n.darkest.from.getTime() + n.darkest.to.getTime()) / 2) : n.sunset!)
  const lines = [`${look.phase}, ${Math.round(n.moonLit * 100)}% lit.`]
  const from = n.sunset!, to = n.sunrise!
  if (!n.moonUp.length) lines.push('It stays below the horizon all night.')
  for (const s of n.moonUp) {
    const rises = s.from > from, sets = s.to < to
    const at = (t: Date) => where(place, own, moonLook(place, t).azimuth)
    if (rises && sets) lines.push(`It rises at ${clock(s.from)} ${at(s.from)}, and sets at ${clock(s.to)} ${at(s.to)}.`)
    else if (rises) lines.push(`It rises at ${clock(s.from)} ${at(s.from)}, and is still up at sunrise.`)
    else if (sets) lines.push(`It is already up at sunset, and sets at ${clock(s.to)} ${at(s.to)}.`)
    else lines.push('It is up all night.')
  }
  if (moon.best) lines.push(`At its highest during the night, at ${clock(moon.best.at)}, it stands ${Math.round(moon.best.altitude)}° up (${fistWords(moon.best.altitude)}) ${where(place, own, moon.best.azimuth)}.`)
  return lines
}

/** One planet's line. */
export function planetLine(place: Place, own: string, b: InView): string {
  if (!b.level) return `${b.name}: not in view tonight, ${b.why}.`
  const best = b.best!, height = `${Math.round(best.altitude)}° up (${fistWords(best.altitude)}) ${where(place, own, best.azimuth)}`
  const seen = b.inView.map(span).join(' and ')
  if (b.level === 'low') return `${b.name} is low: in view from ${seen}, at best ${height}, at ${clock(best.at)}. It needs a clear horizon.`
  const well = b.wellPlaced.map(span).join(' and ')
  return `${b.name} is well placed from ${well} (in view from ${seen}). At its highest, at ${clock(best.at)}, it stands ${height}.`
}

/** A meteor shower's verdict, from how much of the darkest stretch has no Moon. */
export function showerVerdict(n: Night): string {
  if (!n.darkest) return 'a poor year: the sky never gets dark that night'
  const share = n.moonFreeMs / n.darkMs
  if (share >= 0.75) return share > 0.99 ? 'a very good year: no Moon at all' : `a good year: ${duration(n.moonFreeMs)} of the night is Moon-free`
  if (share >= 0.35) return `a fair year: ${duration(n.moonFreeMs)} of the night is Moon-free`
  return n.moonFreeMs < 30_000 ? 'a poor year: the Moon is up all night' : `a poor year: only ${duration(n.moonFreeMs)} of the night is Moon-free`
}

/** Looking ahead, in date order. */
export function aheadLines(place: Place, date: string): string[] {
  const from = dayFigures(place, date).noon, until = new Date(from.getTime() + 370 * 86_400_000)
  const out: { at: Date; line: string }[] = []
  const seen = new Set<string>()
  for (const q of moonPhases(from, 8)) if ((q.phase === 'New Moon' || q.phase === 'Full Moon') && !seen.has(q.phase)) { seen.add(q.phase); out.push({ at: q.at, line: `${q.phase}: ${onDay(ukDate(q.at), date)}.` }) }
  for (const e of solarEclipses(place, from, 1)) out.push({ at: e.peak, line: `Eclipse of the Sun: ${onDay(ukDate(e.peak), date)}, from ${clock(e.begin)} to ${clock(e.end)}. At ${clock(e.peak)} the Moon covers ${Math.round(e.covered * 100)}% of the Sun. Never look at the Sun without proper eclipse glasses.` })
  for (const e of lunarEclipses(place, from, 1)) out.push({ at: e.peak, line: `Eclipse of the Moon: ${onDay(ukDate(e.peak), date)}. At ${clock(e.peak)} the Earth’s shadow covers ${e.kind === 'total' ? 'all' : `${Math.round(e.covered * 100)}%`} of the Moon, which is ${Math.round(e.altitude)}° up.` })
  for (const o of oppositions(from)) if (o.at < until) out.push({ at: o.at, line: `${o.name} at its best: ${onDay(ukDate(o.at), date)}, when it is opposite the Sun, at its brightest and up all night.` })
  const firstOf = new Set<string>()
  for (const e of elongations(from, until)) if (!firstOf.has(e.name)) { firstOf.add(e.name); out.push({ at: e.at, line: `Best ${e.sky}s for ${e.name}: ${ukDate(e.at) === date ? `around now (${dayIn(date, date)})` : `around ${dayIn(ukDate(e.at), date)}`}, when it is furthest from the Sun.` }) }
  const showers = meteorShowers(place, from)
  for (const m of showers.filter((s, i) => i === 0 || s.peak.getTime() - from.getTime() < 100 * 86_400_000)) out.push({ at: m.peak, line: `${m.name}: ${m.night.date === date ? 'best tonight' : `best on the night of ${dayIn(m.night.date, date)}`}. ${up(showerVerdict(m.night))}.` })
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).map((o) => o.line)
}

/** Every group for a place and the night that starts on `date`. */
export function sentences(place: Place, own: string, date: string): { title: string; opening: ReturnType<typeof opening>; groups: Group[] } {
  const n = night(place, date)
  const bodies = sky(place, date)
  const moon = bodies[0], planets = bodies.slice(1)
  const start = (b: InView) => (b.inView[0]?.from.getTime() ?? Infinity)
  const shown = [...planets.filter((b) => b.level)].sort((a, b) => start(a) - start(b))
  const hidden = planets.filter((b) => !b.level)
  const next = longDate(addDays(date, 1)).split(' ')[0]
  return {
    title: `${longDate(date)} into ${next}`,
    opening: opening(n),
    groups: [
      { heading: 'The Moon', lines: moonLines(place, own, n, moon) },
      { heading: 'The planets', lines: [...shown.map((b) => planetLine(place, own, b)), ...hidden.map((b) => planetLine(place, own, b))] },
      { heading: 'Looking ahead', lines: aheadLines(place, date) },
    ],
  }
}
