import { useEffect, useState } from 'react'

type ScriptStatus = 'loading' | 'loaded' | 'error'
type Status = 'uninitialized' | 'idle' | ScriptStatus

const scripts: Record<
  string,
  {
    readonly element: HTMLScriptElement
    status: ScriptStatus
    readonly onStatusChangeHandlers: ((status: ScriptStatus) => void)[]
  }
> = {}

export function useExternalScript(src: string): { externalScriptStatus: Status } {
  const [status, setStatus] = useState<Status>(src ? 'uninitialized' : 'idle')

  useEffect(() => {
    if (!src) {
      setStatus('idle')
      return
    }

    if (!(src in scripts) || scripts[src].status === 'error') {
      scripts[src]?.element.remove()
      const element = window.document.createElement('script')
      element.async = true
      element.src = src
      scripts[src] = {
        element,
        status: 'loading',
        onStatusChangeHandlers: [],
      }
      element.addEventListener('load', () => {
        scripts[src].status = 'loaded'
        scripts[src].onStatusChangeHandlers.forEach(handler => handler('loaded'))
      })
      element.addEventListener('error', () => {
        scripts[src].status = 'error'
        scripts[src].onStatusChangeHandlers.forEach(handler => handler('error'))
      })
      window.document.body.append(element)
    }

    if (src in scripts) {
      setStatus(scripts[src].status)
      scripts[src].onStatusChangeHandlers.push(setStatus)
      return () => {
        const index = scripts[src].onStatusChangeHandlers.indexOf(setStatus)
        if (index >= 0) {
          scripts[src].onStatusChangeHandlers.splice(index, 1)
        }
      }
    }
  }, [src])

  return {
    externalScriptStatus: status,
  }
}
