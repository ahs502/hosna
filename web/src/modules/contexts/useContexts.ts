import { useContext, useMemo } from 'react'
import { ContextValues } from './ContextValues'
import { Contexts } from './Contexts'

export function useContexts<C extends Contexts<any>>(contexts: C): ContextValues<C> {
  return useMemo(
    () =>
      new Proxy(undefined!, {
        get(target, property, receiver) {
          return useContext(contexts.contextsByKey[property as string])
        },
      }),
    []
  )
}
