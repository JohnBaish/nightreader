// The postcode box: on a first visit, and after "Change". What's typed is looked up in the
// bundled list and never sent anywhere (SPEC §2). From Lightreader's, for Great Britain.

import { useState, type FormEvent } from 'react'
import { district, outwardCode, postcodeProblem, type District } from '../lib/postcode.ts'

/** `problem`: a message to show from the start (a link to an unknown postcode). */
export function PostcodeBox({ onChoose, onCancel, problem = '' }: { onChoose: (d: District) => void; onCancel?: () => void; problem?: string }) {
  const [typed, setTyped] = useState('')
  const [error, setError] = useState(problem)

  function submit(e: FormEvent) {
    e.preventDefault()
    const code = outwardCode(typed)
    const d = code ? district(code) : null
    if (!d) return setError(postcodeProblem(typed))
    onChoose(d)
  }

  return (
    <form className="postcode-box" onSubmit={submit} noValidate>
      <label htmlFor="pc">Your postcode, or just its first half</label>
      <div className="choose-row">
        <input
          className="input" id="pc" value={typed} autoComplete="postal-code" placeholder="RG1 or RG1 8FR"
          aria-invalid={error ? true : undefined} aria-describedby={error ? 'pc-error' : undefined}
          autoCapitalize="characters" autoCorrect="off" spellCheck={false} enterKeyHint="go" autoFocus={!!onCancel}
          onChange={(e) => { setTyped(e.target.value); if (error) setError('') }}
        />
        <button className="btn btn-primary" type="submit">Show</button>
        {onCancel && <button className="btn" type="button" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <div className="choose-error" id="pc-error" role="alert">{error}</div>}
      <div className="note">Only the first half (RG1) is used. Saved on this device only: nothing you type is sent anywhere.</div>
    </form>
  )
}
