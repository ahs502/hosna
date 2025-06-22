import { DependencyList, useMemo, useRef, useState } from 'react'
import { Falsy, getErrorMessage } from 'shared'
import { useAsyncEffect } from '../hooks/useAsyncEffect'
import { useRefWrap } from '../hooks/useRefWrap'

export interface Validation {
  readonly validating: boolean
  readonly errorMessage?: string
}

export namespace Validation {
  export function useValidate(
    validator: (provided: { isDiscarded(): boolean }) => string | Falsy | Promise<string | Falsy>,
    dependencies: DependencyList,
    immediate = false
  ): Validation {
    const [validationActionState, setValidationActionState] = useState<
      Readonly<
        ({ status: 'validating' | 'is valid' } | { status: 'is not valid'; error: string }) & {
          memoizedDependencies: DependencyList
        }
      >
    >()

    const immediateDependencyRef = useRef<{ immediate: boolean }>({ immediate })
    if (!immediateDependencyRef.current.immediate && immediate && validationActionState?.status === 'validating') {
      immediateDependencyRef.current = { immediate }
    } else {
      immediateDependencyRef.current.immediate = immediate
    }

    const memoizedDependencies = useMemo(() => dependencies, [...dependencies, immediateDependencyRef.current])

    const memoizedDependenciesRef = useRefWrap(memoizedDependencies)

    useAsyncEffect(async () => {
      setValidationActionState({ status: 'validating', memoizedDependencies })
      let validateOutput: string | Falsy = undefined
      try {
        validateOutput = await validator({
          isDiscarded() {
            return memoizedDependenciesRef.current !== memoizedDependencies
          },
        })
      } catch (error) {
        validateOutput = getErrorMessage(error) || 'Unable to validate'
      }
      if (memoizedDependenciesRef.current !== memoizedDependencies) return
      setValidationActionState(current =>
        current?.status === 'validating' && current.memoizedDependencies === memoizedDependencies
          ? validateOutput
            ? { status: 'is not valid', memoizedDependencies, error: String(validateOutput) }
            : { status: 'is valid', memoizedDependencies }
          : current
      )
    }, [memoizedDependencies])

    return useMemo(
      () => ({
        validating:
          validationActionState?.status === 'validating' ||
          (!!validationActionState && validationActionState.memoizedDependencies !== memoizedDependencies),
        ...(validationActionState?.status === 'is not valid' &&
          validationActionState.memoizedDependencies === memoizedDependencies && {
            errorMessage: validationActionState.error,
          }),
      }),
      [validationActionState]
    )
  }
}
