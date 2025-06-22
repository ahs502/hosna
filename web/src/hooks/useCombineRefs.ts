import { LegacyRef, MutableRefObject, Ref, RefCallback, useCallback, useRef } from 'react'

type Refs = (Ref<any> | MutableRefObject<any> | LegacyRef<any> | undefined | null | false | 0 | '')[]

export function useCombineRefs(...refs: Refs): (...extraRefs: Refs) => RefCallback<any> {
  const extraRefsRef = useRef<Refs>([])

  const combinedRefCallback = useCallback<RefCallback<any>>(
    element =>
      [...refs, ...extraRefsRef.current].forEach(ref => {
        if (!ref || typeof ref === 'string') return // No legacy ref support
        if (typeof ref === 'function') {
          ref(element)
          return
        }
        const mutableRef = ref as MutableRefObject<any>
        mutableRef.current = element
      }),
    refs
  )

  return useCallback(
    (...extraRefs) => {
      extraRefsRef.current = extraRefs
      return combinedRefCallback
    },
    [combinedRefCallback]
  )
}
