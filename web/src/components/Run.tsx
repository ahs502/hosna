import { DependencyList, ReactElement, ReactNode, useMemo } from 'react'

/** **VERY IMPORTANT NOTE:** Always use this component with an identical `key` property, unless you know why you don't need that! */
export function Run<P extends {} = {}>({
  children,
  ...props
}: P & {
  children: (props: Omit<P, 'key' | 'children'>) => ReactNode | void
}): ReactElement {
  return <>{children(props as any)}</>
}

export namespace Run {
  /** **VERY IMPORTANT NOTE:** Always use this component with an identical `key` property, unless you know why you don't need that! */
  export function Memo<P extends {} = {}>({
    children,
    dependencies = [],
    ...props
  }: P & {
    children: (props: Omit<P, 'key' | 'children' | 'dependencies'>) => ReactNode | void
    dependencies?: DependencyList
  }): ReactElement {
    return useMemo(() => <Run {...(props as any)}>{children}</Run>, dependencies)
  }
}
