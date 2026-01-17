import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { UploadIcon } from "@/components/ui/upload";
import { useFileStore } from "@/store/fileStore";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

// Type for the UploadIcon ref
interface UploadIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export function FileUpload({
  onFilesSelected,
  accept = "image/*,video/*",
  multiple = true,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadIconRef = useRef<UploadIconHandle>(null);
  const hasFiles = useFileStore((state) => state.files.length > 0);

  // Start continuous animation on mount
  useEffect(() => {
    const interval = setInterval(() => {
      uploadIconRef.current?.startAnimation();
      setTimeout(() => uploadIconRef.current?.stopAnimation(), 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      onFilesSelected(fileArray);
    },
    [onFilesSelected],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden transition-all duration-300
        ${isDragging ? "scale-[1.01]" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={
        hasFiles
          ? "Add more files"
          : "Drop files here or click to upload images and videos"
      }
    >
      {/* Animated gradient border */}
      <div
        className={`
          absolute inset-0 rounded-2xl p-[2px] transition-opacity duration-300
          bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]
          ${isDragging ? "opacity-100 animate-[gradient-x_2s_ease_infinite]" : "opacity-40"}
        `}
      >
        <div className="absolute inset-[2px] rounded-2xl bg-card" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Inner content area with layered states */}
      <div className="relative rounded-2xl border border-transparent">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glow effect on drag */}
        <div
          className={`
          absolute inset-0 transition-opacity duration-300 pointer-events-none
          bg-gradient-radial from-primary/20 via-transparent to-transparent
          ${isDragging ? "opacity-100" : "opacity-0"}
        `}
        />

        {/* Compact "Add files" bar - always present, animates in when files exist */}
        <div
          className={`
            relative flex items-center justify-between px-5 transition-all duration-500 ease-out
            ${hasFiles ? "py-3.5 opacity-100" : "py-0 opacity-0 pointer-events-none"}
          `}
        >
          <span className="text-sm font-medium text-foreground">Add files</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30 transition-all duration-200 hover:scale-110 hover:border-primary/50">
            <Plus className="h-4 w-4 text-primary" strokeWidth={2.5} />
          </div>
        </div>

        {/* Full upload zone - animates out when files exist */}
        <div
          className={`
            grid transition-[grid-template-rows] duration-500 ease-out
            ${hasFiles ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}
          `}
        >
          <div className="overflow-hidden">
            <div className="relative flex flex-col items-center justify-center gap-5 py-14 px-6 min-h-[220px] md:min-h-[260px]">
              {/* Animated icon container */}
              <div className="relative">
                {/* Blur glow behind icon */}
                <div
                  className={`
                  absolute -inset-0.5 rounded-full blur-xl transition-all duration-500
                  ${isDragging ? "bg-primary/40 scale-150" : "bg-primary/20 scale-100"}
                `}
                />
                {/* Icon container with gradient */}
                <div
                  className={`
                  relative flex h-16 w-16 items-center justify-center rounded-2xl
                  bg-gradient-to-br from-primary/20 to-accent/10
                  border border-primary/30
                  transition-all duration-300 shadow-lg shadow-primary/10
                  ${isDragging ? "rotate-6 scale-110 border-primary/50" : ""}
                `}
                >
                  <UploadIcon
                    ref={uploadIconRef}
                    size={32}
                    className="text-primary"
                  />
                </div>
              </div>

              {/* Text with better hierarchy */}
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-foreground">
                  {isDragging ? "Release to protect" : "Drop files to clean"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or{" "}
                  <span className="text-primary font-medium hover:underline cursor-pointer">
                    browse your device
                  </span>
                </p>
              </div>

              {/* File type badges with hover states */}
              {/*<div className="flex flex-wrap items-center justify-center gap-2">
                {["JPEG", "PNG", "HEIC", "MP4", "MOV", "WebM"].map((type, i) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full
                               bg-secondary text-secondary-foreground border border-border
                               hover:bg-primary/10 hover:border-primary/30 hover:text-primary
                               transition-all duration-200"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {type}
                  </span>
                ))}
              </div>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
