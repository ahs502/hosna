import { useRef } from 'react'
import { ImmutableRefObject } from '../types/ImmutableRefObject'

export function useRefWrap<T>(value: T): ImmutableRefObject<T> {
  const valueRef = useRef(value)

  valueRef.current = value

  return valueRef
}
