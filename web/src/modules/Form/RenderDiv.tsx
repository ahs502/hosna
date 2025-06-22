import { HTMLAttributes, forwardRef } from 'react'
import { OmitTyped } from 'shared'
import { cn } from '../../ui/utils'
import { Form } from './Form'

export const RenderDiv = forwardRef<
  HTMLDivElement,
  {
    form: Form<any, any>
  } & OmitTyped<HTMLAttributes<HTMLDivElement>, 'children'>
>(function RenderDiv({ form, className, ...otherProps }, ref) {
  return (
    <div ref={ref} {...otherProps} className={cn('space-y-8', className)}>
      {form.renderFields()}
    </div>
  )
})
