import { useEffect, useRef } from 'react'
import { arrayHelpers } from 'shared'

export interface ManagedElementAttributes {
  readonly className?: string
  readonly style?: Partial<CSSStyleDeclaration>
  readonly [key: string]: any
}

/**
 * Only applies and updates the given attributes, won't clean up (not implemented yet).
 */
export function useManagedElementAttributes(
  element: HTMLElement | null | (() => HTMLElement | null),
  attributes: ManagedElementAttributes | undefined
): void {
  const appliedAttributesRef = useRef<{
    classNames?: readonly string[]
    style?: Partial<CSSStyleDeclaration>
    others: Record<string, string>
  }>({ others: {} })

  // useLayoutEffect doesn't work with our ApplyTiptapEditorWrapperAttributes!
  useEffect(() => {
    const evaluatedElement = typeof element === 'function' ? element() : element
    if (!evaluatedElement) return

    const { className, style, ...others } = attributes ?? {}

    const attributesClassNames = className?.split(' ').filter(Boolean) ?? []
    attributesClassNames.forEach(
      className =>
        appliedAttributesRef.current.classNames?.includes(className) || evaluatedElement.classList.add(className)
    )
    appliedAttributesRef.current.classNames?.forEach(
      className => attributesClassNames.includes(className) || evaluatedElement.classList.remove(className)
    )
    appliedAttributesRef.current.classNames = attributesClassNames

    // The CSSStyleDeclaration is an all string property object,
    // thus delete won't work to remove a certain property value.
    // If we want to clear a property, we need to assign it an empty string:
    const attributesStyle = style ?? {}
    Object.entries(attributesStyle).forEach(
      ([key, value]) =>
        appliedAttributesRef.current.style?.[key as any] === value ||
        (evaluatedElement.style[key as any] = (value as any) || '')
    )
    Object.keys(appliedAttributesRef.current.style ?? {}).forEach(
      key => !(key in attributesStyle) && (evaluatedElement.style[key as any] = '')
    )
    appliedAttributesRef.current.style = attributesStyle

    arrayHelpers
      .distinctString([...Object.keys(others), ...Object.keys(appliedAttributesRef.current.others)])
      .forEach(key => {
        const oldValue = appliedAttributesRef.current.others[key]
        const newValue = (others as Record<string, string | null | undefined>)[key]
        const hadValue = oldValue !== null && oldValue !== undefined
        const hasValue = newValue !== null && newValue !== undefined
        if (hasValue && (!hadValue || oldValue !== newValue)) {
          evaluatedElement.setAttribute(key, newValue)
          appliedAttributesRef.current.others[key] = newValue
        } else if (hadValue && !hasValue) {
          evaluatedElement.removeAttribute(key)
          delete appliedAttributesRef.current.others[key]
        }
      })
  })
}
