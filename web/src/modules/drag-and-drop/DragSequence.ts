// The whole purpose of drag sequences here is to handle the exceptional situations where
// more than one Drag instances want to manipulate a single DOM element at
// a certain time (like when using Reqct StrictMode and useDrag hook);
// in those cases we want to ensure the element's configurations (like draggble set to true)
// only get removed after all handlers are disposed.

const DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED = 'dragSequences'

export type DragSequence = string

export namespace DragSequence {
  export function set(dragSourceElement: HTMLElement): {
    dragSequence: DragSequence
    isFirstHandler: boolean
  } {
    current += BigInt(1)
    const dragSequence = String(current)
    const isFirstHandler =
      !(DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED in dragSourceElement.dataset) ||
      !dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED]
    dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED] = (
      dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED] || ''
    )
      .split(',')
      .filter(Boolean)
      .concat(dragSequence)
      .join(',')
    return { dragSequence, isFirstHandler }
  }

  export function remove(
    dragSourceElement: HTMLElement,
    dragSequence: DragSequence
  ): {
    wasLastHandler: boolean
  } {
    if (!(DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED in dragSourceElement.dataset)) return { wasLastHandler: false }
    dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED] =
      dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED]?.split(',')
        .filter(item => item && item !== dragSequence)
        .join(',') ?? ''
    const wasLastHandler = !dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED]
    if (wasLastHandler) delete dragSourceElement.dataset[DATASET_DRAG_SEQUENCES_KEY_CAMEL_CASED]
    return { wasLastHandler }
  }
}

let current = BigInt(0)
