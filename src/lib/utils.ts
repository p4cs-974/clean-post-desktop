import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface PlatformInfo {
  isMobile: boolean
  isIOS: boolean
  isDesktop: boolean
  canUseWebShare: boolean
}

export function getPlatformInfo(): PlatformInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isIOS: false,
      isDesktop: true,
      canUseWebShare: false,
    }
  }

  const userAgent = navigator.userAgent
  const isIOS =
    /iPad|iPhone|iPod/.test(userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /Android/.test(userAgent)
  const isMobile = isIOS || isAndroid

  return {
    isMobile,
    isIOS,
    isDesktop: !isMobile,
    canUseWebShare: 'share' in navigator,
  }
}
