import { useEffect, useState } from 'react'

type StyleStatus = 'loading' | 'loaded' | 'error'
type Status = 'uninitialized' | 'idle' | StyleStatus

const styles: Record<
  string,
  {
    readonly element: HTMLStyleElement
    status: StyleStatus
    readonly onStatusChangeHandlers: ((status: StyleStatus) => void)[]
  }
> = {}

export function useExternalStyle(href: string): { externalStyleStatus: Status } {
  const [status, setStatus] = useState<Status>(href ? 'uninitialized' : 'idle')

  useEffect(() => {
    if (!href) {
      setStatus('idle')
      return
    }

    if (!(href in styles) || styles[href].status === 'error') {
      styles[href]?.element.remove()
      const element = window.document.createElement('link')
      element.rel = 'stylesheet'
      element.href = href
      styles[href] = {
        element,
        status: 'loading',
        onStatusChangeHandlers: [],
      }
      element.addEventListener('load', () => {
        styles[href].status = 'loaded'
        styles[href].onStatusChangeHandlers.forEach(handler => handler('loaded'))
      })
      element.addEventListener('error', () => {
        styles[href].status = 'error'
        styles[href].onStatusChangeHandlers.forEach(handler => handler('error'))
      })
      window.document.body.append(element)
    }

    if (href in styles) {
      setStatus(styles[href].status)
      styles[href].onStatusChangeHandlers.push(setStatus)
      return () => {
        const index = styles[href].onStatusChangeHandlers.indexOf(setStatus)
        if (index >= 0) {
          styles[href].onStatusChangeHandlers.splice(index, 1)
        }
      }
    }
  }, [href])

  return {
    externalStyleStatus: status,
  }
}
