import { ReactElement } from 'react'
import { ErrorMessageTooltip } from '../../components/ErrorMessageTooltip'
import { Form } from './Form'

export function CompactErrorMessage({ form, className }: { form: Form<any, any>; className?: string }): ReactElement {
  return (
    <ErrorMessageTooltip className={className}>
      {form.submitActionState?.status === 'failed' && form.submitActionState.error}
    </ErrorMessageTooltip>
  )
}
