import { DependencyList, useMemo, useRef, useState } from 'react'
import { useDebounce } from 'react-use'

export function useDebouncedValue<T>(
  value: T | (() => T),
  delayMilliseconds: number,
  dependencies: DependencyList = [value]
): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  const memoizedDependencies = useMemo(() => dependencies, dependencies)

  const initialDependenciesRef = useRef(memoizedDependencies)

  useDebounce(
    () => {
      if (memoizedDependencies === initialDependenciesRef.current) return
      setDebouncedValue(value)
    },
    delayMilliseconds,
    [memoizedDependencies]
  )

  return debouncedValue
}
