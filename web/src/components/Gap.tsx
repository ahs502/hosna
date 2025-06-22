import { HTMLAttributes } from 'react'

export function Gap({
  height,
  width,
  grow,
  shrink,
  style,
  ...otherProps
}: HTMLAttributes<HTMLDivElement> & {
  height?: string | number
  width?: string | number
  grow?: boolean | number
  shrink?: boolean | number
}) {
  return (
    <div
      {...otherProps}
      style={{
        ...style,
        display: 'inline-block',
        ...(width !== undefined ? { width } : height !== undefined ? { width: '100%' } : {}),
        ...(height !== undefined ? { height } : width !== undefined ? { height: '100%' } : {}),
        ...(grow !== undefined ? { flexGrow: typeof grow === 'number' ? grow : grow ? 1 : 0 } : {}),
        ...(shrink !== undefined ? { flexShrink: typeof shrink === 'number' ? shrink : shrink ? 1 : 0 } : {}),
      }}
    />
  )
}
