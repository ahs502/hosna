import { DragData } from './DragData'
import { NativeDragObject } from './NativeDragObject'
import { DRAG_EVENT_MANAGED_KEY } from './constants'

/**
 * Handles drag & drop events for a drop target.
 */
export class Drop<DragObject, DropResult> {
  private options: Drop.Options<DragObject, DropResult>
  private disconnectDropTarget?: () => void
  private disposed = false

  // While dragging an element over an inner element of the drop target, we have a _drag leave_ event on the drop target root element and
  // a _drag enter_ event on the inner element (right before the _drag leave_ event!).
  // The purpose of this property is to bypass that until the dragging element actually quits the drop target root itself for real.
  // TODO: What if the lastDragEnterEventTarget is the inner element itself (is it possible?)? I kind of don't like this hacky solution. Instead, do something else, like trying to count the number of _drag enter_s against _drag leave_s then fire the leave event when it's 0 again, of leave on another condition of how the event.target and the target element contain each other, or any other approach:
  private lastDragEnterEventTarget?: EventTarget

  constructor(options: Drop.Options<DragObject, DropResult>) {
    this.options = {}
    this.updateOptions(options)
  }

  getOptions(): Drop.Options<DragObject, DropResult> {
    return this.options
  }

  updateOptions(optionsUpdates: Partial<Drop.Options<DragObject, DropResult>>): void {
    if (this.disposed) return

    const oldOptions = this.options
    this.options = { ...oldOptions, ...optionsUpdates }

    const dropTargetWasConnected = !!this.disconnectDropTarget
    const dropTargetHasChanged = oldOptions.dropTargetElement !== this.options.dropTargetElement
    const dropTargetCanConnect = !!this.options.dropTargetElement && !this.options.disabled
    const dropTargetHasToDisonnect = dropTargetWasConnected && (dropTargetHasChanged || !dropTargetCanConnect)
    const dropTargetHasToConnect = (!dropTargetWasConnected || dropTargetHasChanged) && dropTargetCanConnect

    if (dropTargetHasToDisonnect) {
      this.disconnectDropTarget?.()
    }

    if (dropTargetHasToConnect) {
      const dropTargetElement = this.options.dropTargetElement!

      const getManaged = (event: DragEvent): boolean => {
        const extendedEvent = event as DragEvent & { [DRAG_EVENT_MANAGED_KEY]?: boolean }
        return extendedEvent[DRAG_EVENT_MANAGED_KEY] ?? false
      }

      const setManaged = (event: DragEvent, allowed: boolean): void => {
        const extendedEvent = event as DragEvent & { [DRAG_EVENT_MANAGED_KEY]?: boolean }
        extendedEvent[DRAG_EVENT_MANAGED_KEY] ||= allowed
      }

      const getDragData = (event: DragEvent): DragData.Value => {
        return DragData.instance.get() ?? { dragObject: NativeDragObject.extractFromDragEvent(event) }
      }

      const check = (event: DragEvent, dragObject: DragObject, managed: boolean): boolean => {
        if (!this.options.check) return true
        const result = this.options.check(event, dragObject, { managed })
        return result === 'allowed' || result === true
      }

      const handleDragEnter = (event: DragEvent): void => {
        this.lastDragEnterEventTarget = event.target!
        const { dragObject } = getDragData(event)
        const managed = getManaged(event)
        const allowed = check(event, dragObject, managed)
        setManaged(event, allowed)
        this.options.dragEnter?.(event, dragObject, {
          allowed,
          managed,
        })
        const dropEffect = this.options.drag?.(event, dragObject, {
          entered: true,
          allowed,
          accepted: allowed,
          managed,
        })
        if (!managed) {
          if (allowed) {
            event.preventDefault() // To allow dropping.
          }
          if (dropEffect && event.dataTransfer) {
            event.dataTransfer.dropEffect = dropEffect
          }
        }
      }

      const handleDragOver = (event: DragEvent): void => {
        const { dragObject } = getDragData(event)
        const managed = getManaged(event)
        const allowed = check(event, dragObject, managed)
        setManaged(event, allowed)
        this.options.dragOver?.(event, dragObject, {
          allowed,
          managed,
        })
        const dropEffect = this.options.drag?.(event, dragObject, {
          entered: true,
          allowed,
          accepted: allowed,
          managed,
        })
        if (!managed) {
          if (allowed) {
            event.preventDefault() // To allow dropping.
          }
          if (dropEffect && event.dataTransfer) {
            event.dataTransfer.dropEffect = dropEffect
          }
        }
      }

      const handleDragLeave = (event: DragEvent): void => {
        const { dragObject } = getDragData(event)
        const managed = getManaged(event)
        const allowed = check(event, dragObject, managed)
        setManaged(event, allowed)
        if (this.lastDragEnterEventTarget === event.target) {
          this.options.drag?.(event, dragObject, {
            allowed,
            entered: false,
            accepted: false,
            managed,
          })
        }
        this.options.dragLeave?.(event, dragObject, {
          allowed,
          managed,
        })
      }

      const handleDrop = (event: DragEvent): void => {
        const { dragObject, drop } = getDragData(event)
        const managed = getManaged(event)
        const allowed = check(event, dragObject, managed)
        setManaged(event, allowed)
        this.options.drag?.(event, dragObject, {
          allowed,
          entered: false,
          accepted: false,
          managed,
        })
        if (allowed) {
          event.preventDefault() // To prevent the browser to handle the dropped link or file by default.
          this.options.drop?.(event, dragObject, dropResult => void drop?.(dragObject, dropResult), {
            managed,
          })
        }
      }

      dropTargetElement.addEventListener('dragenter', handleDragEnter)
      dropTargetElement.addEventListener('dragover', handleDragOver)
      dropTargetElement.addEventListener('dragleave', handleDragLeave)
      dropTargetElement.addEventListener('drop', handleDrop)

      this.disconnectDropTarget = () => {
        dropTargetElement.removeEventListener('dragenter', handleDragEnter)
        dropTargetElement.removeEventListener('dragover', handleDragOver)
        dropTargetElement.removeEventListener('dragleave', handleDragLeave)
        dropTargetElement.removeEventListener('drop', handleDrop)
      }
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.updateOptions({
      dropTargetElement: undefined,
    })
    this.disposed = true
  }

  get isDisposed(): boolean {
    return this.disposed
  }
}

export namespace Drop {
  export interface Options<DragObject, DropResult> {
    /**
     * The element which will be the drop target.
     */
    readonly dropTargetElement?: HTMLElement | null | undefined

    /**
     * For a dragging element, determines whether it can be dropped into this drop target
     * (by returning `true` or `'allowed'`), or not (by returning `false`, `'denied'`, or just void).
     *
     * Called for every _drag enter_, _drag over_, _drag leave_, and _drop_ event.
     *
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     */
    readonly check?: (
      event: DragEvent,
      dragObject: DragObject,
      flags: { managed: boolean }
    ) => 'allowed' | 'denied' | boolean | void

    /**
     * Called when a dragging element enters this drop target.
     *
     * @param flags.allowed Whether the dragging is allowed to be dropped into this drop target, according to the `check` function.
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     */
    readonly dragEnter?: (
      event: DragEvent,
      dragObject: DragObject,
      flags: { allowed: boolean; managed: boolean }
    ) => void

    /**
     * Called when a dragging element is over this drop target.
     *
     * @param flags.allowed Whether the dragging is allowed to be dropped into this drop target, according to the `check` function.
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     */
    readonly dragOver?: (
      event: DragEvent,
      dragObject: DragObject,
      flags: { allowed: boolean; managed: boolean }
    ) => void

    /**
     * Called when a dragging element leaves this drop target.
     *
     * @param flags.allowed Whether the dragging is allowed to be dropped into this drop target, according to the `check` function.
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     */
    readonly dragLeave?: (
      event: DragEvent,
      dragObject: DragObject,
      flags: { allowed: boolean; managed: boolean }
    ) => void

    /**
     * Determines the dragging cursor (drop effect) for the dragging element on this drop target.
     *
     * Also a shorthand for all `dragStart`, `dragOver`, `dragLeave`, and `drop` callbacks for when
     * it comes to make the drop target display react to the drag action (e.g. show/hide a border while the item is being dragged over).
     *
     * @param flags.entered Whether the dragging element is on the drop target (on _drag enter_ or while _drag over_) or has just left/done (on _drag leave_ or _drop_).
     * @param flags.allowed Whether the dragging is allowed to be dropped into this drop target, according to the `check` function.
     * @param flags.accepted The same as `flags.entered && flags.allowed`, can be used for highlighting the drop target to display it's ready to accept the dragging element drop.
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     * @returns Either `"none"`, `"copy"`, `"link"`, `"move"`, or void (which by default is the same as `"none"`).
     */
    readonly drag?: (
      event: DragEvent,
      dragObject: DragObject,
      flags: { entered: boolean; allowed: boolean; accepted: boolean; managed: boolean }
    ) => void | DataTransfer['dropEffect']

    /**
     * Called when a dragging element (which is allowed to be dropped here) has just dropped on this drop target.
     *
     * For **nested drop targets** make sure to check the `flags.managed` to ensure that
     * no nested drop target has already accepted the dropped element.
     *
     * @param drop To pass handling the drop event back to the dragging element's handler.
     * @param flags.managed Whether this event is already managed (marked as _allowed_) by a nested drop target.
     */
    readonly drop?: (
      event: DragEvent,
      dragObject: DragObject,
      drop: (dropResult: DropResult) => void,
      flags: { managed: boolean }
    ) => void

    /**
     * Whether the dropping is disabled.
     */
    readonly disabled?: boolean
  }
}
