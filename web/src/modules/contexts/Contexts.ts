import { Context, FunctionComponent, PropsWithChildren } from 'react'

export interface Contexts<Values extends { readonly [key: string]: any }> {
  readonly contextsByKey: { readonly [Key in keyof Values]: Context<Values[Key]> }
  readonly Provider: FunctionComponent<PropsWithChildren<{ values: Values }>>
}
