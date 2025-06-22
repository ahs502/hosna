import { useMemo } from 'react'
import { AvailableNavigationOptions } from './types'

// TODO: Not implemented. The only way is to take control of all the app navigations, and then use the history state to determine if the user can go back or forward:
export function useAvailableNavigationOptions(): AvailableNavigationOptions {
  return useMemo(
    () => ({
      canGoBack: false,
      canGoForward: false,
    }),
    [location]
  )
}
