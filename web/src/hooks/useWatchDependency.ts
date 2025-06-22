import { useCallback, useState } from 'react'
import { generateUuid } from 'shared'

export function useWatchDependency(): {
  watchDependency: string
  resetWatchDependencyStatic(): void
} {
  const [watchDependency, setWatchDependency] = useState('')

  return {
    watchDependency,

    resetWatchDependencyStatic: useCallback(() => setWatchDependency(generateUuid()), []),
  }
}
