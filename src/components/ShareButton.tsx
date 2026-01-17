import { useEffect, useState } from 'react'
import { Share } from 'lucide-react'
import { Button } from './ui/button'
import { useWebShare } from '@/hooks/useWebShare'

interface ShareButtonProps {
  files: File[]
  filename?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function ShareButton({
  files,
  filename,
  variant = 'default',
  size = 'default',
  className,
}: ShareButtonProps) {
  const { canShare, share, isSharing } = useWebShare()
  const [showToast, setShowToast] = useState(false)

  // Auto-hide toast with proper cleanup
  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 2000)
    return () => clearTimeout(timer)
  }, [showToast])

  if (!canShare) {
    return null
  }

  const handleShare = async () => {
    const success = await share({
      files,
      title: filename || 'Clean media',
      text: 'Media files with metadata removed',
    })

    if (!success && !isSharing) {
      // Show toast for unsupported/cancelled share
      setShowToast(true)
    }
  }

  const label = files.length === 1 ? 'Share' : `Share ${files.length} files`

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isSharing || files.length === 0}
        className={className}
      >
        {isSharing ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Preparing...
          </>
        ) : (
          <>
            <Share className="mr-2 h-4 w-4" />
            {size === 'icon' ? null : label}
          </>
        )}
      </Button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-muted px-4 py-2 rounded-lg shadow-lg text-sm animate-in slide-in-from-bottom-4">
          Share cancelled or unavailable
        </div>
      )}
    </>
  )
}
