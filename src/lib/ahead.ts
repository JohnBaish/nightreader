// Looking ahead (SPEC §7): the Moon's phases, eclipses, the planets at their best, and meteor
// showers, each worked out for the place.

import {
  Body, Illumination, NextLocalSolarEclipse, NextLunarEclipse, NextMoonQuarter, Observer, SearchLocalSolarEclipse,
  GeoVector, RotateVector, Rotation_EQJ_ECL, SearchLunarEclipse, SearchMaxElongation, SearchMoonQuarter, SearchRelativeLongitude,
  SphereFromVector,
} from 'astronomy-engine'
import { night, position, type Night } from './night.ts'
import type { Place } from './sun.ts'
import { ukParts } from './ukTime.ts'

const QUARTERS = ['New Moon', 'First quarter', 'Full Moon', 'Last quarter']

export function moonPhases(from: Date, count: number): { phase: string; at: Date }[] {
  const out = []
  let q = SearchMoonQuarter(from)
  for (let i = 0; i < count; i++) { out.push({ phase: QUARTERS[q.quarter], at: q.time.date }); q = NextMoonQuarter(q) }
  return out
}

/** Eclipses of the Moon with the Moon above the horizon at the peak. Faint ("penumbral") ones,
 *  which only dim the Moon slightly and are hard to notice, are left out (John, November 9th 2026). */
export function lunarEclipses(place: Place, from: Date, count: number): { kind: string; peak: Date; covered: number; altitude: number }[] {
  const out = []
  let e = SearchLunarEclipse(from)
  for (let tries = 0; out.length < count && tries < 40; tries++) {
    const altitude = position(place, Body.Moon, e.peak.date).altitude
    if (altitude > 0 && e.kind !== 'penumbral') out.push({ kind: e.kind, peak: e.peak.date, covered: e.obscuration, altitude })
    e = NextLunarEclipse(e.peak)
  }
  return out
}

/** Eclipses of the Sun seen from the place, with the Sun up at the peak. */
export function solarEclipses(place: Place, from: Date, count: number): { kind: string; begin: Date; peak: Date; end: Date; covered: number; altitude: number }[] {
  const obs = new Observer(place.latitude, place.longitude, 0)
  const out = []
  let e = SearchLocalSolarEclipse(from, obs)
  for (let tries = 0; out.length < count && tries < 40; tries++) {
    if (e.peak.altitude > 0) out.push({ kind: e.kind, begin: e.partial_begin.time.date, peak: e.peak.time.date, end: e.partial_end.time.date, covered: e.obscuration, altitude: e.peak.altitude })
    e = NextLocalSolarEclipse(e.peak.time, obs)
  }
  return out
}

/** Mars, Jupiter and Saturn opposite the Sun: at their brightest and up all night. */
export function oppositions(from: Date): { name: string; at: Date; magnitude: number }[] {
  return (['Mars', 'Jupiter', 'Saturn'] as const)
    .map((name) => { const t = SearchRelativeLongitude(Body[name], 0, from); return { name, at: t.date, magnitude: Illumination(Body[name], t).mag } })
    .sort((a, b) => a.at.getTime() - b.at.getTime())
}

/** Mercury and Venus at their furthest from the Sun: the best mornings or evenings for them. */
export function elongations(from: Date, until: Date): { name: string; at: Date; degrees: number; sky: 'morning' | 'evening' }[] {
  const out = []
  for (const name of ['Mercury', 'Venus'] as const) {
    let e = SearchMaxElongation(Body[name], from)
    while (e.time.date < until) { out.push({ name, at: e.time.date, degrees: e.elongation, sky: e.visibility as 'morning' | 'evening' }); e = SearchMaxElongation(Body[name], e.time.AddDays(1)) }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime())
}

/** The main meteor showers, from the International Meteor Organization's Working List of Visual
 *  Meteor Showers (Table 5 of its 2027 Meteor Shower Calendar, IMO INFO(3-26), read November
 *  10th 2026): the point on the Sun's yearly path where each peaks (its longitude in degrees,
 *  for the equinox of 2000), the most an observer might count in an hour under perfect skies
 *  with the shower overhead ("80+" and the like given as the plain number), and where in the
 *  sky the meteors seem to come from (right ascension and declination, degrees). */
export const SHOWERS: { name: string; sunLongitude: number; perHour: number; radiant: [number, number] }[] = [
  { name: 'Quadrantids', sunLongitude: 283.15, perHour: 80, radiant: [230, 49] },
  { name: 'Lyrids', sunLongitude: 32.32, perHour: 18, radiant: [271, 34] },
  { name: 'Eta Aquariids', sunLongitude: 45.5, perHour: 50, radiant: [338, -1] },
  { name: 'Perseids', sunLongitude: 140.0, perHour: 110, radiant: [48, 58] },
  { name: 'Orionids', sunLongitude: 208, perHour: 20, radiant: [95, 16] },
  { name: 'Leonids', sunLongitude: 235.27, perHour: 15, radiant: [152, 22] },
  { name: 'Geminids', sunLongitude: 262.2, perHour: 150, radiant: [112, 33] },
  { name: 'Ursids', sunLongitude: 270.7, perHour: 10, radiant: [217, 76] },
]

/** The Sun's longitude at `at`, measured from the equinox of 2000, as the shower list is. */
function sunLongitude2000(at: Date): number {
  return SphereFromVector(RotateVector(Rotation_EQJ_ECL(), GeoVector(Body.Sun, at, true))).lon
}

/** The next time after `from` the Sun reaches `longitude` (equinox of 2000). Worked out from
 *  the Sun's own position rather than Astronomy Engine's search, which measures from the
 *  equinox of the date (about 0.4°, ten hours of the Sun's travel, on from 2000) and, asked to
 *  look a whole year ahead, can skip a crossing only hours away. */
export function sunReaches(longitude: number, from: Date): Date {
  const ahead = (((longitude - sunLongitude2000(from)) % 360) + 360) % 360
  let at = new Date(from.getTime() + (ahead / 0.98565) * 86_400_000)
  for (let i = 0; i < 8; i++) {
    const off = ((longitude - sunLongitude2000(at) + 540) % 360) - 180
    at = new Date(at.getTime() + (off / 0.98565) * 86_400_000)
  }
  return at
}

/** Each shower's next peak, and the night nearest it at the place (the night before a peak that
 *  falls before UK midday, otherwise the night that follows). */
export function meteorShowers(place: Place, from: Date): { name: string; perHour: number; peak: Date; night: Night }[] {
  return SHOWERS.map((s) => {
    const peak = sunReaches(s.sunLongitude, from)
    const uk = ukParts(peak)
    const date = uk.hour < 12 ? new Date(Date.parse(uk.date + 'T00:00:00Z') - 86_400_000).toISOString().slice(0, 10) : uk.date
    return { name: s.name, perHour: s.perHour, peak, night: night(place, date) }
  }).sort((a, b) => a.peak.getTime() - b.peak.getTime())
}
