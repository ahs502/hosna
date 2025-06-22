import { DependencyList } from 'react'
import { webConfig } from '../modules/webConfig'
import { useSyncEffect } from './useSyncEffect'

export function useWindowDev(
  mapFactory: () => Readonly<Record<string, any>>,
  dependencies: DependencyList,
  options?: {
    readonly disabled?: boolean
  }
): void {
  if (webConfig.environment.mode === 'development' || webConfig.environment.target === 'stage') {
    useSyncEffect(() => {
      if (!options?.disabled) {
        const map = mapFactory()
        const keys = Object.keys(map)

        const windowAsAny = window as any

        windowAsAny.dev = windowAsAny.dev || {}
        keys.forEach(key => {
          windowAsAny.dev[key] = map[key]
        })

        return () => {
          keys.forEach(key => {
            delete windowAsAny.dev[key]
          })
          if (Object.keys(windowAsAny.dev).length === 0) delete windowAsAny.dev
        }
      }
    }, [...dependencies, options?.disabled])
  }
}
