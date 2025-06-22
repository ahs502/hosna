import { Loader2Icon } from 'lucide-react'
import { ComponentProps, ComponentRef, ReactNode, forwardRef } from 'react'
import { OmitTyped } from 'shared'
import { Button } from '../../ui/button'
import { cn } from '../../ui/utils'
import { Form } from './Form'

export const SubmitButton = forwardRef<
  ComponentRef<typeof Button>,
  {
    form: Form<any, any>
    submittingLabel?: ReactNode
  } & OmitTyped<ComponentProps<typeof Button>, 'form'>
>(function SubmitButton(
  { form, children, submittingLabel = children, disabled, onClick, type, className, ...otherProps },
  ref
) {
  return (
    <Button
      ref={ref}
      {...otherProps}
      type={type ?? 'button'}
      className={cn('min-w-[6rem]', className)}
      disabled={form.submitDisabled || disabled}
      onClick={event => {
        form.handleSubmit(event)
        onClick?.(event)
      }}
    >
      {form.submittingOrSubmitted ? (
        <>
          <Loader2Icon className={cn('size-4 animate-spin', submittingLabel && 'mr-2')} />
          {submittingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  )
})
