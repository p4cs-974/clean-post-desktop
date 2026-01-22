import {
  useCallback,
  useState,
  startTransition,
  lazy,
  Suspense,
} from "react";
import { Settings } from "lucide-react";
import { UserButton, SignInButton } from "@clerk/clerk-react";
import { useFileStore } from "@/store/fileStore";
import { useMutation } from "convex/react";
import { FileUpload } from "@/components/FileUpload";
import { FileItem } from "@/components/FileItem";
import { MetadataToggles } from "@/components/MetadataToggles";
import { BatchActions } from "@/components/BatchActions";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { AuthGuard } from "@/components/AuthGuard";
import { useAnonymous } from "@/contexts/AnonymousContext";
import { UserStats } from "@/components/UserStats";
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
import { api } from "../convex/_generated/api";

// Lazy load heavy components (bundle-dynamic-imports)
const SettingsModal = lazy(() =>
  import("@/components/SettingsModal").then((m) => ({ default: m.SettingsModal }))
);
const FFmpegLoadingModal = lazy(() =>
  import("@/components/FFmpegLoadingModal").then((m) => ({
    default: m.FFmpegLoadingModal,
  }))
);
const PWAUpdatePrompt = lazy(() =>
  import("@/components/PWAUpdatePrompt").then((m) => ({
    default: m.PWAUpdatePrompt,
  }))
);

function App() {
  const { isAnonymous } = useAnonymous();

  // Split selectors for better re-render optimization (rerender-lazy-state-init)
  const files = useFileStore((state) => state.files);
  const globalOptions = useFileStore((state) => state.globalOptions);
  const ffmpegStatus = useFileStore((state) => state.ffmpegStatus);

  // Actions don't need shallow comparison - they're stable
  const addFile = useFileStore((state) => state.addFile);
  const updateFile = useFileStore((state) => state.updateFile);
  const removeFile = useFileStore((state) => state.removeFile);
  const setGlobalOptions = useFileStore((state) => state.setGlobalOptions);
  const setFFmpegStatus = useFileStore((state) => state.setFFmpegStatus);
  const setFFmpegProgress = useFileStore((state) => state.setFFmpegProgress);

  const { ensureFFmpegLoaded, getLoadProgress } = useFFmpeg();
  const [showFFmpegModal, setShowFFmpegModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Usage tracking mutation
  const trackUsage = useMutation(api.usage.trackUsageBatch);

  // Defer FFmpeg loading until needed (async-dependencies)
  // Removed auto-load effect - FFmpeg loads when user clicks Clean on a video

  const loadFFmpegForVideo = useCallback(async () => {
    if (ffmpegStatus === "loaded") return;

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
  }, [ffmpegStatus, setFFmpegStatus, setFFmpegProgress, ensureFFmpegLoaded]);

  const handleFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      // Process all files and collect metadata loading promises (async-parallel)
      const fileProcessingPromises = selectedFiles.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          addFile(file);
          const currentFiles = useFileStore.getState().files;
          const addedFile = currentFiles[currentFiles.length - 1];
          if (addedFile) {
            updateFile(addedFile.id, {
              error: "Unsupported format",
              status: FileStatus.Error,
            });
          }
          return;
        }

        addFile(file);
        const currentFiles = useFileStore.getState().files;
        const addedFile = currentFiles[currentFiles.length - 1];
        if (!addedFile) return;

        updateFile(addedFile.id, { metadataLoading: true });

        try {
          const [metadata, thumbnail] = await Promise.all([
            isImage ? readImageMetadata(file) : readVideoMetadata(file),
            isImage ? generateImageThumbnail(file) : generateVideoThumbnail(file),
          ]);

          // Use startTransition for non-urgent metadata updates (rerender-transitions)
          startTransition(() => {
            updateFile(addedFile.id, {
              metadata,
              thumbnail,
              metadataLoading: false,
            });
          });
        } catch {
          startTransition(() => {
            updateFile(addedFile.id, { metadataLoading: false });
          });
        }
      });

      // Process all files in parallel
      await Promise.all(fileProcessingPromises);
    },
    [addFile, updateFile]
  );

  const handleProcess = useCallback(
    async (id: string) => {
      const file = useFileStore.getState().files.find((f) => f.id === id);
      if (!file) return;

      updateFile(id, { status: FileStatus.Processing });

      try {
        if (file.mediaType === MediaType.Image) {
          const { blob } = await processImage(file.file, file.options);
          updateFile(id, {
            status: FileStatus.Completed,
            processedBlob: blob,
          });

          // Fire-and-forget tracking (async-defer-await)
          trackUsage({
            totalFiles: 1,
            gpsRemovals: file.options.removeGPS ? 1 : undefined,
            cameraInfoRemovals: file.options.removeExif ? 1 : undefined,
            timestampRemovals: file.options.removeTimestamps ? 1 : undefined,
          }).catch((err) => console.error("Failed to track usage:", err));
        } else {
          // Video processing - load FFmpeg if needed
          if (ffmpegStatus !== "loaded") {
            await loadFFmpegForVideo();
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
            }
          );

          updateFile(id, {
            status: FileStatus.Completed,
            processedBlob: blob,
          });

          // Fire-and-forget tracking (async-defer-await)
          trackUsage({
            totalFiles: 1,
            gpsRemovals: file.options.removeGPS ? 1 : undefined,
            cameraInfoRemovals: file.options.removeExif ? 1 : undefined,
            timestampRemovals: file.options.removeTimestamps ? 1 : undefined,
          }).catch((err) => console.error("Failed to track usage:", err));
        }
      } catch (error) {
        updateFile(id, {
          status: FileStatus.Error,
          error: error instanceof Error ? error.message : "Processing failed",
        });
      }
    },
    [updateFile, ffmpegStatus, loadFFmpegForVideo, ensureFFmpegLoaded, trackUsage]
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile]
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background relative">
        {/* Vibe Kanban Web Companion */}
        <VibeKanbanWebCompanion />

        {/* Header */}
        <header className="sticky top-0 z-50 safe-area-header">
          <div className="container mx-auto max-w-2xl px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="z-50">
                  <h1 className="text-xl font-bold tracking-tight">
                    CleanPost
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Protect your privacy
                  </p>
                </div>
              </div>

              {/* Theme Switch */}
              <div className="flex items-center gap-3 z-50">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                {isAnonymous ? (
                  <SignInButton mode="modal">
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                      Sign in
                    </button>
                  </SignInButton>
                ) : (
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-9 w-9",
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                )}
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
              onToggleGPS={(checked) =>
                setGlobalOptions({ removeGPS: checked })
              }
              onToggleExif={(checked) =>
                setGlobalOptions({ removeExif: checked })
              }
              onToggleTimestamps={(checked) =>
                setGlobalOptions({ removeTimestamps: checked })
              }
            />
          )}

          {/* File List with content-visibility optimization (rendering-content-visibility) */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  style={{ contentVisibility: "auto", containIntrinsicSize: "0 120px" }}
                >
                  <FileItem
                    file={file}
                    onProcess={handleProcess}
                    onRemove={handleRemove}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {files.length === 0 && <UserStats />}
        </main>

        {/* Batch Actions */}
        <BatchActions />

        {/* Lazy loaded modals with Suspense (async-suspense-boundaries) */}
        <Suspense fallback={null}>
          {showFFmpegModal && (
            <FFmpegLoadingModal
              progress={getLoadProgress()}
              onCancel={() => setShowFFmpegModal(false)}
            />
          )}
        </Suspense>

        <Suspense fallback={null}>
          <PWAUpdatePrompt />
        </Suspense>

        <Suspense fallback={null}>
          {showSettings && (
            <SettingsModal
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
          )}
        </Suspense>
      </div>
    </AuthGuard>
  );
}

export default App;
