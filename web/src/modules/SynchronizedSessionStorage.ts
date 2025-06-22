import { useState } from 'react'
import { useEffectOnce } from 'react-use'

const references: Record<
  string,
  {
    getDefaultValue: () => any
    value: any
    readonly watchers: ((value: any) => void)[]
  }
> = {}

export namespace SynchronizedSessionStorage {
  export function createEntity<Key extends string, Value>(key: Key, getDefaultValue: () => Value): Entity<Key, Value> {
    if (key.includes('::')) throw Error('Key cannot contain "::".')
    const storageKey = `SynchronizedSessionStorage::${key}`
    const rawInitialValue = window.sessionStorage.getItem(storageKey)
    const initialValue = rawInitialValue !== null ? JSON.parse(rawInitialValue) : getDefaultValue()
    references[storageKey] = { getDefaultValue, value: initialValue, watchers: [] }

    const entity: Entity<Key, ReturnType<typeof getDefaultValue>> = {
      get value() {
        return this.get()[key]
      },

      set value(value) {
        this.set(value)
      },

      set(value) {
        if (value !== undefined) {
          if (references[storageKey].value === value) return
          window.sessionStorage.setItem(storageKey, JSON.stringify(value))
          references[storageKey].value = value
        } else {
          const defaultValue = references[storageKey].getDefaultValue()
          if (references[storageKey].value === defaultValue) return
          window.sessionStorage.removeItem(storageKey)
          references[storageKey].value = defaultValue
        }
        references[storageKey].watchers.forEach(watcher => watcher(references[storageKey].value))
      },

      get() {
        return { [key]: references[storageKey].value } as { [K in Key]: ReturnType<typeof getDefaultValue> }
      },

      reset() {
        const defaultValue = references[storageKey].getDefaultValue()
        if (references[storageKey].value === defaultValue) return
        window.sessionStorage.removeItem(storageKey)
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

        return { [key]: value } as { [K in Key]: ReturnType<typeof getDefaultValue> }
      },
    }

    return entity
  }

  export interface Entity<Key extends string, Value> {
    value: Value
    readonly set: (value: Value) => void
    readonly get: () => { [K in Key]: Value }
    readonly reset: () => void
    readonly use: () => { [K in Key]: Value }
  }
}
