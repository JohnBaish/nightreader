// "About these figures" (stage 7): the words for the sky with their technical names, and how
// the figures are worked out. John's wording (November 10th 2026); item 1 is Lightreader's.

import { cssRgb, skyAt } from '../lib/skyColour.ts'

const BANDS: [string, string | null, number, string][] = [
  ['Daylight', null, 10, 'The Sun is up: from sunrise to sunset, when the top of the Sun meets a flat horizon.'],
  ['Half-light', 'civil twilight', -3, 'The Sun is just below the horizon, up to 6° down. Enough light to be out and about.'],
  ['Dark', 'nautical twilight', -9, 'The Sun is 6° to 12° below the horizon. Too dark for most things outdoors without a light.'],
  ['Very dark', 'astronomical twilight', -15, 'The Sun is 12° to 18° below the horizon. A faint glow may remain low in the sky.'],
  ['True night', null, -19, 'The Sun is more than 18° below the horizon, and the sky is as dark as it gets.'],
]

export function About() {
  return (
    <section className="about">
      <div className="sec-head"><h2>About these figures</h2></div>
      <dl>
        {BANDS.map(([name, technical, sun, what]) => (
          <div key={name} className="about-row">
            <dt><i className="swatch" style={{ background: cssRgb(skyAt(sun)) }} />{name}{technical && <span> ({technical})</span>}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
      <p>“Moon-free” means the Moon is below the horizon. The moonlight in the pictures indicates only the Moon’s position and fullness, not the overall brightness of the sky.</p>
      <p>
        The planets are Mercury, Venus, Mars, Jupiter and Saturn. A planet is well placed when it’s at least 20° up, and low
        (needing a clear horizon) from 10° to 20°. The sky also has to be dark enough to see it. The brighter the planet, the
        sooner after sunset it shows: Venus once the Sun is 3° below the horizon, Mercury at its faintest at 9°. A spell of
        less than 15 minutes isn’t counted. Uranus and Neptune are left out, as they need binoculars.
      </p>
      <p>
        Directions are from the middle of your postcode district. Named towns are included in that direction if they are
        within 25 miles, or within 60 miles when towns are sparse.
      </p>
      <p>
        Meteor showers’ peak times are from the International Meteor Organization’s calendar. Each year’s verdict (“a good
        year”) comes from how much of that night’s darkness is free of the Moon.
      </p>
      <p>
        Everything is worked out on your device with Astronomy Engine, a free astronomy library, in UK local time (GMT or
        BST), to the nearest minute. Moonrise and moonset agree with the Norwegian Meteorological Institute’s published times
        to within a minute.
      </p>
      <p>
        We assume a flat, open horizon. Hills, buildings, street lights and cloud aren’t taken into account. Stars close to
        the horizon are drawn without allowing for the way the air bends their light there, so they may sit a fraction of a
        degree too low.
      </p>
    </section>
  )
}
