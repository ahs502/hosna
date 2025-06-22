import { RefObject, useEffect, useRef } from 'react'
import { Drop } from './Drop'

export function useDrop<DragObject, DropResult>(
  options: Drop.Options<DragObject, DropResult>
): {
  dropTargetRef: RefObject<any>
} {
  const dropRef = useRef<Drop<DragObject, DropResult> | undefined>(undefined)

  const dropTargetRef = useRef<any>(null)

  useEffect(() => {
    const drop = new Drop({
      ...options,
      dropTargetElement: dropTargetRef.current ?? options.dropTargetElement,
    })
    dropRef.current = drop

    return () => {
      drop.dispose()
      dropRef.current = undefined
    }
  }, [])

  dropRef.current?.updateOptions({
    ...options,
    dropTargetElement: dropTargetRef.current ?? options.dropTargetElement,
  })

  return {
    dropTargetRef,
  }
}
