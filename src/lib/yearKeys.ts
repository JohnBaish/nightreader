// The two keys under "The year in darkness", as colours and words, shared by the page and by the
// picture made for "Copy" / "Share" (the fresh look's 2.6), so the shared picture can be read too.

import { cssRgb, skyAt } from './skyColour.ts'

const WASH = [174, 184, 238] // the colour of a moonlit sky, as skyColour.ts
export type KeyItem = { label: string; colour: string }

/** The sky: a colour for each band, from the Sun's height in the middle of it. */
export const SKY_KEY: KeyItem[] = ([['Daylight', 10], ['Half-light', -3], ['Dark', -9], ['Very dark', -15], ['True night', -19]] as const)
  .map(([label, sun]) => ({ label, colour: cssRgb(skyAt(sun)) }))

/** Moonlight in the night: a true-night sky washed paler the fuller the Moon. */
export const MOON_KEY: (KeyItem & { glyph: number | null })[] = ([['Moon down', 0, null], ['Thin', 0.12, 0.12], ['Quarter', 0.25, 0.25], ['Half', 0.5, 0.5], ['Three quarters', 0.75, 0.75], ['Full', 1, 1]] as const)
  .map(([label, k, glyph]) => {
    const night = skyAt(-18)
    return { label, glyph, colour: cssRgb(night.map((v, i) => v + (WASH[i] - v) * k * 0.52) as [number, number, number]) }
  })
