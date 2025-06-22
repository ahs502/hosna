import { DependencyList, useCallback, useEffect, useMemo, useRef } from 'react'
import { useEffectOnce } from 'react-use'
import { useRefWrap } from '../../hooks/useRefWrap'
import { useStateAccessor } from '../../hooks/useStateAccessor'
import { useSyncEffect } from '../../hooks/useSyncEffect'
import { useInfiniteVirtualScroll } from './useInfiniteVirtualScroll'

// TODO: Make it work with items' indexes, not their IDs:
export function useInfiniteVirtualScrollList<T extends { readonly id: string }>(
  {
    initiallyScrollIsAtBottom = false,
    minimumThresholdInViewsCount,
    minimumThresholdInPixels,
    maximumThresholdInViewsCount,
    maximumThresholdInPixels,
    ultimateMaximumThresholdInViewsCount,
    ultimateMaximumThresholdInPixels,
    averageItemHeight,
    highlightedItemId,
    highlightedItemScrollIntoViewOption = 'center',
    itemsAreLoading = false,
    items,
    initialItemsCount = 10,
  }: {
    initiallyScrollIsAtBottom?: boolean
    minimumThresholdInViewsCount?: number
    minimumThresholdInPixels?: number
    maximumThresholdInViewsCount?: number
    maximumThresholdInPixels?: number
    ultimateMaximumThresholdInViewsCount?: number
    ultimateMaximumThresholdInPixels?: number
    averageItemHeight: number
    highlightedItemId?: string
    highlightedItemScrollIntoViewOption?: ScrollLogicalPosition
    itemsAreLoading?: boolean
    items: readonly T[]
    initialItemsCount?: number
  },
  dependencies?: DependencyList
): {
  setScrollElementStatic(scrollElement: HTMLElement | null): void
  getScrollElementStatic(): HTMLElement | null
  setItemElementFactoryStatic(id: string): (itemElement: HTMLElement | null) => void
  getItemElementStatic(id: string): HTMLElement | null
  itemsFrom: number | undefined
  itemsTo: number | undefined
  clippedItems: readonly T[]
  getIsScrollAtBottomStatic(): boolean
  jumpToTopStatic(): void
  jumpToButtomStatic(): void
} {
  const itemElementsRef = useRef<
    Partial<
      Record<
        string,
        {
          setElement(element: HTMLElement | null): void
          element: HTMLElement | undefined
        }
      >
    >
  >({})

  const scrollElementAccessor = useStateAccessor<HTMLElement | null>(null, dependencies)
  const isScrollAtBottomAccessor = useStateAccessor(initiallyScrollIsAtBottom, dependencies)
  const itemsBoundariesAccessor = useStateAccessor(() => {
    if (itemsAreLoading && items.length === 0) return undefined
    if (highlightedItemId) {
      const highlightedItemIndex = items.findIndex(card => card.id === highlightedItemId)
      if (highlightedItemIndex >= 0)
        return {
          from: Math.max(highlightedItemIndex - initialItemsCount, 0),
          to: Math.min(highlightedItemIndex + 1 + initialItemsCount, items.length),
        }
    }
    return isScrollAtBottomAccessor.value
      ? { from: Math.max(items.length - initialItemsCount, 0), to: items.length }
      : { from: 0, to: Math.min(initialItemsCount, items.length) }
  }, [...(dependencies ?? []), highlightedItemId, itemsAreLoading, items])

  const clippedItems = useMemo(
    () =>
      itemsBoundariesAccessor.value
        ? items.slice(itemsBoundariesAccessor.value.from, itemsBoundariesAccessor.value.to)
        : [],
    [items, itemsBoundariesAccessor.value]
  )

  const contentRef = useRefWrap({
    highlightedItemId,
    items,
    clippedItems,
  })

  const keepScrollAtHighlightedItemRef = useRef(false)

  useSyncEffect(() => {
    if (highlightedItemId) {
      keepScrollAtHighlightedItemRef.current = true

      let timeout: any = setTimeout(
        () => {
          keepScrollAtHighlightedItemRef.current = false
          timeout = undefined
        },
        2000 // For this amount of time, scrolling to the highlighted item has more priority over scrolling to bottom
      )

      return () => {
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    }
  }, [highlightedItemId])

  const resizeObserverStatic = useMemo(
    () =>
      new ResizeObserver(entries => {
        if (!itemsBoundariesAccessor.value) return

        if (contentRef.current.highlightedItemId && keepScrollAtHighlightedItemRef.current) {
          itemElementsRef.current[contentRef.current.highlightedItemId]?.element?.scrollIntoView({
            block: highlightedItemScrollIntoViewOption,
          })
        } else if (isScrollAtBottomAccessor.value && scrollElementAccessor.value) {
          scrollElementAccessor.value.scrollTo(0, scrollElementAccessor.value.scrollHeight)
        }
      }),
    [
      /* highlightedItemScrollIntoViewOption */
    ]
  )

  useEffect(() => {
    const scrollElement = scrollElementAccessor.get()

    if (scrollElement) {
      resizeObserverStatic.observe(scrollElement)
      scrollElement.addEventListener('scroll', handleScroll)

      return () => {
        resizeObserverStatic.unobserve(scrollElement)
        scrollElement.removeEventListener('scroll', handleScroll)
      }
    }

    function handleScroll(event: Event): void {
      const scrollElement = event.target as HTMLElement

      isScrollAtBottomAccessor.set(
        Boolean(
          itemsBoundariesAccessor.value &&
            (scrollElement.scrollTop > 0 || itemsBoundariesAccessor.value.from > 0) &&
            itemsBoundariesAccessor.value.to === contentRef.current.items.length &&
            scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 10
        )
      )
    }
  }, [scrollElementAccessor.value])

  useEffectOnce(() => () => resizeObserverStatic.disconnect())

  useInfiniteVirtualScroll(
    {
      getScrollElement: scrollElementAccessor.get,
      disabled: !itemsBoundariesAccessor.value,
      minimumThresholdInViewsCount,
      minimumThresholdInPixels,
      maximumThresholdInViewsCount,
      maximumThresholdInPixels,
      ultimateMaximumThresholdInViewsCount,
      ultimateMaximumThresholdInPixels,
      hasMoreAtStart: !!itemsBoundariesAccessor.value && itemsBoundariesAccessor.value.from > 0,
      hasMoreAtEnd: !!itemsBoundariesAccessor.value && itemsBoundariesAccessor.value.to < items.length,
      hasAnythingToExclude:
        itemsBoundariesAccessor.value && itemsBoundariesAccessor.value.from < itemsBoundariesAccessor.value.to,
      onMoreRequiredAtStart(minimumRequiredPixels, maximumRequiredPixels) {
        if (!itemsBoundariesAccessor.value) return
        const extraCardsCount = 5 + Math.round(minimumRequiredPixels / averageItemHeight)
        itemsBoundariesAccessor.merge({
          from: Math.max(itemsBoundariesAccessor.value.from - extraCardsCount, 0),
        })
      },
      onMoreRequiredAtEnd(minimumRequiredPixels, maximumRequiredPixels) {
        if (!itemsBoundariesAccessor.value) return
        const extraCardsCount = 5 + Math.round(minimumRequiredPixels / averageItemHeight)
        itemsBoundariesAccessor.merge({
          to: Math.min(itemsBoundariesAccessor.value.to + extraCardsCount, items.length),
        })
      },
      onLessRequiredAtStart(minimumRequiredPixels, maximumRequiredPixels) {
        if (!itemsBoundariesAccessor.value) return
        let reducedCardsCount = 0
        let reducedSpace = 0
        while (reducedCardsCount < clippedItems.length) {
          const reducingSpace = itemElementsRef.current[clippedItems[reducedCardsCount].id]?.element?.offsetHeight ?? 0
          if (reducedSpace + reducingSpace > maximumRequiredPixels) break
          reducedCardsCount += 1
          reducedSpace += reducingSpace
          if (!reducingSpace) break // We better wait for the card to be rendered and get some height first
        }
        if (reducedCardsCount === 0) return
        itemsBoundariesAccessor.merge({
          from: Math.min(itemsBoundariesAccessor.value.from + reducedCardsCount, itemsBoundariesAccessor.value.to),
        })
      },
      onLessRequiredAtEnd(minimumRequiredPixels, maximumRequiredPixels) {
        if (!itemsBoundariesAccessor.value) return
        let reducedCardsCount = 0
        let reducedSpace = 0
        while (reducedCardsCount < clippedItems.length) {
          const reducingSpace =
            itemElementsRef.current[clippedItems[clippedItems.length - 1 - reducedCardsCount].id]?.element
              ?.offsetHeight ?? 0
          if (reducedSpace + reducingSpace > maximumRequiredPixels) break
          reducedCardsCount += 1
          reducedSpace += reducingSpace
          if (!reducingSpace) break // We better wait for the card to be rendered and get some height first
        }
        if (reducedCardsCount === 0) return
        itemsBoundariesAccessor.merge({
          to: Math.max(itemsBoundariesAccessor.value.to - reducedCardsCount, itemsBoundariesAccessor.value.from),
        })
      },
    },
    dependencies
  )

  const setItemElementFactoryStatic = useCallback<
    ReturnType<typeof useInfiniteVirtualScrollList>['setItemElementFactoryStatic']
  >(id => {
    return itemElementsRef.current[id]?.setElement ?? setElement

    function setElement(element: HTMLElement | null): void {
      if (itemElementsRef.current[id]?.element) {
        resizeObserverStatic.unobserve(itemElementsRef.current[id]!.element!)
      }
      if (element) {
        itemElementsRef.current[id] = {
          setElement,
          element,
        }
        resizeObserverStatic.observe(element)
      } else if (itemElementsRef.current[id]) {
        delete itemElementsRef.current[id]
      }
    }
  }, [])

  const getItemElementStatic = useCallback<ReturnType<typeof useInfiniteVirtualScrollList>['getItemElementStatic']>(
    id => itemElementsRef.current[id]?.element ?? null,
    []
  )

  const jumpToTopStatic = useCallback<ReturnType<typeof useInfiniteVirtualScrollList>['jumpToTopStatic']>(() => {
    isScrollAtBottomAccessor.set(false)
    if (itemsBoundariesAccessor.value?.from !== 0) {
      const count = Math.max(
        itemsBoundariesAccessor.value ? itemsBoundariesAccessor.value.to - itemsBoundariesAccessor.value.from : 1,
        initialItemsCount
      )
      itemsBoundariesAccessor.set({
        from: 0,
        to: Math.min(count, contentRef.current.items.length),
      })
    }
    scrollElementAccessor.value?.scrollTo(0, 0)
  }, [])

  const jumpToButtomStatic = useCallback<ReturnType<typeof useInfiniteVirtualScrollList>['jumpToButtomStatic']>(() => {
    isScrollAtBottomAccessor.set(true)
    if (itemsBoundariesAccessor.value?.to !== contentRef.current.items.length) {
      const count = Math.max(
        itemsBoundariesAccessor.value ? itemsBoundariesAccessor.value.to - itemsBoundariesAccessor.value.from : 1,
        initialItemsCount
      )
      itemsBoundariesAccessor.set({
        from: Math.max(contentRef.current.items.length - count, 0),
        to: contentRef.current.items.length,
      })
    }
    scrollElementAccessor.value?.scrollTo(0, scrollElementAccessor.value.scrollHeight)
  }, [])

  return {
    setScrollElementStatic: scrollElementAccessor.set,
    getScrollElementStatic: scrollElementAccessor.get,
    setItemElementFactoryStatic,
    getItemElementStatic,
    itemsFrom: itemsBoundariesAccessor.value?.from,
    itemsTo: itemsBoundariesAccessor.value?.to,
    clippedItems,
    getIsScrollAtBottomStatic: isScrollAtBottomAccessor.get,
    jumpToTopStatic,
    jumpToButtomStatic,
  }
}
