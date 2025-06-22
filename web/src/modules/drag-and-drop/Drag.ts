import { DragData } from './DragData'
import { DragSequence } from './DragSequence'
import { DRAG_EVENT_MANAGED_KEY } from './constants'

/**
 * Handles drag & drop events for a dragging element.
 */
export class Drag<DragObject, DropResult> {
  private options: Drag.Options<DragObject, DropResult>
  private disconnectDragSource?: () => void
  private disposed = false

  constructor(options: Drag.Options<DragObject, DropResult>) {
    this.options = {}
    this.updateOptions(options)
  }

  getOptions(): Drag.Options<DragObject, DropResult> {
    return this.options
  }

  updateOptions(optionsUpdates: Partial<Drag.Options<DragObject, DropResult>>): void {
    if (this.disposed) return

    const oldOptions = this.options
    this.options = { ...oldOptions, ...optionsUpdates }

    const dragSourceWasConnected = !!this.disconnectDragSource
    const dragSourceHasChanged = oldOptions.dragSourceElement !== this.options.dragSourceElement
    const dragSourceCanConnect =
      this.options.dragObject !== undefined && !!this.options.dragSourceElement && !this.options.disabled
    const dragSourceHasToDisonnect = dragSourceWasConnected && (dragSourceHasChanged || !dragSourceCanConnect)
    const dragSourceHasToConnect = (!dragSourceWasConnected || dragSourceHasChanged) && dragSourceCanConnect

    if (dragSourceHasToDisonnect) {
      this.disconnectDragSource?.()
    }

    if (dragSourceHasToConnect) {
      const dragSourceElement = this.options.dragSourceElement!

      const { dragSequence, isFirstHandler } = DragSequence.set(dragSourceElement)
      if (isFirstHandler) {
        dragSourceElement.draggable = true
      }

      const getAndSetManagedToTrue = (event: DragEvent): boolean => {
        const extendedEvent = event as DragEvent & { [DRAG_EVENT_MANAGED_KEY]?: boolean }
        const managed = extendedEvent[DRAG_EVENT_MANAGED_KEY] ?? false
        extendedEvent[DRAG_EVENT_MANAGED_KEY] = true
        return managed
      }

      const handleDragStart = (event: DragEvent): void => {
        if (getAndSetManagedToTrue(event)) return
        const dragPreviewElement =
          typeof this.options.dragPreviewElement === 'function'
            ? this.options.dragPreviewElement()
            : this.options.dragPreviewElement
        if (dragPreviewElement) {
          const dragPreviewBoundingClientRect = dragPreviewElement.getBoundingClientRect()
          const cursorLeft = event.pageX - dragPreviewBoundingClientRect.x
          const cursorTop = event.pageY - dragPreviewBoundingClientRect.y
          const dragPreviewWidth = dragPreviewBoundingClientRect.width
          const dragPreviewHeight = dragPreviewBoundingClientRect.height
          const dragPreviewLeft =
            typeof this.options.dragPreviewLeft === 'function'
              ? this.options.dragPreviewLeft({
                  dragPreviewElement,
                  dragPreviewWidth,
                  dragPreviewHeight,
                  cursorLeft,
                  cursorTop,
                })
              : this.options.dragPreviewLeft
          const x =
            dragPreviewLeft === undefined || dragPreviewLeft === 'cursor'
              ? cursorLeft
              : typeof dragPreviewLeft === 'number'
                ? dragPreviewLeft
                : dragPreviewLeft.endsWith('px')
                  ? Number(dragPreviewLeft.slice(0, -2))
                  : dragPreviewLeft.endsWith('%')
                    ? (dragPreviewWidth * Number(dragPreviewLeft.slice(0, -1))) / 100
                    : 0
          const dragPreviewTop =
            typeof this.options.dragPreviewTop === 'function'
              ? this.options.dragPreviewTop({
                  dragPreviewElement,
                  dragPreviewWidth,
                  dragPreviewHeight,
                  cursorLeft,
                  cursorTop,
                })
              : this.options.dragPreviewTop
          const y =
            dragPreviewTop === undefined || dragPreviewTop === 'cursor'
              ? cursorTop
              : typeof dragPreviewTop === 'number'
                ? dragPreviewTop
                : dragPreviewTop.endsWith('px')
                  ? Number(dragPreviewTop.slice(0, -2))
                  : dragPreviewTop.endsWith('%')
                    ? (dragPreviewHeight * Number(dragPreviewTop.slice(0, -1))) / 100
                    : 0
          event.dataTransfer?.setDragImage(dragPreviewElement, Number.isNaN(x) ? 0 : x, Number.isNaN(y) ? 0 : y)
        }
        DragData.instance.set(() => this.options)
        this.options.dragStart?.(event)
      }

      const handleDrag = (event: DragEvent): void => {
        if (getAndSetManagedToTrue(event)) return
        DragData.instance.set(() => this.options)
        this.options.drag?.(event)
      }

      const handleDragEnd = (event: DragEvent): void => {
        if (getAndSetManagedToTrue(event)) return
        DragData.instance.set(undefined)
        this.options.dragEnd?.(event)
      }

      dragSourceElement.addEventListener('dragstart', handleDragStart)
      dragSourceElement.addEventListener('drag', handleDrag)
      dragSourceElement.addEventListener('dragend', handleDragEnd)

      this.disconnectDragSource = () => {
        const { wasLastHandler } = DragSequence.remove(dragSourceElement, dragSequence)
        if (wasLastHandler) {
          dragSourceElement.draggable = false
        }

        dragSourceElement.removeEventListener('dragstart', handleDragStart)
        dragSourceElement.removeEventListener('drag', handleDrag)
        dragSourceElement.removeEventListener('dragend', handleDragEnd)

        delete this.disconnectDragSource
      }
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.updateOptions({
      dragSourceElement: undefined,
    })
    this.disposed = true
  }

  get isDisposed(): boolean {
    return this.disposed
  }
}

export namespace Drag {
  export interface Options<DragObject, DropResult> {
    /**
     * Data representation for the dragging element.
     *
     * It can be anything but `undefined`, otherwise the element won't become draggable.
     */
    readonly dragObject?: DragObject | (() => DragObject)

    /**
     * The element which will be draggable.
     */
    readonly dragSourceElement?: HTMLElement | null | undefined

    /**
     * The element which will be displayed as a preview while dragging.
     */
    readonly dragPreviewElement?: HTMLElement | null | undefined | (() => HTMLElement | null | undefined)

    /**
     * The left position of the drag preview element.
     *
     * Can be a pixel value (e.g. `10` or `"10px"`), a percentage value (e.g. `10%`),
     * or `"cursor"` (default) to use the cursor position (the drag start mouse position on the preview element).
     */
    readonly dragPreviewLeft?:
      | 'cursor'
      | (string & {})
      | number
      | ((provided: {
          dragPreviewElement: HTMLElement
          dragPreviewWidth: number
          dragPreviewHeight: number
          cursorLeft: number
          cursorTop: number
        }) => 'cursor' | (string & {}) | number)

    /**
     * The top position of the drag preview element.
     *
     * Can be a pixel value (e.g. `10` or `"10px"`), a percentage value (e.g. `10%`),
     * or `"cursor"` (default) to use the cursor position (the drag start mouse position on the preview element).
     */
    readonly dragPreviewTop?:
      | 'cursor'
      | (string & {})
      | number
      | ((provided: {
          dragPreviewElement: HTMLElement
          dragPreviewWidth: number
          dragPreviewHeight: number
          cursorLeft: number
          cursorTop: number
        }) => 'cursor' | (string & {}) | number)

    /**
     * Called when the dragging starts.
     */
    readonly dragStart?: (event: DragEvent) => void

    /**
     * Called while the dragging.
     */
    readonly drag?: (event: DragEvent) => void

    /**
     * Called when the dragging ends.
     */
    readonly dragEnd?: (event: DragEvent) => void

    /**
     * Called when the dragging element is dropped into an accepting drop target
     * and the drop target passed handling the drop operation back to this dragging
     * element by calling its given `drop()` function.
     */
    readonly drop?: (dragObject: DragObject, dropResult: DropResult) => void

    /**
     * Whether the dragging is disabled.
     */
    readonly disabled?: boolean
  }
}
