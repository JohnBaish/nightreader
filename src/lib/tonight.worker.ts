// The page's worker: one night's figures and sentences for a place (src/lib/tonight.ts).
// Nothing leaves the device; this only keeps the sums off the page's own thread.

import { tonight, type Tonight } from './tonight.ts'
import type { Place } from './sun.ts'

export type Ask = { id: number; place: Place; own: string; date: string }
export type Answer = { id: number; view: Tonight }

self.onmessage = (e: MessageEvent<Ask>) => {
  const { id, place, own, date } = e.data
  self.postMessage({ id, view: tonight(place, own, date) } satisfies Answer)
}
