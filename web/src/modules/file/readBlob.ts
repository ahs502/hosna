export async function readBlob<M extends 'array buffer' | 'binary string' | 'data url' | 'text'>(
  blob: Blob,
  mode: M
): Promise<M extends 'array buffer' ? ArrayBuffer : string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', () => resolve(fileReader.result as any))
    fileReader.addEventListener('error', () => reject(fileReader.error))

    switch (mode) {
      case 'array buffer':
        fileReader.readAsArrayBuffer(blob)
        break

      case 'binary string':
        fileReader.readAsBinaryString(blob)
        break

      case 'data url':
        fileReader.readAsDataURL(blob)
        break

      case 'text':
        fileReader.readAsText(blob)
        break

      default:
        reject(new Error(`Invalid mode: ${mode}`))
        break
    }
  })
}
