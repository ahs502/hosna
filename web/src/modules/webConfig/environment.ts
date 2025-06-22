export const environment = {
  mode: (import.meta.env.MODE as 'development' | 'production') || 'development',
  target: import.meta.env.VITE_TARGET || 'local',
} as const
