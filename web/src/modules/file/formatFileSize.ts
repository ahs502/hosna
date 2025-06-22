const base = 1024
const units = ['B', 'KB', 'MB', 'GB', 'TB']

export function formatFileSize(size: number): string {
  const i = Math.floor(Math.log(size) / Math.log(base))
  return `${Number((size / base ** i).toFixed(1))}\u00A0${units[i]}`
}
