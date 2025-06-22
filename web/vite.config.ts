import { defineConfig } from 'vite'
import pluginReactSwc from '@vitejs/plugin-react-swc'

// See: https://vitejs.dev/config/

export default defineConfig({
  plugins: [pluginReactSwc()],
})
