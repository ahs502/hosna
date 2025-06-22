import { FormHTMLAttributes, forwardRef } from 'react'
import { OmitTyped } from 'shared'
import { cn } from '../../ui/utils'
import { Form } from './Form'

export const Render = forwardRef<
  HTMLFormElement,
  {
    form: Form<any, any>
  } & OmitTyped<FormHTMLAttributes<HTMLFormElement>, 'children' | 'onSubmit' | 'onSubmitCapture'>
>(function Render({ form, autoComplete, className, ...otherProps }, ref) {
  return (
    <form
      ref={ref}
      {...otherProps}
      className={cn('space-y-8', className)}
      autoComplete={autoComplete ?? 'off'}
      noValidate
      onSubmit={form.handleSubmit}
    >
      {form.renderFields()}

      <input type="submit" hidden />
    </form>
  )
})
