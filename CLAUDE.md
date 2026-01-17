# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CleanPost Desktop is a privacy-focused Progressive Web App (PWA) that removes metadata (EXIF, GPS, timestamps) from images and videos entirely in the browser. All processing happens client-side using WebAssembly—no data ever leaves the user's device.

## Development Commands

```bash
# Install dependencies (uses Bun as package manager)
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Add shadcn/ui or MagicUI components (use bun, not npm)
bunx shadcn@latest add <component-name>
bunx shadcn@latest add @magicui/<component-name>
```

## UI Components

Shadcn-style UI components in `src/components/ui/` using:
- `class-variance-authority` for variant styling
- `tailwind-merge` + `clsx` for conditional classes
- `lucide-react` for icons
- **MagicUI ProgressiveBlur**: Used in the header area for a gradient blur effect that fades content at the top edge as it scrolls under the sticky header (position="top", height="15%")

## Architecture

### State Management
- **Zustand store** (`src/store/fileStore.ts`): Central state for files, global metadata removal options, and FFmpeg loading status
- Store manages file lifecycle (idle → processing → completed/error) and cleanup of object URLs

### Media Processing Pipeline

**Images** (`src/lib/processors/imageProcessor.ts`):
- JPEG: Uses `piexifjs` for selective EXIF/GPS/timestamp removal while preserving orientation and resolution tags
- PNG/WebP/GIF: Canvas re-encoding to strip all metadata
- HEIC/HEIF: Converts to JPEG via `heic2any`, then processes as JPEG

**Videos** (`src/lib/processors/videoProcessor.ts`):
- FFmpeg.wasm for in-browser video processing
- MP4 files: Fast stream copy (`-c copy`) to remove metadata without re-encoding
- MOV/other formats: Converts to MP4 with H.264/AAC
- Max file size: 500MB

### FFmpeg Management
- Singleton pattern in `src/hooks/useFFmpeg.ts` prevents multiple loads
- Loads from CDN (`@ffmpeg/core@0.12.10`) with Workbox caching
- Progress tracking during load and processing

### PWA Features
- Service worker with auto-update (`vite-plugin-pwa`)
- Share Target API: Accepts images/videos directly from other apps
- Offline support with runtime caching for FFmpeg `.wasm` files

### COOP/COEP Headers
Vite dev/preview servers require these headers for SharedArrayBuffer (FFmpeg.wasm):
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Key Libraries

- **@ffmpeg/ffmpeg**: WebAssembly video processing
- **piexifjs**: JPEG EXIF manipulation
- **exifr**: Metadata reading
- **heic2any**: HEIC to JPEG conversion
- **zustand**: State management
- **Tailwind CSS v4**: Styling (via PostCSS plugin)
- **lucide-react**: Icons
- **vite-plugin-pwa**: PWA configuration

## Path Aliases

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)