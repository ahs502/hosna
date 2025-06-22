import { CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Loader2Icon } from 'lucide-react'
import { ReactElement, ReactNode, useLayoutEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip'
import { cn } from '../../ui/utils'
import { CompactErrorMessage } from './CompactErrorMessage'
import { Form } from './Form'

export function AutoSubmitStatus({
  form,
  submittingLabel = 'Saving',
  submittedLabel = 'Saved!',
  className,
}: {
  form: Form<any, any>
  submittingLabel?: ReactNode
  submittedLabel?: ReactNode
  className?: string
}): ReactElement {
  const [draft, setDraft] = useState(false)

  useLayoutEffect(() => void setDraft(true), [form.values])

  useLayoutEffect(() => void setDraft(false), [form.submitActionState?.status])

  if (draft)
    return (
      <div className={cn('text-muted-foreground inline-flex items-center gap-2 text-sm', className)}>
        <ClockIcon className="size-4" />
        Drafted
      </div>
    )

  switch (form.submitActionState?.status) {
    case undefined:
      if (form.invalid)
        return (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <ExclamationTriangleIcon className={cn('text-destructive size-4', className)} />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-destructive">
              Invalid data
            </TooltipContent>
          </Tooltip>
        )
      return <div className="text-sm">&nbsp;</div>

    case 'doing':
      return (
        <div className={cn('text-muted-foreground inline-flex items-center gap-2 text-sm', className)}>
          <Loader2Icon className="size-4 animate-spin" />
          {submittingLabel}
        </div>
      )

    case 'done':
      return (
        <div className={cn('text-muted-foreground inline-flex items-center gap-2 text-sm', className)}>
          <CheckIcon className="text-success size-4" />
          {submittedLabel}
        </div>
      )

    case 'failed':
      return <CompactErrorMessage className={className} form={form} />
  }
}
