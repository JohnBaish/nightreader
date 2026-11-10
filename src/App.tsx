// Nightreader's page (PLAN stage 3): the header with the postcode pill, the opening (the Moon
// beside one figure), "The sky tonight" with the planets' sentences, and "Looking ahead".
// "Where to look" and "The year in darkness" come in stages 4 and 5. A first-time visitor sees
// the postcode box; the postcode is kept after "#" and on this device only (SPEC §2).

import { Component, useEffect, useState, type ReactNode } from 'react'
import { MoonFace } from './components/MoonFace.tsx'
import { PostcodeBox } from './components/PostcodeBox.tsx'
import { SkyTonight } from './components/SkyTonight.tsx'
import { lineColour } from './lib/lineColour.ts'
import { clock } from './lib/format.ts'
import { district, outwardCode, POSTCODE_CREDITS, saveDistrict, savedDistrict, type District } from './lib/postcode.ts'
import { tonightDate } from './lib/tonight.ts'
import { useTonight } from './lib/useTonight.ts'

function Logo() {
  return (
    <svg viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="11" fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      <path d="M13 2a11 11 0 0 1 0 22a6.4 11 0 0 0 0-22z" fill="var(--ink)" />
    </svg>
  )
}

/** The moment now, moving on each minute. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/** If the page can't be shown, a message, not an empty page (HOUSE-STYLE §5). */
class SafetyNet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <div className="welcome" role="alert"><p>Sorry, this page couldn’t be shown. Try another postcode, or try again later.</p></div>
  }
}

const fromHash = (): District | null => {
  const code = outwardCode(decodeURIComponent(location.hash.slice(1)))
  return code ? district(code) : null
}

function Lines({ lines, marks }: { lines: string[]; marks?: boolean }) {
  return (
    <ul className={marks ? 'lines marked' : 'lines'}>
      {lines.map((l) => {
        const colour = marks ? lineColour(l) : null
        return <li key={l}>{marks && <span className="sw" style={colour ? { background: colour } : { visibility: 'hidden' }} />}<span>{l}</span></li>
      })}
    </ul>
  )
}

function Place({ d, now }: { d: District; now: Date }) {
  const date = tonightDate(d, now)
  const v = useTonight(d, date)
  if (!v) return <p className="working" role="status">Working out tonight’s sky…</p>
  const [moon, planets, ahead, more] = v.groups
  return (
    <>
      <div className="hero">
        <figure className="moonbox">
          <MoonFace lit={v.moon.lit} tilt={v.moon.tilt} up={v.moon.up} label={moon.lines[0]} />
          {v.moon.up && v.moon.lit > 0.012 && <figcaption>As it stands at {clock(v.moon.at)}</figcaption>}
        </figure>
        <div>
          <p className="kicker">Tonight · {v.title}</p>
          <h1 className="big">{v.opening.figure}<small>{v.opening.under}</small>{v.opening.note && <em>{v.opening.note}</em>}</h1>
          <p className="lede">{v.opening.line}</p>
        </div>
      </div>
      <Lines lines={moon.lines} />

      <section>
        <div className="sec-head">
          <h2>The sky tonight</h2>
          <p className="sub">From sunset to sunrise. Each arc is how high the Moon or a planet stands: solid where it’s in view, dotted where it’s up but lost in a bright sky or too low.</p>
        </div>
        {v.series && <SkyTonight v={v} now={now} />}
        <Lines lines={planets.lines} marks />
      </section>

      <section>
        <div className="sec-head"><h2>Looking ahead</h2></div>
        <Lines lines={ahead.lines} />
        {more.lines.length > 0 && (
          <details className="more">
            <summary>See more</summary>
            <Lines lines={more.lines} />
          </details>
        )}
      </section>
    </>
  )
}

export default function App() {
  const now = useNow()
  const [d, setD] = useState<District | null>(() => fromHash() ?? savedDistrict())
  const [changing, setChanging] = useState(false)
  const choose = (next: District) => {
    saveDistrict(next.code)
    history.replaceState(null, '', `#${next.code}`)
    setD(next)
    setChanging(false)
  }
  // The postcode after "#" (it never reaches a server): followed when it changes.
  useEffect(() => {
    const onHash = () => { const next = fromHash(); if (next) { saveDistrict(next.code); setD(next) } }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand"><Logo />Nightreader</div>
        {d && !changing && (
          <div className="pill">
            <span><strong>{d.name}</strong> ({d.code})</span>
            <button className="btn btn-small" type="button" onClick={() => setChanging(true)}>Change</button>
          </div>
        )}
      </header>
      <main>
        {(!d || changing) && (
          <div className="welcome">
            {!d && <h1>The night sky from your postcode</h1>}
            {!d && <p className="lede">How dark tonight gets, when the Moon is out of the way, and which planets you can see, anywhere in Great Britain.</p>}
            <PostcodeBox onChoose={choose} onCancel={d ? () => setChanging(false) : undefined} />
          </div>
        )}
        {d && <SafetyNet key={d.code}><Place d={d} now={now} /></SafetyNet>}
      </main>
      <footer>
        <p>
          Nightreader is a free-to-use personal project by John Baish. More free tools at{' '}
          <a href="https://www.baish.net/" target="_blank" rel="noopener noreferrer">www.baish.net</a>. Contact: workshop@baish.net.
          {' '}Everything is worked out on your device: nothing you type is sent anywhere. Your device, rather than the website, stores your postcode, so the page opens the same way next time.
        </p>
        <p>
          Times are UK local time. {POSTCODE_CREDITS.map((c) => c.replace(/([^.])$/, '$1.')).join(' ')}
          {' '}Calculated with <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener noreferrer">Astronomy Engine</a> (MIT licence).
        </p>
      </footer>
    </div>
  )
}
