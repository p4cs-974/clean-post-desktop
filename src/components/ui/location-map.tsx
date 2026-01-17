import { memo, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import type { LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LocationMapProps {
  lat: number
  lng: number
  className?: string
}

export const LocationMap = memo(function LocationMap({ lat, lng, className }: LocationMapProps) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const position: LatLngExpression = [lat, lng]

  // Load leaflet dynamically for icon fix
  useEffect(() => {
    import('leaflet').then((leaflet) => {
      // Fix default marker icon issue with bundlers
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      setL(leaflet)
    })
  }, [])

  if (!L) {
    return (
      <div className={`bg-neutral-800 animate-pulse rounded-lg ${className}`} />
    )
  }

  return (
    <MapContainer
      center={position}
      zoom={14}
      scrollWheelZoom={false}
      dragging={false}
      zoomControl={false}
      attributionControl={false}
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={position} />
    </MapContainer>
  )
})
