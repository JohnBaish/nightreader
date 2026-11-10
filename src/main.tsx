import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/caprasimo/400.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/500.css'
import '@fontsource/figtree/600.css'
import './styles/global.css'
import App from './App.tsx'

// MOCK-UP ONLY, to remove once John chooses: ?copy=a, b or c places the copy buttons on a computer
const copyMock = new URLSearchParams(location.search).get('copy')
if (copyMock) document.documentElement.dataset.copy = copyMock

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
