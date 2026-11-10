// "The year in darkness" (SPEC §6.3): every night for a year, dusk at the top and dawn at the
// bottom, coloured by the Sun's depth, with moonlight as pale slanting bands. Two keys: the
// sky, and moonlight by phase. Tapping or pointing at a night gives its figures. From the
// agreed mock-up.

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { clock, duration, longDate } from '../lib/format.ts'
import { dayIn } from '../lib/sentences.ts'
import { cssRgb, skyAt } from '../lib/skyColour.ts'
import { FIRST_HOUR, ROWS, STEP_MINUTES, YEAR_NIGHTS, type YearNight, type YearView } from '../lib/yearView.ts'

const WASH = [174, 184, 238] // the colour of a moonlit sky, as skyColour.ts
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const smooth = (x: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const LUT = Array.from({ length: 257 }, (_, l) => skyAt(30 - l * 0.1875))
const KIND = { 'true night': 'True night', 'very dark': 'No true night: “very dark”', dark: 'No true night: only “dark”' } as const

/** A night's figures in a line (draft wording). */
function Readout({ n, first, today }: { n: YearNight; first: boolean; today: string }) {
  const who = first ? `Tonight, ${longDate(n.date)}` : longDate(n.date, n.date.slice(0, 4) !== today.slice(0, 4))
  const lit = `Moon ${Math.round(n.lit * 100)}% lit`
  return (
    <p className="readout">
      <b>{who}</b><br />
      {n.kind
        ? <>{KIND[n.kind]} {clock(new Date(n.from))} to {clock(new Date(n.to))} <span>·</span> {n.freeMs < 30_000 ? <b>none</b> : <b>{duration(n.freeMs)}</b>} of it Moon-free <span>· {lit}</span></>
        : <>Half-light all night <span>· {lit}</span></>}
    </p>
  )
}

function MoonKey() {
  const night = skyAt(-18)
  const items: [string, number, number | null][] = [['Moon down', 0, null], ['Thin', 0.12, 0.12], ['Quarter', 0.25, 0.25], ['Half', 0.5, 0.5], ['Three quarters', 0.75, 0.75], ['Full', 1, 1]]
  return (
    <div className="moonkey">
      {items.map(([label, k, glyph]) => {
        const R = 9, ry = glyph === null ? 0 : Math.abs(1 - 2 * glyph) * R
        return (
          <div key={label}>
            {glyph === null
              ? <svg viewBox="-11 -11 22 22" aria-hidden="true"><path d="M-8 4h16" stroke="var(--ink2)" strokeWidth="1.2" /><circle cy="9" r="5" fill="none" stroke="var(--ink2)" strokeDasharray="1.5 2.5" /></svg>
              : <svg viewBox="-11 -11 22 22" aria-hidden="true"><circle r={R} fill="var(--raise)" stroke="var(--hair)" />{glyph > 0.02 && <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 A ${R} ${ry} 0 0 ${glyph > 0.5 ? 1 : 0} ${-R} 0 Z`} fill="var(--moon)" transform="rotate(90)" />}</svg>}
            <i style={{ background: cssRgb(night.map((v, i) => v + (WASH[i] - v) * k * 0.52) as [number, number, number]) }} />
            {label}
          </div>
        )
      })}
    </div>
  )
}

export function YearInDarkness({ y, name }: { y: YearView; name: string }) {
  const frame = useRef<HTMLDivElement | null>(null), canvas = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState<[number, number]>([0, 800])
  const [chosen, setChosen] = useState(0)
  useEffect(() => {
    const el = frame.current!
    const measure = () => setSize([el.clientWidth, window.innerHeight])
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  const [W, screenH] = size, narrow = W < 620, short = screenH < 500, N = YEAR_NIGHTS
  // never taller than the screen of a phone held sideways (HOUSE-STYLE §6)
  const H = short ? Math.max(200, screenH - 70) : narrow ? 360 : 500
  const gl = narrow ? 38 : 52, gt = 24, gb = 28, pw = W - gl, ph = H - gt - gb

  useEffect(() => {
    const can = canvas.current
    if (!can || !W) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    can.width = Math.round(W * dpr); can.height = Math.round(H * dpr)
    const ctx = can.getContext('2d')!
    ctx.fillStyle = '#080b22'; ctx.fillRect(0, 0, can.width, can.height)
    const iw = Math.round(pw * dpr), ih = Math.round(ph * dpr), img = ctx.createImageData(iw, ih), px = img.data
    for (let x = 0; x < iw; x++) {
      const nf = Math.max(0, Math.min(N - 1, ((x + 0.5) / iw) * N - 0.5)), i0 = Math.floor(nf), i1 = Math.min(N - 1, i0 + 1), fx = nf - i0
      for (let yy = 0; yy < ih; yy++) {
        const rf = (yy / (ih - 1)) * (ROWS - 1), j0 = Math.floor(rf), j1 = Math.min(ROWS - 1, j0 + 1), fy = rf - j0
        const mix = (a: Uint8Array) => (a[i0 * ROWS + j0] * (1 - fy) + a[i0 * ROWS + j1] * fy) * (1 - fx) + (a[i1 * ROWS + j0] * (1 - fy) + a[i1 * ROWS + j1] * fy) * fx
        const level = mix(y.sun), c = LUT[Math.round(level * 4)], k = (mix(y.moon) / 36) * 0.52 * smooth(level * 0.75 - 30, 3, 10), o = (yy * iw + x) * 4
        px[o] = c[0] + (WASH[0] - c[0]) * k; px[o + 1] = c[1] + (WASH[1] - c[1]) * k; px[o + 2] = c[2] + (WASH[2] - c[2]) * k; px[o + 3] = 255
      }
    }
    ctx.putImageData(img, Math.round(gl * dpr), Math.round(gt * dpr))
  }, [y, W, H, pw, ph, gl, N])

  const pick = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setChosen(Math.max(0, Math.min(N - 1, Math.floor(((e.clientX - r.left - gl) / pw) * N))))
  }
  // a tap away from the picture goes back to tonight
  useEffect(() => {
    if (!chosen) return
    const away = (e: Event) => { if (!frame.current?.contains(e.target as Node)) setChosen(0) }
    document.addEventListener('click', away)
    return () => document.removeEventListener('click', away)
  }, [chosen])

  const yOf = (clockMinutes: number) => gt + ((clockMinutes - FIRST_HOUR * 60) / ((ROWS - 1) * STEP_MINUTES)) * ph
  const firsts = y.nights.map((n, i) => ({ i, month: +n.date.slice(5, 7) - 1 })).filter(({ i }) => y.nights[i].date.endsWith('-01'))
  const x = gl + ((chosen + 0.5) / N) * pw
  const span = ([a, b]: [string, string]) => `From ${dayIn(a, y.from)} to ${dayIn(b, y.from)}`
  return (
    <>
      <Readout n={y.nights[chosen]} first={chosen === 0} today={y.from} />
      <div className="frame year" ref={frame}>
        <canvas ref={canvas} style={{ height: H }} />
        {W > 0 && (
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`A year of nights at ${name}, coloured by how dark the sky is, with moonlight. Point at or tap a night for its figures.`}
            onPointerDown={pick} onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons) pick(e) }} onPointerLeave={(e) => { if (e.pointerType === 'mouse') setChosen(0) }}>
            {[18, 21, 24, 27, 30].map((h) => (
              <g key={h}>
                <line x1={gl} x2={W} y1={yOf(h * 60)} y2={yOf(h * 60)} stroke="var(--ink)" strokeOpacity={h === 24 ? 0.2 : 0.1} />
                <text x={gl - 8} y={yOf(h * 60) + 4} fontSize={narrow ? 11 : 12.5} textAnchor="end" fillOpacity=".75" className="num">{String(h % 24).padStart(2, '0')}:00</text>
              </g>
            ))}
            {firsts.map(({ i, month }, k) => {
              const end = firsts[k + 1]?.i ?? N, tx = gl + (i / N) * pw, room = ((end - i) / N) * pw >= (narrow ? 22 : 34)
              return (
                <g key={i}>
                  <line x1={tx} x2={tx} y1={gt + ph} y2={gt + ph + 5} stroke="var(--ink)" strokeOpacity=".4" />
                  {room && <text x={gl + ((i + end) / 2 / N) * pw} y={H - 9} fontSize={narrow ? 11 : 12.5} textAnchor="middle" fillOpacity=".78" letterSpacing=".06em">{narrow ? MONTHS[month][0] : MONTHS[month].toUpperCase()}</text>}
                </g>
              )
            })}
            {y.phases.map((p) => {
              const px = gl + ((p.x + 0.5) / N) * pw
              return px < gl + 3 || px > W - 3 ? null : <circle key={p.x} cx={px} cy={gt / 2 + 1} r={narrow ? 2.6 : 3.6} fill={p.full ? 'var(--moon)' : 'none'} stroke="var(--moon)" strokeWidth="1" strokeOpacity={p.full ? 1 : 0.7} />
            })}
            <line x1={x} x2={x} y1={gt} y2={gt + ph} stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={x} cy={gt + ph + 1} r="3.5" fill="var(--accent)" />
          </svg>
        )}
      </div>
      <div className="key">
        <div>
          <p className="keyhead">The sky</p>
          <div className="keybar" style={{ background: `linear-gradient(90deg, ${[30, 12, 6, 2, 0, -3, -6, -9, -12, -18].map((a) => cssRgb(skyAt(a))).join(',')})` }} />
          <div className="keywords"><span>Daylight</span><span>Half-light</span><span>Dark</span><span>Very dark</span><span>True night</span></div>
        </div>
        <div><p className="keyhead">Moonlight in the night</p><MoonKey /></div>
      </div>
      <div className="notes">
        <p>Small discs along the top mark each full Moon, and rings each new Moon.</p>
        {y.noTrueNight.map((r) => <p key={r[0]}>{span(r)} the sky over {name} never reaches true night, so those weeks are measured by “very dark” instead.</p>)}
        {y.noVeryDark.map((r) => <p key={r[0]}>{span(r)} it doesn’t reach “very dark” either, only “dark”.</p>)}
      </div>
    </>
  )
}
