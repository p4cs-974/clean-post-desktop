import { useCallback, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null
let loadPromise: Promise<FFmpeg> | null = null
let loadingProgress = 0

export function useFFmpeg() {
  const isLoadedRef = useRef(false)

  // Get the current FFmpeg loading progress
  const getLoadProgress = useCallback(() => loadingProgress, [])

  // Load FFmpeg.wasm
  const loadFFmpeg = useCallback(async (
    onProgress?: (progress: number) => void
  ): Promise<FFmpeg> => {
    // Return existing instance if already loaded
    if (ffmpegInstance) {
      return ffmpegInstance
    }

    // Return existing promise if already loading
    if (loadPromise) {
      return loadPromise
    }

    // Start loading
    loadPromise = (async () => {
      try {
        const ffmpeg = new FFmpeg()

        // Setup logging
        ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]', message)
        })

        // Setup progress tracking
        ffmpeg.on('progress', ({ progress }) => {
          const percent = Math.round(progress * 100)
          loadingProgress = percent
          onProgress?.(percent)
        })

        // Load FFmpeg from CDN
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })

        ffmpegInstance = ffmpeg
        isLoadedRef.current = true
        loadingProgress = 100

        return ffmpeg
      } catch (error) {
        ffmpegInstance = null
        loadPromise = null
        loadingProgress = 0
        throw new Error(`Failed to load FFmpeg: ${error}`)
      }
    })()

    return loadPromise
  }, [])

  // Ensure FFmpeg is loaded before processing
  const ensureFFmpegLoaded = useCallback(async (
    onProgress?: (progress: number) => void
  ): Promise<FFmpeg> => {
    if (isLoadedRef.current && ffmpegInstance) {
      return ffmpegInstance
    }
    return loadFFmpeg(onProgress)
  }, [loadFFmpeg])

  // Reset FFmpeg (for error recovery)
  const resetFFmpeg = useCallback(() => {
    ffmpegInstance = null
    loadPromise = null
    loadingProgress = 0
    isLoadedRef.current = false
  }, [])

  return {
    loadFFmpeg,
    ensureFFmpegLoaded,
    getLoadProgress,
    resetFFmpeg,
    isLoaded: () => isLoadedRef.current,
  }
}

// Export function to get FFmpeg instance from outside React components
export function getFFmpegInstance(): FFmpeg | null {
  return ffmpegInstance
}
