// "The year in darkness" (SPEC §6.3): every night for a year from tonight. For the picture,
// the Sun's height and the moonlight every ten minutes of UK clock time from 15:00 to 09:00;
// for the line of figures, each night's darkest stretch and how much of it is Moon-free.
// Worked out in the worker.

import { Body, Illumination, NextMoonQuarter, SearchMoonQuarter } from 'astronomy-engine'
import { nights, position, type DarkKind } from './night.ts'
import { sunPosition, type Place } from './sun.ts'
import { addDays, ukInstant } from './ukTime.ts'

export const YEAR_NIGHTS = 365, FIRST_HOUR = 15, STEP_MINUTES = 10, ROWS = 109 // 15:00 to 09:00

export type YearNight = { date: string; kind: DarkKind | null; from: number; to: number; darkMs: number; freeMs: number; lit: number }
export type YearView = {
  from: string
  /** One byte per night and row, night by night. Sun: 0 = 30° up or more … 64 = 18° below or
   *  more, in steps of 0.75°. Moon: its lit share times how far it is above the horizon, 0 to 36. */
  sun: Uint8Array
  moon: Uint8Array
  nights: YearNight[]
  /** New and full Moons, as nights from the first (with a fraction). */
  phases: { x: number; full: boolean }[]
  /** Runs of nights that don't reach true night, and that don't reach "very dark" either. */
  noTrueNight: [string, string][]
  noVeryDark: [string, string][]
}

function runs(list: YearNight[], test: (n: YearNight) => boolean): [string, string][] {
  const out: [string, string][] = []
  let start: string | null = null
  list.forEach((n, i) => {
    if (test(n) && start === null) start = n.date
    if (start !== null && (!test(n) || i === list.length - 1)) { out.push([start, test(n) ? n.date : list[i - 1].date]); start = null }
  })
  return out
}

export function yearView(place: Place, from: string): YearView {
  const sun = new Uint8Array(YEAR_NIGHTS * ROWS), moon = new Uint8Array(YEAR_NIGHTS * ROWS)
  for (let i = 0, date = from; i < YEAR_NIGHTS; i++, date = addDays(date, 1)) {
    const start = ukInstant(date, FIRST_HOUR).getTime()
    // the Moon's lit share barely changes in a night: once, in the middle, is enough
    const lit = Illumination(Body.Moon, new Date(start + 9 * 3_600_000)).phase_fraction
    for (let k = 0; k < ROWS; k++) {
      const at = new Date(start + k * STEP_MINUTES * 60_000)
      sun[i * ROWS + k] = Math.max(0, Math.min(64, Math.round((30 - sunPosition(place, at).altitude) / 0.75)))
      const up = Math.max(0, Math.min(1, (position(place, Body.Moon, at).altitude + 1) / 9))
      moon[i * ROWS + k] = Math.round(lit * up * up * (3 - 2 * up) * 36)
    }
  }
  const list: YearNight[] = nights(place, from, YEAR_NIGHTS).map((n) => ({
    date: n.date, kind: n.darkest?.kind ?? null, from: n.darkest?.from.getTime() ?? 0, to: n.darkest?.to.getTime() ?? 0,
    darkMs: n.darkMs, freeMs: n.moonFreeMs, lit: n.moonLit,
  }))
  const phases: YearView['phases'] = []
  const t0 = ukInstant(from, 12).getTime(), end = t0 + YEAR_NIGHTS * 86_400_000
  for (let q = SearchMoonQuarter(new Date(t0 - 86_400_000)); q.time.date.getTime() < end; q = NextMoonQuarter(q))
    if (q.quarter % 2 === 0) phases.push({ x: (q.time.date.getTime() - t0) / 86_400_000, full: q.quarter === 2 })
  return {
    from, sun, moon, nights: list, phases,
    noTrueNight: runs(list, (n) => n.kind !== 'true night'), noVeryDark: runs(list, (n) => n.kind === 'dark' || n.kind === null),
  }
}
