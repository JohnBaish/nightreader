// A postcode district's name as Nightreader shows it. Some districts in the list carry two
// names ("Cardiff / Caerdydd", "Abertawe / Swansea", in either order). In Wales the Welsh
// name is shown (John, November 10th 2026: "their Welsh placenames on this one, just for a
// change"); the English one is still needed, to keep a visitor's own town out of the
// directions, which use English names.

import data from '../data/towns.json' with { type: 'json' }

const ENGLISH = new Set((data.places as [string, number, number, number][]).map((p) => p[0]))
/** Postcode areas wholly or mostly in Wales (border districts have double names only where
 *  the place is Welsh). */
const WELSH_AREAS = new Set(['CF', 'SA', 'NP', 'LL', 'LD', 'SY', 'CH', 'HR'])

export function placeNames(code: string, name: string): { shown: string; own: string } {
  const parts = name.split(' / ').map((x) => x.trim())
  if (parts.length !== 2) return { shown: name, own: name }
  const [a, b] = parts
  const english = ENGLISH.has(a) ? a : ENGLISH.has(b) ? b : null
  if (!english) return { shown: name, own: a }
  const other = english === a ? b : a
  const wales = WELSH_AREAS.has(code.replace(/\d.*$/, ''))
  return { shown: wales ? other : english, own: english }
}
