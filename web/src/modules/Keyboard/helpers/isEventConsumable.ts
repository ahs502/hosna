import { NativeEventCode } from '../types/NativeEventCode'
import { isEventTargetConsuming } from './isEventTargetConsuming'

export function isEventConsumable(event: KeyboardEvent): boolean {
  return (
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey &&
    codeConsumablityDictionary[event.code as NativeEventCode] &&
    isEventTargetConsuming(event)
  )
}

const codeConsumablityDictionary: Readonly<Record<NativeEventCode, boolean>> = {
  ArrowUp: true,
  ArrowDown: true,
  ArrowLeft: true,
  ArrowRight: true,

  ControlRight: false,
  ShiftRight: false,
  AltRight: false,
  MetaRight: false,
  ControlLeft: false,
  ShiftLeft: false,
  AltLeft: false,
  MetaLeft: false,

  Enter: false,
  Backspace: true,
  Escape: false,
  Tab: true,
  Space: true,

  F1: false,
  F2: false,
  F3: false,
  F4: false,
  F5: false,
  F6: false,
  F7: false,
  F8: false,
  F9: false,
  F10: false,
  F11: false,
  F12: false,

  Digit1: true,
  Digit2: true,
  Digit3: true,
  Digit4: true,
  Digit5: true,
  Digit6: true,
  Digit7: true,
  Digit8: true,
  Digit9: true,
  Digit0: true,

  Minus: true,
  Equal: true,
  BracketLeft: true,
  BracketRight: true,
  Backquote: true,
  Semicolon: true,
  Quote: true,
  Comma: true,
  Period: true,
  Slash: true,
  Backslash: true,

  KeyQ: true,
  KeyW: true,
  KeyE: true,
  KeyR: true,
  KeyT: true,
  KeyY: true,
  KeyU: true,
  KeyI: true,
  KeyO: true,
  KeyP: true,
  KeyA: true,
  KeyS: true,
  KeyD: true,
  KeyF: true,
  KeyG: true,
  KeyH: true,
  KeyJ: true,
  KeyK: true,
  KeyL: true,
  KeyZ: true,
  KeyX: true,
  KeyC: true,
  KeyV: true,
  KeyB: true,
  KeyN: true,
  KeyM: true,

  Numpad0: true,
  Numpad1: true,
  Numpad2: true,
  Numpad3: true,
  Numpad4: true,
  Numpad5: true,
  Numpad6: true,
  Numpad7: true,
  Numpad8: true,
  Numpad9: true,

  NumpadEnter: false,
  NumpadDecimal: true,
  NumpadAdd: true,
  NumpadSubtract: true,
  NumpadMultiply: true,
  NumpadDivide: true,

  Home: true,
  End: true,
  PageUp: true,
  PageDown: true,
  Delete: true,
  Insert: false,
  Pause: false,
  ContextMenu: false,
  IntlBackslash: true, // TODO: What is this button?
  IntlYen: false, // TODO: What is this button?

  ScrollLock: true,
  CapsLock: true,
  NumLock: true,
}
