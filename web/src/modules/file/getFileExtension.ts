export function getFileExtension(fileName: string): string | null {
  return /(?:\.([^.]+))?$/.exec(fileName)?.[1]?.toLowerCase() ?? null
}
