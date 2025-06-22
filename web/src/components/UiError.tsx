import { ReactElement } from 'react'

export function UiError({ children }: { children?: string | Error }): ReactElement {
  throw children instanceof Error ? children : typeof children === 'string' ? new Error(children) : Error()
}
