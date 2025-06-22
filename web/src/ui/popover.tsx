import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { useCombineRefs } from '../hooks/useCombineRefs'
import { cn } from './utils'

const PortalContainerContext = React.createContext<HTMLElement | null>(null)
const SetPortalContainerContext = React.createContext<React.Dispatch<HTMLElement | null>>(() => {})

const Popover: typeof PopoverPrimitive.Root = props => {
  const [portalContainer, setPortalContainer] = React.useState<HTMLElement | null>(null)
  return (
    <PortalContainerContext.Provider value={portalContainer}>
      <SetPortalContainerContext.Provider value={setPortalContainer}>
        <PopoverPrimitive.Root {...props} />
      </SetPortalContainerContext.Provider>
    </PortalContainerContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>((props, ref) => {
  const setPortalContainer = React.useContext(SetPortalContainerContext)
  const combineRefs = useCombineRefs(ref, setPortalContainer)
  return <PopoverPrimitive.Trigger ref={combineRefs()} {...props} />
})

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { container?: HTMLElement | null }
>(({ container = window.document.body, className, align = 'center', sideOffset = 4, ...props }, ref) => {
  const portalContainer = React.useContext(PortalContainerContext)
  return (
    <PopoverPrimitive.Portal container={container || portalContainer || null}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 rounded-md border p-4 shadow-md outline-none',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverContent, PopoverTrigger }
