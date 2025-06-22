import { useMatch, useResolvedPath } from 'react-router-dom'

export function useRouteRelativePath(): (string | undefined)[] {
  return (
    useMatch(`${useResolvedPath('.').pathname}/*`)
      ?.params['*']?.split('/')
      .filter(Boolean) ?? []
  )
}
