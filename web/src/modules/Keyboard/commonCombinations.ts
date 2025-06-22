import { typed } from 'shared'
import { webConfig } from '../webConfig'
import { Combinations } from './types/Combinations'

export const commonCombinations = {
  enter: typed<Combinations>(['Enter', 'NumpadEnter']),
  escape: typed<Combinations>('Escape'),
  delete: typed<Combinations>(webConfig.device === 'macOS' ? { cmd: true, code: 'Backspace' } : 'Delete'),
  rename: typed<Combinations>(webConfig.device === 'macOS' ? { cmd: true, shift: true, code: 'KeyR' } : 'F2'),
  command: typed<Combinations>(
    webConfig.device === 'macOS' ? ['MetaLeft', 'MetaRight'] : ['ControlLeft', 'ControlRight']
  ),
} as const
