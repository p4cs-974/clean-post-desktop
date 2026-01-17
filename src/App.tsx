import { useCallback, useEffect, useState } from "react";
import { useFileStore } from "@/store/fileStore";
import { useShallow } from "zustand/react/shallow";
import { FileUpload } from "@/components/FileUpload";
import { FileItem } from "@/components/FileItem";
import { MetadataToggles } from "@/components/MetadataToggles";
import { BatchActions } from "@/components/BatchActions";
import { FFmpegLoadingModal } from "@/components/FFmpegLoadingModal";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { processImage } from "@/lib/processors/imageProcessor";
import { processVideo } from "@/lib/processors/videoProcessor";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { FileStatus, MediaType } from "@/types";
import {
  readImageMetadata,
  readVideoMetadata,
  generateImageThumbnail,
  generateVideoThumbnail,
} from "@/lib/metadata/metadataReader";
import { VibeKanbanWebCompanion } from "vibe-kanban-web-companion";

function App() {
  const {
    files,
    globalOptions,
    ffmpegStatus,
    addFile,
    updateFile,
    removeFile,
    setGlobalOptions,
    setFFmpegStatus,
    setFFmpegProgress,
  } = useFileStore(
    useShallow((state) => ({
      files: state.files,
      globalOptions: state.globalOptions,
      ffmpegStatus: state.ffmpegStatus,
      addFile: state.addFile,
      updateFile: state.updateFile,
      removeFile: state.removeFile,
      setGlobalOptions: state.setGlobalOptions,
      setFFmpegStatus: state.setFFmpegStatus,
      setFFmpegProgress: state.setFFmpegProgress,
    }))
  );

  const { ensureFFmpegLoaded, getLoadProgress } = useFFmpeg();
  const [showFFmpegModal, setShowFFmpegModal] = useState(false);

  // Load FFmpeg when first video is added
  useEffect(() => {
    const hasVideo = files.some((f) => f.mediaType === MediaType.Video);
    if (hasVideo && ffmpegStatus === "idle") {
      loadFFmpegForVideo();
    }
  }, [files, ffmpegStatus]);

  const loadFFmpegForVideo = async () => {
    setFFmpegStatus("loading");
    setShowFFmpegModal(true);

    try {
      await ensureFFmpegLoaded((progress) => {
        setFFmpegProgress(progress);
      });
      setFFmpegStatus("loaded");
      setShowFFmpegModal(false);
    } catch {
      setFFmpegStatus("error");
      setShowFFmpegModal(false);
    }
  };

  const handleFilesSelected = async (selectedFiles: File[]) => {
    for (const file of selectedFiles) {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        addFile(file);
        // Get the just-added file's ID from the store
        const currentFiles = useFileStore.getState().files;
        const addedFile = currentFiles[currentFiles.length - 1];
        if (addedFile) {
          updateFile(addedFile.id, {
            error: "Unsupported format",
            status: FileStatus.Error,
          });
        }
        continue;
      }

      // Add file with metadata loading state
      addFile(file);

      // Get the just-added file's ID from the store
      const currentFiles = useFileStore.getState().files;
      const addedFile = currentFiles[currentFiles.length - 1];
      if (!addedFile) continue;

      // Update to show metadata is loading
      updateFile(addedFile.id, { metadataLoading: true });

      // Read metadata and generate thumbnail in parallel (don't await, let it run async)
      const loadMetadataAndThumbnail = async () => {
        try {
          // Read metadata and generate thumbnail in parallel
          const [metadata, thumbnail] = await Promise.all([
            isImage ? readImageMetadata(file) : readVideoMetadata(file),
            isImage
              ? generateImageThumbnail(file)
              : generateVideoThumbnail(file),
          ]);

          updateFile(addedFile.id, {
            metadata,
            thumbnail,
            metadataLoading: false,
          });
        } catch {
          // If metadata reading fails, just mark as not loading
          updateFile(addedFile.id, { metadataLoading: false });
        }
      };

      // Fire and forget - don't block the upload loop
      loadMetadataAndThumbnail();
    }
  };

  const handleProcess = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;

      updateFile(id, { status: FileStatus.Processing });

      try {
        if (file.mediaType === MediaType.Image) {
          const { blob } = await processImage(file.file, file.options);
          updateFile(id, {
            status: FileStatus.Completed,
            processedBlob: blob,
          });
        } else {
          // Video processing
          if (ffmpegStatus !== "loaded") {
            throw new Error("Video engine not loaded");
          }

          const ffmpeg = await ensureFFmpegLoaded();

          const { blob } = await processVideo(
            file.file,
            ffmpeg,
            {
              removeExif: file.options.removeExif,
              removeGPS: file.options.removeGPS,
              removeTimestamps: file.options.removeTimestamps,
            },
            (_progress) => {
              // Update file with progress
            },
          );

          updateFile(id, {
            status: FileStatus.Completed,
            processedBlob: blob,
          });
        }
      } catch (error) {
        updateFile(id, {
          status: FileStatus.Error,
          error: error instanceof Error ? error.message : "Processing failed",
        });
      }
    },
    [files, updateFile, ffmpegStatus, ensureFFmpegLoaded]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile]
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Vibe Kanban Web Companion */}
      <VibeKanbanWebCompanion />

      {/* Header */}
      <header className="sticky top-0 z-50 safe-area-header">
        <div className="container mx-auto max-w-2xl px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo with gradient background and glow */}
              {/*<div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur opacity-40" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                  <Shield className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>*/}
              <div className="z-50">
                <h1 className="text-xl font-bold tracking-tight">CleanPost</h1>
                <p className="text-sm text-muted-foreground">
                  Protect your privacy
                </p>
              </div>
            </div>

            {/* Theme Switch */}
            <div className="z-50">
              <ThemeSwitch />
            </div>
          </div>
        </div>
        <ProgressiveBlur position="top" height="100%"></ProgressiveBlur>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="relative z-10 container mx-auto max-w-2xl px-4 py-8 space-y-6 overflow-y-auto"
      >
        {/* Upload Zone */}
        <FileUpload onFilesSelected={handleFilesSelected} multiple />

        {/* Metadata Toggles - Show when files exist */}
        {files.length > 0 && (
          <MetadataToggles
            removeGPS={globalOptions.removeGPS}
            removeExif={globalOptions.removeExif}
            removeTimestamps={globalOptions.removeTimestamps}
            onToggleGPS={(checked) => setGlobalOptions({ removeGPS: checked })}
            onToggleExif={(checked) =>
              setGlobalOptions({ removeExif: checked })
            }
            onToggleTimestamps={(checked) =>
              setGlobalOptions({ removeTimestamps: checked })
            }
          />
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onProcess={handleProcess}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-3">
            {/*<div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">*/}
            {/* Glow effect */}
            {/*<div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
                <Shield className="h-8 w-8 text-primary" />
              </div>*/}
            {/*</div>*/}
            <h3 className="text-lg font-semibold mb-2">
              Your files stay private
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              All processing happens on your device. Nothing is ever uploaded to
              any server.
            </p>
          </div>
        )}
      </main>

      {/* Batch Actions */}
      <BatchActions />

      {/* FFmpeg Loading Modal */}
      {showFFmpegModal && (
        <FFmpegLoadingModal
          progress={getLoadProgress()}
          onCancel={() => setShowFFmpegModal(false)}
        />
      )}

      {/* PWA Update Prompt */}
      <PWAUpdatePrompt />
    </div>
  );
}

export default App;
