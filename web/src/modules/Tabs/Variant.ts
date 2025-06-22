import { createContext } from 'react'

export interface Variant {
  readonly highlight: 'emphasized and underlined' | 'emphasized' | 'toggled button'
  readonly gap: 'none' | 'chevron' | 'dash'
}

export namespace Variant {
  export const defaultValue: Variant = {
    highlight: 'emphasized and underlined',
    gap: 'none',
  }

  export const Context = createContext<Variant>(defaultValue)
}
