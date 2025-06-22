import { BaseSyntheticEvent, Dispatch, ReactNode, SetStateAction } from 'react'
import { ErrorMessages, SubmitActionState } from './types'

export interface Form<Values extends {} = any, Result = void> {
  /** Additional way to set the form disabled manually. Useful in nesting forms (using a form as a field of another form). */
  readonly useSynchronizedDisabled: (disabled: boolean) => void
  /** Updates lead to a form reset. */
  readonly memoizedInitialValues: Values
  readonly values: Values
  readonly setValues: Dispatch<SetStateAction<Values>>
  readonly showErrors: boolean
  readonly submitActionState: SubmitActionState<Result>
  readonly errorMessages: ErrorMessages<Values>
  readonly displayedErrorMessages: ErrorMessages<Values>
  readonly clean: boolean
  readonly validating: boolean
  readonly invalid: boolean
  /** Useful in rendering submit button labels. */
  readonly submittingOrSubmitted: boolean
  /** The form is readonly and there is no input enabled on it. More restrict than `submittingOrSubmitted`. */
  readonly fieldsDisabled: boolean
  /** The form is not submittable; the submit button is disabled. More restrict than `fieldsDisabled`. */
  readonly submitDisabled: boolean
  readonly reset: () => void
  readonly handleSubmit: (event?: BaseSyntheticEvent) => void
  readonly renderFields: () => ReactNode
}

export * as Form from './namespace'
