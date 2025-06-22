import { DependencyList, EffectCallback, useEffect, useRef } from 'react'
import { usePreviousDistinct } from 'react-use'

export function useSyncEffect<T extends DependencyList = []>(
  effect: (dependencies: T, previousDependencies?: T) => ReturnType<EffectCallback>,
  dependencies: T,
  options?: {
    readonly updatesOnly?: boolean
  }
): void {
  const previousDependencies = usePreviousDistinct(dependencies)

  const destructorRef = useRef<ReturnType<EffectCallback>>(undefined)

  if (
    (!previousDependencies && !options?.updatesOnly) ||
    (previousDependencies &&
      (previousDependencies.length !== dependencies.length ||
        previousDependencies.some((dependency, index) => dependency !== dependencies[index])))
  ) {
    destructorRef.current?.()
    const destructor = effect(dependencies, previousDependencies)
    destructorRef.current = () => {
      destructor?.()
      destructorRef.current = undefined
    }
  }

  useEffect(() => () => destructorRef.current?.(), [])
}
