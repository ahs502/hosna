import { ComponentRef, PropsWithChildren, ReactElement, Ref, forwardRef, useContext } from 'react'
import { Toggle } from '../../ui/toggle'
import { cn } from '../../ui/utils'
import { Variant } from './Variant'

export const Item = forwardRef<
  HTMLDivElement | HTMLHeadingElement | ComponentRef<typeof Toggle>,
  PropsWithChildren<{
    disabled?: boolean
    selected?: boolean
    onSelect?: () => void
  }>
>(function Item({ disabled, selected, onSelect, children }, ref): ReactElement {
  const variant = useContext(Variant.Context)

  switch (variant.highlight) {
    case 'emphasized and underlined':
      return (
        <div
          ref={ref as Ref<HTMLDivElement>}
          className={cn(
            'h-10 content-center border-b-2',
            !disabled && 'cursor-pointer',
            selected ? 'border-b-primary' : 'border-b-transparent'
          )}
          onClick={() => void (disabled || selected || onSelect?.())}
        >
          <h4
            className={cn(
              'flex items-center justify-center px-3 text-sm font-medium transition-colors',
              selected ? 'text-accent-foreground' : disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
            )}
          >
            {children}
          </h4>
        </div>
      )

    case 'emphasized':
      return (
        <h4
          ref={ref as Ref<HTMLHeadingElement>}
          className={cn(
            'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
            !disabled && 'cursor-pointer',
            selected ? 'text-accent-foreground' : disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'
          )}
          onClick={() => void (disabled || selected || onSelect?.())}
        >
          {children}
        </h4>
      )

    case 'toggled button':
      return (
        <Toggle
          ref={ref as Ref<ComponentRef<typeof Toggle>>}
          className="text-sm"
          disabled={disabled}
          pressed={selected}
          onPressedChange={pressed => void (pressed && (selected || onSelect?.()))}
        >
          {children}
        </Toggle>
      )
  }
})
