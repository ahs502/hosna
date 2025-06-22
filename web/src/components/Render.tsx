import { ComponentProps, FunctionComponent, ReactElement } from 'react'

export function Render<C extends FunctionComponent<any>>({
  Component,
  ...otherProps
}: { Component: C } & ComponentProps<C>): ReactElement {
  return <Component {...otherProps} />
}
