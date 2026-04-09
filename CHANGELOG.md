# Changelog

All notable changes to this project should be documented in this file.

This format is inspired by Keep a Changelog and uses a date-based section style.

## 2026-04-09

### Added

- **Custom local font integration**: Added Majestic Face font from local assets and applied across UI and canvas timestamp text
- **Shutter sound on capture**: Camera capture now plays `assets/shutter.wav` for each shot
- **Dynamic timestamp contrast**: Timestamp text auto-switches to white on dark borders and black on bright borders
- **Mobile camera flip control**: Added front/back camera toggle in capture view, with live stream restart and correct mirroring behavior per camera direction

### Changed

- **Preview scaling behavior**: Customization and final preview canvases now scale to viewport height so full strips fit on one page without scrolling
- **Typography scaling**: Increased overall text size and adjusted heading/button sizes for stronger readability with the custom font
- **Text presentation**: UI text and rendered timestamp display in lowercase for visual consistency with selected font style

### Fixed

- **Input method switch persistence**: Switching between Files and Camera now clears stale photos from the previous method
- **Grid recapture flow**: Clearing camera slots with `X` now supports batch refill of all empty slots (instead of single-slot-only recapture behavior)
- **File preview slot action**: `X` in file mode now clears the slot directly, making replacement flow more predictable
- **Shutter replay consistency**: Reused a preloaded shutter audio instance so capture sound plays reliably on every photo, not just the first
- **Mobile vintage sepia rendering**: Added filter fallback processing for browsers that do not reliably apply canvas `ctx.filter` during image draws (notably some mobile environments)
- **Mobile shutter unlock flow**: Added tap-time audio unlock and replay fallback so shutter sound can fire for each photo on stricter mobile autoplay policies

## 2026-04-07

### Added

- **Multi-step guided workflow**: Redesigned app into 5 sequential steps for better UX
  - Step 1: Frame selection with visual previews
  - Step 2: Input method choice (camera or file upload)
  - Step 3: Photo capture/upload with live preview
  - Step 4: Customization (border color and filters)
  - Step 5: Final preview and download
- **Frame configurations**: Exact physical dimensions for print-ready output
  - Normal Strip: 5.08 × 15.24 cm (600 × 1800 px at 300 DPI)
  - 2×2 Grid: 10 × 10 cm (1181 × 1181 px at 300 DPI)
  - Vintage: 3.8 × 15.24 cm (449 × 1800 px at 300 DPI)
- **Smart image cropping**: Photos crop to fit frame aspect ratios without distortion
  - Normal Strip: 1.36:1 ratio per photo
  - Grid: 0.8:1 ratio per photo
  - Vintage: 0.97:1 ratio per photo
- **Live preview system**: Real-time preview updates during photo capture
- **Individual photo replacement**: X button on each photo to retake/replace individually
- **Timestamp feature**: Automatic timestamp on Normal Strip and Grid layouts
- **Border color picker**: Customizable border colors with live preview
- **File type validation**: Restricts uploads to JPEG, PNG, and WEBP formats
- **Vintage mode special handling**: Auto-applies sepia filter and black border, skips customization step

### Changed

- **Complete UI redesign**: Minimalistic black and white theme
  - Removed all gradients and shadows
  - Sharp geometric design with clean borders
  - Inter font family for modern typography
  - Frame previews replaced with geometric icons
- **Navigation system**: Added back/next buttons with validation
- **Camera capture flow**: Sequential countdown captures with preview grid
- **Image rendering**: Increased margins (30px) and photo gaps for better aesthetics
- **Canvas quality**: PNG output with high-quality image smoothing
- **Frame dimensions**: Updated to match actual physical print sizes in centimeters

### Fixed

- **Image loading timing**: Fixed async issues causing last photo to not display
- **Preview compression**: Images no longer appear squished or distorted
- **Navigation errors**: Proper cleanup when navigating between steps
- **Camera management**: Camera stream properly starts/stops during navigation
- **Aspect ratio handling**: Cropping now uses actual target area dimensions

### Removed

- Single-page simultaneous controls interface
- Frame image dependencies (replaced with CSS-generated previews)
- Auto-session without user control
- Fixed 4-photo limitation (now frame-dependent)

### Notes

- App now uses step-based state machine for flow control
- All frames output at 300 DPI for professional print quality
- Vintage mode is streamlined for classic film aesthetic
- File input supports multiple file selection for faster workflow

---

## Entry Template

Copy this section for each new date:

## YYYY-MM-DD

### Added

- 

### Changed

- 

### Fixed

- 

### Removed

- 

### Notes

- 
