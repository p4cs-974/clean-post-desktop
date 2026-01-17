import { useCallback, useState } from 'react'
import { getPlatformInfo } from '@/lib/utils'

interface ShareData {
  files: File[]
  title?: string
  text?: string
}

interface UseWebShareReturn {
  canShare: boolean
  share: (data: ShareData) => Promise<boolean>
  isSharing: boolean
}

export function useWebShare(): UseWebShareReturn {
  const [isSharing, setIsSharing] = useState(false)

  // Check if Web Share API is supported
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    if (!canShare) {
      return false
    }

    setIsSharing(true)

    try {
      // Check if we can share the files
      if ('canShare' in navigator) {
        const canShareData = navigator.canShare({ files: data.files })

        if (!canShareData) {
          setIsSharing(false)
          return false
        }
      }

      // Share the files
      await navigator.share({
        files: data.files,
        title: data.title || 'Clean media files',
        text: data.text || 'Media files with metadata removed',
      })

      setIsSharing(false)
      return true
    } catch (error) {
      // User cancelled the share
      if ((error as Error).name === 'AbortError') {
        setIsSharing(false)
        return false
      }

      setIsSharing(false)
      return false
    }
  }, [canShare])

  return {
    canShare,
    share,
    isSharing,
  }
}
