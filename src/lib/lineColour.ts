import { PLANETS } from './night.ts'

/** The colour of the planet a sentence starts with, for the small mark beside it. */
export function lineColour(line: string): string | null {
  const first = PLANETS.find((p) => line.startsWith(p))
  return first ? `var(--${first.toLowerCase()})` : null
}
