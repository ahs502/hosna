import { DependencyList, useEffect } from 'react'
import { useRefWrap } from '../../hooks/useRefWrap'
import { doesEventMatchCombinations } from './Keyboard'
import { Combinations } from './types/Combinations'

export function useGlobalRegistration(
  eventType: 'keydown' | 'keypress' | 'keyup',
  handler: (event: KeyboardEvent) => void,
  dependencies: DependencyList,
  {
    combinations,
    disabled = false,
    ...eventListenerOptions
  }: {
    combinations?: Combinations | undefined
    disabled?: boolean
  } & EventListenerOptions = {}
): void {
  const combinationsRef = useRefWrap(combinations)

  useEffect(() => {
    if (!disabled) {
      const filteredHandler = (event: KeyboardEvent): void => {
        if (doesEventMatchCombinations(event, combinationsRef.current)) {
          handler(event)
        }
      }

      window.addEventListener(eventType, filteredHandler, eventListenerOptions)
      return () => void window.removeEventListener(eventType, filteredHandler, eventListenerOptions)
    }
  }, [eventType, ...dependencies, disabled])
}
