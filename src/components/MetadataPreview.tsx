import { memo, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Smartphone,
  AlertTriangle,
  Shield,
  Aperture,
  ExternalLink,
} from 'lucide-react'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { LocationMap } from './ui/location-map'
import type { MetadataInfo, GPSInfo, DeviceInfo, CameraSettings, TimestampInfo, MetadataRemovalOptions } from '@/types'
import { cn } from '@/lib/utils'

interface MetadataPreviewProps {
  metadata: MetadataInfo
  isClean: boolean
  options: MetadataRemovalOptions
}

export const MetadataPreview = memo(function MetadataPreview({ metadata, isClean, options }: MetadataPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Determine what was actually removed based on options
  const gpsRemoved = isClean && options.removeGPS
  const exifRemoved = isClean && options.removeExif
  const timestampsRemoved = isClean && options.removeTimestamps

  const hasAnyData = metadata.hasExif || metadata.hasGPS || metadata.hasTimestamps

  if (!hasAnyData) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-950/50 px-3 py-2.5 text-sm text-green-400">
        <Shield className="h-4 w-4" />
        <span className="font-medium">No sensitive metadata detected</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden transition-all duration-200',
        isClean
          ? 'border-green-500/50 bg-green-950/30'
          : 'border-orange-500/50 bg-orange-950/20'
      )}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center justify-between gap-3 p-3 text-left transition-colors',
          isClean ? 'hover:bg-green-950/30' : 'hover:bg-orange-950/30'
        )}
      >
        <div className="flex items-center gap-3">
          {/* Privacy Risk Indicator */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              isClean ? 'bg-green-500/20' : 'bg-orange-500/20'
            )}
          >
            {isClean ? (
              <Shield className="h-5 w-5 text-green-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            )}
          </div>

          <div>
            <p className={cn(
              'text-sm font-semibold',
              isClean ? 'text-green-300' : 'text-orange-300'
            )}>
              {isClean ? 'Metadata Removed' : 'Metadata Found'}
            </p>
            <p className="text-xs text-neutral-400">
              {isClean
                ? 'Your file is now private'
                : `Privacy risk: ${getRiskLabel(metadata.privacyRiskScore)}`}
            </p>
          </div>
        </div>

        {/* Quick badges and expand toggle */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            {metadata.hasGPS && <QuickBadge type="gps" isClean={gpsRemoved} />}
            {metadata.device && <QuickBadge type="device" isClean={exifRemoved} />}
            {metadata.hasTimestamps && <QuickBadge type="timestamp" isClean={timestampsRemoved} />}
          </div>

          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-4 border-t border-neutral-800 bg-neutral-900/50 px-3 pb-4 pt-4">
          {/* GPS Section */}
          {metadata.gps && (
            <GPSSection gps={metadata.gps} isClean={gpsRemoved} />
          )}

          {/* Device Section */}
          {metadata.device && (
            <>
              {metadata.gps && <Separator className="bg-neutral-800" />}
              <DeviceSection device={metadata.device} isClean={exifRemoved} />
            </>
          )}

          {/* Camera Settings */}
          {metadata.camera && (
            <>
              <Separator className="bg-neutral-800" />
              <CameraSection camera={metadata.camera} isClean={exifRemoved} />
            </>
          )}

          {/* Timestamps */}
          {metadata.timestamps && (
            <>
              <Separator className="bg-neutral-800" />
              <TimestampSection timestamps={metadata.timestamps} isClean={timestampsRemoved} />
            </>
          )}
        </div>
      )}
    </div>
  )
})

// Quick badge for collapsed view
function QuickBadge({ type, isClean }: { type: 'gps' | 'device' | 'timestamp'; isClean: boolean }) {
  const config = {
    gps: {
      icon: MapPin,
      label: 'GPS',
      cleanClass: 'border-green-500/50 bg-green-950/50 text-green-400',
      dirtyClass: 'border-orange-500/50 bg-orange-950/50 text-orange-400',
    },
    device: {
      icon: Smartphone,
      label: 'Device',
      cleanClass: 'border-green-500/50 bg-green-950/50 text-green-400',
      dirtyClass: 'border-blue-500/50 bg-blue-950/50 text-blue-400',
    },
    timestamp: {
      icon: Clock,
      label: 'Date',
      cleanClass: 'border-green-500/50 bg-green-950/50 text-green-400',
      dirtyClass: 'border-yellow-500/50 bg-yellow-950/50 text-yellow-400',
    },
  }

  const { icon: Icon, label, cleanClass, dirtyClass } = config[type]

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 text-xs font-medium', isClean ? cleanClass : dirtyClass)}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  )
}

// Interactive map preview using Leaflet
function MapPreview({ lat, lng, isClean }: { lat: number; lng: number; isClean: boolean }) {
  const linkUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border',
      isClean ? 'border-neutral-700' : 'border-orange-500/50'
    )}>
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className={cn(
          'relative w-full h-36',
          isClean && 'opacity-40 grayscale'
        )}>
          <LocationMap lat={lat} lng={lng} className="rounded-lg" />
        </div>
        {/* Click to open label */}
        <div className="absolute bottom-2 right-2 z-[1000]">
          <span className="text-xs text-white bg-black/70 px-2 py-1 rounded flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            Open in Maps
          </span>
        </div>
      </a>
      {isClean && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[1000]">
          <span className="text-sm font-medium text-green-400 bg-green-950/90 px-3 py-1.5 rounded">
            Location Removed
          </span>
        </div>
      )}
    </div>
  )
}

// GPS Section
function GPSSection({ gps, isClean }: { gps: GPSInfo; isClean: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className={cn('h-4 w-4', isClean ? 'text-green-400' : 'text-orange-400')} />
          <span className="text-sm font-semibold text-neutral-200">Location</span>
        </div>
        {!isClean && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px] px-2 py-0.5 font-semibold">
            HIGH RISK
          </Badge>
        )}
      </div>

      {/* Map Preview */}
      <MapPreview lat={gps.latitude} lng={gps.longitude} isClean={isClean} />

      {/* Coordinates */}
      <div
        className={cn(
          'rounded-md p-3 font-mono text-sm',
          isClean ? 'bg-neutral-800/50' : 'bg-orange-500/10 border border-orange-500/30'
        )}
      >
        <p className={cn('font-semibold text-neutral-100', isClean && 'line-through opacity-50')}>
          {gps.formattedCoords}
        </p>
        {gps.altitude && (
          <p className={cn('text-neutral-400 mt-1', isClean && 'line-through opacity-50')}>
            Altitude: {gps.altitude.toFixed(1)}m
          </p>
        )}
      </div>

      {!isClean && (
        <p className="text-sm text-orange-400 font-medium">
          Anyone with this image can see exactly where it was taken
        </p>
      )}
    </div>
  )
}

// Device Section
function DeviceSection({ device, isClean }: { device: DeviceInfo; isClean: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Smartphone className={cn('h-4 w-4', isClean ? 'text-green-400' : 'text-blue-400')} />
        <span className="text-sm font-semibold text-neutral-200">Device</span>
      </div>

      <div className={cn(
        'space-y-2 text-sm rounded-md p-3',
        isClean ? 'bg-neutral-800/50' : 'bg-blue-500/10 border border-blue-500/30'
      )}>
        {device.make && <MetadataRow label="Make" value={device.make} isClean={isClean} />}
        {device.model && <MetadataRow label="Model" value={device.model} isClean={isClean} />}
        {device.software && <MetadataRow label="Software" value={device.software} isClean={isClean} />}
        {device.lens && <MetadataRow label="Lens" value={device.lens} isClean={isClean} />}
      </div>
    </div>
  )
}

// Camera Settings Section
function CameraSection({ camera, isClean }: { camera: CameraSettings; isClean: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Aperture className={cn('h-4 w-4', isClean ? 'text-green-400' : 'text-purple-400')} />
        <span className="text-sm font-semibold text-neutral-200">Camera Settings</span>
      </div>

      <div className={cn('flex flex-wrap gap-2', isClean && 'opacity-50')}>
        {camera.exposureTime && <SettingBadge label={camera.exposureTime} isClean={isClean} />}
        {camera.fNumber && <SettingBadge label={`f/${camera.fNumber}`} isClean={isClean} />}
        {camera.iso && <SettingBadge label={`ISO ${camera.iso}`} isClean={isClean} />}
        {camera.focalLength && <SettingBadge label={camera.focalLength} isClean={isClean} />}
        {camera.flash && <SettingBadge label={camera.flash} isClean={isClean} />}
      </div>
    </div>
  )
}

// Timestamp Section
function TimestampSection({ timestamps, isClean }: { timestamps: TimestampInfo; isClean: boolean }) {
  const formatDate = (date?: Date) => {
    if (!date) return null
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className={cn('h-4 w-4', isClean ? 'text-green-400' : 'text-yellow-400')} />
        <span className="text-sm font-semibold text-neutral-200">Timestamps</span>
      </div>

      <div className={cn(
        'space-y-2 text-sm rounded-md p-3',
        isClean ? 'bg-neutral-800/50' : 'bg-yellow-500/10 border border-yellow-500/30'
      )}>
        {timestamps.dateTimeOriginal && (
          <MetadataRow label="Taken" value={formatDate(timestamps.dateTimeOriginal)!} isClean={isClean} />
        )}
        {timestamps.dateTimeModified && (
          <MetadataRow label="Modified" value={formatDate(timestamps.dateTimeModified)!} isClean={isClean} />
        )}
      </div>
    </div>
  )
}

// Utility components
function MetadataRow({
  label,
  value,
  isClean,
}: {
  label: string
  value: string
  isClean: boolean
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-neutral-400">{label}</span>
      <span className={cn('text-right truncate text-neutral-100', isClean && 'line-through opacity-50')}>
        {value}
      </span>
    </div>
  )
}

function SettingBadge({ label, isClean }: { label: string; isClean: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md bg-neutral-800 border border-neutral-700 px-2.5 py-1 text-sm text-neutral-200',
        isClean && 'line-through'
      )}
    >
      {label}
    </span>
  )
}

function getRiskLabel(score: number): string {
  if (score >= 7) return 'High'
  if (score >= 4) return 'Medium'
  if (score >= 1) return 'Low'
  return 'None'
}
