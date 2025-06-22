import { DependencyList, useEffect } from 'react'
import { useMountedState } from 'react-use'

export function useAsyncEffect(
  effect: (provided: { isMounted: () => boolean }) => void | Promise<void>,
  dependencies?: DependencyList
): void {
  const isMounted = useMountedState()

  return useEffect(() => {
    effect({ isMounted })
  }, dependencies)
}
