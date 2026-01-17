import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import type { VideoProcessingOptions } from '@/types'

// Maximum file size for video processing (500MB)
const MAX_VIDEO_SIZE = 500 * 1024 * 1024

// Supported video formats
const SUPPORTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']

// Check if video format is supported
export function isVideoFormatSupported(file: File): boolean {
  return SUPPORTED_FORMATS.includes(file.type) || file.name.endsWith('.mov')
}

// Check if video file size is within limits
export function isVideoSizeValid(file: File): boolean {
  return file.size <= MAX_VIDEO_SIZE
}

// Process video and remove metadata using FFmpeg
export async function processVideo(
  file: File,
  ffmpeg: FFmpeg,
  options: VideoProcessingOptions,
  _onProgress?: (progress: number) => void
): Promise<{ blob: Blob; outputName: string }> {
  // Validate file size
  if (!isVideoSizeValid(file)) {
    throw new Error(
      `Video file too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB`
    )
  }

  // Validate format
  if (!isVideoFormatSupported(file)) {
    throw new Error(`Unsupported video format: ${file.type}`)
  }

  const inputName = `input_${Date.now()}${getExtension(file.name)}`
  const outputName = `output_${Date.now()}.mp4`

  try {
    // Write input file to FFmpeg's virtual filesystem
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    // Build FFmpeg command
    const args = buildFFmpegCommand(file, inputName, outputName, options)

    // Execute FFmpeg command
    await ffmpeg.exec(args)

    // Read the output file
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data], { type: 'video/mp4' })

    // Clean up virtual filesystem
    try {
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
    } catch {
      // Ignore cleanup errors
    }

    return {
      blob,
      outputName: file.name.replace(/\.[^/.]+$/, '.mp4'),
    }
  } catch (error) {
    // Clean up on error
    try {
      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)
    } catch {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to process video: ${error}`)
  }
}

// Build FFmpeg command arguments
function buildFFmpegCommand(
  file: File,
  inputName: string,
  outputName: string,
  options: VideoProcessingOptions
): string[] {
  const args = ['-i', inputName]

  // Remove metadata if ANY option is enabled
  // Note: FFmpeg doesn't have granular control for video metadata like images
  // We remove all metadata when any option is enabled for consistency
  const shouldRemoveAny = options.removeExif || options.removeGPS || options.removeTimestamps
  if (shouldRemoveAny) {
    args.push('-map_metadata', '-1')
  }

  // Fast stream copy (no re-encoding) for MP4 files
  if (file.type === 'video/mp4') {
    args.push('-c', 'copy')
  } else {
    // For MOV and other formats, convert to MP4 with faststart
    args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23')
    args.push('-c:a', 'aac', '-b:a', '128k')
  }

  // MP4 optimization for streaming
  args.push('-movflags', '+faststart')

  args.push(outputName)

  return args
}

// Get file extension from filename
function getExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  return ext ? `.${ext}` : '.mp4'
}

// Get video metadata
export async function getVideoMetadata(file: File): Promise<{
  duration: number
  width: number
  height: number
  size: number
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = url
  })
}
