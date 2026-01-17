import exifr from 'exifr'
import type {
  MetadataInfo,
  GPSInfo,
  DeviceInfo,
  CameraSettings,
  TimestampInfo,
} from '@/types'

// Enhanced exifr options for comprehensive extraction
const EXIFR_OPTIONS = {
  tiff: true,
  exif: true,
  gps: true,
  xmp: true,
  iptc: true,
  translateKeys: true,
  translateValues: true,
  reviveValues: true,
}

// Read metadata from an image file
export async function readImageMetadata(file: File): Promise<MetadataInfo> {
  try {
    const metadata = await exifr.parse(file, EXIFR_OPTIONS)

    if (!metadata) {
      return createEmptyMetadata()
    }

    const gps = extractGPSInfo(metadata)
    const device = extractDeviceInfo(metadata)
    const camera = extractCameraSettings(metadata)
    const timestamps = extractTimestamps(metadata)

    return {
      hasExif: Object.keys(metadata).length > 0,
      hasGPS: gps !== undefined,
      hasTimestamps: timestamps !== undefined,
      gps,
      device,
      camera,
      timestamps,
      privacyRiskScore: calculatePrivacyRisk(gps, device, timestamps),
      rawExifData: metadata,
    }
  } catch {
    return createEmptyMetadata()
  }
}

// Read metadata from a video file
export async function readVideoMetadata(file: File): Promise<MetadataInfo> {
  try {
    const metadata = await exifr.parse(file, EXIFR_OPTIONS)

    if (!metadata) {
      return createEmptyMetadata()
    }

    const gps = extractGPSInfo(metadata)
    const device = extractDeviceInfo(metadata)
    const camera = extractCameraSettings(metadata)
    const timestamps = extractTimestamps(metadata)

    return {
      hasExif: Object.keys(metadata).length > 0,
      hasGPS: gps !== undefined,
      hasTimestamps: timestamps !== undefined,
      gps,
      device,
      camera,
      timestamps,
      privacyRiskScore: calculatePrivacyRisk(gps, device, timestamps),
      rawExifData: metadata,
    }
  } catch {
    return createEmptyMetadata()
  }
}

// Extract GPS information
function extractGPSInfo(
  metadata: Record<string, unknown>
): GPSInfo | undefined {
  const lat = (metadata.latitude ?? metadata.GPSLatitude) as number | undefined
  const lng = (metadata.longitude ?? metadata.GPSLongitude) as number | undefined

  if (lat === undefined || lng === undefined) return undefined

  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'

  return {
    latitude: lat,
    longitude: lng,
    altitude: metadata.GPSAltitude as number | undefined,
    formattedCoords: `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`,
    mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`,
  }
}

// Extract device information
function extractDeviceInfo(
  metadata: Record<string, unknown>
): DeviceInfo | undefined {
  const make = metadata.Make as string | undefined
  const model = metadata.Model as string | undefined

  if (!make && !model) return undefined

  return {
    make,
    model,
    software: metadata.Software as string | undefined,
    lens: (metadata.LensModel ?? metadata.Lens) as string | undefined,
  }
}

// Extract camera settings
function extractCameraSettings(
  metadata: Record<string, unknown>
): CameraSettings | undefined {
  const hasSettings =
    metadata.ExposureTime || metadata.FNumber || metadata.ISO

  if (!hasSettings) return undefined

  return {
    exposureTime: formatExposureTime(metadata.ExposureTime as number),
    fNumber: metadata.FNumber as number | undefined,
    iso: (metadata.ISO ?? metadata.ISOSpeedRatings) as number | undefined,
    focalLength: metadata.FocalLength
      ? `${metadata.FocalLength}mm`
      : undefined,
    flash: formatFlash(metadata.Flash),
  }
}

// Extract timestamps
function extractTimestamps(
  metadata: Record<string, unknown>
): TimestampInfo | undefined {
  const original = (metadata.DateTimeOriginal ?? metadata.CreateDate) as
    | Date
    | undefined
  const modified = (metadata.DateTime ?? metadata.ModifyDate) as
    | Date
    | undefined

  if (!original && !modified) return undefined

  return {
    dateTimeOriginal: original,
    dateTimeModified: modified,
  }
}

// Calculate privacy risk score (1-10)
function calculatePrivacyRisk(
  gps?: GPSInfo,
  device?: DeviceInfo,
  timestamps?: TimestampInfo
): number {
  let score = 0

  if (gps) score += 5 // GPS is highest risk
  if (device?.make || device?.model) score += 2
  if (device?.software) score += 1
  if (timestamps?.dateTimeOriginal) score += 2

  return Math.min(score, 10)
}

// Format exposure time for display
function formatExposureTime(exposure?: number): string | undefined {
  if (!exposure) return undefined
  if (exposure >= 1) return `${exposure}s`
  return `1/${Math.round(1 / exposure)}`
}

// Format flash value for display
function formatFlash(flash?: unknown): string | undefined {
  if (flash === undefined) return undefined
  if (typeof flash === 'string') return flash
  if (typeof flash === 'number') {
    return flash === 0 ? 'No Flash' : 'Flash Fired'
  }
  return undefined
}

// Create empty metadata object
function createEmptyMetadata(): MetadataInfo {
  return {
    hasExif: false,
    hasGPS: false,
    hasTimestamps: false,
    privacyRiskScore: 0,
  }
}

// Generate thumbnail for image files
export async function generateImageThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down if needed
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize
          width = maxSize
        } else {
          width = (width / height) * maxSize
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error('Failed to create thumbnail'))
          }
        },
        'image/jpeg',
        0.8
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for thumbnail'))
    }

    img.src = url
  })
}

// Generate thumbnail for video files
export async function generateVideoThumbnail(
  file: File,
  maxSize: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)

    video.preload = 'metadata'

    video.onloadeddata = () => {
      // Seek to 1 second or 25% of video duration
      const seekTime = Math.min(1, video.duration * 0.25)
      video.currentTime = seekTime
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      let { videoWidth, videoHeight } = video

      // Scale down if needed
      if (videoWidth > maxSize || videoHeight > maxSize) {
        if (videoWidth > videoHeight) {
          videoHeight = (videoHeight / videoWidth) * maxSize
          videoWidth = maxSize
        } else {
          videoWidth = (videoWidth / videoHeight) * maxSize
          videoHeight = maxSize
        }
      }

      canvas.width = videoWidth
      canvas.height = videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error('Failed to create thumbnail'))
          }
        },
        'image/jpeg',
        0.8
      )
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video for thumbnail'))
    }

    video.src = url
  })
}

