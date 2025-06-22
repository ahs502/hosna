import { DependencyList, useCallback, useRef } from 'react'

// TODO: Replace this hook with useMemo + Lazily:
export function useLazyMemo<T>(factory: () => T, dependencies: DependencyList): () => T {
  const resultRef = useRef<
    | {
        readonly usedFactory: typeof factory
        readonly extractedValue: T
      }
    | undefined
  >(undefined)

  return useCallback((): T => {
    if (resultRef.current?.usedFactory !== factory) {
      resultRef.current = {
        usedFactory: factory,
        extractedValue: factory(),
      }
    }
    return resultRef.current.extractedValue
  }, [dependencies])
}
