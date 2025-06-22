import 'es5-shim'
import 'es6-shim'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/scrollbar'

import '@xyflow/react/dist/style.css'

import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ResizeObserverPolyfill from 'resize-observer-polyfill'
import { App } from './components/App'
import { webConfig } from './modules/webConfig'

window.ResizeObserver = ResizeObserverPolyfill

const root = createRoot(document.getElementById('root')!)

root.render(
  webConfig.environment.mode === 'development' &&
    !webConfig.temporary.doNotUseReactStrictModeInDevelopmentBecauseOfTheFailingUseSyncEffectHook ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
)
