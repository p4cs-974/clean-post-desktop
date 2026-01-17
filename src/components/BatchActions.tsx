import { memo } from 'react'
import { Shield, Share, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { useFileStore } from '@/store/fileStore'
import { MediaType } from '@/types'
import { useSmartDownload } from '@/hooks/useSmartDownload'

export const BatchActions = memo(function BatchActions() {
  const files = useFileStore((state) => state.files)
  const processAll = useFileStore((state) => state.processAll)
  const clearCompleted = useFileStore((state) => state.clearCompleted)
  const ffmpegStatus = useFileStore((state) => state.ffmpegStatus)
  const { smartDownload, platform } = useSmartDownload()

  const idleCount = files.filter((f) => f.status === 'idle').length
  const completedCount = files.filter((f) => f.status === 'completed').length
  const imageCount = files.filter((f) => f.mediaType === MediaType.Image).length
  const videoCount = files.filter((f) => f.mediaType === MediaType.Video).length

  const hasFiles = files.length > 0
  const hasIdle = idleCount > 0
  const hasCompleted = completedCount > 0

  async function downloadAll() {
    const filesToDownload = files.filter(
      (f) => f.status === 'completed' && f.processedBlob
    )

    const filesForDownload = filesToDownload.map((file) => {
      const ext = file.originalName.split('.').pop()
      const newName = file.originalName.replace(
        `.${ext}`,
        `_clean.${file.mediaType === MediaType.Video ? 'mp4' : ext}`
      )
      return new File([file.processedBlob!], newName, { type: file.processedBlob!.type })
    })

    await smartDownload({
      files: filesForDownload,
      filename: filesForDownload.length === 1
        ? filesForDownload[0].name
        : `${filesForDownload.length} cleaned files`,
    })
  }

  return (
    <>
      {/* Desktop - Inline */}
      <div className="hidden md:block rounded-xl border bg-card p-4 shadow-sm">
        {hasFiles && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {completedCount > 0 ? (
                <span>{completedCount} files ready</span>
              ) : (
                <span>{files.length} file{files.length !== 1 ? 's' : ''} added</span>
              )}
              {imageCount > 0 || videoCount > 0 ? (
                <span className="ml-2">
                  • {imageCount > 0 && `${imageCount} image${imageCount !== 1 ? 's' : ''}`}
                  {imageCount > 0 && videoCount > 0 && ', '}
                  {videoCount > 0 && `${videoCount} video${videoCount !== 1 ? 's' : ''}`}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {hasIdle && (
                <Button
                  size="sm"
                  onClick={processAll}
                  disabled={ffmpegStatus === 'loading'}
                >
                  <Shield className="mr-1 h-4 w-4" />
                  Clean All
                </Button>
              )}

              {hasCompleted && (
                <>
                  <Button size="sm" variant="outline" onClick={downloadAll}>
                    <Share className="mr-1 h-4 w-4" />
                    Share All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearCompleted}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile - Sticky Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card shadow-lg safe-area-footer">
        <div className="flex items-center justify-between px-4 py-3">
          {hasFiles && (
            <>
              <div className="text-sm">
                <span className="font-medium">{files.length}</span>
                <span className="text-muted-foreground ml-1">files</span>
              </div>

              <div className="flex items-center gap-2">
                {hasIdle && (
                  <Button
                    size="sm"
                    onClick={processAll}
                    disabled={ffmpegStatus === 'loading'}
                  >
                    <Shield className="h-4 w-4" />
                    Clean All
                  </Button>
                )}

                {hasCompleted && (
                  <>
                    <Button size="sm" variant="outline" onClick={downloadAll}>
                      <Share className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Spacer for mobile sticky bar */}
      <div className="h-16 md:hidden safe-area-spacer" />
    </>
  )
})
