declare module 'piexifjs' {
  export function load(data: string): any
  export function dump(exifObj: any): string
  export function insert(exifStr: string, file: string): string

  export namespace ImageIFD {
    const Orientation: number
    const XResolution: number
    const YResolution: number
    const ResolutionUnit: number
    const PixelXDimension: number
    const PixelYDimension: number
    const ColorSpace: number
    const DateTime: number
    const DateTimeOriginal: number
    const DateTimeDigitized: number
  }
}
