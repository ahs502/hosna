import { useCallback, useRef } from 'react'
import { useRefEffect } from './useRefEffect'
import { useRefWrap } from './useRefWrap'

export function useKeepScrollAtBottom(options?: { readonly forceScrollToBottomOnChildAppend?: boolean }): {
  scrollingContainerRef: useRefEffect.Ref<HTMLElement>
  handleBottomElementUpdatedStatic: () => void
} {
  const optionsRef = useRefWrap(options)

  const scrollingContainerRef = useRefEffect(instance => {
    instance.style.overflowX = 'hidden'
    instance.style.overflowY = 'auto'

    instance.scrollTop = instance.scrollHeight

    const handleScroll = (event: Event): void => {
      if (ignoreScrollEventTimeoutRef.current) {
        clearTimeout(ignoreScrollEventTimeoutRef.current)
        ignoreScrollEventTimeoutRef.current = null
        return
      }
      const element = event.target as HTMLElement
      scrollAtBottomRef.current = element.scrollHeight - element.clientHeight <= element.scrollTop + 1
    }

    instance.addEventListener('scroll', handleScroll)

    const resizeObserver = new ResizeObserver(() => void handleBottomElementUpdatedStatic())
    resizeObserver.observe(instance)
    Array.from(instance.children).forEach(child => resizeObserver.observe(child))

    const mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              if (
                optionsRef.current?.forceScrollToBottomOnChildAppend &&
                node === instance.children.item(instance.children.length - 1)
              ) {
                scrollAtBottomRef.current = true
              }
              resizeObserver.observe(node)
            }
          })
          mutation.removedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              resizeObserver.unobserve(node)
            }
          })
        }
      })
    })
    mutationObserver.observe(instance, {
      childList: true,
      subtree: false,
    })

    return () => {
      instance.style.overflowX = ''
      instance.style.overflowY = ''
      instance.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  const scrollAtBottomRef = useRef(true)

  const ignoreScrollEventTimeoutRef = useRef<any | null>(null)

  const handleBottomElementUpdatedStatic = useCallback((): void => {
    if (scrollingContainerRef.current && scrollAtBottomRef.current) {
      if (ignoreScrollEventTimeoutRef.current) {
        clearTimeout(ignoreScrollEventTimeoutRef.current)
      }
      ignoreScrollEventTimeoutRef.current = setTimeout(() => void (ignoreScrollEventTimeoutRef.current = null), 100)
      scrollingContainerRef.current.scrollTop = scrollingContainerRef.current.scrollHeight
    }
  }, [])

  return {
    scrollingContainerRef,

    handleBottomElementUpdatedStatic,
  }
}
