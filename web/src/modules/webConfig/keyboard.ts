import { device } from './device'

export const keyboard = {
  cmdIsCtrl: device !== 'macOS',
  cmdIsMeta: device === 'macOS',
} as const
