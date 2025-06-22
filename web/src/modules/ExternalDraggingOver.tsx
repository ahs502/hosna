import { createContext, PropsWithChildren, useContext, useState } from 'react'
import { NativeDragObject, useDrop } from './drag-and-drop'

export namespace ExternalDraggingOver {
  export type Status = 'none' | 'files' | 'html' | 'text' | 'urls'

  export function Provider({ children }: PropsWithChildren<{}>) {
    const [status, setStatus] = useState<Status>('none')

    useDrop<NativeDragObject.File | NativeDragObject.Html | NativeDragObject.Text | NativeDragObject.Url, void>({
      dropTargetElement: window.document.body,
      check(event, dragObject) {
        switch (dragObject.type) {
          case NativeDragObject.Type.File:
          case NativeDragObject.Type.Html:
          case NativeDragObject.Type.Text:
          case NativeDragObject.Type.Url:
            return 'allowed'
        }
      },
      drag(event, dragObject, { entered }) {
        switch (dragObject.type) {
          case NativeDragObject.Type.File:
            setStatus(entered ? 'files' : 'none')
            return 'none'

          case NativeDragObject.Type.Html:
            setStatus(entered ? 'html' : 'none')
            return 'none'

          case NativeDragObject.Type.Text:
            setStatus(entered ? 'text' : 'none')
            return 'none'

          case NativeDragObject.Type.Url:
            setStatus(entered ? 'urls' : 'none')
            return 'none'
        }
      },
    })

    return <StatusContext.Provider value={status}>{children}</StatusContext.Provider>
  }

  export function useStatus(): { externalDraggingOverStatus: Status } {
    return { externalDraggingOverStatus: useContext(StatusContext) }
  }
}

const StatusContext = createContext<ExternalDraggingOver.Status>('none')
