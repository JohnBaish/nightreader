// The Moon, drawn at its true phase and tilt as it stands in the sky (from the agreed mock-up).

import { useId } from 'react'

export function MoonFace({ lit, tilt, up, label }: { lit: number; tilt: number; up: boolean; label: string }) {
  const id = useId()
  const R = 78, ry = Math.abs(1 - 2 * lit) * R, sweep = lit > 0.5 ? 1 : 0
  return (
    <svg className="moon" viewBox="-100 -100 200 200" role="img" aria-label={label}>
      <defs>
        <radialGradient id={`${id}lit`} cx="50%" cy="42%" r="62%">
          <stop offset="0" stopColor="var(--moon)" /><stop offset="1" stopColor="var(--moon)" stopOpacity=".82" />
        </radialGradient>
        <radialGradient id={`${id}halo`} cx="50%" cy="50%" r="50%">
          <stop offset=".72" stopColor="var(--moon)" stopOpacity={(0.16 * lit).toFixed(3)} /><stop offset="1" stopColor="var(--moon)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="100" fill={`url(#${id}halo)`} />
      <circle r={R} fill="var(--raise)" stroke="var(--hair)" strokeWidth="1" />
      {lit > 0.012 && (
        // the bright limb drawn upward, then turned to where it really points
        <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 A ${R} ${ry.toFixed(2)} 0 0 ${sweep} ${-R} 0 Z`} fill={`url(#${id}lit)`} transform={`rotate(${-tilt})`} opacity={up ? 1 : 0.55} />
      )}
    </svg>
  )
}
