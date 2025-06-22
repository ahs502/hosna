import { NativeEventCode } from './NativeEventCode'

export type Combination =
  | NativeEventCode
  | {
      readonly code: NativeEventCode
      readonly ctrl?: boolean
      readonly shift?: boolean
      /** The same as `option` for macOS */
      readonly alt?: boolean
      readonly meta?: boolean
      /** The same as `meta` for macOS and `ctrl` for other operating systems */
      readonly cmd?: boolean
    }
