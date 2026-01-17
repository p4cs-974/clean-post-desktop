import { memo } from "react";
import { FileState, FileStatus, MediaType } from "@/types";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Trash2,
  Image as ImageIcon,
  Video,
  Shield,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useSmartDownload } from "@/hooks/useSmartDownload";
import { MetadataPreview } from "./MetadataPreview";
import { MetadataSkeleton } from "./MetadataSkeleton";
import { DownloadIcon } from "./ui/download";

interface FileItemProps {
  file: FileState;
  onProcess: (id: string) => void;
  onRemove: (id: string) => void;
}

export const FileItem = memo(function FileItem({ file, onProcess, onRemove }: FileItemProps) {
  const { smartDownload } = useSmartDownload();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleDownload = async () => {
    if (!file.processedBlob) return;

    const ext = file.originalName.split(".").pop();
    const newName = file.originalName.replace(
      `.${ext}`,
      `_clean.${file.mediaType === MediaType.Video ? "mp4" : ext}`,
    );

    const downloadFile = new File([file.processedBlob], newName, { type: file.processedBlob.type });
    await smartDownload({
      files: [downloadFile],
      filename: newName,
    });
  };

  const getMediaIcon = () => {
    return file.mediaType === MediaType.Image ? (
      <ImageIcon className="h-4 w-4" />
    ) : (
      <Video className="h-4 w-4" />
    );
  };

  const getStatusIcon = () => {
    switch (file.status) {
      case FileStatus.Completed:
        return <Check className="h-6 w-6 text-green-500" />;
      case FileStatus.Processing:
        return (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case FileStatus.Error:
        return <AlertTriangle className="h-6 w-6 text-destructive" />;
      default:
        return getMediaIcon();
    }
  };

  const isCompleted = file.status === FileStatus.Completed;
  const isProcessing = file.status === FileStatus.Processing;
  const hasError = file.status === FileStatus.Error;

  return (
    <div
      className={`
      group relative overflow-hidden rounded-2xl border bg-card
      dark:bg-gradient-to-b dark:from-card dark:to-card/90
      shadow-sm shadow-black/5 dark:shadow-black/20
      transition-all duration-300
      hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-primary/5
      hover:border-primary/30 hover:-translate-y-0.5
      animate-in slide-in-from-bottom-2 fade-in-0
      ${hasError ? "border-destructive/40 bg-destructive/5" : "border-border"}
      ${isCompleted ? "border-emerald-500/30" : ""}
    `}
    >
      {/* Top edge highlight for dark mode */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent dark:block hidden" />

      {/* Status indicator bar on the left */}
      <div
        className={`
        absolute left-0 top-0 bottom-0 w-1 transition-all duration-300
        ${isCompleted ? "bg-emerald-500" : isProcessing ? "bg-primary animate-pulse" : hasError ? "bg-destructive" : "bg-transparent"}
      `}
      />

      <div className="flex gap-4 p-4 pl-5">
        {/* Enhanced Thumbnail */}
        <div className="relative flex-shrink-0">
          <div
            className={`
            flex h-16 w-16 items-center justify-center rounded-xl overflow-hidden
            ring-1 ring-inset ring-black/5 dark:ring-white/10
            transition-all duration-300 bg-muted
            group-hover:ring-primary/30
            ${isCompleted ? "ring-emerald-500/30" : ""}
          `}
          >
            {file.thumbnail ? (
              <img
                src={file.thumbnail}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground">{getStatusIcon()}</div>
            )}
          </div>

          {/* Processing overlay on thumbnail */}
          {isProcessing && (
            <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-medium"
                title={file.originalName}
              >
                {file.originalName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(file.file.size)}</span>
                {isCompleted && file.processedBlob && (
                  <>
                    <span>→</span>
                    <span>{formatFileSize(file.processedBlob.size)}</span>
                  </>
                )}
              </div>
            </div>

            {/* Type badge */}
            {/*<Badge
              variant={file.mediaType === MediaType.Image ? 'default' : 'secondary'}
              className="flex-shrink-0"
            >
              {getMediaIcon()}
              <span className="ml-1">{file.mediaType === MediaType.Image ? 'IMAGE' : 'VIDEO'}</span>
            </Badge>*/}
          </div>

          {/* Metadata Preview */}
          {file.metadataLoading ? (
            <MetadataSkeleton />
          ) : file.metadata ? (
            <MetadataPreview metadata={file.metadata} isClean={isCompleted} options={file.options} />
          ) : null}

          {/* Progress bar */}
          {isProcessing && (
            <div className="space-y-1">
              <Progress value={50} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Removing metadata...
              </p>
            </div>
          )}

          {/* Error message */}
          {hasError && file.error && (
            <p className="text-xs text-destructive">{file.error}</p>
          )}

          {/* GIF warning */}
          {file.isGIF && (
            <p className="text-xs text-warning">
              ⚠️ GIF processing captures first frame only
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-end gap-2 mb-4">
        {file.status === FileStatus.Idle && (
          <Button size="sm" onClick={() => onProcess(file.id)}>
            <Shield className="mr-1 h-3 w-3" />
            Clean
          </Button>
        )}

        {isCompleted && (
          <>
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-0">
              <DownloadIcon size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </>
        )}

        {hasError && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onProcess(file.id)}
          >
            Retry
          </Button>
        )}

        <Button size="sm" variant="ghost" onClick={() => onRemove(file.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Success overlay with subtle glow */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle corner glow */}
          <div className="absolute -right-8 -top-8 h-20 w-20 bg-emerald-500/10 rounded-full blur-xl" />

          {/* Success badge */}
          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center">
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 animate-[success-pop_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
              <Check className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
})
