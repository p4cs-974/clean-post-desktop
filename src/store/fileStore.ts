import { create } from 'zustand'
import type {
  FileState,
  FileStoreState,
  MetadataRemovalOptions,
  FFmpegStatus,
} from '@/types'
import { FileStatus, MediaType } from '@/types'
import { processImage } from '@/lib/processors/imageProcessor'
import { processVideo } from '@/lib/processors/videoProcessor'
import { getFFmpegInstance } from '@/hooks/useFFmpeg'

// Global Convex client reference (will be set by the component)
let convexClient: any = null

export function setConvexClient(client: any) {
  convexClient = client
}

// Helper to determine media type
function getMediaType(file: File): MediaType {
  return file.type.startsWith('image/') ? MediaType.Image : MediaType.Video
}

// Helper to record usage stats to Convex
async function recordUsageStat(file: FileState): Promise<void> {
  if (!convexClient) {
    console.warn('Convex client not initialized, skipping stats recording')
    return
  }

  try {
    await convexClient.mutation('usageStats:recordUsage', {
      fileName: file.originalName,
      fileType: file.file.type,
      mediaType: file.mediaType,
      fileSize: file.file.size,
      processedSize: file.processedBlob?.size ?? file.file.size,
      hadExif: file.metadata?.hasExif ?? false,
      hadGPS: file.metadata?.hasGPS ?? false,
      hadTimestamps: file.metadata?.hasTimestamps ?? false,
      privacyRiskScore: file.metadata?.privacyRiskScore,
      removedExif: file.options.removeExif,
      removedGPS: file.options.removeGPS,
      removedTimestamps: file.options.removeTimestamps,
      status: file.status === FileStatus.Completed ? 'completed' : 'error',
      errorMessage: file.error,
    })
  } catch (error) {
    console.error('Failed to record usage stat:', error)
    // Don't throw - we don't want to block the UI if stats recording fails
  }
}

// Initial state
const initialState = {
  files: [],
  globalOptions: {
    removeExif: true,
    removeGPS: true,
    removeTimestamps: false,
  },
  ffmpegStatus: 'idle' as FFmpegStatus,
  ffmpegProgress: 0,
}

// Create the store
export const useFileStore = create<FileStoreState>((set, get) => ({
  ...initialState,

  addFile: (file: File) => {
    const id = Math.random().toString(36).substring(2, 9)
    const mediaType = getMediaType(file)
    const isGIF = file.type === 'image/gif'

    const newFile: FileState = {
      id,
      file,
      originalName: file.name,
      status: FileStatus.Idle,
      mediaType,
      thumbnail: undefined,
      options: get().globalOptions,
      isGIF,
    }

    set((state) => ({ files: [...state.files, newFile] }))
  },

  removeFile: (id: string) => {
    set((state) => {
      const file = state.files.find((f) => f.id === id)
      if (file?.thumbnail) {
        URL.revokeObjectURL(file.thumbnail)
      }
      // Record usage stat if file was processed or had an error
      if (file && (file.status === FileStatus.Completed || file.status === FileStatus.Error)) {
        recordUsageStat(file)
      }
      return { files: state.files.filter((f) => f.id !== id) }
    })
  },

  clearAll: () => {
    const { files } = get()
    // Record usage stats for completed or error files before clearing
    files.forEach((file) => {
      if (file.status === FileStatus.Completed || file.status === FileStatus.Error) {
        recordUsageStat(file)
      }
      if (file.thumbnail) {
        URL.revokeObjectURL(file.thumbnail)
      }
    })
    set({ files: [] })
  },

  clearCompleted: () => {
    const { files } = get()
    // Record usage stats for completed files before clearing
    files.forEach((file) => {
      if (file.status === FileStatus.Completed) {
        recordUsageStat(file)
      }
      if (file.thumbnail) {
        URL.revokeObjectURL(file.thumbnail)
      }
    })
    set({
      files: files.filter((f) => f.status !== FileStatus.Completed),
    })
  },

  updateFile: (id: string, updates: Partial<FileState>) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  },

  setGlobalOptions: (options: Partial<MetadataRemovalOptions>) => {
    set((state) => ({
      globalOptions: { ...state.globalOptions, ...options },
      files: state.files.map((f) => ({
        ...f,
        options: { ...f.options, ...options },
      })),
    }))
  },

  processFile: async (id: string) => {
    const file = get().files.find((f) => f.id === id)
    if (!file) return

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: FileStatus.Processing } : f
      ),
    }))

    try {
      if (file.mediaType === MediaType.Image) {
        const { blob } = await processImage(file.file, file.options)
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, status: FileStatus.Completed, processedBlob: blob } : f
          ),
        }))
      } else {
        // Video processing
        const ffmpeg = getFFmpegInstance()
        if (!ffmpeg) {
          throw new Error('FFmpeg not loaded')
        }

        const { blob } = await processVideo(
          file.file,
          ffmpeg,
          {
            removeExif: file.options.removeExif,
            removeGPS: file.options.removeGPS,
            removeTimestamps: file.options.removeTimestamps,
          }
        )

        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, status: FileStatus.Completed, processedBlob: blob } : f
          ),
        }))
      }
    } catch (error) {
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? {
            ...f,
            status: FileStatus.Error,
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        ),
      }))
    }
  },

  processAll: async () => {
    const { files, processFile } = get()
    const idleFiles = files.filter((f) => f.status === FileStatus.Idle)

    for (const file of idleFiles) {
      try {
        await processFile(file.id)
      } catch (error) {
        console.error(`Failed to process ${file.originalName}:`, error)
      }
    }
  },

  setFFmpegStatus: (status: FFmpegStatus) => {
    set({ ffmpegStatus: status })
  },

  setFFmpegProgress: (progress: number) => {
    set({ ffmpegProgress: progress })
  },
}))
