import { BaseSyntheticEvent, ReactNode, useLayoutEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import { Writable, delay, getErrorMessage, isOneOf } from 'shared'
import { useAsyncEffect } from '../../hooks/useAsyncEffect'
import { Validation } from '../Validation'
import { Form } from './Form'

export function useCreate<F extends Form<any, any> = Form>({
  memoizedInitialValues,
  validate,
  onReset,
  onBeforeSubmit,
  onSubmit,
  renderFields,
  initiallySubmittable,
  autoSubmitDelay,
  submitEvenIfInvalid,
  disabled,
}: {
  readonly memoizedInitialValues: Form.ValuesOf<F>
  readonly validate: (values: Form.ValuesOf<F>, immediate: boolean) => Form.Validations<Form.ValuesOf<F>>
  readonly onReset?: () => void
  readonly onBeforeSubmit?: (form: Form<Form.ValuesOf<F>, unknown>) => void | Promise<void>
  readonly onSubmit: (form: Form<Form.ValuesOf<F>, unknown>) => Promise<Form.ResultOf<F>>
  readonly renderFields: (form: Form<Form.ValuesOf<F>, Form.ResultOf<F>>) => ReactNode
  readonly initiallySubmittable?: boolean
  readonly autoSubmitDelay?: number
  /** Make sure to handle invalid states in your `onSubmit()` callback. */ readonly submitEvenIfInvalid?: boolean
  readonly disabled?: boolean
}): Form<Form.ValuesOf<F>, Form.ResultOf<F>> {
  const autoSubmit = autoSubmitDelay !== undefined

  const [synchronizedDisabled, setSynchronizedDisabled] = useState(false)
  const [values, setValues] = useState(memoizedInitialValues)
  const [showErrors, setShowErrors] = useState(initiallySubmittable || autoSubmit)
  const [submitActionState, setSubmitActionState] = useState<Form.SubmitActionState<Form.ResultOf<F>>>()

  const evaluatedDisabled = disabled || synchronizedDisabled

  const immediate = submitActionState?.status === 'doing'
  const validations = validate(values, immediate)

  const validationEntries = Object.entries(validations).filter(([, validation]) => validation) as any as readonly [
    keyof Form.ValuesOf<F>,
    Validation,
  ][]

  const errorMessages: Form.ErrorMessages<Form.ValuesOf<F>> = validationEntries.reduce(
    (errorMessages, [key, validation]) => {
      const errorMessage = validation.errorMessage
      if (errorMessage) {
        errorMessages[key as keyof Form.ValuesOf<F>] = errorMessage
      }
      return errorMessages
    },
    {} as Writable<Form.ErrorMessages<Form.ValuesOf<F>>>
  )
  const displayedErrorMessages = showErrors ? errorMessages : ({} as Form.ErrorMessages<Form.ValuesOf<F>>)

  const clean = useMemo(
    () =>
      !initiallySubmittable &&
      (values === memoizedInitialValues ||
        (Object.keys(values) as (keyof Form.ValuesOf<F>)[]).every(key => values[key] === memoizedInitialValues[key])),
    [memoizedInitialValues, initiallySubmittable, values]
  )

  const validating = validationEntries.some(([, validation]) => validation.validating)

  const invalid = validationEntries.some(([, validation]) => validation.errorMessage)

  const submittingOrSubmitted = isOneOf(submitActionState?.status, 'doing', 'done') && !autoSubmit

  const fieldsDisabled = submittingOrSubmitted || evaluatedDisabled

  const submitDisabled = (!autoSubmit && clean) || fieldsDisabled || (showErrors && invalid && !submitEvenIfInvalid)

  function reset(): void {
    setValues(memoizedInitialValues)
    setShowErrors(initiallySubmittable || autoSubmit)
    setSubmitActionState(undefined)
    onReset?.()
  }

  function handleSubmit(event?: BaseSyntheticEvent): void {
    event?.preventDefault()
    setShowErrors(true)
    // To make sure all fields validations are started:
    setTimeout(() => {
      setSubmitActionState(current =>
        !isOneOf(current?.status, 'doing', 'done') || autoSubmit ? { status: 'doing', progress: 'pending' } : current
      )
    })
  }

  const form: Form<Form.ValuesOf<F>, Form.ResultOf<F>> = {
    useSynchronizedDisabled: disabled => void useLayoutEffect(() => void setSynchronizedDisabled(disabled), [disabled]),
    memoizedInitialValues,
    values,
    setValues,
    showErrors,
    submitActionState,
    errorMessages,
    displayedErrorMessages,
    clean,
    validating,
    invalid,
    submittingOrSubmitted,
    fieldsDisabled,
    submitDisabled,
    reset,
    handleSubmit,
    renderFields: () => renderFields(form),
  }

  if (!autoSubmit) {
    useLayoutEffect(reset, [memoizedInitialValues])
  }

  useAsyncEffect(async () => {
    if (submitActionState?.status !== 'doing') return
    if (validating) return
    if (clean || (invalid && !submitEvenIfInvalid) || evaluatedDisabled) return setSubmitActionState(undefined)
    switch (submitActionState.progress) {
      case 'pending':
        setSubmitActionState({ status: 'doing', progress: 'preparing' })
        break

      case 'preparing':
        try {
          await onBeforeSubmit?.(form)
          await delay(0) // To ensure all the probable changes from the above call apply to the form validation state.
          setSubmitActionState({ status: 'doing', progress: 'prepared' })
        } catch (error) {
          setSubmitActionState({ status: 'failed', error: getErrorMessage(error) })
        }
        break

      case 'prepared':
        setSubmitActionState({ status: 'doing', progress: 'applying' })
        break

      case 'applying':
        try {
          const result = await onSubmit(form)
          setSubmitActionState({ status: 'done', result })
        } catch (error) {
          console.error('Applying form', error)
          setSubmitActionState({ status: 'failed', error: getErrorMessage(error) })
        }
        break
    }
  }, [submitActionState, clean, validating, invalid, evaluatedDisabled])

  if (autoSubmit) {
    useDebounce(() => void (evaluatedDisabled || handleSubmit()), autoSubmitDelay, [evaluatedDisabled, values])
  }

  return form
}
