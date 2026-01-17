// Core Enums
export enum FileStatus {
  Idle = 'idle',
  Processing = 'processing',
  Completed = 'completed',
  Error = 'error',
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
}

// GPS Location Details
export interface GPSInfo {
  latitude: number
  longitude: number
  altitude?: number
  formattedCoords: string // e.g., "37.7749° N, 122.4194° W"
  mapUrl: string // OpenStreetMap link
}

// Camera/Device Information
export interface DeviceInfo {
  make?: string
  model?: string
  software?: string
  lens?: string
}

// Camera Settings
export interface CameraSettings {
  exposureTime?: string
  fNumber?: number
  iso?: number
  focalLength?: string
  flash?: string
}

// Timestamp Information
export interface TimestampInfo {
  dateTimeOriginal?: Date
  dateTimeModified?: Date
}

// Metadata Information
export interface MetadataInfo {
  // Boolean flags (for quick checks)
  hasExif: boolean
  hasGPS: boolean
  hasTimestamps: boolean

  // Detailed information
  gps?: GPSInfo
  device?: DeviceInfo
  camera?: CameraSettings
  timestamps?: TimestampInfo

  // Privacy risk score (1-10)
  privacyRiskScore: number

  // Raw data for advanced users
  rawExifData?: Record<string, unknown>
}

// Metadata Removal Options
export interface MetadataRemovalOptions {
  removeExif: boolean
  removeGPS: boolean
  removeTimestamps: boolean
}

// FFmpeg Status
export type FFmpegStatus = 'idle' | 'loading' | 'loaded' | 'error'

// File State
export interface FileState {
  id: string
  file: File
  originalName: string
  status: FileStatus
  mediaType: MediaType
  thumbnail?: string
  processedBlob?: Blob
  metadata?: MetadataInfo
  metadataLoading?: boolean
  options: MetadataRemovalOptions
  error?: string
  isGIF?: boolean
}

// Custom Error Classes
export class UnsupportedFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnsupportedFormatError'
  }
}

export class FileSizeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FileSizeError'
  }
}

export class ProcessingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProcessingError'
  }
}

export class FFmpegLoadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FFmpegLoadError'
  }
}

// Store State
export interface FileStoreState {
  files: FileState[]
  globalOptions: MetadataRemovalOptions
  ffmpegStatus: FFmpegStatus
  ffmpegProgress: number

  // Actions
  addFile: (file: File) => void
  removeFile: (id: string) => void
  clearAll: () => void
  clearCompleted: () => void
  updateFile: (id: string, updates: Partial<FileState>) => void
  setGlobalOptions: (options: Partial<MetadataRemovalOptions>) => void
  processFile: (id: string) => Promise<void>
  processAll: () => Promise<void>
  setFFmpegStatus: (status: FFmpegStatus) => void
  setFFmpegProgress: (progress: number) => void
}

// Video Processing Options
export interface VideoProcessingOptions {
  removeExif: boolean
  removeGPS: boolean
  removeTimestamps: boolean
}
