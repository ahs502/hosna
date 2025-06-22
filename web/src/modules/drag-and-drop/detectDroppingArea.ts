export interface DroppingArea {
  readonly vertical: 'top' | 'bottom'
  readonly horizontal: 'left' | 'right'
}

export function detectDroppingArea(event: DragEvent): DroppingArea | undefined {
  const dropTargetBoundingClientRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const verticalMiddle = dropTargetBoundingClientRect.top + dropTargetBoundingClientRect.height / 2
  const horizontalMiddle = dropTargetBoundingClientRect.left + dropTargetBoundingClientRect.width / 2

  return {
    vertical: event.clientY < verticalMiddle ? 'top' : 'bottom',
    horizontal: event.clientX < horizontalMiddle ? 'left' : 'right',
  }
}
