import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import '@fontsource/caprasimo/400.css'
import '@fontsource/figtree/400.css'
import '@fontsource/figtree/500.css'
import '@fontsource/figtree/600.css'
import './styles/global.css'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* visit statistics without the part after "#" (the postcode), which stays on the device */}
    <Analytics beforeSend={(event) => ({ ...event, url: event.url.split('#')[0] })} />
  </StrictMode>,
)
