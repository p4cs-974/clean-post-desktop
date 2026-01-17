import { Film } from 'lucide-react'
import { Progress } from './ui/progress'

interface FFmpegLoadingModalProps {
  progress: number
  onCancel?: () => void
}

export function FFmpegLoadingModal({ progress, onCancel }: FFmpegLoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-xl animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Film className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Loading Video Engine</h3>
            <p className="text-sm text-muted-foreground">First time only</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground text-center">
            {progress < 100 ? `${progress}%` : 'Almost ready...'}
          </p>
        </div>

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center mb-4">
          Downloading video processing engine (~30 MB).<br />
          This will be cached for offline use.
        </p>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
