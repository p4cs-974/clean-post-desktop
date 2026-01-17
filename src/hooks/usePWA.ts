import { useEffect, useState } from 'react'

type ServiceWorkerRegistrationWithWaiting = ServiceWorkerRegistration & {
  waiting?: ServiceWorker
}

interface UsePWAReturn {
  isUpdateAvailable: boolean
  updateApp: () => void
  isOffline: boolean
}

export function usePWA(): UsePWAReturn {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistrationWithWaiting | null>(null)

  useEffect(() => {
    // Check online/offline status
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    const handleControllerChange = () => {
      // Reload the page when the new service worker takes control
      window.location.reload()
    }

    setIsOffline(!navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg as ServiceWorkerRegistrationWithWaiting)
      })

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      }
    }
  }, [])

  useEffect(() => {
    // Listen for service worker updates
    if (!registration) return

    const handleUpdateFound = () => {
      const newWorker = registration.installing

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available, show update prompt
            setIsUpdateAvailable(true)
          }
        })
      }
    }

    registration.addEventListener('updatefound', handleUpdateFound)

    // Check if there's already a waiting service worker
    if (registration.waiting) {
      setIsUpdateAvailable(true)
    }

    return () => {
      registration.removeEventListener('updatefound', handleUpdateFound)
    }
  }, [registration])

  const updateApp = () => {
    if (!registration?.waiting) return

    // Send message to waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    setIsUpdateAvailable(false)
  }

  return {
    isUpdateAvailable,
    updateApp,
    isOffline,
  }
}
