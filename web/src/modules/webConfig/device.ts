type Device = 'macOS' | 'iOS' | 'Windows' | 'Android' | 'Linux' | 'Unknown'

export const device: Device = globalThis.navigator?.userAgent.includes('like Mac')
  ? 'iOS'
  : globalThis.navigator?.userAgent.includes('Android')
  ? 'Android'
  : globalThis.navigator?.userAgent.includes('Linux')
  ? 'Linux'
  : globalThis.navigator?.userAgent.includes('Mac')
  ? 'macOS'
  : globalThis.navigator?.userAgent.includes('Win')
  ? 'Windows'
  : 'Unknown'
