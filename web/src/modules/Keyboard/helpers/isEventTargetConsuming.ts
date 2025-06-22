export function isEventTargetConsuming(event: KeyboardEvent): boolean {
  // TODO: It also needs to consider Enter (submit) in <form>s as well
  return event.composedPath().some(element => {
    const typedElement = element as HTMLElement
    return (
      typedElement.tagName === 'INPUT' ||
      typedElement.tagName === 'TEXTAREA' ||
      typedElement.isContentEditable ||
      typedElement.tagName === 'IFRAME'
    )
  })
}
