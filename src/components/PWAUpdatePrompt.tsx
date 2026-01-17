import { usePWA } from '@/hooks/usePWA'
import { Button } from './ui/button'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Download } from 'lucide-react'

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA()

  if (!isUpdateAvailable) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <Alert className="border-primary bg-card shadow-lg">
        <Download className="h-4 w-4" />
        <AlertTitle>Update Available</AlertTitle>
        <AlertDescription className="flex items-center gap-2 mt-2">
          <span className="text-sm">A new version is ready to install.</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={updateApp}>
              Update Now
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
              Later
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
