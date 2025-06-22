import { useState } from 'react'
import { useWindowDev } from '../hooks/useWindowDev'

// This component is for test purposes only:

export function UiErrorGenerator() {
  const [throwError, setThrowError] = useState(false)

  useWindowDev(
    () => ({
      generateUIError(): void {
        setThrowError(true)
      },
    }),
    []
  )

  if (!throwError) return <></>

  throw Error('Manually generated error by UiErrorGenerator component.')
}
