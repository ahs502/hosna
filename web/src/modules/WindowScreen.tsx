import { createContext, PropsWithChildren, ReactElement, useContext, useEffect } from 'react'
import { useStateAccessor } from '../hooks/useStateAccessor'

export namespace WindowScreen {
  export interface Size {
    readonly width: number
    readonly height: number
  }

  export namespace Size {
    export function get(): Size {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    }

    export function areEqual(first: Size, second: Size): boolean {
      return first.width === second.width && first.height === second.height
    }
  }

  export function Provider({ children }: PropsWithChildren<{}>): ReactElement {
    const sizeAccessor = useStateAccessor(Size.get, [], { equalityFunction: Size.areEqual })

    useEffect(() => {
      window.addEventListener('resize', handleResize)
      return () => void window.removeEventListener('resize', handleResize)

      function handleResize(): void {
        sizeAccessor.reset()
      }
    }, [])

    return <SizeContext.Provider value={sizeAccessor.value}>{children}</SizeContext.Provider>
  }

  export function useSize(): { windowScreenSize: WindowScreen.Size } {
    return { windowScreenSize: useContext(SizeContext) }
  }
}

const SizeContext = createContext(WindowScreen.Size.get())
