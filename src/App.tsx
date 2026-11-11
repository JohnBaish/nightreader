// Nightreader's page (PLAN stage 3): the header with the postcode pill, the opening (the Moon
// beside one figure), "The sky tonight" with the planets' sentences, and "Looking ahead".
// "Where to look" and "The year in darkness" come in stages 4 and 5. A first-time visitor sees
// the postcode box; the postcode is kept after "#" and on this device only (SPEC §2).

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { About } from './components/About.tsx'
import { MoonFace } from './components/MoonFace.tsx'
import { PostcodeBox } from './components/PostcodeBox.tsx'
import { ShareButton } from './components/ShareButton.tsx'
import { SkyTonight } from './components/SkyTonight.tsx'
import { WhereToLook } from './components/WhereToLook.tsx'
import { YearInDarkness } from './components/YearInDarkness.tsx'
import { lineColour } from './lib/lineColour.ts'
import { clock } from './lib/format.ts'
import { district, outwardCode, POSTCODE_CREDITS, postcodeProblem, saveDistrict, savedDistrict, type District } from './lib/postcode.ts'
import { chartPicture, deliver, imageName, type PictureText } from './lib/shareImage.ts'
import { MOON_KEY, SKY_KEY } from './lib/yearKeys.ts'
import { tonightDate } from './lib/tonight.ts'
import { townsRound } from './lib/towns.ts'
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

const hashText = () => decodeURIComponent(location.hash.slice(1)).trim()
const fromHash = (): District | null => {
  const code = outwardCode(hashText())
  return code ? district(code) : null
}
/** A link to a postcode Nightreader doesn't know (#BT1, #ZZ99): the box's own message, shown with
 *  the box open (the fresh look's 3.6; John, November 11th 2026). */
const hashProblem = (): string => (hashText() && !fromHash() ? postcodeProblem(hashText()) : '')

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

const CREDIT = `nightreader.baish.net · Times in UK local time for the middle of the postcode district, calculated with Astronomy Engine (MIT licence). ${POSTCODE_CREDITS.map((c) => c.replace(/([^.])$/, '$1.')).join(' ')}`
const STARS = 'Stars and constellation lines from d3-celestial by Olaf Frohn (BSD licence), from XHIP, an extended Hipparcos compilation (Anderson and Francis, 2012).'

/** "Copy" / "Share" for a picture: the drawing found in `section` by `selector`. */
function Share({ section, selector, heading, sub, credit, file, date, code, keys }: {
  section: React.RefObject<HTMLElement | null>; selector: string; heading: string; sub: () => string[]; credit: string; file: string; date: string; code: string; keys?: PictureText['keys']
}) {
  return (
    <div className="share-row">
      <ShareButton what="" make={() => deliver(async () => {
        const area = section.current?.querySelector<HTMLElement>(selector)
        if (!area) throw new Error('No picture')
        return chartPicture(area, { heading, sub: sub(), credit, keys })
      }, imageName(file, code, date), heading)} />
    </div>
  )
}

function Place({ d, now }: { d: District; now: Date }) {
  const date = tonightDate(d, now)
  const { view: v, year } = useTonight(d, date)
  const skyRef = useRef<HTMLElement | null>(null), lookRef = useRef<HTMLElement | null>(null), yearRef = useRef<HTMLElement | null>(null)
  if (!v) return <p className="working" role="status">Working out tonight’s sky…</p>
  const [moon, planets, ahead, more] = v.groups
  // where no town lies to the south (Shetland, say), the line about towns is left out (John, November 10th)
  const hasTowns = townsRound(d, d.own).some((t) => t.bearing > 47 && t.bearing < 313)
  const where = `${d.name} (${d.code})`
  const text = (sel: string) => (sec: React.RefObject<HTMLElement | null>) => sec.current?.querySelector(sel)?.textContent?.trim() ?? ''
  const skyShare = <Share section={skyRef} selector=".frame" heading="The sky tonight" sub={() => [where, `Tonight, ${v.title}, from sunset to sunrise`]} credit={CREDIT} file="sky-tonight" date={v.date} code={d.code} />
  const lookShare = <Share section={lookRef} selector=".pano-inner" heading="Where and when to look" sub={() => [where, `${v.title} at ${text('.clock')(lookRef)}, facing south`]} credit={`${CREDIT} ${STARS}`} file="where-to-look" date={v.date} code={d.code} />
  const yearShare = year && <Share section={yearRef} selector=".frame.year" heading="The year in darkness" sub={() => [where, ...(yearRef.current?.querySelector<HTMLElement>('.readout')?.innerText.split('\n').map((l) => l.trim()).filter(Boolean) ?? [])]} credit={CREDIT} file="year-in-darkness" date={year.from} code={d.code} keys={[{ heading: 'The sky', items: SKY_KEY }, { heading: 'Moonlight in the night', items: MOON_KEY }]} />
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

      <section ref={skyRef}>
        <div className="sec-head">
          <h2>The sky tonight</h2>
          {v.series && <div className="cp cp-head cp-wide">{skyShare}</div>}
          <p className="sub">From sunset to sunrise. Each arc is the height of the Moon or a planet: solid where it’s in view, dotted where it’s up but lost in a bright sky or too low.</p>
        </div>
        {v.series && <SkyTonight v={v} now={now} />}
        {v.series && <div className="cp cp-below cp-phone">{skyShare}</div>}
        <Lines lines={planets.lines} marks />
      </section>

      {v.series && (
        <section ref={lookRef}>
          <div className="sec-head">
            <h2>Where and when to look</h2>
            <p className="sub">Facing south, with east on the left and west on the right. {hasTowns && 'The towns along the horizon are where they really lie from here. '}Slide through the night.<span className="swipe-hint"> Swipe the picture to look east or west.</span></p>
          </div>
          <WhereToLook key={v.date} v={v} d={d} now={now}
            share={lookShare} />
        </section>
      )}

      <section ref={yearRef}>
        <div className="sec-head">
          <h2>The year in darkness</h2>
          <p className="sub">Every night from tonight for a year, dusk at the top and dawn at the bottom. The pale slanting bands are moonlight.</p>
        </div>
        {year ? <YearInDarkness key={year.from + d.code} y={year} name={d.name}
          share={yearShare} /> : <p className="working" role="status">Working out the year…</p>}
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

      <About />
    </>
  )
}

export default function App() {
  const now = useNow()
  const [d, setD] = useState<District | null>(() => fromHash() ?? savedDistrict())
  const [problem, setProblem] = useState(hashProblem)
  const [changing, setChanging] = useState(() => !!problem)
  const choose = (next: District) => {
    saveDistrict(next.code)
    history.replaceState(null, '', `#${next.code}`)
    setD(next)
    setChanging(false)
    setProblem('')
  }
  // The postcode after "#" (it never reaches a server): followed when it changes.
  useEffect(() => {
    const onHash = () => {
      const next = fromHash()
      if (next) { saveDistrict(next.code); setD(next); setProblem(''); setChanging(false) }
      else if (hashText()) { setProblem(hashProblem()); setChanging(true) }
    }
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
            {!d && <p className="lede">Proper darkness tonight, with the Moon out of the way, and the visible planets, anywhere in Great Britain.</p>}
            <PostcodeBox key={problem} onChoose={choose} onCancel={d ? () => { setChanging(false); if (problem) history.replaceState(null, '', `#${d.code}`); setProblem('') } : undefined} problem={problem} />
            {!d && (
              <p className="welcome-about">
                Nightreader works out, for any postcode in Great Britain, when the sky is truly dark tonight, when the Moon is
                out of the way, which planets are in view and where to look for them, and how the darkness changes through the
                year. Free to use.
              </p>
            )}
          </div>
        )}
        {d && <SafetyNet key={d.code}><Place d={d} now={now} /></SafetyNet>}
      </main>
      <footer>
        {/* the credits wait until a postcode is chosen, as Lightreader's do (John, November 10th) */}
        {d && (
          <p>
            Times are UK local time. {POSTCODE_CREDITS.map((c) => c.replace(/([^.])$/, '$1.')).join(' ')}
            {' '}Stars and constellation lines from d3-celestial by Olaf Frohn (BSD licence), from XHIP, an extended Hipparcos compilation (Anderson and Francis, 2012). Meteor shower peaks from the International Meteor Organization. Calculated with <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener noreferrer">Astronomy Engine</a> (MIT licence).
          </p>
        )}
        <p>
          Nightreader is a free-to-use personal project by John Baish. More free tools at{' '}
          <a href="https://www.baish.net/" target="_blank" rel="noopener noreferrer">www.baish.net</a>. Contact: workshop@baish.net.
          {' '}Everything is worked out on your device: nothing you type is sent anywhere. Your device, rather than the website, stores your postcode, so the page opens the same way next time. We don’t record anything you do here, apart from anonymous visit statistics (no cookies, no personal data), showing us how the site is used.
        </p>
      </footer>
    </div>
  )
}
