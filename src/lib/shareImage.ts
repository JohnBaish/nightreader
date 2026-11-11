// "Copy chart" / "Share chart" (John, November 10th 2026, as Lightreader's): a picture of one of
// the page's pictures, with a heading, the place and the night, and the credit line, made on the
// visitor's device. Nightreader is dark for everyone, so the picture keeps the Ember colours.
// On a touch screen it goes to the phone's own share sheet; on a computer it's copied (or saved,
// where the browser won't copy). Nothing is sent anywhere until the visitor chooses where.
//
// The picture is made from what's already drawn on the page: each canvas is copied as it is,
// and each drawing (SVG) is made into a picture of its own, with the page's colours and the
// Figtree font put inside it, since a drawing made into a picture can't see the page's.
import figtree400 from '@fontsource/figtree/files/figtree-latin-400-normal.woff2?url'
import figtree600 from '@fontsource/figtree/files/figtree-latin-600-normal.woff2?url'

const PAD = 36
const FIG = 'Figtree, system-ui, sans-serif'
const VARS = ['--night', '--raise', '--ink', '--ink2', '--hair', '--accent', '--moon', '--land', '--mars', '--jupiter', '--saturn', '--venus', '--mercury']

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > width && line) { lines.push(line); line = w } else line = t
  }
  if (line) lines.push(line)
  return lines
}

let fontCss: Promise<string> | null = null
const asDataUrl = async (url: string) => {
  const blob = await (await fetch(url)).blob()
  return new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob) })
}
/** The two Figtree weights the drawings use, as data inside the drawing (fetched once). */
function fonts(): Promise<string> {
  fontCss ??= Promise.all([asDataUrl(figtree400), asDataUrl(figtree600)])
    .then(([a, b]) => `@font-face{font-family:Figtree;font-weight:400;src:url(${a}) format('woff2')}@font-face{font-family:Figtree;font-weight:600;src:url(${b}) format('woff2')}`)
    .catch(() => { fontCss = null; return '' })
  return fontCss
}

/** One drawing (SVG) on the page as a picture, with the page's colours, fonts and shared shapes inside it. */
async function svgImage(svg: SVGSVGElement, w: number, h: number): Promise<HTMLImageElement> {
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  copy.setAttribute('width', String(w))
  copy.setAttribute('height', String(h))
  copy.removeAttribute('style')
  // shapes it borrows from elsewhere on the page (the fist, the glow)
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const markup = copy.outerHTML
  for (const m of markup.matchAll(/(?:href="#|url\(#)([^")]+)/g)) {
    const id = m[1]
    if (copy.querySelector(`[id="${CSS.escape(id)}"]`)) continue
    const el = document.getElementById(id)
    if (el && !defs.querySelector(`[id="${CSS.escape(id)}"]`)) defs.appendChild(el.cloneNode(true))
  }
  copy.insertBefore(defs, copy.firstChild)
  const root = getComputedStyle(document.documentElement)
  const vars = VARS.map((v) => `${v}:${root.getPropertyValue(v).trim()}`).join(';')
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = `${await fonts()}svg{${vars}}text{font-family:Figtree,sans-serif;fill:var(--ink);font-variant-numeric:tabular-nums}`
  copy.insertBefore(style, copy.firstChild)
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally { URL.revokeObjectURL(url) }
}

/** Everything drawn inside `area`, as one picture `w` by `h`. A ruler fixed at the left stays at the left. */
async function layers(area: HTMLElement, w: number, h: number, scale: number): Promise<HTMLCanvasElement> {
  const out = document.createElement('canvas')
  out.width = Math.round(w * scale); out.height = Math.round(h * scale)
  const ctx = out.getContext('2d')!
  ctx.scale(scale, scale)
  const frame = area.closest('.frame') ?? area
  const origin = area.getBoundingClientRect()
  const els = [...frame.querySelectorAll<HTMLCanvasElement | SVGSVGElement>('canvas, svg')]
    .filter((el) => !el.closest('.tip, .share-row') && el.getBoundingClientRect().width > 0 && (el instanceof HTMLCanvasElement || !el.parentElement?.closest('svg')))
  for (const el of els) {
    const r = el.getBoundingClientRect()
    const ruler = el.classList.contains('ruler')
    const x = ruler ? 0 : r.left - origin.left, y = ruler ? 0 : r.top - origin.top
    if (el instanceof HTMLCanvasElement) ctx.drawImage(el, x, y, r.width, r.height)
    else ctx.drawImage(await svgImage(el, r.width, r.height), x, y, r.width, r.height)
  }
  return out
}

/** `keys`: rows of coloured swatches with words, drawn under the picture (the year's two keys). */
export type PictureText = { heading: string; sub: string[]; credit: string; keys?: { heading: string; items: { label: string; colour: string }[] }[] }

const SWATCH_W = 78, SWATCH_GAP = 8

/** How the keys sit: each key's heading, then its swatches in rows that fit `width`. */
function keyLayout(keys: NonNullable<PictureText['keys']>, width: number): { heading: string; rows: { label: string; colour: string }[][] }[] {
  const per = Math.max(1, Math.floor((width + SWATCH_GAP) / (SWATCH_W + SWATCH_GAP)))
  return keys.map((k) => {
    // rows balanced, so a key that wraps splits evenly (six as three and three)
    const n = Math.ceil(k.items.length / per), each = Math.ceil(k.items.length / n)
    return { heading: k.heading, rows: Array.from({ length: n }, (_, r) => k.items.slice(r * each, r * each + each)) }
  })
}
const KEY_HEAD = 26, KEY_ROW = 46

/** The picture: the name, heading, sub-lines, the drawing from `area`, and the credit, in the Ember colours. */
export async function chartPicture(area: HTMLElement, t: PictureText): Promise<HTMLCanvasElement> {
  await document.fonts.ready
  const scale = 2
  const bodyW = area.scrollWidth || area.getBoundingClientRect().width, bodyH = area.scrollHeight || area.getBoundingClientRect().height
  const body = await layers(area, bodyW, bodyH, scale)
  const W = Math.max(bodyW + 2 * PAD, 360)
  const probe = document.createElement('canvas').getContext('2d')!
  probe.font = `12px ${FIG}`
  const credit = wrap(probe, t.credit, W - 2 * PAD)
  probe.font = `15px ${FIG}`
  const subs = t.sub.flatMap((s) => wrap(probe, s, W - 2 * PAD))
  const top = 98 + subs.length * 22 + 14
  const keys = t.keys ? keyLayout(t.keys, W - 2 * PAD) : []
  const keysH = keys.reduce((h, k) => h + KEY_HEAD + k.rows.length * KEY_ROW, keys.length ? 14 : 0)
  const H = top + bodyH + keysH + 22 + credit.length * 16 + 22
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(W * scale); canvas.height = Math.round(H * scale)
  const ctx = canvas.getContext('2d')!
  ctx.scale(scale, scale)
  const css = getComputedStyle(document.documentElement), c = (v: string) => css.getPropertyValue(v).trim()
  ctx.fillStyle = c('--night'); ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = c('--accent'); ctx.font = `600 12.5px ${FIG}`
  ctx.fillText('NIGHTREADER', PAD, 42)
  ctx.fillStyle = c('--ink'); ctx.font = `30px Caprasimo, Georgia, serif`
  ctx.fillText(t.heading, PAD, 80)
  ctx.fillStyle = c('--ink2'); ctx.font = `15px ${FIG}`
  subs.forEach((s, i) => ctx.fillText(s, PAD, 106 + i * 22))
  // the drawing, in a rounded frame as on the page
  const bx = (W - bodyW) / 2
  ctx.save()
  ctx.beginPath(); ctx.roundRect(bx, top, bodyW, bodyH, 14); ctx.clip()
  ctx.fillStyle = c('--land'); ctx.fillRect(bx, top, bodyW, bodyH)
  ctx.drawImage(body, bx, top, bodyW, bodyH)
  ctx.restore()
  ctx.strokeStyle = c('--hair'); ctx.lineWidth = 1
  ctx.beginPath(); ctx.roundRect(bx + 0.5, top + 0.5, bodyW - 1, bodyH - 1, 14); ctx.stroke()
  // the keys, so a shared picture can be read on its own
  let y = top + bodyH + (keys.length ? 14 : 0)
  for (const k of keys) {
    ctx.fillStyle = c('--ink2'); ctx.font = `600 11.5px ${FIG}`
    ctx.fillText(k.heading.toUpperCase(), PAD, y + 18)
    y += KEY_HEAD
    for (const row of k.rows) {
      row.forEach((it, i) => {
        const x = PAD + i * (SWATCH_W + SWATCH_GAP)
        ctx.fillStyle = it.colour; ctx.beginPath(); ctx.roundRect(x, y, SWATCH_W, 12, 3); ctx.fill()
        ctx.strokeStyle = c('--hair'); ctx.beginPath(); ctx.roundRect(x + 0.5, y + 0.5, SWATCH_W - 1, 11, 3); ctx.stroke()
        ctx.fillStyle = c('--ink'); ctx.font = `11.5px ${FIG}`; ctx.textAlign = 'center'
        ctx.fillText(it.label, x + SWATCH_W / 2, y + 28); ctx.textAlign = 'left'
      })
      y += KEY_ROW
    }
  }
  ctx.fillStyle = c('--ink2'); ctx.font = `12px ${FIG}`
  credit.forEach((s, i) => ctx.fillText(s, PAD, y + 30 + i * 16))
  return canvas
}

export type Delivered = 'shared' | 'copied' | 'saved' | 'cancelled'
const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
/** The button's own word: "Share" on a touch screen (the phone's share sheet), "Copy" on a computer. */
export const shareVerb = () => (touch() ? 'Share' : 'Copy')

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

/** Hands the picture over: the share sheet on a touch screen, else the clipboard, else a saved file. Call straight from the tap. */
export async function deliver(make: () => Promise<HTMLCanvasElement>, filename: string, title: string): Promise<Delivered> {
  const blob = make().then((canvas) => new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('No picture'))), 'image/png')))
  if (touch()) {
    const b = await blob
    const file = new File([b], filename, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title })
        return 'shared'
      } catch (e) {
        if ((e as Error).name === 'AbortError') return 'cancelled'
      }
    }
    save(b, filename)
    return 'saved'
  }
  try {
    // the picture is handed over as a promise, made inside the click, which Safari needs
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return 'copied'
  } catch {
    save(await blob, filename)
    return 'saved'
  }
}

/** "nightreader-sky-tonight-RG1-2026-11-10.png" */
export const imageName = (what: string, code: string, date: string) => `nightreader-${what}-${code}-${date}.png`
