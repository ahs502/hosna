import { Context, PropsWithChildren, ReactElement, createContext } from 'react'
import { objectHelpers } from 'shared'
import { Contexts } from './Contexts'

export function createContexts<Values extends { readonly [key: string]: any }>(
  defaultValues: Values,
  name?: string
): Contexts<Values> {
  const keys = Object.keys(defaultValues)

  const contextsByKey = objectHelpers.map(defaultValues, (key, value) => createContext(value)) as {
    readonly [Key in keyof Values]: Context<any>
  }

  function Provider({ values, children }: PropsWithChildren<{ values: Values }>): ReactElement {
    return keys.reduceRight(
      (current, key) => {
        const Context = contextsByKey[key]
        return <Context.Provider value={values[key]}>{current}</Context.Provider>
      },
      <>{children}</>
    )
  }

  Provider.displayName = `${name ?? ''}ContextsProvider`

  return {
    Provider,
    contextsByKey,
  }
}
