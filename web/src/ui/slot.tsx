import * as SlotPrimitive from '@radix-ui/react-slot'
import * as React from 'react'

const Slot = SlotPrimitive.Root as {
  <P extends React.PropsWithChildren<{}> = SlotPrimitive.SlotProps, R = HTMLElement>(
    props: P & React.RefAttributes<R>
  ): React.ReactNode
}

const Slottable = SlotPrimitive.Slottable

export { Slot, Slottable }
