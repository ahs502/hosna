import { FunctionComponent, PropsWithChildren, ReactElement, createContext, useContext } from 'react'
import { prependErrorMessage } from 'shared'

export function createSimpleProvider<T>(
  displayName?: string
): FunctionComponent<PropsWithChildren<{ memoizedProvided: T }>> & { readonly useProvided: () => T } {
  const ProvidedContext = createContext<T | undefined>(undefined)

  function Provider({ memoizedProvided, children }: PropsWithChildren<{ memoizedProvided: T }>): ReactElement {
    return <ProvidedContext.Provider value={memoizedProvided}>{children}</ProvidedContext.Provider>
  }

  if (displayName) {
    Provider.displayName = displayName.endsWith('Provider') ? displayName : `${displayName}Provider`
  }

  Provider.useProvided = function useProvided(): T {
    const provided = useContext(ProvidedContext)
    if (provided === undefined) throw Error(prependErrorMessage(displayName, 'Not provided.'))
    return provided
  }

  return Provider
}
