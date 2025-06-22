import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { humanizeTimestamp } from './humanizeTimestamp'

export function useHumanizedTimestamp(
  timestamp: number | undefined,
  mode: humanizeTimestamp.Mode,
  options?: {
    readonly disabled?: boolean
  }
): string {
  const initialResult = useMemo<ReturnType<(typeof humanizeTimestamp)['withExpiration']>>(
    () => (options?.disabled ? { humanizedTimestamp: '' } : humanizeTimestamp.withExpiration(timestamp, mode)),
    [timestamp, mode, options?.disabled]
  )

  const [humanizedTimestamp, setHumanizedTimestamp] = useState(initialResult.humanizedTimestamp)

  const expiresInMillisecondsRef = useRef(initialResult.expiresInMilliseconds)

  useLayoutEffect(() => {
    setHumanizedTimestamp(initialResult.humanizedTimestamp)
    expiresInMillisecondsRef.current = initialResult.expiresInMilliseconds

    let timeout: any
    resetTimeout()
    return () => void clearTimeout(timeout)

    function resetTimeout(): void {
      if (expiresInMillisecondsRef.current === undefined) return
      timeout = setTimeout(() => {
        const result = humanizeTimestamp.withExpiration(timestamp, mode)
        setHumanizedTimestamp(result.humanizedTimestamp)
        expiresInMillisecondsRef.current = result.expiresInMilliseconds
        resetTimeout()
      }, expiresInMillisecondsRef.current)
    }
  }, [timestamp, mode, initialResult])

  return humanizedTimestamp
}
