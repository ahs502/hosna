import { useLayoutEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'

// TODO: Remove it if it's not being used:

type MatchedParams<R extends readonly string[], O extends readonly string[]> = Readonly<{ [K in R[number]]: string }> &
  Readonly<{ [K in O[number]]?: string }>

export function createStarParamsHandler<R extends readonly string[], O extends readonly string[]>({
  requiredParams,
  optionalParams,
}: {
  readonly requiredParams: R
  readonly optionalParams: O
}): {
  useParams: (options?: { readonly onInvalid?: () => void }) => MatchedParams<R, O>
  getPath: (params: MatchedParams<R, O>) => string
} {
  return {
    getPath(params: MatchedParams<R, O>): string {
      return [
        '.',
        ...requiredParams.map(param => (params as any)[param]),
        ...optionalParams.map(param => (params as any)[param]),
      ]
        .filter(Boolean)
        .join('/')
    },

    useParams(options) {
      const { '*': matchedPath } = useParams()

      const [result, valid] = useMemo(() => {
        const matchedPathParts = matchedPath?.split('/').filter(Boolean) ?? []
        const result: Record<string, string> = {}

        for (let i = 0; i < requiredParams.length; i++) {
          const part = matchedPathParts.shift()
          if (!part) return [result, false]
          result[requiredParams[i]] = part
        }

        for (let i = 0; i < optionalParams.length; i++) {
          const part = matchedPathParts.shift()
          if (!part) break
          result[optionalParams[i]] = part
        }

        return [result, true]
      }, [matchedPath])

      useLayoutEffect(() => {
        if (!valid) {
          options?.onInvalid?.()
        }
      }, [valid])

      return result as any
    },
  }
}
