import { RefObject, useEffect, useRef } from 'react'
import { Drag } from './Drag'

export function useDrag<DragObject, DropResult>(
  options: Drag.Options<DragObject, DropResult>
): {
  dragSourceRef: RefObject<any>
  dragPreviewRef: RefObject<any>
} {
  const dragRef = useRef<Drag<DragObject, DropResult> | undefined>(undefined)

  const dragSourceRef = useRef<any>(null)
  const dragPreviewRef = useRef<any>(null)

  useEffect(() => {
    const drag = new Drag({
      ...options,
      dragSourceElement: dragSourceRef.current ?? options.dragSourceElement,
      dragPreviewElement: dragPreviewRef.current ?? options.dragPreviewElement,
    })
    dragRef.current = drag

    return () => {
      drag.dispose()
      dragRef.current = undefined
    }
  }, [])

  dragRef.current?.updateOptions({
    ...options,
    dragSourceElement: dragSourceRef.current ?? options.dragSourceElement,
    dragPreviewElement: dragPreviewRef.current ?? options.dragPreviewElement,
  })

  return {
    dragSourceRef,
    dragPreviewRef,
  }
}
