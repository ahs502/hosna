import { createContext, PropsWithChildren, useContext } from 'react'
import { useMedia } from 'react-use'

export namespace SystemTheme {
  export type Type = 'light' | 'dark'

  export function Provider({ children }: PropsWithChildren<{}>) {
    const darkMode = useMedia('(prefers-color-scheme: dark)')

    return <TypeContext.Provider value={darkMode ? 'dark' : 'light'}>{children}</TypeContext.Provider>
  }

  export function useType(): { systemThemeType: Type } {
    return { systemThemeType: useContext(TypeContext) }
  }
}

const TypeContext = createContext<SystemTheme.Type>('light')
