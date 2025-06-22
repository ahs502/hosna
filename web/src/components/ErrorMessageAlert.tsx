import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { ComponentProps, ComponentRef, forwardRef } from 'react'
import { OmitTyped } from 'shared'
import { Alert, AlertDescription } from '../ui/alert'
import { cn } from '../ui/utils'

export const ErrorMessageAlert = forwardRef<
  ComponentRef<typeof Alert>,
  OmitTyped<ComponentProps<typeof Alert>, 'variant'>
>(function ErrorMessageAlert({ className, children, ...otherProps }, ref) {
  return (
    <Alert ref={ref} {...otherProps} variant="destructive" className={cn('bg-card', className)}>
      <ExclamationTriangleIcon className="size-4" />
      <AlertDescription className="whitespace-pre-line">{children}</AlertDescription>
    </Alert>
  )
})
