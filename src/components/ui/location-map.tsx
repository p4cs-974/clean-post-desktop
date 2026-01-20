import { memo, useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface LocationMapProps {
  lat: number
  lng: number
  className?: string
  isClean?: boolean
}

// Custom pulsing marker SVG for warning state (orange)
function createCustomMarkerIcon(isClean: boolean) {
  const color = isClean ? '#22C55E' : '#F97316' // green-500 / orange-500
  const pulseColor = isClean ? 'rgba(34, 197, 94, 0.4)' : 'rgba(249, 115, 22, 0.4)'

  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <style>
        @keyframes pulse {
          0% { r: 8; opacity: 0.8; }
          100% { r: 18; opacity: 0; }
        }
        .pulse-ring {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          transform-origin: center;
        }
      </style>
      <!-- Pulse ring -->
      <circle class="pulse-ring" cx="20" cy="20" r="8" fill="${pulseColor}" />
      <!-- Outer ring -->
      <circle cx="20" cy="20" r="10" fill="${color}" opacity="0.3" />
      <!-- Inner dot -->
      <circle cx="20" cy="20" r="6" fill="${color}" />
      <!-- Center highlight -->
      <circle cx="18" cy="18" r="2" fill="white" opacity="0.6" />
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-location-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

// Pin marker for a more traditional look
function createPinMarkerIcon(isClean: boolean) {
  const color = isClean ? '#22C55E' : '#F97316' // green-500 / orange-500
  const shadowColor = isClean ? 'rgba(34, 197, 94, 0.3)' : 'rgba(249, 115, 22, 0.3)'

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="16" cy="38" rx="8" ry="3" fill="${shadowColor}" />
      <!-- Pin body -->
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
      <!-- Inner circle -->
      <circle cx="16" cy="16" r="8" fill="#262624"/>
      <!-- Center dot -->
      <circle cx="16" cy="16" r="4" fill="${color}"/>
      <!-- Highlight -->
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.3"/>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-pin-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
  })
}

// Component to invalidate map size after mount
function MapResizer() {
  const map = useMap()

  useEffect(() => {
    // Force map to recalculate size after container renders
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [map])

  return null
}

// Detect dark mode from document
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    checkDarkMode()

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return isDark
}

export const LocationMap = memo(function LocationMap({
  lat,
  lng,
  className,
  isClean = false
}: LocationMapProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const position: LatLngExpression = [lat, lng]
  const isDark = useIsDarkMode()

  // Create marker icon based on clean state
  const markerIcon = useMemo(() => createPinMarkerIcon(isClean), [isClean])

  // Tile layer URLs for light and dark mode
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

  return (
    <div className={cn('relative w-full h-full min-h-[144px]', className)}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse rounded-lg flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
            <span className="text-xs text-neutral-500">Loading map...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={false}
        touchZoom={false}
        className={cn(
          'w-full h-full rounded-lg transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ minHeight: '144px' }}
        whenReady={() => setIsLoaded(true)}
      >
        <MapResizer />
        <TileLayer
          url={tileUrl}
          attribution={attribution}
        />
        <Marker position={position} icon={markerIcon} />
      </MapContainer>
    </div>
  )
})

// Also export the custom marker creators for potential reuse
export { createCustomMarkerIcon, createPinMarkerIcon }
