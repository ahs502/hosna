import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn, tw } from './utils'

const buttonVariants = cva(
  tw`[&_svg]:size-4 ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        default: tw`bg-primary text-primary-foreground hover:bg-primary/90`,
        destructive: tw`bg-destructive text-destructive-foreground hover:bg-destructive/90`,
        warning: tw`bg-warning text-warning-foreground hover:bg-warning/90`,
        success: tw`bg-success text-success-foreground hover:bg-success/90`,
        outline: tw`border-input bg-background hover:bg-accent hover:text-accent-foreground border`,
        secondary: tw`bg-secondary text-secondary-foreground hover:bg-secondary/80`,
        ghost: tw`hover:bg-accent hover:text-accent-foreground`,
        link: tw`text-primary underline-offset-4 hover:underline`,
      },
      size: {
        default: tw`h-10 px-4 py-2`,
        sm: tw`h-9 rounded-md px-3`,
        lg: tw`h-11 rounded-md px-8`,
        icon: tw`h-10 w-10`,
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
