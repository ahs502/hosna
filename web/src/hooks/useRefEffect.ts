import { DependencyList, RefCallback, RefObject, useMemo, useRef } from 'react'
import { Writable } from 'shared'

export function useRefEffect<T = HTMLElement>(
  effect: (instance: T, ref: useRefEffect.Ref<T>) => void | (() => void),
  dependencies: DependencyList
): useRefEffect.Ref<T> {
  const cleanUpRef = useRef<void | (() => void)>(undefined)

  return useMemo<useRefEffect.Ref<T>>(() => {
    const refCallback: RefCallback<T> = instance => {
      const writableRef = ref as Writable<RefObject<T>>
      writableRef.current = instance

      if (cleanUpRef.current) {
        cleanUpRef.current()
        cleanUpRef.current = undefined
      }

      if (instance) {
        cleanUpRef.current = effect(instance, ref)
      }
    }

    const ref = refCallback as useRefEffect.Ref<T>

    return ref
  }, dependencies)
}

export namespace useRefEffect {
  export type Ref<T = HTMLElement> = RefCallback<T> & RefObject<T>
}
