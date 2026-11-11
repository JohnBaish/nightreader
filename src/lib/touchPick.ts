// Picking a point on a picture without catching the page's scroll (the fresh look's 2.1, as
// Lightreader's year ribbon): a mouse or pen picks at once and as it moves; a finger picks only
// on a tap, or once it moves sideways, so an ordinary upward swipe just scrolls the page.

import { useRef, type PointerEvent } from 'react'

type Handler = (e: PointerEvent<SVGSVGElement>) => void
const SLOP = 10

/** Pointer handlers for an SVG: `pick` for a press, a tap or a sideways drag; `move` for
 *  movement of a mouse or pen. The gesture is kept in a ref, so it survives re-drawing. */
export function useTouchPick(pick: Handler, move: Handler) {
  const g = useRef<{ x: number; y: number; id: number; dragging: boolean } | null>(null)
  return {
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => {
      if (e.pointerType !== 'touch') return pick(e)
      g.current = { x: e.clientX, y: e.clientY, id: e.pointerId, dragging: false }
    },
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => {
      if (e.pointerType !== 'touch') return move(e)
      const s = g.current
      if (!s || s.id !== e.pointerId) return
      const dx = e.clientX - s.x, dy = e.clientY - s.y
      if (!s.dragging && Math.abs(dx) > SLOP && Math.abs(dx) > Math.abs(dy)) s.dragging = true
      if (s.dragging) pick(e)
    },
    onPointerUp: (e: PointerEvent<SVGSVGElement>) => {
      const s = g.current
      if (e.pointerType === 'touch' && s && !s.dragging && Math.hypot(e.clientX - s.x, e.clientY - s.y) <= SLOP) pick(e)
      g.current = null
    },
    onPointerCancel: () => { g.current = null },
  }
}
