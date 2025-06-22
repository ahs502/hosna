import { Dispatch, SetStateAction, useLayoutEffect, useState } from 'react'

interface ElementAndRect {
  readonly element: Element
  readonly rect: DOMRectReadOnly
}

export function useObservedSize(element: Element | null | undefined): DOMRectReadOnly | undefined {
  const [elementAndRect, setElementAndRect] = useState<ElementAndRect>()

  useLayoutEffect(() => {
    if (!element) return

    const resizeObserver = new ResizeObserver(entries => {
      const [entry] = entries
      setElementAndRect({ element: entry.target, rect: entry.contentRect })
    })

    resizeObserver.observe(element)

    return () => void resizeObserver.disconnect()
  }, [element])

  return element && element === elementAndRect?.element ? elementAndRect.rect : undefined
}

export namespace useObservedSize {
  export function withRef(): [
    ref: Dispatch<SetStateAction<Element | null>>,
    rect: DOMRectReadOnly | undefined,
    element: Element | null,
  ] {
    const [element, setElement] = useState<Element | null>(null)

    return [setElement, useObservedSize(element), element]
  }
}
