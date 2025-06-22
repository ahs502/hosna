export function getAvatarFallback(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('\u200A') // &VeryThinSpace;
    .toUpperCase()
}
