# CleanPost Desktop - Implementation Plan

A privacy-first PWA for removing metadata from images and videos before sharing on social media. All processing happens client-side on the user's device.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** + **Shadcn/ui** (Radix UI primitives)
- **Zustand** for state management
- **piexifjs** + **exifr** for image metadata
- **heic2any** for HEIC conversion
- **FFmpeg.wasm** for video metadata removal
- **vite-plugin-pwa** for PWA functionality
- **Web Share API** for native mobile sharing

## File Structure

```
clean-post-desktop/
├── public/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   ├── favicon.ico
│   └── mask-icon.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn components
│   │   ├── FileUpload.tsx
│   │   ├── FileItem.tsx
│   │   ├── MetadataToggles.tsx
│   │   ├── BatchActions.tsx
│   │   ├── PWAUpdatePrompt.tsx
│   │   └── ShareButton.tsx
│   ├── hooks/
│   │   ├── usePWA.ts
│   │   ├── useFFmpeg.ts
│   │   └── useWebShare.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── metadata/
│   │   │   └── metadataReader.ts
│   │   └── processors/
│   │       ├── imageProcessor.ts
│   │       └── videoProcessor.ts
│   ├── store/
│   │   └── fileStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Implementation Steps

### Phase 1: Project Setup

1. **Initialize Vite project**
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

2. **Install dependencies**
   - Core: `react`, `react-dom`, `zustand`
   - Styling: `tailwindcss`, `postcss`, `autoprefixer`, `tailwindcss-animate`
   - UI: `@radix-ui/react-*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`
   - Processing: `piexifjs`, `exifr`, `heic2any`, `@ffmpeg/ffmpeg`, `@ffmpeg/util`
   - Files: `jszip`, `file-saver`
   - PWA: `vite-plugin-pwa`

3. **Configure Vite** with:
   - Path aliases (`@/` -> `./src/`)
   - CORS headers for FFmpeg.wasm (`Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy`)
   - vite-plugin-pwa with manifest and workbox settings
   - Exclude FFmpeg from optimizeDeps

4. **Configure Tailwind** with CSS variables for theming (copy from clean-post-cc)

5. **Copy Shadcn/ui components** from clean-post-cc:
   - `button.tsx`, `card.tsx`, `badge.tsx`, `alert.tsx`
   - `label.tsx`, `switch.tsx`, `progress.tsx`, `separator.tsx`

### Phase 2: Core Types & State

6. **Create type definitions** (`src/types/index.ts`):
   - `FileStatus`, `MediaType`
   - `MetadataInfo`, `MetadataRemovalOptions`, `FileState`
   - `FFmpegStatus` (for video processing state)
   - Custom error classes: `UnsupportedFormatError`, `FileSizeError`, `ProcessingError`, `FFmpegLoadError`

7. **Create Zustand store** (`src/store/fileStore.ts`):
   - Extend clean-post-cc store with:
     - `mediaType` field on `FileState`
     - `ffmpegStatus`, `ffmpegProgress` state
     - `setFFmpegStatus`, `setFFmpegProgress` actions

### Phase 3: Image Processing

8. **Copy image processor** from clean-post-cc (`src/lib/processors/imageProcessor.ts`):
   - JPEG: piexifjs for selective EXIF removal
   - PNG/WebP/GIF: Canvas re-encoding
   - HEIC: heic2any conversion then JPEG processing

9. **Copy metadata reader** from clean-post-cc (`src/lib/metadata/metadataReader.ts`):
   - Uses exifr for comprehensive metadata parsing
   - Thumbnail generation for images and videos

### Phase 4: Video Processing

10. **Create FFmpeg hook** (`src/hooks/useFFmpeg.ts`):
    - Lazy-load FFmpeg.wasm when first video added
    - Cache FFmpeg instance as singleton
    - Track loading progress for UI feedback
    - Load from CDN: `https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm`

11. **Create video processor** (`src/lib/processors/videoProcessor.ts`):
    - Use `-map_metadata -1` to strip all metadata
    - Use `-c copy` for fast stream copy (no re-encoding)
    - Use `-movflags +faststart` for MP4 optimization
    - Support MP4, MOV (convert to MP4), WebM
    - Max file size: 500MB

### Phase 5: PWA Setup

12. **Configure vite-plugin-pwa** in `vite.config.ts`:
    - Manifest with app name, icons, theme color
    - Share target for receiving shared media
    - Workbox for caching (including FFmpeg WASM files)
    - Auto-update registration

13. **Create PWA assets** in `/public`:
    - Generate icons: 192x192, 512x512, apple-touch-icon
    - Create favicon.ico
    - Create mask-icon.svg

14. **Create PWA hook** (`src/hooks/usePWA.ts`):
    - Service worker registration
    - Update prompt handling

15. **Create PWAUpdatePrompt component**:
    - Show toast when update available
    - "Update" and "Later" buttons

### Phase 6: Web Share API

16. **Create useWebShare hook** (`src/hooks/useWebShare.ts`):
    - Check `navigator.share` and `navigator.canShare` support
    - Share function that accepts files

17. **Create ShareButton component**:
    - Only render if Web Share API supported
    - Convert processed blob to File for sharing

### Phase 7: UI Components

18. **Create FileUpload** (adapt from clean-post-cc):
    - Drag-drop zone with visual feedback
    - Accept `image/*,video/*`
    - Keyboard accessible

19. **Create FileItem** (extend from clean-post-cc):
    - Show media type badge (image/video)
    - Show metadata badges (GPS, EXIF, Timestamps)
    - Process/Download/Share/Remove buttons
    - Progress indicator during processing

20. **Create MetadataToggles** (copy from clean-post-cc):
    - Global toggles for removeExif, removeGPS, removeTimestamps
    - Switch components with labels

21. **Create BatchActions** (extend from clean-post-cc):
    - Process All / Download All buttons
    - Share All (if Web Share supported)
    - File count statistics
    - FFmpeg loading indicator

### Phase 8: Main App

22. **Create App.tsx**:
    - Header with privacy badge
    - FFmpeg loading indicator (when loading)
    - FileUpload zone
    - MetadataToggles (when files exist)
    - File list
    - BatchActions (sticky on mobile)
    - PWAUpdatePrompt

23. **Implement processing flow**:
    - Images: Direct processing with imageProcessor
    - Videos: Load FFmpeg first, then process with videoProcessor
    - Show progress during processing

### Phase 9: Polish

24. **Add HTML meta tags** for PWA:
    - theme-color, viewport, description
    - apple-touch-icon, mask-icon links

25. **Add responsive design**:
    - Mobile-first with `md:` breakpoints
    - Sticky bottom BatchActions on mobile
    - Touch-friendly upload zone

26. **Add error handling**:
    - Display errors in UI
    - Retry option for FFmpeg load failures
    - Graceful degradation for unsupported browsers

## Key Implementation Details

### FFmpeg Loading Strategy
- Lazy load only when video file added
- Show loading progress (WASM is ~30MB)
- Cache in service worker for offline use
- Retry mechanism on failure

### Memory Management
- Revoke blob URLs when files removed
- Cleanup in removeFile, clearAll, clearCompleted
- Max 500MB for videos (FFmpeg memory constraints)

### CORS Requirements (Production)
The hosting server must set these headers:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### GIF Limitation
Canvas re-encoding only captures first frame. Show warning badge in UI.

## Reference Files (from clean-post-cc)

Copy/adapt these files from `/Users/pedro/Developments/clean-post-cc/`:
- `src/lib/processors/imageProcessor.ts` - Image processing pipeline
- `src/lib/metadata/metadataReader.ts` - Metadata extraction & thumbnails
- `src/store/fileStore.ts` - Zustand store pattern
- `src/types/index.ts` - TypeScript definitions
- `src/components/ui/*` - Shadcn/ui components
- `tailwind.config.js` - Tailwind configuration
- `vite.config.ts` - Base Vite config (add PWA plugin)

## Verification

1. **Image processing**:
   - Upload JPEG, verify EXIF stripped with exiftool or online checker
   - Upload PNG/WebP/GIF, verify metadata removed
   - Upload HEIC, verify conversion to JPEG and metadata removal

2. **Video processing**:
   - Upload MP4, verify metadata stripped
   - Upload MOV, verify converted to MP4 and metadata stripped
   - Check FFmpeg loading indicator appears

3. **PWA functionality**:
   - Install on Chrome/Safari
   - Test offline after install
   - Verify update prompt works

4. **Web Share**:
   - Test on iOS Safari and Android Chrome
   - Verify files can be shared to other apps

5. **Performance**:
   - Test with 50MB image
   - Test with 100MB+ video
   - Verify no memory leaks (check blob URL cleanup)
