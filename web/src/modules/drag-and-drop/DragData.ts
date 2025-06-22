import { Drag } from './Drag'
import { DRAG_DATA_TIMEOUT } from './constants'

export class DragData {
  private getter?: () => DragData.Value | undefined
  private timeout?: any

  private constructor() {}

  get(): DragData.Value | undefined {
    return this.getter?.()
  }

  set(dragOptionsGetter: (() => Drag.Options<any, any>) | undefined): void {
    if (this.timeout !== undefined) {
      clearTimeout(this.timeout)
    }
    this.getter =
      dragOptionsGetter &&
      (() => {
        const dragOptions = dragOptionsGetter()
        return dragOptions.dragObject
          ? {
              dragObject:
                typeof dragOptions.dragObject === 'function' ? dragOptions.dragObject() : dragOptions.dragObject,
              drop: dragOptions.drop,
            }
          : undefined
      })
    this.timeout = this.getter
      ? setTimeout(() => {
          delete this.getter
          delete this.timeout
        }, DRAG_DATA_TIMEOUT)
      : undefined
  }

  static instance = new DragData()
}

export namespace DragData {
  export interface Value {
    readonly dragObject?: any
    readonly drop?: (dragObject: any, dropResult: any) => void
  }
}
