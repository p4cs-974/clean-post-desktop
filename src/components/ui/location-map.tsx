import { memo, useEffect, useRef, useId } from 'react'
import { cn } from '@/lib/utils'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  lat: number
  lng: number
  className?: string
}

export const LocationMap = memo(function LocationMap({ lat, lng, className }: LocationMapProps) {
  const uniqueId = useId()
  const mapRef = useRef<L.Map | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Prevent double initialization from StrictMode/HMR
    if (initializedRef.current) return
    initializedRef.current = true

    const container = document.getElementById(uniqueId)
    if (!container) return

    import('leaflet').then((L) => {
      // Double check container still exists and map not created
      if (!document.getElementById(uniqueId)) return
      if (mapRef.current) return

      const map = L.map(container, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
      })

      // Use Stadia Maps which supports CORS properly
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        crossOrigin: 'anonymous',
      }).addTo(map)

      const icon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className: 'bg-transparent border-none',
      })

      L.marker([lat, lng], { icon }).addTo(map)

      mapRef.current = map

      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      initializedRef.current = false
    }
  }, [lat, lng, uniqueId])

  return (
    <div
      id={uniqueId}
      className={cn('h-full w-full', className)}
    />
  )
})
