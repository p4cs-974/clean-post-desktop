# CleanPost Desktop - UI/UX Design Specification

A comprehensive design system and user experience guide for the privacy-first metadata removal PWA.

---

## Design Philosophy

**Core Principles:**
1. **Trust Through Transparency** - Users must feel confident their data never leaves their device
2. **Effortless Privacy** - One-click simplicity for complex operations
3. **Calm Technology** - Minimal, focused interface that doesn't overwhelm
4. **Mobile-First Utility** - Optimized for quick, on-the-go use

---

## Visual Design System

### Color Palette

```css
/* Primary - Deep Indigo (Trust & Security) */
--primary: 238 73% 60%;           /* #5B6EE1 - Main actions */
--primary-hover: 238 73% 52%;     /* Darker on hover */
--primary-foreground: 0 0% 100%;

/* Accent - Emerald (Success & Safety) */
--accent-success: 158 64% 52%;    /* #2DD4A7 - Processed/Safe */
--accent-success-muted: 158 40% 94%; /* Light background */

/* Semantic Colors */
--warning: 38 92% 50%;            /* #F59E0B - Attention needed */
--danger: 0 84% 60%;              /* #EF4444 - Destructive/Risky */
--info: 199 89% 48%;              /* #0EA5E9 - Informational */

/* Neutrals - Slate (Modern, Readable) */
--background: 222 47% 98%;        /* #F8FAFC - App background */
--surface: 0 0% 100%;             /* #FFFFFF - Cards */
--surface-elevated: 220 14% 96%;  /* #F1F5F9 - Elevated surfaces */
--border: 220 13% 91%;            /* #E2E8F0 */
--border-hover: 220 13% 80%;
--text-primary: 222 47% 11%;      /* #0F172A */
--text-secondary: 215 16% 47%;    /* #64748B */
--text-muted: 215 14% 63%;        /* #94A3B8 */

/* Dark Mode */
--background-dark: 222 47% 6%;    /* #0B0F1A */
--surface-dark: 222 47% 11%;      /* #131B2E */
```

### Typography

```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Type Scale */
--text-xs: 0.75rem;    /* 12px - Badges, captions */
--text-sm: 0.875rem;   /* 14px - Secondary text, buttons */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Subheadings */
--text-xl: 1.25rem;    /* 20px - Section titles */
--text-2xl: 1.5rem;    /* 24px - Page titles */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
```

### Spacing & Layout

```css
/* Spacing Scale (8px base) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */

/* Container */
--container-max: 640px;  /* Single-column focus */
--container-padding: 1rem;

/* Border Radius */
--radius-sm: 0.375rem;   /* 6px - Badges */
--radius-md: 0.5rem;     /* 8px - Buttons */
--radius-lg: 0.75rem;    /* 12px - Cards */
--radius-xl: 1rem;       /* 16px - Large containers */
--radius-full: 9999px;   /* Pills */
```

### Shadows & Elevation

```css
/* Elevation System */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Interactive States */
--shadow-focus: 0 0 0 3px rgb(91 110 225 / 0.2);
--shadow-card-hover: 0 8px 25px -5px rgb(0 0 0 / 0.1);
```

---

## Component Design Specifications

### 1. Header / Trust Banner

```
┌─────────────────────────────────────────────────────┐
│  🛡️  CleanPost          [🔒 100% Private]          │
│      Clean your media                               │
└─────────────────────────────────────────────────────┘
```

**Specifications:**
- Height: `60px` mobile, `72px` desktop
- Logo: Shield icon + wordmark, `text-xl font-bold`
- Privacy badge: Pill shape, green background (`accent-success-muted`), animated pulse on first visit
- Sticky on scroll with subtle backdrop blur

**Privacy Badge Animation:**
```css
@keyframes trust-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}
/* Plays once on component mount */
```

---

### 2. File Upload Zone

**States:**

#### Default State
```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│                                                     │
│              ╭──────────────────╮                   │
│              │   📁  + arrow    │                   │
│              ╰──────────────────╯                   │
│                                                     │
│         Drop images or videos here                  │
│              or tap to browse                       │
│                                                     │
│     ┌─────────────────────────────────────┐        │
│     │ JPEG • PNG • HEIC • MP4 • MOV • WebM │        │
│     └─────────────────────────────────────┘        │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

#### Hover / Drag-Over State
```
┌────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░                                             ░░ │
│ ░░            📁  Release to upload            ░░ │
│ ░░                                             ░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Border: `2px dashed` with `border-color` transitioning on hover
- Background: Transparent → `primary/5%` on hover
- Min height: `200px` mobile, `240px` desktop
- Icon: Upload cloud with animated arrow (subtle float)
- Touch target: Full zone is tappable
- Transition: `all 200ms ease-out`

**Micro-interactions:**
```css
/* Icon float animation */
@keyframes gentle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

/* Drag over feedback */
.drag-over {
  border-color: var(--primary);
  background: rgb(91 110 225 / 0.05);
  transform: scale(1.01);
}
```

**Accessibility:**
- `tabindex="0"` with focus ring
- `aria-label="Drop files here or click to upload images and videos"`
- Keyboard: Enter/Space to open file picker

---

### 3. Metadata Toggle Panel

```
┌─────────────────────────────────────────────────────┐
│  Privacy Settings                                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📍 Remove GPS Location              [═══════●]    │
│     Strips coordinates from files                   │
│                                                     │
│  📷 Remove Camera Info               [═══════●]    │
│     Device model, lens, settings                    │
│                                                     │
│  🕐 Remove Timestamps                [●═══════]    │
│     Creation & modification dates                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Card with `radius-lg`, `shadow-sm`
- Each toggle row: `padding: space-4`, `gap: space-3`
- Icon: `20px`, colored to match category (red for GPS, blue for camera, orange for time)
- Toggle: Shadcn Switch, `h-6 w-11`
- Description text: `text-sm text-muted`
- Dividers between options (subtle `border-b`)

**Toggle Animation:**
```css
/* Smooth toggle with spring feel */
.toggle-thumb {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Smart Defaults:**
- GPS: ON by default (privacy critical)
- Camera Info: ON by default
- Timestamps: OFF by default (often useful to keep)

---

### 4. File Item Card

#### Pending State (Before Processing)
```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐                                           │
│ │      │  vacation-photo.jpg              [IMAGE]  │
│ │ 🖼️   │  2.4 MB                                   │
│ │      │                                           │
│ └──────┘  ⚠️ GPS  ⚠️ EXIF  ⚠️ Date                 │
│                                                     │
│           [ 🛡️ Clean ]  [ 🗑️ ]                     │
└─────────────────────────────────────────────────────┘
```

#### Processing State
```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐                                           │
│ │      │  beach-sunset.mp4               [VIDEO]   │
│ │ 🎬   │  45.2 MB                                  │
│ │      │                                           │
│ └──────┘  ━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░ 68%      │
│           Removing metadata...                     │
└─────────────────────────────────────────────────────┘
```

#### Completed State
```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐                                           │
│ │ ✓    │  vacation-photo.jpg              [IMAGE]  │
│ │ 🖼️   │  2.4 MB → 2.1 MB  ✓ Clean               │
│ │      │                                           │
│ └──────┘  ✓ GPS  ✓ EXIF  ✓ Date                   │
│                                                     │
│           [ ⬇️ Save ]  [ 📤 Share ]  [ 🗑️ ]        │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Card: `bg-surface`, `radius-lg`, `shadow-sm` → `shadow-md` on hover
- Thumbnail: `64x64px` with `radius-md`, `object-cover`
- Type badge: Pill shape, `text-xs font-medium`
  - IMAGE: `bg-blue-100 text-blue-700`
  - VIDEO: `bg-purple-100 text-purple-700`
- Metadata badges:
  - Warning (pending): `bg-warning/10 text-warning` with ⚠️
  - Safe (cleaned): `bg-success/10 text-success` with ✓
- Progress bar: `h-2`, `bg-primary`, rounded, animated gradient shimmer
- Buttons: Icon-only on mobile, icon+text on desktop

**Status Transitions:**
```css
/* Card entrance */
@keyframes card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Success celebration */
@keyframes success-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* Badge transition pending → clean */
.badge-transition {
  transition: all 300ms ease-out;
}
```

**Thumbnail Overlay States:**
- Pending: No overlay
- Processing: Semi-transparent overlay with spinner
- Complete: Checkmark badge in corner

---

### 5. Video Processing Indicator (FFmpeg Loading)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ╭────────────────────────────────╮              │
│     │    🎬  Loading Video Engine    │              │
│     │                                │              │
│     │    ━━━━━━━━━━━━━━━░░░░░░ 72%  │              │
│     │    Downloading (21.6 / 30 MB)  │              │
│     │                                │              │
│     │    First time only - cached    │              │
│     │    for offline use             │              │
│     ╰────────────────────────────────╯              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Modal overlay: `bg-black/50` with backdrop blur
- Card: `max-w-sm`, centered, `radius-xl`, `shadow-xl`
- Progress: Determinate bar showing download progress
- Reassurance text: Explains one-time download
- Cancel option if user wants to remove video instead

---

### 6. Batch Action Bar

#### Desktop (Inline)
```
┌─────────────────────────────────────────────────────┐
│  3 files ready  •  1 image, 2 videos               │
│                                                     │
│  [ 🛡️ Clean All ]  [ ⬇️ Download All ]  [ Clear ]  │
└─────────────────────────────────────────────────────┘
```

#### Mobile (Sticky Bottom)
```
┌─────────────────────────────────────────────────────┐
│  3 files  │  [ 🛡️ Clean All ]  [ ⬇️ Download ]    │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Desktop: Card at bottom of file list
- Mobile: Fixed to bottom, `height: 64px`, safe area padding
- Background: `bg-surface` with `shadow-lg` (elevated)
- Primary action (Clean All): `bg-primary text-white`, prominent
- Secondary actions: Ghost/outline style
- Stats: `text-sm text-muted`, icon + count

**Safe Area:**
```css
.batch-bar-mobile {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
```

---

### 7. Share Integration

#### Share Button States
```
[Not Supported]     →  Hidden entirely
[Single File]       →  📤 Share
[Multiple Files]    →  📤 Share All (creates ZIP first)
[Sharing...]        →  ⏳ Preparing...
```

**Native Share Sheet Trigger:**
- Uses Web Share API when available
- Falls back to download on unsupported browsers
- Shows toast: "Sharing not supported - downloading instead"

---

### 8. PWA Update Toast

```
┌─────────────────────────────────────────────────────┐
│  🔄  Update Available                    [ × ]     │
│                                                     │
│  A new version of CleanPost is ready               │
│                                                     │
│  [ Later ]                    [ Update Now ]       │
└─────────────────────────────────────────────────────┘
```

**Design Specifications:**
- Position: Bottom center, `margin-bottom: space-6`
- Entrance: Slide up + fade in
- Auto-dismiss: Never (requires user action)
- Update button: Primary style
- Later: Ghost style

---

## User Flows & Interactions

### Primary Flow: Clean Single File

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Upload    │ →  │   Review    │ →  │   Clean     │ →  │   Share/    │
│   File      │    │   Metadata  │    │   File      │    │   Download  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                  │                   │
     ▼                   ▼                  ▼                   ▼
 Drag/drop or      See warning        Processing         One-tap share
 tap to select     badges for         animation          to social apps
                   detected data
```

### Video Flow (First Time)

```
┌──────────┐   ┌───────────────┐   ┌──────────┐   ┌──────────┐
│  Add     │ → │ FFmpeg Load   │ → │ Process  │ → │ Complete │
│  Video   │   │ (one-time)    │   │ Video    │   │          │
└──────────┘   └───────────────┘   └──────────┘   └──────────┘
                     │
                     ▼
              Progress modal with
              "First time only" message
```

---

## Loading & Progress States

### Skeleton Loading
```
┌─────────────────────────────────────────────────────┐
│ ┌──────┐  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│ │░░░░░░│  ░░░░░░░░░░░░░░░░░░░                      │
│ │░░░░░░│                                           │
│ └──────┘  ░░░░░░░░░░░  ░░░░░░░░░  ░░░░░░░         │
└─────────────────────────────────────────────────────┘
```

### Progress Bar Styles
```css
/* Indeterminate (analyzing) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.progress-indeterminate {
  background: linear-gradient(90deg,
    var(--primary) 0%,
    var(--primary-light) 50%,
    var(--primary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Determinate */
.progress-determinate {
  transition: width 200ms ease-out;
}
```

---

## Error States & Empty States

### Empty State (No Files)
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│               ╭─────────────────╮                   │
│               │   🖼️  📁  🎬    │                   │
│               ╰─────────────────╯                   │
│                                                     │
│            Your files stay private                  │
│                                                     │
│       All processing happens on your device.        │
│       Nothing is ever uploaded to any server.       │
│                                                     │
│       ┌──────────────────────────────┐             │
│       │   📁  Select Files to Start  │             │
│       └──────────────────────────────┘             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Error States

#### Unsupported Format
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Unsupported Format                              │
│                                                     │
│ "document.pdf" cannot be processed.                 │
│                                                     │
│ Supported: JPEG, PNG, HEIC, GIF, WebP, MP4, MOV    │
│                                                     │
│                              [ OK ]                 │
└─────────────────────────────────────────────────────┘
```

#### File Too Large
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  File Too Large                                  │
│                                                     │
│ "movie.mp4" (892 MB) exceeds the 500 MB limit      │
│ for video processing.                               │
│                                                     │
│ Tip: Try compressing the video first.              │
│                                                     │
│                              [ OK ]                 │
└─────────────────────────────────────────────────────┘
```

#### Processing Failed
```
┌─────────────────────────────────────────────────────┐
│ ❌  Processing Failed                               │
│                                                     │
│ Could not process "corrupt-image.jpg"              │
│                                                     │
│ The file may be corrupted or in an unsupported     │
│ format variant.                                     │
│                                                     │
│         [ Try Again ]        [ Remove ]            │
└─────────────────────────────────────────────────────┘
```

#### FFmpeg Load Failed
```
┌─────────────────────────────────────────────────────┐
│ ⚠️  Video Engine Failed to Load                     │
│                                                     │
│ Could not load the video processing engine.        │
│                                                     │
│ This might be due to:                              │
│ • Network connectivity issues                       │
│ • Browser compatibility                            │
│                                                     │
│         [ Retry ]           [ Cancel ]             │
└─────────────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {  /* sm */
  /* Wider upload zone, larger thumbnails */
}

@media (min-width: 768px) {  /* md */
  /* Side-by-side layouts, inline batch bar */
}

@media (min-width: 1024px) { /* lg */
  /* Max container width, more spacing */
}
```

### Mobile Optimizations
- Upload zone: Full width, taller touch target
- File cards: Stacked layout, swipe actions
- Batch bar: Fixed bottom, primary action prominent
- Toggles: Full-width rows, large touch targets

### Desktop Enhancements
- Centered container (max 640px)
- Hover states on all interactive elements
- Keyboard navigation support
- Multi-file drag and drop with count indicator

---

## Accessibility (A11y)

### Focus Management
```css
/* Visible focus ring */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgb(91 110 225 / 0.4);
  border-radius: var(--radius-md);
}

/* Skip link */
.skip-link:focus {
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 100;
}
```

### ARIA Labels
- Upload zone: `aria-label="File upload area. Drag and drop files or click to browse"`
- Progress: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Status badges: `aria-live="polite"` for status changes
- Remove buttons: `aria-label="Remove [filename]"`

### Keyboard Navigation
- Tab order: Upload → Toggles → File list → Batch actions
- Enter/Space: Activate buttons, toggle switches
- Escape: Close modals
- Arrow keys: Navigate file list

### Screen Reader Announcements
- File added: "[filename] added. Contains GPS location, camera info."
- Processing: "Processing [filename]..."
- Complete: "[filename] cleaned successfully. GPS, camera info, and timestamps removed."

---

## Performance Considerations

### Image Optimization
- Thumbnails: Generated at 128x128, WebP when supported
- Lazy loading: Thumbnails loaded as cards enter viewport
- Memory: Blob URLs revoked immediately after use

### Animation Performance
- Use `transform` and `opacity` for animations
- `will-change` on frequently animated elements
- Reduce motion for `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Dark Mode

All colors should support automatic dark mode via CSS custom properties:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: 222 47% 6%;
    --surface: 222 47% 11%;
    --border: 215 25% 20%;
    --text-primary: 210 40% 98%;
    --text-secondary: 215 20% 65%;
  }
}
```

Key considerations:
- Reduce shadow intensity in dark mode
- Increase contrast for text
- Use muted accent colors (less saturated)
- Test all states in both modes

---

## Motion Design Tokens

```css
/* Durations */
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;

/* Easings */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Common transitions */
--transition-colors: color var(--duration-fast) var(--ease-out),
                     background-color var(--duration-fast) var(--ease-out);
--transition-transform: transform var(--duration-normal) var(--ease-spring);
--transition-all: all var(--duration-normal) var(--ease-out);
```

---

## Implementation Priority

1. **P0 - Core Experience**
   - Upload zone with drag/drop
   - File cards with status states
   - Progress indicators
   - Download functionality

2. **P1 - Enhanced UX**
   - Metadata toggles
   - Batch actions
   - Error handling UI
   - Loading states

3. **P2 - Polish**
   - Animations & micro-interactions
   - Dark mode
   - PWA update toast
   - Share integration

4. **P3 - Delight**
   - Success celebrations
   - Empty state illustrations
   - Accessibility audit
   - Performance optimization
