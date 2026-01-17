import { memo } from 'react'
import { MapPin, Camera, Clock } from 'lucide-react'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Separator } from './ui/separator'

interface MetadataTogglesProps {
  removeGPS: boolean
  removeExif: boolean
  removeTimestamps: boolean
  onToggleGPS: (checked: boolean) => void
  onToggleExif: (checked: boolean) => void
  onToggleTimestamps: (checked: boolean) => void
}

export const MetadataToggles = memo(function MetadataToggles({
  removeGPS,
  removeExif,
  removeTimestamps,
  onToggleGPS,
  onToggleExif,
  onToggleTimestamps,
}: MetadataTogglesProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-semibold">Privacy Settings</h3>

      <div className="mt-4 space-y-4">
        {/* GPS Toggle */}
        <ToggleRow
          icon={<MapPin className="h-5 w-5 text-orange-500" />}
          title="Remove GPS Location (Recommended)"
          description="Strips coordinates from files"
          checked={removeGPS}
          onCheckedChange={onToggleGPS}
          iconColor="text-orange-500"
        />

        <Separator />

        {/* EXIF Toggle */}
        <ToggleRow
          icon={<Camera className="h-5 w-5 text-blue-500" />}
          title="Remove Camera Info (Recommended)"
          description="Device model, lens, settings"
          checked={removeExif}
          onCheckedChange={onToggleExif}
          iconColor="text-blue-500"
        />

        <Separator />

        {/* Timestamps Toggle */}
        <ToggleRow
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          title="Remove Timestamps"
          description="Creation & modification dates"
          checked={removeTimestamps}
          onCheckedChange={onToggleTimestamps}
          iconColor="text-yellow-600"
        />
      </div>
    </div>
  )
})

interface ToggleRowProps {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  iconColor: string
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 space-y-0.5">
        <Label htmlFor={title} className="text-sm font-medium">
          {title}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={title}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}
