import { DependencyList, useEffect, useMemo, useRef } from 'react'
import { useMountedState } from 'react-use'
import { useRefWrap } from '../../hooks/useRefWrap'

export function useInfiniteVirtualScroll(
  {
    getScrollElement,
    disabled,
    minimumThresholdInViewsCount = 1,
    minimumThresholdInPixels = 0,
    maximumThresholdInViewsCount = 2,
    maximumThresholdInPixels = 0,
    ultimateMaximumThresholdInViewsCount = 3,
    ultimateMaximumThresholdInPixels = 0,
    hasMoreAtStart,
    hasMoreAtEnd,
    hasAnythingToExclude,
    onMoreRequiredAtStart,
    onMoreRequiredAtEnd,
    onLessRequiredAtStart,
    onLessRequiredAtEnd,
  }: {
    getScrollElement(): HTMLElement | null
    disabled?: boolean
    minimumThresholdInViewsCount?: number
    minimumThresholdInPixels?: number
    maximumThresholdInViewsCount?: number
    maximumThresholdInPixels?: number
    ultimateMaximumThresholdInViewsCount?: number
    ultimateMaximumThresholdInPixels?: number
    hasMoreAtStart?: boolean
    hasMoreAtEnd?: boolean
    hasAnythingToExclude?: boolean
    onMoreRequiredAtStart?(minimumRequiredPixels: number, maximumRequiredPixels: number): void
    onMoreRequiredAtEnd?(minimumRequiredPixels: number, maximumRequiredPixels: number): void
    onLessRequiredAtStart?(minimumRequiredPixels: number, maximumRequiredPixels: number): void
    onLessRequiredAtEnd?(minimumRequiredPixels: number, maximumRequiredPixels: number): void
  },
  dependencies?: DependencyList
): void {
  const isMounted = useMountedState()

  const contentRef = useRefWrap({
    getScrollElement,
    disabled,
    minimumThresholdInViewsCount,
    minimumThresholdInPixels,
    maximumThresholdInViewsCount,
    maximumThresholdInPixels,
    ultimateMaximumThresholdInViewsCount,
    ultimateMaximumThresholdInPixels,
    hasMoreAtStart,
    hasMoreAtEnd,
    hasAnythingToExclude,
    onMoreRequiredAtStart,
    onMoreRequiredAtEnd,
    onLessRequiredAtStart,
    onLessRequiredAtEnd,
  })

  const stateRef = useRef<{
    timeout?: any
    requiresAnotherCheck?: boolean
    latestAction?: 'less start' | 'more start' | 'less end' | 'more end'
  }>({})

  const checkRef = useRefWrap((): void => {
    if (!isMounted()) return

    if (stateRef.current.timeout) {
      stateRef.current.requiresAnotherCheck = true
      return
    }

    stateRef.current.timeout = setTimeout(() => {
      if (!isMounted()) return

      delete stateRef.current.timeout

      const scrollElement = contentRef.current.getScrollElement()
      if (!scrollElement || contentRef.current.disabled) return

      const minimumThreshold = Math.max(
        0,
        contentRef.current.minimumThresholdInViewsCount * scrollElement.clientHeight,
        contentRef.current.minimumThresholdInPixels
      )
      const maximumThreshold = Math.max(
        minimumThreshold,
        contentRef.current.maximumThresholdInViewsCount * scrollElement.clientHeight,
        contentRef.current.maximumThresholdInPixels
      )
      const ultimateMaximumThreshold = Math.max(
        maximumThreshold,
        contentRef.current.ultimateMaximumThresholdInViewsCount * scrollElement.clientHeight,
        contentRef.current.ultimateMaximumThresholdInPixels
      )

      const contentTop = 0
      const contentBottom = scrollElement.scrollHeight

      const clientTop = scrollElement.scrollTop
      const clientBottom = scrollElement.scrollTop + scrollElement.clientHeight

      const topSpace = clientTop - contentTop
      const bottomSpace = contentBottom - clientBottom

      if (contentRef.current.onMoreRequiredAtEnd && contentRef.current.hasMoreAtEnd && bottomSpace < minimumThreshold) {
        stateRef.current.latestAction = 'more end'
        contentRef.current.onMoreRequiredAtEnd(minimumThreshold - bottomSpace, maximumThreshold - bottomSpace)
      } else if (
        contentRef.current.onMoreRequiredAtStart &&
        contentRef.current.hasMoreAtStart &&
        topSpace < minimumThreshold
      ) {
        stateRef.current.latestAction = 'more start'
        contentRef.current.onMoreRequiredAtStart(minimumThreshold - topSpace, maximumThreshold - topSpace)
      } else if (
        contentRef.current.onLessRequiredAtEnd &&
        contentRef.current.hasAnythingToExclude &&
        ((bottomSpace > maximumThreshold && stateRef.current.latestAction !== 'more end') ||
          bottomSpace > ultimateMaximumThreshold)
      ) {
        stateRef.current.latestAction = 'less end'
        contentRef.current.onLessRequiredAtEnd(bottomSpace - maximumThreshold, bottomSpace - minimumThreshold)
      } else if (
        contentRef.current.onLessRequiredAtStart &&
        contentRef.current.hasAnythingToExclude &&
        ((topSpace > maximumThreshold && stateRef.current.latestAction !== 'more start') ||
          topSpace > ultimateMaximumThreshold)
      ) {
        stateRef.current.latestAction = 'less start'
        contentRef.current.onLessRequiredAtStart(topSpace - maximumThreshold, topSpace - minimumThreshold)
      } else return

      if (stateRef.current.requiresAnotherCheck) {
        delete stateRef.current.requiresAnotherCheck
        checkRef.current()
      }
    })
  })

  useEffect(() => {
    checkRef.current()
  })

  // TODO: Check if the following is really required:
  useEffect(() => {
    if (stateRef.current.timeout) {
      clearTimeout(stateRef.current.timeout)
      delete stateRef.current.timeout
      setTimeout(() => checkRef.current())
    }
  }, dependencies)

  useEffect(() => {
    const scrollElement = getScrollElement()

    if (scrollElement) {
      scrollElement.addEventListener('scroll', check)

      return () => {
        scrollElement.removeEventListener('scroll', check)
      }
    }

    function check(): void {
      checkRef.current()
    }
  }, [getScrollElement()])

  const scrollElementResizeObserver = useMemo(
    () =>
      new ResizeObserver(entries => {
        checkRef.current()
      }),
    []
  )

  useEffect(() => {
    const scrollElement = getScrollElement()

    if (scrollElement) {
      scrollElementResizeObserver.observe(scrollElement)

      return () => {
        scrollElementResizeObserver.unobserve(scrollElement)
      }
    }
  }, [scrollElementResizeObserver, getScrollElement()])

  useEffect(() => () => scrollElementResizeObserver.disconnect(), [scrollElementResizeObserver])
}
