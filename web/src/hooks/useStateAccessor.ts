import { useLayoutEffect, useMemo, useRef, useState } from 'react'

// TODO: A bunch of renames are required: useStateAccessor, onChangeBefore, onChnageAfter; Also, dependencies should be optional

/**
 * All the methods are persistent, no need to put them in the dependencies.
 * Also, all of them are `this`-independent and can be passed/called
 * as independent functions (except for the `value` setter).
 */
export interface StateAccessor<T> {
  /**
   * The state value, you can either set or get it.
   *
   * > **NOTE:**
   * The `value` should not be partially updated, instead it should be set as a whole.
   * Therefore, it's more safe to use `.set()` and `.get()` instead.
   */
  value: T

  /** Returns the state value. */
  get(): T

  /** Sets the state value and returns the possibily modified value and possibily re-renders the component. */
  set(value: T): T

  /** Sets/returns the state value without re-rendering the component. */
  put(value: T): T

  /** Merges and sets the state value and definitely re-renders the component. */
  merge(value: Partial<T>): T

  /** Resets the state value with the given initializer and possibly re-renders the component. */
  reset(): void

  /** Returns true iff the state value equals the given value. */
  is(value: T): boolean

  /** Returns true iff the state value does not equal the given value. */
  isNot(value: T): boolean

  /**
   * Registers a callback function on value change.
   * @param callback Is called once right after registrations with `initialTime == true`, and more on value changes with `initialTime == false`
   * @param cleanUp Optional, is called when unregistering this watch, either by the provided `unwatch()` or by `unwatchAll()` method
   * @returns The `unwatch()` function
   */
  watch(callback: (initialTime: boolean) => void, cleanUp?: () => void): () => void

  /** Removes all the registered watch callbacks at once. */
  unwatchAll(): void

  toString(): string
}

/**
 * An enriched version of the React's default useState hook.
 * @param initialize The initial value (provider) to be used first to initialize the state value, on reset, and on changes in the dependencies
 * @param dependencies The state dependencies, any changes will lead to a state reset to the current initializing value, by default is []
 * @param options Extra complementary options and callbacks
 */
export function useStateAccessor<T>(
  initialize: T | (() => T),
  dependencies?: readonly any[],
  options?: {
    /** Optional, instead of ===, is used in the is() method and to decide whether or not to re-render on setting value, it doesn't affect the options.onChange() functionality */
    equalityFunction?(first: T, second: T): boolean
    /** Optional, is called after setting the state value and before calling options.onChange() and then causing the possible re-render, it will optionally modify the new value and return the actual one to be set, it also applies on the initial value */
    middleware?(newValue: T, oldValue?: T): T
    /** Optional, is called after calling the options.middleware() and before setting the state value and options.onChangeAfter() and possibly causing re-render, it can optionally prevent the new value to be set by returning `'ignore change'` */
    onChangeBefore?(newValue: T, oldValue: T): 'ignore change' | void
    /** Optional, is called after setting the state value, if it happens */
    onChangeAfter?(newValue: T, oldValue: T): void
    /** Optional, overrides the string representation of the state accessor */
    toString?(value: T): string
  }
): StateAccessor<T> {
  const [state, setState] = useState<T>(() => {
    const initialValue = initialize instanceof Function ? initialize() : initialize
    const modifiedInitialValue = options?.middleware ? options.middleware(initialValue) : initialValue
    return modifiedInitialValue
  })

  const ref = useRef<{
    firstRun: boolean
    initialize: typeof initialize
    options: typeof options
    state: typeof state
    registrations: {
      readonly callback: Parameters<StateAccessor<T>['watch']>[0]
      readonly unwatch: ReturnType<StateAccessor<T>['watch']>
    }[]
  }>({
    firstRun: true,
    initialize,
    options,
    state,
    registrations: [],
  })
  ref.current.initialize = initialize
  ref.current.options = options

  const stateAccessor: StateAccessor<T> = useMemo(
    () => ({
      get value() {
        return ref.current.state
      },

      set value(value: T) {
        stateAccessor.set(value)
      },

      get() {
        return ref.current.state
      },

      set(value) {
        const oldValue = ref.current.state
        const modifiedValue = stateAccessor.put(value)
        if (oldValue === modifiedValue) return ref.current.state
        setState(modifiedValue)
        return modifiedValue
      },

      put(value) {
        const modifiedValue = ref.current.options?.middleware
          ? ref.current.options.middleware(value, ref.current.state)
          : value
        if (stateAccessor.is(modifiedValue)) return ref.current.state
        const ignoreChange = ref.current.options?.onChangeBefore?.(modifiedValue, ref.current.state) === 'ignore change'
        if (ignoreChange) return ref.current.state
        const oldValue = ref.current.state
        ref.current.state = modifiedValue
        ref.current.options?.onChangeAfter?.(modifiedValue, oldValue)
        setTimeout(() => ref.current.registrations.forEach(({ callback }) => callback(false))) // Just to make sure the callbacks are being called *after* the value is set and this rendering phase finishes
        return modifiedValue
      },

      merge(value) {
        return stateAccessor.set({ ...ref.current.state, ...value })
      },

      reset() {
        const initialValue =
          ref.current.initialize instanceof Function ? ref.current.initialize() : ref.current.initialize
        const modifiedInitialValue = ref.current.options?.middleware
          ? ref.current.options.middleware(initialValue)
          : initialValue
        stateAccessor.set(modifiedInitialValue)
      },

      is(value) {
        return ref.current.options?.equalityFunction
          ? ref.current.options.equalityFunction(ref.current.state, value)
          : value === ref.current.state
      },

      isNot(value) {
        return !stateAccessor.is(value)
      },

      watch(callback, cleanUp) {
        const registration: typeof ref.current.registrations[number] = {
          callback,
          unwatch() {
            const index = ref.current.registrations.indexOf(registration)
            if (index >= 0) {
              ref.current.registrations.splice(index, 1)
            }
            cleanUp?.()
          },
        }
        ref.current.registrations.push(registration)
        callback(true)
        return registration.unwatch
      },

      unwatchAll() {
        const { registrations } = ref.current
        ref.current.registrations = []
        registrations.forEach(({ unwatch }) => unwatch())
      },

      toString() {
        return ref.current.options?.toString
          ? ref.current.options.toString(ref.current.state)
          : String(ref.current.state)
      },
    }),
    []
  )

  useLayoutEffect(() => {
    if (!ref.current.firstRun) {
      stateAccessor.reset()
    }
    ref.current.firstRun = false
  }, dependencies ?? [])

  return stateAccessor
}
