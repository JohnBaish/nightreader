// "Where to look" (SPEC §6.2): the view south, east on the left, with a slider through the
// night. The towns along the horizon are at their true directions; the stars and
// constellation lines are real; a ruler of fists runs up the left edge. On a phone the
// picture is wider than the screen, opens on south and is swiped sideways (John's option B).
// From the agreed mock-up.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { clock, compassPoint } from '../lib/format.ts'
import { LOW, PLANETS, sunDepthNeeded, type PlanetName } from '../lib/night.ts'
import type { District } from '../lib/postcode.ts'
import { fistWords } from '../lib/sentences.ts'
import { cssRgb, moonlit, skyAt } from '../lib/skyColour.ts'
import type { Tonight } from '../lib/tonight.ts'
import { describeToward, townsRound } from '../lib/towns.ts'

const AZ0 = 45, AZ1 = 315, ALT_MAX = 74, LAND = 78, RAD = Math.PI / 180
const COMPASS: [number, string][] = [[90, 'EAST'], [135, 'SOUTH-EAST'], [180, 'SOUTH'], [225, 'SOUTH-WEST'], [270, 'WEST']]
const smooth = (x: number, a: number, b: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const andList = (names: string[]) => (names.length < 2 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`)
const bandWord = (sun: number) => (sun > 0 ? 'Daylight' : sun > -6 ? 'Half-light' : sun > -12 ? 'Dark' : sun > -18 ? 'Very dark' : 'True night')

// The compass reading for a direction, as a phone's compass gives it ("96° E"), with a small
// dial (John's choice C, November 10th 2026). From true north; nothing reads the device's compass.
const EIGHT = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
const reading = (az: number) => { const deg = Math.round(az) % 360; return `${deg}° ${EIGHT[Math.round(deg / 45) % 8]}` }
function Dial({ az }: { az: number }) {
  return (
    <svg className="dial" viewBox="-14 -14 28 28" aria-hidden="true">
      <circle r="12" fill="none" stroke="var(--ink)" strokeOpacity=".45" />
      {[0, 90, 180, 270].map((a) => <line key={a} y1="-12" y2="-9" stroke="var(--ink)" strokeOpacity={a ? 0.45 : 1} strokeWidth={a ? 1 : 1.6} transform={`rotate(${a})`} />)}
      <path d="M0 -9.5 L3 2 L0 0.5 L-3 2 Z" fill="var(--accent)" transform={`rotate(${az})`} />
    </svg>
  )
}

type Stars = { stars: (number | string)[][]; lines: [number, number][][] }

/** A star's direction and height from its place on the sky, the latitude and the sidereal time. */
function starAt(ra: number, dec: number, lst: number, latitude: number): [number, number] | null {
  const H = (lst - ra) * RAD, d = dec * RAD, p = latitude * RAD
  const sa = Math.sin(p) * Math.sin(d) + Math.cos(p) * Math.cos(d) * Math.cos(H)
  if (sa < 0.01) return null
  return [(Math.atan2(-Math.cos(d) * Math.sin(H), Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(H)) / RAD + 360) % 360, Math.asin(sa) / RAD]
}

function Fists({ altitude }: { altitude: number }) {
  const f = Math.round(altitude / 5) / 2, whole = Math.floor(f), half = f - whole > 0
  return (
    <span className="fists" title={`${Math.round(altitude)}° up`}>
      {Array.from({ length: whole }, (_, i) => <svg key={i} viewBox="0 0 20 20" aria-hidden="true"><use href="#fist" /></svg>)}
      {half && <svg viewBox="0 0 10 20" style={{ width: 10 }} aria-hidden="true"><use href="#fist" width="20" height="20" /></svg>}
      <span>{fistWords(altitude)} ({Math.round(altitude)}°)</span>
    </span>
  )
}

export function WhereToLook({ v, d, now, share }: { v: Tonight; d: District; now: Date; share?: ReactNode }) {
  const s = v.series!, n = v.night
  const frame = useRef<HTMLDivElement | null>(null), scroller = useRef<HTMLDivElement | null>(null), canvas = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState<[number, number]>([0, 800])
  const [stars, setStars] = useState<Stars | null>(null)
  useEffect(() => {
    const el = frame.current!
    const measure = () => setSize([el.clientWidth, window.innerHeight])
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  // the stars are a file of their own, fetched when this picture is first drawn
  useEffect(() => { let on = true; void import('../data/stars.json').then((m) => { if (on) setStars(m.default as unknown as Stars) }); return () => { on = false } }, [])

  // the slider covers sunset to sunrise
  const slots = useMemo(() => {
    const out: number[] = []
    for (let i = 0; i < s.sun.length; i++) { const t = s.from + i * s.step; if (t >= n.sunset!.getTime() && t <= n.sunrise!.getTime()) out.push(i) }
    return out
  }, [s, n])
  // it opens on now, if it's night; otherwise a little way into the darkest stretch
  const [idx, setIdx] = useState(() => {
    const t = now.getTime(), from = n.darkest?.from ?? n.sunset!, to = n.darkest?.to ?? n.sunrise!
    const want = t > n.sunset!.getTime() && t < n.sunrise!.getTime() ? t : from.getTime() + (to.getTime() - from.getTime()) * 0.28
    return Math.max(0, slots.findIndex((i) => s.from + i * s.step >= want))
  })
  const i = slots[Math.min(idx, slots.length - 1)], at = new Date(s.from + i * s.step), sun = s.sun[i]

  const [FW, screenH] = size, narrow = FW < 720
  const ppd = narrow ? 4.7 : FW / (AZ1 - AZ0)
  // never taller than the screen of a phone held sideways (HOUSE-STYLE §6)
  const ppy = screenH < 500 ? Math.min(ppd, Math.max(1.6, (screenH - 70 - LAND) / ALT_MAX)) : ppd
  const W = Math.round((AZ1 - AZ0) * ppd), skyH = Math.round(ALT_MAX * ppy), H = skyH + LAND
  const X = (az: number) => (az - AZ0) * ppd, Y = (alt: number) => skyH - alt * ppy

  // on a phone the picture opens on south
  useEffect(() => { if (narrow && scroller.current) scroller.current.scrollLeft = X(180) - FW / 2 }, [narrow, FW]) // eslint-disable-line react-hooks/exhaustive-deps

  // towns along the horizon: nearest first, in two rows, where there is room
  const towns = useMemo(() => {
    const out: { name: string; x: number; row: number }[] = [], taken: { x: number; w: number; row: number }[] = []
    for (const t of townsRound(d, d.own)) {
      if (t.bearing <= AZ0 + 2 || t.bearing >= AZ1 - 2) continue
      const x = (t.bearing - AZ0) * ppd, w = t.name.length * 6.4 + 14
      if (x - w / 2 < (narrow ? 4 : 50) || x + w / 2 > W - 4) continue
      // a second-row name's tick mustn't run through a first-row name
      for (const row of [0, 1]) if (!taken.some((q) => (q.row === row && Math.abs(q.x - x) < (q.w + w) / 2) || (row === 1 && q.row === 0 && Math.abs(q.x - x) < q.w / 2 + 3))) { taken.push({ x, w, row }); out.push({ name: t.name, x, row }); break }
    }
    return out
  }, [d, ppd, narrow, W])

  const moonUp = Math.max(0, Math.min(1, (s.moon[i] + 1) / 9)), moonLight = n.moonLit * moonUp * moonUp * (3 - 2 * moonUp)

  // the sky and the stars, on a canvas
  useEffect(() => {
    const can = canvas.current
    if (!can || !FW) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    can.width = W * dpr; can.height = H * dpr
    const ctx = can.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // darker overhead, lighter at the horizon, glowing towards the Sun
    const gr = ctx.createLinearGradient(0, 0, 0, skyH)
    gr.addColorStop(0, cssRgb(moonlit(sun - 6, moonLight * 0.45))); gr.addColorStop(1, cssRgb(moonlit(sun + 0.5, moonLight * 0.8)))
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, skyH)
    const glow = smooth(sun, -15, -3)
    if (glow > 0) {
      const sx = X(s.sunAz[i]), c = skyAt(Math.min(2, sun + 8)).map(Math.round).join(',')
      const rg = ctx.createRadialGradient(sx, skyH + 10, 0, sx, skyH + 10, 95 * ppd)
      rg.addColorStop(0, `rgba(${c},${(0.95 * glow).toFixed(3)})`); rg.addColorStop(0.45, `rgba(${c},${(0.4 * glow).toFixed(3)})`); rg.addColorStop(1, `rgba(${c},0)`)
      ctx.save(); ctx.scale(1, 0.55); ctx.translate(0, (skyH + 10) * (1 / 0.55 - 1)); ctx.fillStyle = rg; ctx.fillRect(0, -skyH, W, skyH * 4); ctx.restore()
    }
    const seen = smooth(-sun, 4, 11), limit = 2 + 2.7 * smooth(-sun, 5, 15) - 1.6 * moonLight
    if (stars && seen > 0) {
      const lst = s.lst[i]
      ctx.strokeStyle = `rgba(244,234,214,${(0.11 * seen * (1 - 0.5 * moonLight)).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath()
      for (const seg of stars.lines) {
        let pen = false
        for (const [ra, dec] of seg) {
          const p = starAt(ra, dec, lst, d.latitude)
          if (!p || p[0] < AZ0 - 5 || p[0] > AZ1 + 5 || p[1] > ALT_MAX + 4) { pen = false; continue }
          if (pen) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1]))
          pen = true
        }
      }
      ctx.stroke()
      for (const st of stars.stars) {
        const mag = st[2] as number
        if (mag > limit) break // brightest first
        const p = starAt(st[0] as number, st[1] as number, lst, d.latitude)
        if (!p || p[0] < AZ0 || p[0] > AZ1 || p[1] > ALT_MAX) continue
        const x = X(p[0]), y = Y(p[1]), r = Math.max(0.55, 2.5 - mag * 0.42), bv = st[3] as number, low = smooth(p[1], 0, 9)
        const col = bv < 0.2 ? '205,220,255' : bv < 0.9 ? '255,247,232' : '255,214,170'
        ctx.fillStyle = `rgba(${col},${(Math.min(1, 0.45 + (limit - mag) * 0.3) * seen * low).toFixed(3)})`
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill()
        if (st[4] && seen > 0.6 && p[1] > 5) { ctx.fillStyle = `rgba(244,234,214,${(0.6 * seen).toFixed(2)})`; ctx.font = '11.5px Figtree, sans-serif'; ctx.fillText(st[4] as string, x + 6, y + 4) }
      }
    }
    ctx.fillStyle = '#080b22'; ctx.fillRect(0, skyH, W, LAND)
  }, [FW, W, H, skyH, ppd, ppy, i, stars, s, sun, moonLight, d.latitude]) // eslint-disable-line react-hooks/exhaustive-deps

  // the Moon and planets at this moment
  const bodies = (['Moon', ...PLANETS] as const).map((name) => {
    const planet = name === 'Moon' ? null : (name as PlanetName)
    const alt = planet ? s.planets[planet][i] : s.moon[i], az = planet ? s.planetAz[planet][i] : s.moonAz[i]
    const magnitude = v.bodies.find((b) => b.name === name)!.magnitude
    const up = alt > 0, washed = !!planet && sun > -sunDepthNeeded(magnitude ?? 0)
    return { name, alt, az, magnitude, up, washed, shown: up && !washed, low: alt < LOW, inPicture: az >= AZ0 && az <= AZ1, colour: `var(--${name.toLowerCase()})`,
      alts: planet ? s.planets[planet] : s.moon, azs: planet ? s.planetAz[planet] : s.moonAz }
  })
  const labels: { x: number; y: number; name: string }[] = []
  for (const b of bodies) if (b.shown && b.inPicture) labels.push({ x: X(b.az), y: Y(b.alt) - (b.name === 'Moon' ? Math.max(9, 3.2 * ppd) : 6) - 8, name: b.name })
  labels.sort((a, b) => a.y - b.y)
  const put: { x: number; y: number; name: string }[] = []
  for (const l of labels) { let y = l.y; while (put.some((q) => Math.abs(q.x - l.x) < 52 && Math.abs(q.y - y) < 15)) y -= 15; put.push({ ...l, y: Math.max(14, y) }) }
  const track = `linear-gradient(90deg, ${slots.filter((_, k) => k % 3 === 0).map((k) => cssRgb(skyAt(s.sun[k]))).join(',')})`

  return (
    <>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <symbol id="fist" viewBox="0 0 20 20">
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 9V6.6a1.6 1.6 0 0 1 3.2 0V6a1.6 1.6 0 0 1 3.2 0v.3a1.6 1.6 0 0 1 3.2 0v.9a1.5 1.5 0 0 1 3 0v4.6a5.6 5.6 0 0 1-5.6 5.6H9.9a5.4 5.4 0 0 1-5.4-5.4z" />
              <path d="M4.5 10.2h5.2a1.7 1.7 0 0 1 0 3.4H8.4" /><path d="M7.7 6.6v2M10.9 6.3v2.3M14.1 7.2v1.6" />
            </g>
          </symbol>
          <radialGradient id="glow"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
      </svg>
      <div className="frame pano" ref={frame}>
        <div className="pano-scroll" ref={scroller} tabIndex={narrow ? 0 : undefined} aria-label={narrow ? 'The view south: swipe sideways to look east or west' : undefined}>
          <div className="pano-inner" style={{ width: W, height: H }}>
            <canvas ref={canvas} style={{ width: W, height: H }} />
            {FW > 0 && (
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }} role="img" aria-label="The sky looking south, with the Moon, planets and brightest stars above the towns on the horizon. The list below says the same in words.">
                <line x1="0" x2={W} y1={skyH} y2={skyH} stroke="var(--ink)" strokeOpacity=".4" />
                {towns.map((t) => (
                  <g key={t.name + t.x}>
                    <line x1={t.x} x2={t.x} y1={skyH} y2={skyH + 10 + t.row * 17} stroke="var(--ink)" strokeOpacity=".35" />
                    <text x={t.x} y={skyH + 22 + t.row * 17} fontSize="12" textAnchor="middle" fillOpacity={t.row ? 0.62 : 0.88}>{t.name}</text>
                  </g>
                ))}
                {COMPASS.map(([az, word]) => <text key={word} x={X(az)} y={H - 10} fontSize="11" textAnchor="middle" letterSpacing=".16em" style={{ fill: 'var(--accent)' }}>{word}</text>)}
                {bodies.map((b) => {
                  let path = '', pen = false
                  for (const k of slots) { if (b.alts[k] <= 0 || b.azs[k] < AZ0 || b.azs[k] > AZ1) { pen = false; continue } path += `${pen ? 'L' : 'M'}${X(b.azs[k]).toFixed(1)} ${Y(b.alts[k]).toFixed(1)}`; pen = true }
                  return path ? <path key={b.name} d={path} fill="none" stroke={b.colour} strokeOpacity=".42" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" /> : null
                })}
                {bodies.filter((b) => b.shown && b.inPicture).map((b) => {
                  const x = X(b.az), y = Y(b.alt)
                  if (b.name === 'Moon') {
                    const R = Math.max(9, 3.2 * ppd), k = n.moonLit, ry = Math.abs(1 - 2 * k) * R
                    return (
                      <g key={b.name}>
                        <circle cx={x} cy={y} r={R * 3.2} fill="url(#glow)" opacity={(0.5 * k).toFixed(2)} />
                        <circle cx={x} cy={y} r={R} fill="var(--raise)" stroke="var(--hair)" />
                        {k > 0.012 && <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 A ${R} ${ry.toFixed(2)} 0 0 ${k > 0.5 ? 1 : 0} ${-R} 0 Z`} fill="var(--moon)" transform={`translate(${x} ${y}) rotate(${-s.moonTilt[i]})`} />}
                      </g>
                    )
                  }
                  const r = Math.max(2.6, Math.min(6.5, 3.4 - (b.magnitude ?? 0) * 0.75))
                  return <g key={b.name}><circle cx={x} cy={y} r={r * 3.4} fill="url(#glow)" opacity=".5" /><circle cx={x} cy={y} r={r} fill={b.colour} /></g>
                })}
                {put.map((l) => <text key={l.name} x={l.x} y={l.y} fontSize="13.5" fontWeight="600" textAnchor="middle" stroke="var(--night)" strokeWidth="3.5" strokeOpacity=".5" paintOrder="stroke" strokeLinejoin="round">{l.name}</text>)}
              </svg>
            )}
          </div>
        </div>
        {/* the ruler of fists, fixed at the left */}
        <svg className="ruler" viewBox={`0 0 46 ${H}`} style={{ width: 46, height: H }} aria-hidden="true">
          {Array.from({ length: Math.floor((ALT_MAX - 1) / 10) }, (_, k) => k + 1).map((f) => (
            <g key={f}>
              <line x1="0" x2="7" y1={Y(f * 10)} y2={Y(f * 10)} stroke="var(--ink)" strokeOpacity=".6" />
              <use href="#fist" x="10" y={Y(f * 10) - 8} width="16" height="16" style={{ color: 'var(--ink)' }} opacity=".75" />
              <text x="29" y={Y(f * 10) + 4} fontSize="11.5" fillOpacity=".8">{f}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="when">
        <div className="clock">{clock(at)}</div>
        {/* the copy button, at the end of the time row (John's option C, November 10th 2026) */}
        <div className="cp cp-time cp-wide cp-phone">{share}</div>
        <div className="slide" style={{ ['--track' as string]: track }}>
          <input type="range" min="0" max={slots.length - 1} step="1" value={Math.min(idx, slots.length - 1)} aria-label="Time of night" aria-valuetext={`${clock(at)}, ${bandWord(sun)}`} onChange={(e) => setIdx(+e.target.value)} />
          <div className="ends"><span>Sunset {clock(n.sunset!)}</span><span>Sunrise {clock(n.sunrise!)}</span></div>
        </div>
        <div className="band">{bandWord(sun)}</div>
      </div>
      <ul className="look">
        {/* those in view first; the rest grouped on a line each (the fresh look's 2.4; John, November 11th 2026) */}
        {bodies.filter((b) => b.shown).map((b) => {
          const toward = b.shown ? describeToward(d, b.az, d.own) : ''
          return (
            <li key={b.name} className={b.shown && !b.low ? '' : 'off'}>
              <span className="sw" style={{ background: b.colour, opacity: b.shown && !b.low ? 1 : 0.4 }} />
              <span className="nm">{b.name}</span>
              <span className="where">{!b.up ? 'Below the horizon' : b.washed ? 'Up, but lost in the bright sky' : <>{b.low ? 'Very low in the ' : 'In the '}<b>{compassPoint(b.az)}</b>{toward} <span className="reading"><Dial az={b.az} />{reading(b.az)}</span></>}</span>
              {b.shown ? <Fists altitude={b.alt} /> : <span />}
            </li>
          )
        })}
        {([['Below the horizon', bodies.filter((b) => !b.up)], ['Up, but lost in the bright sky', bodies.filter((b) => b.up && b.washed)]] as const).map(([words, group]) => group.length > 0 && (
          <li key={words} className="off group">
            <span />
            <span className="where">{words}: {andList(group.map((b) => b.name))}.</span>
          </li>
        ))}
      </ul>
      <p className="fistnote"><svg viewBox="0 0 20 20" aria-hidden="true"><use href="#fist" /></svg><span>Hold a fist out at arm’s length: it covers about 10° of sky. Stack fists up from the horizon to find the height. Compass readings are from true north.</span></p>
    </>
  )
}
