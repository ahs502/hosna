import { PropsWithChildren, ReactElement } from 'react'
import { createPortal } from 'react-dom'

export function Portal({
  container,
  children,
}: PropsWithChildren<{
  container?: Element | DocumentFragment | null | undefined
}>): ReactElement | null {
  return container ? createPortal(children, container) : null
}
