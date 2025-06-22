import { Children, Fragment, ReactNode } from 'react'

export function isReactNodeNotEmpty(reactNode: ReactNode): boolean {
  return (
    reactNode !== null &&
    reactNode !== undefined &&
    (typeof reactNode === 'string'
      ? !!reactNode
      : typeof reactNode === 'number'
        ? !!reactNode || reactNode === 0
        : typeof reactNode === 'boolean'
          ? reactNode
          : Symbol.iterator in reactNode
            ? isIterableReactNodeNotEmpty(reactNode)
            : reactNode.type === Fragment
              ? isReactNodeNotEmpty.forChildren(reactNode.props.children)
              : true)
  )
}

export namespace isReactNodeNotEmpty {
  export function forChildren(children: ReactNode | undefined): boolean {
    return isReactNodeNotEmpty(Children.toArray(children))
  }
}

function isIterableReactNodeNotEmpty(iterableReactNode: Iterable<ReactNode>): boolean {
  for (const item of iterableReactNode) {
    if (isReactNodeNotEmpty(item)) return true
  }
  return false
}
