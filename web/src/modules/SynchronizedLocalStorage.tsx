import { useState } from 'react'
import { useEffectOnce } from 'react-use'

const references: Record<
  string,
  {
    defaultValue: any
    value: any
    readonly watchers: ((value: any) => void)[]
  }
> = {}

export namespace SynchronizedLocalStorage {
  export function useInitialize(): void {
    useEffectOnce(() => {
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)

      function handleStorage(event: StorageEvent): void {
        const keys = event.key !== null ? [event.key] : Object.keys(references)
        keys.forEach(key => {
          if (!(key in references)) return
          if (event.newValue !== null) {
            const newValue = JSON.parse(event.newValue)
            if (references[key].value === newValue) return
            references[key].value = newValue
          } else {
            if (references[key].value === references[key].defaultValue) return
            references[key].value = references[key].defaultValue
          }
          references[key].watchers.forEach(watcher => watcher(references[key].value))
        })
      }
    })
  }

  export function createEntity<Key extends string, Value>(
    key: Key,
    version: number,
    defaultValue: Value,
    options?: {
      obsolete?: boolean
      import?: () => Value | undefined
    }
  ): Entity<Key, Value> {
    if (key.includes('::')) throw Error('Key cannot contain "::".')
    const storageKey = `SynchronizedLocalStorage::${key}::${version}`
    const rawInitialValue = window.localStorage.getItem(storageKey)
    const initialValue = rawInitialValue !== null ? JSON.parse(rawInitialValue) : defaultValue
    references[storageKey] = { defaultValue, value: initialValue, watchers: [] }

    const entity: Entity<Key, typeof defaultValue> = {
      get value() {
        return this.get()[key]
      },

      set value(value) {
        this.set(value)
      },

      set(value) {
        if (value !== undefined) {
          if (references[storageKey].value === value) return
          if (!options?.obsolete) {
            window.localStorage.setItem(storageKey, JSON.stringify(value))
          }
          references[storageKey].value = value
        } else {
          if (references[storageKey].value === defaultValue) return
          window.localStorage.removeItem(storageKey)
          references[storageKey].value = defaultValue
        }
        references[storageKey].watchers.forEach(watcher => watcher(references[storageKey].value))
      },

      get() {
        return { [key]: references[storageKey].value } as { [K in Key]: typeof defaultValue }
      },

      reset() {
        if (references[storageKey].value === defaultValue) return
        window.localStorage.removeItem(storageKey)
        references[storageKey].value = defaultValue
        references[storageKey].watchers.forEach(watcher => watcher(references[storageKey].value))
      },

      use() {
        const [value, setValue] = useState(references[storageKey].value)

        useEffectOnce(() => {
          references[storageKey].watchers.push(setValue)
          return () => {
            const index = references[storageKey].watchers.indexOf(setValue)
            if (index >= 0) {
              references[storageKey].watchers.splice(index, 1)
            }
          }
        })

        return { [key]: value } as { [K in Key]: typeof defaultValue }
      },

      get export() {
        const rawValue = window.localStorage.getItem(storageKey)
        const value = rawValue !== null ? JSON.parse(rawValue) : undefined
        return value
      },
    }

    if (options?.obsolete && rawInitialValue !== null) {
      entity.reset()
    }

    if (options?.import && rawInitialValue === null) {
      const imported = options.import()
      if (imported !== undefined) {
        entity.set(imported)
      }
    }

    return entity
  }

  export interface Entity<Key extends string, Value> {
    value: Value
    readonly set: (value: Value) => void
    readonly get: () => { [K in Key]: Value }
    readonly reset: () => void
    readonly use: () => { [K in Key]: Value }
    readonly export: Value | undefined
  }
}
