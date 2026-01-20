import { memo, useState } from 'react'
import { cn } from '@/lib/utils'

interface LocationMapProps {
  lat: number
  lng: number
  className?: string
  isClean?: boolean
}

// Custom SVG marker component
function MapMarker({ isClean, className }: { isClean: boolean; className?: string }) {
  const color = isClean ? '#22C55E' : '#F97316' // green-500 / orange-500

  return (
    <svg
      width="24"
      height="32"
      viewBox="0 0 32 42"
      className={cn('drop-shadow-lg', className)}
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
    >
      {/* Pin body */}
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"
        fill={color}
      />
      {/* Inner circle */}
      <circle cx="16" cy="16" r="8" fill="#262624"/>
      {/* Center dot */}
      <circle cx="16" cy="16" r="4" fill={color}/>
      {/* Highlight */}
      <circle cx="12" cy="12" r="3" fill="white" opacity="0.3"/>
    </svg>
  )
}

// Pulsing dot marker for a modern look
function PulsingMarker({ isClean, className }: { isClean: boolean; className?: string }) {
  const color = isClean ? '#22C55E' : '#F97316'

  return (
    <div className={cn('relative', className)}>
      {/* Pulse ring */}
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />
      {/* Outer ring */}
      <div
        className="absolute inset-1 rounded-full"
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
      {/* Inner dot */}
      <div
        className="absolute inset-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {/* Highlight */}
      <div
        className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-white/60"
      />
    </div>
  )
}

export const LocationMap = memo(function LocationMap({
  lat,
  lng,
  className,
  isClean = false
}: LocationMapProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Generate multiple tile URLs to create a 3x3 grid for better coverage
  const zoom = 15
  const n = Math.pow(2, zoom)
  const centerX = Math.floor((lng + 180) / 360 * n)
  const centerY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n)

  // Create a 3x3 grid of tiles
  const tiles: { x: number; y: number; url: string }[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = centerX + dx
      const y = centerY + dy
      tiles.push({
        x: dx,
        y: dy,
        url: `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${x}/${y}.png`
      })
    }
  }

  return (
    <div className={cn('relative w-full h-full min-h-[144px] overflow-hidden rounded-lg bg-neutral-900', className)}>
      {/* Loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-neutral-800 animate-pulse flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
            <span className="text-xs text-neutral-500">Loading map...</span>
          </div>
        </div>
      )}

      {/* Tile grid container */}
      <div
        className={cn(
          'absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-300',
          imageLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          // Offset to center the middle tile
          transform: 'translate(-33.33%, -33.33%)',
          width: '300%',
          height: '300%'
        }}
      >
        {tiles.map((tile, i) => (
          <img
            key={i}
            src={tile.url}
            alt=""
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onLoad={i === 4 ? () => setImageLoaded(true) : undefined} // Center tile
            onError={i === 4 ? () => setImageError(true) : undefined}
          />
        ))}
      </div>

      {/* Fallback gradient background if tiles fail */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <PulsingMarker isClean={isClean} className="w-10 h-10" />
            </div>
            <p className="text-xs text-neutral-500">
              {lat.toFixed(4)}°, {lng.toFixed(4)}°
            </p>
          </div>
        </div>
      )}

      {/* Map marker overlay - centered */}
      {!imageError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <MapMarker isClean={isClean} className="-mt-5" />
        </div>
      )}

      {/* Vignette overlay for better aesthetics */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  )
})
