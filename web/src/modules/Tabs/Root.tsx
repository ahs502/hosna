import { ChevronRightIcon, MinusIcon } from '@radix-ui/react-icons'
import { Children, Fragment, HTMLAttributes, ReactNode, forwardRef, useMemo } from 'react'
import { cn } from '../../ui/utils'
import { Variant } from './Variant'

export const Root = forwardRef<HTMLDivElement, Partial<Variant> & HTMLAttributes<HTMLDivElement>>(function Root(
  { highlight = Variant.defaultValue.highlight, gap = Variant.defaultValue.gap, className, children, ...otherProps },
  ref
) {
  const variant = useMemo<Variant>(() => ({ highlight, gap }), [highlight, gap])

  const count = Children.count(children)
  const gappedChildren: ReactNode[] = []
  Children.forEach(children, (child, index) => {
    gappedChildren.push(child)
    if (index < count - 1) {
      gappedChildren.push(
        <Fragment key={index}>
          {((): NonNullable<ReactNode> => {
            switch (variant.gap) {
              case 'none':
                return <></>

              case 'chevron':
                return <ChevronRightIcon className="size-6 text-muted-foreground" />

              case 'dash':
                return <MinusIcon className="size-6 text-muted-foreground" />
            }
          })()}
        </Fragment>
      )
    }
  })

  return (
    <Variant.Context.Provider value={variant}>
      <div
        ref={ref}
        {...otherProps}
        className={cn(
          'flex items-center gap-2 overflow-x-auto overflow-y-hidden [&>*]:flex-none',
          variant.highlight === 'emphasized and underlined' && 'border-b',
          className
        )}
      >
        {gappedChildren}
      </div>
    </Variant.Context.Provider>
  )
})
