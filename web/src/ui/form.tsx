import { Slot } from '@radix-ui/react-slot'
import * as React from 'react'

import { Label } from './label'
import { cn } from './utils'

const FormItemContext = React.createContext<{
  readonly id: string
  readonly descriptionId: string
  readonly errorMessageId: string
  readonly errorMessage?: any
}>({} as any)

const FormItem = React.forwardRef<
  HTMLDivElement,
  {
    description?: string
    errorMessage?: any
  } & React.HTMLAttributes<HTMLDivElement>
>(({ errorMessage, className, ...props }, ref) => {
  const id = React.useId()
  const descriptionId = React.useId()
  const errorMessageId = React.useId()

  return (
    <FormItemContext.Provider
      value={React.useMemo(
        () => ({
          id,
          descriptionId,
          errorMessageId,
          errorMessage,
        }),
        [errorMessage]
      )}
    >
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<React.ComponentRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    const { id, errorMessage } = React.useContext(FormItemContext)

    return <Label ref={ref} className={cn(errorMessage && 'text-destructive', className)} htmlFor={id} {...props} />
  }
)
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { id, descriptionId, errorMessageId, errorMessage } = React.useContext(FormItemContext)

    return (
      <Slot
        ref={ref}
        id={id}
        area-aria-describedby={!errorMessage ? `${descriptionId}` : `${descriptionId} ${errorMessageId}`}
        aria-invalid={!!errorMessage}
        {...props}
      />
    )
  }
)
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId } = React.useContext(FormItemContext)

    return <p ref={ref} id={descriptionId} className={cn('text-muted-foreground text-sm', className)} {...props} />
  }
)
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { errorMessageId, errorMessage } = React.useContext(FormItemContext)

    if (!errorMessage) return null

    return (
      <p
        ref={ref}
        id={errorMessageId}
        className={cn('text-destructive whitespace-pre text-sm font-medium', className)}
        {...props}
      >
        {errorMessage}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'

export { FormControl, FormDescription, FormItem, FormLabel, FormMessage }
