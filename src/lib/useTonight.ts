import { useEffect, useRef, useState } from 'react'
import type { District } from './postcode.ts'
import type { Tonight } from './tonight.ts'
import type { Answer, Ask } from './tonight.worker.ts'
import type { YearView } from './yearView.ts'

/** The night's figures for a district, then the year's, worked out in the worker; each is
 *  null while that's happening. */
export function useTonight(d: District, date: string): { view: Tonight | null; year: YearView | null } {
  const worker = useRef<Worker | null>(null)
  const [got, setGot] = useState<{ key: string; view: Tonight } | null>(null)
  const [year, setYear] = useState<{ key: string; year: YearView } | null>(null)
  const nextId = useRef(0)
  const key = `${d.code} ${date}`

  useEffect(() => {
    const w = new Worker(new URL('./tonight.worker.ts', import.meta.url), { type: 'module' })
    worker.current = w
    return () => w.terminate()
  }, [])

  useEffect(() => {
    const w = worker.current!
    const id = ++nextId.current
    const onAnswer = (e: MessageEvent<Answer>) => {
      if (e.data.id !== id) return
      if ('view' in e.data) setGot({ key, view: e.data.view }); else setYear({ key, year: e.data.year })
    }
    w.addEventListener('message', onAnswer)
    w.postMessage({ id, place: { latitude: d.latitude, longitude: d.longitude }, own: d.own, date } satisfies Ask)
    return () => w.removeEventListener('message', onAnswer)
  }, [d, date, key])

  return { view: got?.key === key ? got.view : null, year: year?.key === key ? year.year : null }
}
