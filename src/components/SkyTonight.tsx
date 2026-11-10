// "The sky tonight" (SPEC §6.1): from sunset to sunrise, the sky coloured by the Sun's depth
// and washed by moonlight, with an arc for the Moon and each planet showing how high it
// stands; solid where it's in view, dotted where it's up but not. From the agreed mock-up.

import { useEffect, useId, useMemo, useRef, useState, type PointerEvent } from 'react'
import { clock } from '../lib/format.ts'
import type { InView, Span } from '../lib/night.ts'
import { cssRgb, moonlit } from '../lib/skyColour.ts'
import type { Tonight } from '../lib/tonight.ts'
import { ukParts } from '../lib/ukTime.ts'

const MAX_ALTITUDE = 72
const ORDER = ['Moon', 'Saturn', 'Mars', 'Jupiter', 'Venus', 'Mercury'] as const
const within = (spans: Span[], t: number) => spans.some((s) => t >= s.from.getTime() && t <= s.to.getTime())
const DARK_WORDS = { 'true night': 'TRUE NIGHT', 'very dark': 'VERY DARK', dark: 'DARK' } as const

function useSize(): [React.RefObject<HTMLDivElement | null>, number, number] {
  const ref = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState<[number, number]>([0, typeof window === 'undefined' ? 800 : window.innerHeight])
  useEffect(() => {
    const el = ref.current!
    const measure = () => setSize([el.clientWidth, window.innerHeight])
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  return [ref, size[0], size[1]]
}

type Arc = { name: string; colour: string; width: number; faint: string; solid: string; points: [number, number][]; peak: [number, number] | null; altitudes: number[] }

export function SkyTonight({ v, now }: { v: Tonight; now: Date }) {
  const id = useId()
  const [ref, W, screenH] = useSize()
  const [tip, setTip] = useState<{ x: number; i: number } | null>(null)
  const s = v.series!, n = v.night
  const narrow = W < 620, short = screenH < 500
  // never taller than a phone held sideways (HOUSE-STYLE §6)
  const H = short ? Math.max(200, screenH - 60) : narrow ? 330 : 430
  const padT = 34, land = 46, plotH = H - padT - land
  const t0 = n.sunset!.getTime() - 40 * 60_000, t1 = n.sunrise!.getTime() + 40 * 60_000
  const X = (t: number) => ((t - t0) / (t1 - t0)) * W, Y = (a: number) => padT + plotH * (1 - a / MAX_ALTITUDE)
  const rows = s.sun.length, at = (i: number) => s.from + i * s.step

  const drawn = useMemo(() => {
    if (!W) return null
    const moonLevel = (i: number) => { const up = Math.max(0, Math.min(1, (s.moon[i] + 1) / 9)); return n.moonLit * up * up * (3 - 2 * up) }
    const stops: { offset: number; colour: string }[] = []
    for (let i = 0; i < rows; i++) { const t = at(i); if (t < t0 - s.step || t > t1 + s.step) continue; stops.push({ offset: Math.max(0, Math.min(1, (t - t0) / (t1 - t0))), colour: cssRgb(moonlit(s.sun[i], moonLevel(i))) }) }
    const body = (name: string): InView => v.bodies.find((b) => b.name === name)!
    const arcs: Arc[] = []
    for (const name of ORDER) {
      const alt = name === 'Moon' ? s.moon : s.planets[name], b = body(name)
      let faint = '', solid = '', pen = false, spen = false
      const points: [number, number][] = []
      for (let i = 0; i < rows; i++) {
        const t = at(i), a = alt[i]
        if (t < t0 || t > t1) { pen = spen = false; continue }
        if (a <= 0) {
          if (pen && i > 0 && alt[i - 1] > 0) { const f = alt[i - 1] / (alt[i - 1] - a); faint += `L${X(t - s.step + f * s.step).toFixed(1)} ${Y(0).toFixed(1)}` }
          pen = spen = false; continue
        }
        if (!pen) {
          if (i > 0 && alt[i - 1] <= 0 && t - s.step >= t0) { const f = -alt[i - 1] / (a - alt[i - 1]); faint += `M${X(t - s.step + f * s.step).toFixed(1)} ${Y(0).toFixed(1)}L${X(t).toFixed(1)} ${Y(a).toFixed(1)}` }
          else faint += `M${X(t).toFixed(1)} ${Y(a).toFixed(1)}`
          pen = true
        } else faint += `L${X(t).toFixed(1)} ${Y(a).toFixed(1)}`
        if (within(b.inView, t)) { solid += `${spen ? 'L' : 'M'}${X(t).toFixed(1)} ${Y(a).toFixed(1)}`; spen = true; points.push([X(t), Y(a)]) } else spen = false
      }
      if (!faint) continue
      arcs.push({ name, colour: `var(--${name.toLowerCase()})`, width: name === 'Moon' ? 3.2 : 2, faint, solid, points, altitudes: alt,
        peak: solid && b.best ? [X(b.best.at.getTime()), Y(b.best.altitude)] : null })
    }
    // a name for each arc in view, clear of the other arcs and names
    const boxes: { x: number; y: number; w: number }[] = [], labels: { name: string; x: number; y: number }[] = []
    const shown = arcs.filter((a) => a.points.length > 1)
    for (const a of shown) {
      const tw = a.name.length * 7.6 + 8, others = shown.filter((o) => o !== a).flatMap((o) => o.points)
      const clear = (bx: number, by: number) => by > 26 && by < H - land - 22
        && !boxes.some((b) => bx < b.x + b.w + 6 && bx + tw + 6 > b.x && by < b.y + 20 && by + 20 > b.y)
        && !others.some((p) => p[0] > bx - 2 && p[0] < bx + tw + 2 && p[1] > by - 2 && p[1] < by + 22)
      let placed: { x: number; y: number; w: number } | null = null
      out: for (const dy of [-26, 8]) for (const f of [0.5, 0.35, 0.65, 0.22, 0.78, 0.12, 0.88]) {
        const p = a.points[Math.floor((a.points.length - 1) * f)], bx = Math.max(6, Math.min(W - tw - 6, p[0] - tw / 2)), by = p[1] + dy
        if (clear(bx, by)) { placed = { x: bx, y: by, w: tw }; break out }
      }
      if (!placed) { const p = a.points[Math.floor(a.points.length / 2)]; placed = { x: Math.max(6, Math.min(W - tw - 6, p[0] - tw / 2)), y: Math.max(28, p[1] - 26), w: tw } }
      boxes.push(placed)
      labels.push({ name: a.name, x: placed.x + tw / 2, y: placed.y + 15 })
    }
    const hours: { x: number; text: string }[] = []
    const every = narrow ? 3 : 2
    for (let t = Math.ceil(t0 / 3_600_000) * 3_600_000; t <= t1; t += 3_600_000) {
      if (t < t0 + 20 * 60_000 || t > t1 - 20 * 60_000) continue
      const hour = ukParts(new Date(t)).hour
      if (hour % every === 0) hours.push({ x: X(t), text: `${String(hour).padStart(2, '0')}:00` })
    }
    return { stops, arcs, labels, hours }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v, W, H, narrow])

  const move = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), x = Math.max(0, Math.min(W, e.clientX - r.left))
    const t = t0 + (x / W) * (t1 - t0)
    setTip({ x, i: Math.max(0, Math.min(rows - 1, Math.round((t - s.from) / s.step))) })
  }
  // a tap away from the picture puts the line away (as the other tools' charts)
  useEffect(() => {
    if (!tip) return
    const away = (e: Event) => { if ((e.target as Element).closest?.('.share-row, a[download]')) return; if (!ref.current?.contains(e.target as Node)) setTip(null) }
    document.addEventListener('click', away)
    return () => document.removeEventListener('click', away)
  }, [tip, ref])

  const dark = n.darkest, nowT = now.getTime(), showNow = nowT > t0 && nowT < t1
  const up = tip && drawn ? drawn.arcs.filter((a) => a.altitudes[tip.i] > 0).sort((a, b) => b.altitudes[tip.i] - a.altitudes[tip.i]) : []
  return (
    <div className="frame" ref={ref}>
      {drawn && (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ height: H }} role="img" aria-label="How high the Moon and each planet stand through the night. The sentences below say the same in words."
          onPointerMove={move} onPointerDown={move} onPointerLeave={(e) => { if (e.pointerType === 'mouse') setTip(null) }}>
          <defs>
            <linearGradient id={`${id}sky`} x1="0" y1="0" x2="1" y2="0">{drawn.stops.map((st, i) => <stop key={i} offset={st.offset.toFixed(4)} stopColor={st.colour} />)}</linearGradient>
            <linearGradient id={`${id}depth`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--night)" stopOpacity=".42" /><stop offset="1" stopColor="var(--night)" stopOpacity="0" /></linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H - land} fill={`url(#${id}sky)`} />
          <rect x="0" y="0" width={W} height={H - land} fill={`url(#${id}depth)`} />
          {[30, 60].map((a) => (
            <g key={a}>
              <line x1="0" x2={W} y1={Y(a)} y2={Y(a)} stroke="var(--ink)" strokeOpacity=".11" strokeDasharray="2 6" />
              <text x="10" y={Y(a) - 6} fontSize="11.5" fillOpacity=".62">{a}° up</text>
            </g>
          ))}
          {dark && (
            <g>
              <path d={`M ${X(dark.from.getTime())} 22 V 16 H ${X(dark.to.getTime())} V 22`} fill="none" stroke="var(--ink)" strokeOpacity=".5" />
              <text x={(X(dark.from.getTime()) + X(dark.to.getTime())) / 2} y="12" fontSize="11.5" textAnchor="middle" fillOpacity=".8" letterSpacing=".08em">
                {narrow ? DARK_WORDS[dark.kind] : `${DARK_WORDS[dark.kind]} ${clock(dark.from)} TO ${clock(dark.to)}`}
              </text>
            </g>
          )}
          <rect x="0" y={H - land} width={W} height={land} fill="var(--land)" />
          <line x1="0" x2={W} y1={H - land} y2={H - land} stroke="var(--ink)" strokeOpacity=".35" />
          {drawn.hours.map((h) => (
            <g key={h.text}>
              <line x1={h.x} x2={h.x} y1={H - land} y2={H - land + 6} stroke="var(--ink)" strokeOpacity=".4" />
              <text x={h.x} y={H - land + 22} fontSize="12.5" textAnchor="middle" fillOpacity=".78" className="num">{h.text}</text>
            </g>
          ))}
          <circle cx={X(n.sunset!.getTime())} cy={H - land} r="3" fill="var(--accent)" />
          <text x={X(n.sunset!.getTime()) - 4} y={H - 8} fontSize="11" fillOpacity=".62">Sunset {clock(n.sunset!)}</text>
          <circle cx={X(n.sunrise!.getTime())} cy={H - land} r="3" fill="var(--accent)" />
          <text x={X(n.sunrise!.getTime()) + 4} y={H - 8} fontSize="11" textAnchor="end" fillOpacity=".62">Sunrise {clock(n.sunrise!)}</text>
          {drawn.arcs.map((a) => (
            <g key={a.name}>
              <path d={a.faint} fill="none" stroke={a.colour} strokeWidth="1.3" strokeOpacity=".5" strokeDasharray="1 5" strokeLinecap="round" />
              {a.solid && <path d={a.solid} fill="none" stroke="var(--night)" strokeWidth={a.width + 3} strokeOpacity=".35" strokeLinecap="round" strokeLinejoin="round" />}
              {a.solid && <path d={a.solid} fill="none" stroke={a.colour} strokeWidth={a.width} strokeLinecap="round" strokeLinejoin="round" />}
              {a.peak && <circle cx={a.peak[0]} cy={a.peak[1]} r={a.name === 'Moon' ? 6 : 4.5} fill={a.colour} stroke="var(--night)" strokeWidth="2" />}
            </g>
          ))}
          {drawn.labels.map((l) => (
            <text key={l.name} x={l.x} y={l.y} fontSize="13.5" fontWeight="600" textAnchor="middle" stroke="var(--night)" strokeWidth="3.5" strokeOpacity=".55" paintOrder="stroke" strokeLinejoin="round">{l.name}</text>
          ))}
          {showNow && (
            <g>
              <line x1={X(nowT)} x2={X(nowT)} y1={padT - 8} y2={H - land} stroke="var(--accent)" strokeWidth="1.5" />
              <text x={X(nowT) > W - 50 ? X(nowT) - 6 : X(nowT) + 6} y={padT + 8} fontSize="11.5" fontWeight="600" textAnchor={X(nowT) > W - 50 ? 'end' : 'start'} style={{ fill: 'var(--accent)' }} letterSpacing=".08em" stroke="var(--night)" strokeWidth="3" strokeOpacity=".5" paintOrder="stroke">NOW</text>
            </g>
          )}
          {tip && <line x1={tip.x} x2={tip.x} y1={padT - 8} y2={H - land} stroke="var(--ink)" strokeOpacity=".55" />}
        </svg>
      )}
      {tip && (
        <div className="tip" style={tip.x > W / 2 ? { right: W - tip.x + 14, top: padT + 6 } : { left: tip.x + 14, top: padT + 6 }}>
          <b>{clock(new Date(at(tip.i)))}</b>
          {up.length ? up.map((a) => <div key={a.name}><i style={{ background: a.colour }} />{a.name} {Math.round(a.altitudes[tip.i])}° up</div>) : <div>Nothing above the horizon</div>}
        </div>
      )}
    </div>
  )
}
