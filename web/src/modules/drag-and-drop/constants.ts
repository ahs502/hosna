/**
 * The maximum amount of time which we keep the drag data without any drag event,
 * otherwise we'll assume the drag operation is already aborted.
 */
export const DRAG_DATA_TIMEOUT = 1 * 1000

/**
 * This boolean flag attached to any drag event is used to inform the handler that
 * this event is already managed by a nested handler and we probably want to bypass it here.
 */
export const DRAG_EVENT_MANAGED_KEY = Symbol('DRAG_EVENT_MANAGED_KEY')
