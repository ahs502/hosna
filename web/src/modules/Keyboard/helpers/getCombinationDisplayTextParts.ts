import { webConfig } from '../../webConfig'
import { Combination } from '../types/Combination'
import { NativeEventCode } from '../types/NativeEventCode'

export function getCombinationDisplayTextParts(combination: Combination): string[] {
  if (typeof combination === 'string') return [codeDisplayTextMap[combination] || combination]

  const shiftOnly = !combination.ctrl && combination.shift && !combination.alt && !combination.meta && !combination.cmd
  const shiftOnlyDisplayText = shiftOnly && shiftedCodeDisplayTextMap[combination.code]
  if (shiftOnlyDisplayText) return [shiftOnlyDisplayText]

  const parts: string[] = []
  if (combination.meta) {
    parts.push(webConfig.device === 'macOS' ? '\u2318' : '\u229E') // ⌘ | ⊞
  }
  if (combination.cmd) {
    parts.push(webConfig.keyboard.cmdIsMeta ? '\u2318' : 'Ctrl') // ⌘
  }
  if (combination.ctrl) {
    parts.push('Ctrl')
  }
  if (combination.alt) {
    parts.push(webConfig.device === 'macOS' ? '\u2325' : 'Alt') // ⌥ (Option key)
  }
  if (combination.shift) {
    parts.push(webConfig.device === 'macOS' ? '\u21E7' : 'Shift') // ⇧ (Shift key)
  }
  parts.push(codeDisplayTextMap[combination.code] || combination.code)
  return parts
}

const codeDisplayTextMap: Readonly<Record<NativeEventCode, string>> = {
  ArrowUp: '\u2191',
  ArrowDown: '\u2193',
  ArrowLeft: '\u2190',
  ArrowRight: '\u2192',

  ControlRight: 'Right\u00A0Control',
  ShiftRight: 'Right\u00A0Shift',
  AltRight: 'Right\u00A0Alt',
  MetaRight: `Right\u00A0${webConfig.device === 'macOS' ? '\u2318' : 'Meta'}`,
  ControlLeft: 'Left\u00A0Control',
  ShiftLeft: 'Left\u00A0Shift',
  AltLeft: 'Left\u00A0Alt',
  MetaLeft: `Left\u00A0${webConfig.device === 'macOS' ? '\u2318' : 'Meta'}`,

  Enter: '\u21B5',
  Backspace: '',
  Escape: 'Esc',
  Tab: '',
  Space: '',

  F1: '',
  F2: '',
  F3: '',
  F4: '',
  F5: '',
  F6: '',
  F7: '',
  F8: '',
  F9: '',
  F10: '',
  F11: '',
  F12: '',

  Digit1: '1',
  Digit2: '2',
  Digit3: '3',
  Digit4: '4',
  Digit5: '5',
  Digit6: '6',
  Digit7: '7',
  Digit8: '8',
  Digit9: '9',
  Digit0: '0',

  Minus: '\u2212',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backquote: '`',
  Semicolon: ';',
  Quote: '"',
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backslash: '\\',

  KeyQ: 'Q',
  KeyW: 'W',
  KeyE: 'E',
  KeyR: 'R',
  KeyT: 'T',
  KeyY: 'Y',
  KeyU: 'U',
  KeyI: 'I',
  KeyO: 'O',
  KeyP: 'P',
  KeyA: 'A',
  KeyS: 'S',
  KeyD: 'D',
  KeyF: 'F',
  KeyG: 'G',
  KeyH: 'H',
  KeyJ: 'J',
  KeyK: 'K',
  KeyL: 'L',
  KeyZ: 'Z',
  KeyX: 'X',
  KeyC: 'C',
  KeyV: 'V',
  KeyB: 'B',
  KeyN: 'N',
  KeyM: 'M',

  Numpad0: 'Numpad\u00A00',
  Numpad1: 'Numpad\u00A01',
  Numpad2: 'Numpad\u00A02',
  Numpad3: 'Numpad\u00A03',
  Numpad4: 'Numpad\u00A04',
  Numpad5: 'Numpad\u00A05',
  Numpad6: 'Numpad\u00A06',
  Numpad7: 'Numpad\u00A07',
  Numpad8: 'Numpad\u00A08',
  Numpad9: 'Numpad\u00A09',

  NumpadEnter: 'Numpad\u00A0Enter',
  NumpadDecimal: 'Numpad\u00A0Decimal',
  NumpadAdd: 'Numpad\u00A0Add',
  NumpadSubtract: 'Numpad\u00A0Subtract',
  NumpadMultiply: 'Numpad\u00A0Multiply',
  NumpadDivide: 'Numpad\u00A0Divide',

  Home: '',
  End: '',
  PageUp: 'Page\u00A0Up',
  PageDown: 'Page\u00A0Down',
  Delete: '',
  Insert: '',
  Pause: '',
  ContextMenu: 'Context\u00A0Menu',
  IntlBackslash: 'Intl\u00A0Backslash',
  IntlYen: 'Intl\u00A0Yen',

  ScrollLock: 'Scroll\u00A0Lock',
  CapsLock: 'Caps\u00A0Lock',
  NumLock: 'Num\u00A0Lock',
}

const shiftedCodeDisplayTextMap: Partial<Readonly<Record<NativeEventCode, string>>> = {
  Digit1: '!',
  Digit2: '@',
  Digit3: '#',
  Digit4: '$',
  Digit5: '%',
  Digit6: '^',
  Digit7: '&',
  Digit8: '*',
  Digit9: '(',
  Digit0: ')',

  Minus: '_',
  Equal: '+',
  BracketLeft: '{',
  BracketRight: '}',
  Backquote: '~',
  Semicolon: ':',
  Quote: "'",
  Comma: '<',
  Period: '>',
  Slash: '?',
  Backslash: '|',
}
