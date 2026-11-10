// Looking up a postcode in the bundled list (src/data/outcodes.json), so nothing typed is
// sent anywhere (SPEC §2). Postcode-district precision: only the first half is used.
// From Lightreader's src/lib/postcode.ts, for Great Britain.

import data from '../data/outcodes.json' with { type: 'json' }
import { placeNames } from './places.ts'
import type { Place } from './sun.ts'

/** `name` is the place as shown (Welsh in Wales); `own` its English name, for directions. */
export type District = Place & { code: string; name: string; own: string }

const OUTCODES = data.outcodes as unknown as Record<string, [number, number, string | null]>

/** The three credit lines that come with the list (OS Open Names). */
export const POSTCODE_CREDITS: string[] = data.credits

/** The first half of a postcode, from whatever someone types: "rg4", "RG4 7HN", "rg47hn".
 *  Null if it can't be a postcode. */
export function outwardCode(typed: string): string | null {
  const t = typed.toUpperCase().replace(/\s+/g, '')
  const m = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})?$/.exec(t)
  return m ? m[1] : null
}

/** The district for an outward code, or null if it isn't one in Great Britain. */
export function district(code: string): District | null {
  const d = OUTCODES[code]
  if (!d) return null
  const names = placeNames(code, d[2] || code)
  return { code, latitude: d[0], longitude: d[1], name: names.shown, own: names.own }
}

const KEY = 'nightreader.postcode'

/** The last postcode district chosen, kept on this device only. Blocked storage (a private
 *  window, say) just means starting afresh. */
export function savedDistrict(): District | null {
  try {
    const code = localStorage.getItem(KEY)
    return code ? district(code) : null
  } catch {
    return null
  }
}

export function saveDistrict(code: string) {
  try {
    localStorage.setItem(KEY, code)
  } catch {
    // Not saved; the page still works for this visit.
  }
}
