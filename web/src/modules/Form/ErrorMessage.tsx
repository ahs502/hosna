import { ComponentProps, ReactElement } from 'react'
import { ErrorMessageAlert } from '../../components/ErrorMessageAlert'
import { isReactNodeNotEmpty } from '../../helpers/isReactNodeNotEmpty'
import { Form } from './Form'

export function ErrorMessage({
  form,
  ...otherProps
}: {
  form: Form<any, any>
} & ComponentProps<typeof ErrorMessageAlert>): ReactElement | null {
  const message = form.submitActionState?.status === 'failed' && form.submitActionState.error

  if (!isReactNodeNotEmpty(message)) return null

  return <ErrorMessageAlert {...otherProps}>{message}</ErrorMessageAlert>
}
