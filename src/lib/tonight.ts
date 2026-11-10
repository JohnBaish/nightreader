// Everything the page shows for one night at one place: the figures, the sentences, and the
// heights of the Moon and planets through the night for "The sky tonight" (SPEC §6.1).
// Worked out in a worker (tonight.worker.ts), so the page stays quick.

import { Body, SiderealTime } from 'astronomy-engine'
import { moonLook, night, PLANETS, position, sky, type InView, type Night, type PlanetName } from './night.ts'
import { opening, sentences, type Group } from './sentences.ts'
import { dayFigures, sunPosition, type Place } from './sun.ts'
import { addDays, ukParts } from './ukTime.ts'

/** The night the page shows at `now`: the one that starts today, unless it's still before
 *  sunrise on the night that started yesterday. */
export function tonightDate(place: Place, now: Date): string {
  const today = ukParts(now).date
  const sunrise = dayFigures(place, today).sunrise
  return sunrise && now < sunrise ? addDays(today, -1) : today
}

export const STEP_MINUTES = 5, MARGIN_MINUTES = 40

/** Heights in degrees every five minutes, from 40 minutes before sunset to 40 after sunrise;
 *  and for "Where to look", directions (degrees from north), the Moon's tilt, and the local
 *  sidereal time in degrees, which places the stars. */
export type Series = {
  from: number; step: number; sun: number[]; moon: number[]; planets: Record<PlanetName, number[]>
  sunAz: number[]; moonAz: number[]; moonTilt: number[]; planetAz: Record<PlanetName, number[]>; lst: number[]
}

export function series(place: Place, n: Night): Series {
  const step = STEP_MINUTES * 60_000
  const from = Math.floor((n.sunset!.getTime() - MARGIN_MINUTES * 60_000) / step) * step
  const to = n.sunrise!.getTime() + MARGIN_MINUTES * 60_000
  const five = (): Record<PlanetName, number[]> => ({ Mercury: [], Venus: [], Mars: [], Jupiter: [], Saturn: [] })
  const s: Series = { from, step, sun: [], moon: [], planets: five(), sunAz: [], moonAz: [], moonTilt: [], planetAz: five(), lst: [] }
  for (let t = from; t <= to + step; t += step) {
    const at = new Date(t)
    const sun = sunPosition(place, at), look = moonLook(place, at)
    s.sun.push(sun.altitude); s.sunAz.push(sun.azimuth)
    s.moon.push(look.altitude); s.moonAz.push(look.azimuth); s.moonTilt.push(look.tilt)
    for (const p of PLANETS) { const q = position(place, Body[p], at); s.planets[p].push(q.altitude); s.planetAz[p].push(q.azimuth) }
    s.lst.push((((SiderealTime(at) * 15 + place.longitude) % 360) + 360) % 360)
  }
  return s
}

export type Tonight = {
  date: string
  title: string
  night: Night
  opening: ReturnType<typeof opening>
  groups: Group[]
  bodies: InView[]
  series: Series | null
  /** The Moon as drawn at the top: at its highest while in view, or in the middle of the night. */
  moon: { lit: number; tilt: number; up: boolean; at: Date }
}

export function tonight(place: Place, own: string, date: string): Tonight {
  const n = night(place, date)
  const bodies = sky(place, date)
  const s = sentences(place, own, date)
  const mid = n.darkest ? new Date((n.darkest.from.getTime() + n.darkest.to.getTime()) / 2) : (n.sunset ?? dayFigures(place, date).noon)
  const at = bodies[0].best?.at ?? mid
  const look = moonLook(place, at)
  return {
    date, title: s.title, night: n, opening: s.opening, groups: s.groups, bodies,
    series: n.sunset && n.sunrise ? series(place, n) : null,
    moon: { lit: n.moonLit, tilt: look.tilt, up: look.altitude > 0, at },
  }
}
