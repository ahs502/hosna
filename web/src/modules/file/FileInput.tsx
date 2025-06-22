import { ReactElement, forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'

export const FileInput = forwardRef<FileInput.Referee, {}>(function FileInput({}, ref): ReactElement {
  const [state, setState] = useState<{
    readonly options?: FileInput.Options
    readonly resolve: (files: FileList | null) => void
  }>()

  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      openFileInput(options?) {
        const inputElement = inputRef.current
        if (!inputElement) return Promise.resolve(null)

        return new Promise(resolve => {
          setState({ options, resolve })

          // To let the above setState to take effect:
          setTimeout(() => {
            inputElement.value = ''
            inputElement.click()
          })
        })
      },
    }),
    []
  )

  useEffectOnce(() => {
    const inputElement = inputRef.current
    if (inputElement) {
      inputElement.addEventListener('cancel', handleCancel)
      return () => void inputElement.removeEventListener('cancel', handleCancel)
    }

    function handleCancel(event: Event): void {
      setState(currentState => {
        currentState?.resolve(null)
        return undefined
      })
    }
  })

  return (
    <input
      ref={inputRef}
      hidden
      type="file"
      multiple={state?.options?.allowMultipleFilesSelection}
      accept={
        state?.options?.allowedFileTypes && state.options.allowedFileTypes.length > 0
          ? state.options.allowedFileTypes.join(',')
          : undefined
      }
      onChange={event => {
        setState(currentState => {
          currentState?.resolve(event.target.files)
          return undefined
        })
      }}
    />
  )
})

export namespace FileInput {
  export interface Options {
    readonly allowMultipleFilesSelection?: boolean
    /** Either `'abc/def'` formatted mime-types or `'.abc'` formatted file extensions */ readonly allowedFileTypes?: readonly string[]
  }

  export interface Referee {
    readonly openFileInput: (options?: Options) => Promise<FileList | null>
  }
}
