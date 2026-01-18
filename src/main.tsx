import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App'
import { setConvexClient } from './store/fileStore'

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!)

// Set the Convex client for usage stats tracking
setConvexClient(convex)

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    // Service worker registration failed - app will still work
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
        <App />
      </ThemeProvider>
    </ConvexProvider>
  </StrictMode>,
)
