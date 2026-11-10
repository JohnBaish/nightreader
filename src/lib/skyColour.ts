// The sky's colour from the Sun's height, in the "Ember" look John chose (November 9th 2026):
// deep indigo at true night, a terracotta-to-gold glow at the horizon. Moonlight washes a dark
// sky paler. Copied from the agreed mock-up (design/mockups/template.html).

type Rgb = [number, number, number]
const RAMP: [number, string][] = [[30, '#34407c'], [12, '#5a5a98'], [6, '#9a6f9a'], [2, '#dc8d6e'], [0, '#f0b07c'], [-3, '#c2687a'], [-6, '#74508f'], [-9, '#403b7a'], [-12, '#232a5e'], [-18, '#0d1233']]
const rgb = (h: string): Rgb => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb
const STOPS = RAMP.map(([alt, hex]) => [alt, rgb(hex)] as const)
/** The colour of a moonlit sky. */
const WASH = rgb('#aeb8ee')

/** The sky's colour with the Sun `altitude` degrees up (negative below the horizon). */
export function skyAt(altitude: number): Rgb {
  if (altitude >= STOPS[0][0]) return STOPS[0][1]
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [a, ca] = STOPS[i], [b, cb] = STOPS[i + 1]
    if (altitude <= a && altitude >= b) { const f = (a - altitude) / (a - b); return ca.map((v, k) => v + (cb[k] - v) * f) as Rgb }
  }
  return STOPS[STOPS.length - 1][1]
}
const smooth = (x: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/** The sky with moonlight: `moon` is 0 to 1 (how full, times whether it's up). Moonlight only
 *  shows once the sky has darkened. */
export function moonlit(altitude: number, moon: number): Rgb {
  const c = skyAt(altitude), k = moon * 0.5 * smooth(-altitude, 3, 10)
  return c.map((v, i) => v + (WASH[i] - v) * k) as Rgb
}
export const cssRgb = (c: Rgb) => `rgb(${c.map(Math.round).join(',')})`
