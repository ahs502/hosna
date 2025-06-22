import { DependencyList, Ref, useImperativeHandle, useMemo } from 'react'

export function useReturningImperativeHandle<T, R extends T>(
  ref: Ref<T> | undefined,
  initialize: () => R,
  dependencies?: DependencyList
): R {
  const referee = useMemo(initialize, dependencies ?? [])

  useImperativeHandle(ref, () => referee, [referee])

  return referee
}
