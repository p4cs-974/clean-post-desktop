import { useCallback } from 'react'
import { saveAs } from 'file-saver'
import { useWebShare } from './useWebShare'
import { getPlatformInfo } from '@/lib/utils'

interface SmartDownloadOptions {
  files: File[]
  filename?: string
}

export function useSmartDownload() {
  const { canShare, share } = useWebShare()
  const platform = getPlatformInfo()

  const smartDownload = useCallback(async (options: SmartDownloadOptions): Promise<boolean> => {
    const { files, filename } = options

    // Check if all files can actually be shared on this platform
    // iOS Safari has limited Web Share API support for files
    const canShareFiles = canShare && files.every(file => {
      // iOS doesn't support video sharing via Web Share API
      if (platform.isIOS && file.type.startsWith('video/')) {
        return false
      }
      // iOS only reliably supports JPEG and PNG
      if (platform.isIOS && file.type.startsWith('image/') &&
          !['image/jpeg', 'image/png'].includes(file.type)) {
        return false
      }
      return true
    })

    // Use Web Share API when available and supported
    if (canShareFiles) {
      const shared = await share({
        files,
        title: filename || 'Clean media',
        text: 'Media files with metadata removed',
      })
      if (shared) return true
    }

    // Fallback to file-saver when Web Share is unavailable or fails
    files.forEach((file) => {
      saveAs(file, file.name)
    })

    return true
  }, [canShare, share, platform])

  return {
    smartDownload,
    platform,
  }
}
