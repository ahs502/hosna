import { useCallback, useMemo } from 'react'
import { NavigateOptions, useSearchParams } from 'react-router-dom'

export function createSearchParamsHandler<
  RawSearchParams extends Record<string, any> = Record<string, any>,
  ProcessedSearchParams = RawSearchParams,
>(
  mapper?: (rawSearchParams: RawSearchParams) => ProcessedSearchParams
): {
  useParams: () => {
    processedSearchParams: ProcessedSearchParams
    setRawSearchParams: (
      newRawSearchParams: RawSearchParams | ((currentProcessedSearchParams: ProcessedSearchParams) => RawSearchParams),
      navigateOptions?: NavigateOptions
    ) => void
  }
} {
  function map(searchParams: URLSearchParams): ProcessedSearchParams {
    const rawSearchParams = Object.fromEntries(searchParams.entries()) as RawSearchParams
    return mapper ? mapper(rawSearchParams) : (rawSearchParams as any)
  }

  return {
    useParams() {
      const [searchParams, setSearchParams] = useSearchParams()

      return {
        processedSearchParams: useMemo(() => map(searchParams), [searchParams]),

        setRawSearchParams: useCallback(
          (newRawSearchParams, navigateOptions?) => {
            setSearchParams(
              currentSearchParams =>
                typeof newRawSearchParams === 'function'
                  ? newRawSearchParams(map(currentSearchParams))
                  : newRawSearchParams,
              navigateOptions
            )
          },
          [setSearchParams]
        ),
      }
    },
  }
}
