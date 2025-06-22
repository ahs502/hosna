// See: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types

export namespace NativeDragObject {
  export enum Type {
    File = 'FILE',
    Html = 'HTML',
    Text = 'TEXT',
    Url = 'URL',
    Unknown = 'UNKNOWN',
  }

  export interface File {
    readonly type: Type.File
    readonly files: readonly File[]
    readonly items: DataTransferItemList
  }

  export interface Html {
    readonly type: Type.Html
    readonly html: string
    readonly text?: string
  }

  export interface Text {
    readonly type: Type.Text
    readonly text: string
  }

  export interface Url {
    readonly type: Type.Url
    readonly urls: readonly string[]
  }

  export interface Unknown {
    readonly type: Type.Unknown
  }

  export function extractFromDragEvent(
    event: DragEvent
  ):
    | NativeDragObject.File
    | NativeDragObject.Html
    | NativeDragObject.Text
    | NativeDragObject.Url
    | NativeDragObject.Unknown {
    const hasUrlsData = event.dataTransfer?.types.includes('text/uri-list')
    if (hasUrlsData)
      return {
        type: Type.Url,
        urls:
          event.dataTransfer
            ?.getData('text/uri-list')
            .split('\n')
            .filter(url => url && !url.trim().startsWith('#')) ?? [],
      }

    if (event.dataTransfer?.types.includes('Files'))
      return {
        type: Type.File,
        files: Array.prototype.slice.call(event.dataTransfer.files),
        items: event.dataTransfer.items,
      }

    const hasHtmlData = event.dataTransfer?.types.includes('text/html')
    if (hasHtmlData)
      return {
        type: Type.Html,
        html: event.dataTransfer?.getData('text/html') ?? '',
        text: event.dataTransfer?.types.includes('text/plain') ? event.dataTransfer.getData('text/plain') : undefined,
      }

    const hasTextData = event.dataTransfer?.types.includes('text/plain')
    if (hasTextData)
      return {
        type: Type.Text,
        text: event.dataTransfer?.getData('text/plain') ?? '',
      }

    return {
      type: Type.Unknown,
    }
  }
}
