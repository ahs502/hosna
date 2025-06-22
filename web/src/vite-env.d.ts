/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TARGET: 'local' | 'stage' | 'live'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
