import piexifjs from 'piexifjs'
import heic2any from 'heic2any'
import type { MetadataRemovalOptions } from '@/types'

// Process image and remove metadata
export async function processImage(
  file: File,
  options: MetadataRemovalOptions
): Promise<{ blob: Blob; wasCompressed: boolean }> {
  const fileType = file.type

  // Handle HEIC files - convert to JPEG first
  if (fileType === 'image/heic' || fileType === 'image/heif') {
    return await processHEIC(file, options)
  }

  // Handle JPEG with piexifjs for selective removal
  if (fileType === 'image/jpeg') {
    return await processJPEG(file, options)
  }

  // Handle PNG, WebP, GIF with canvas re-encoding
  if (fileType === 'image/png' || fileType === 'image/webp' || fileType === 'image/gif') {
    return await processWithCanvas(file, fileType)
  }

  throw new Error(`Unsupported image format: ${fileType}`)
}

// Process JPEG with piexifjs for selective EXIF removal
async function processJPEG(
  file: File,
  options: MetadataRemovalOptions
): Promise<{ blob: Blob; wasCompressed: boolean }> {
  const arrayBuffer = await file.arrayBuffer()
  const base64 = arrayBufferToBase64(arrayBuffer)
  let exifObj = null

  try {
    exifObj = piexifjs.load(base64)
  } catch {
    // No EXIF data or invalid EXIF, return original
    return { blob: file, wasCompressed: false }
  }

  let modified = false

  // Remove EXIF if option is enabled
  if (options.removeExif && exifObj['0th'] || exifObj['Exif']) {
    // Keep only necessary tags
    const necessary0thTags = [
      piexifjs.ImageIFD.Orientation,
      piexifjs.ImageIFD.XResolution,
      piexifjs.ImageIFD.YResolution,
      piexifjs.ImageIFD.ResolutionUnit,
    ]
    const necessaryExifTags = [
      piexifjs.ImageIFD.PixelXDimension,
      piexifjs.ImageIFD.PixelYDimension,
      piexifjs.ImageIFD.ColorSpace,
    ]

    if (exifObj['0th']) {
      exifObj['0th'] = Object.fromEntries(
        Object.entries(exifObj['0th']).filter(([key]) =>
          necessary0thTags.includes(Number(key))
        )
      )
    }
    if (exifObj['Exif']) {
      exifObj['Exif'] = Object.fromEntries(
        Object.entries(exifObj['Exif']).filter(([key]) =>
          necessaryExifTags.includes(Number(key))
        )
      )
    }
    modified = true
  }

  // Remove GPS if option is enabled
  if (options.removeGPS && exifObj['GPS']) {
    delete exifObj['GPS']
    modified = true
  }

  // Remove timestamps if option is enabled
  if (options.removeTimestamps) {
    const timestampTags = [
      piexifjs.ImageIFD.DateTime,
      piexifjs.ImageIFD.DateTimeOriginal,
      piexifjs.ImageIFD.DateTimeDigitized,
    ]
    if (exifObj['0th']) {
      timestampTags.forEach((tag) => {
        if (exifObj['0th'][tag]) {
          delete exifObj['0th'][tag]
          modified = true
        }
      })
    }
    if (exifObj['Exif']) {
      timestampTags.forEach((tag) => {
        if (exifObj['Exif'][tag]) {
          delete exifObj['Exif'][tag]
          modified = true
        }
      })
    }
  }

  if (!modified) {
    return { blob: file, wasCompressed: false }
  }

  try {
    const newBase64 = piexifjs.dump(exifObj)
    const newImageData = piexifjs.insert(newBase64, base64)
    const binaryString = atob(newImageData.split(',')[1])
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' })
    return { blob, wasCompressed: true }
  } catch {
    // Fallback: return original if EXIF manipulation fails
    return { blob: file, wasCompressed: false }
  }
}

// Process PNG, WebP, GIF with canvas re-encoding
async function processWithCanvas(
  file: File,
  targetMimeType: string
): Promise<{ blob: Blob; wasCompressed: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) {
            resolve({ blob, wasCompressed: true })
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        targetMimeType,
        0.95
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

// Process HEIC files - convert to JPEG
async function processHEIC(
  file: File,
  options: MetadataRemovalOptions
): Promise<{ blob: Blob; wasCompressed: boolean }> {
  try {
    // Convert HEIC to JPEG
    const jpegBlob = (await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.95,
    })) as Blob

    // HEIC conversion already strips metadata, but let's process again to be sure
    const jpegFile = new File([jpegBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg',
    })

    return await processJPEG(jpegFile, options)
  } catch (error) {
    throw new Error(`Failed to convert HEIC file: ${error}`)
  }
}

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:image/jpeg;base64,' + btoa(binary)
}
