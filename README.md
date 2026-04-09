# Photobooth

A browser-based photobooth application with a guided multi-step workflow for creating print-ready photo strips. Features smart image cropping, customizable borders and filters, and accurate physical dimensions for real photo booth frames.

Live : https://rubyarthalia.github.io/Simple-Photobooth/ 

## Features

### Multi-Step Workflow
1. **Frame Selection**: Choose from three professionally sized layouts
2. **Input Method**: Take photos with camera or upload from files
3. **Photo Capture/Upload**: Real-time preview with slot clearing and refill options
4. **Customization**: Border color picker and filter effects
5. **Final Preview**: Download high-quality print-ready image

### Frame Types

- **Normal Strip** (5.08 × 15.24 cm)
  - Clean photobooth aesthetic
  - 4 photos stacked vertically
  - Timestamp included (auto contrast text color)
  - Photo ratio: 1.36:1

- **2×2 Grid** (10 × 10 cm)
  - Modern scrapbook style
  - 4 photos in 2×2 layout
  - Timestamp included (auto contrast text color)
  - Photo ratio: 0.8:1

- **Vintage** (3.8 × 15.24 cm)
  - Classic film aesthetic
  - 4 photos stacked (tight spacing)
  - Sepia filter and black border (locked)
  - Photo ratio: 0.97:1

### Smart Features

- **Intelligent Cropping**: Photos automatically crop to fit without distortion
- **Live Preview**: See your layout update in real-time during capture
- **Adaptive Timestamp Color**: White text on dark borders, black text on bright borders
- **Camera Shutter Sound**: Plays on every captured photo
- **Viewport-Fit Preview**: Final/customization previews are scaled to fit one page without scrolling
- **Flexible Slot Refill**: Clear any slot with X and refill empty camera slots in batch
- **File Validation**: Accepts JPEG, PNG, and WEBP formats only
- **Print Quality**: 300 DPI output for professional printing
- **Customizable Borders**: Choose any color for frame borders
- **Filter Effects**: Normal, Black & White, Sepia, and Vivid

## Tech Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Minimalistic black and white design with local custom font
- **Vanilla JavaScript**: No frameworks or dependencies
- **Browser APIs**: 
  - `getUserMedia` for camera access
  - `Canvas` for image rendering
  - `FileReader` for file uploads

## Project Structure

```
Photobooth/
├── index.html          # Main application with 5-step layout
├── style.css           # Minimalistic B&W styling
├── script.js           # State management, camera, rendering logic
├── assets/
│   ├── majestic_face/
│   │   └── Majestic Face.otf  # Local font
│   └── shutter.wav            # Camera shutter sound
├── CHANGELOG.md        # Version history
└── README.md           # This file
```

## How To Run

### Option 1: Simple File Open
1. Open `index.html` in a modern browser
2. Allow camera access when prompted

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8080

# Using Node.js
npx http-server -p 8080
```
Then navigate to `http://localhost:8080`

## Usage Guide

### Taking Photos
1. Select your desired frame type
2. Choose "Take Photos"
3. Allow camera access
4. Click "Start Capture"
5. Pose for each countdown (4 photos total)
6. Review preview grid
7. Click X on any photo to clear that slot, then click Start Capture to refill empty slots
8. Click "Next" when satisfied

### Uploading Photos
1. Select your desired frame type
2. Choose "Choose from Files"
3. Click "Choose Files" and select 4 images
4. Review preview grid
5. Click X on any photo to clear that slot, then click "Choose File" in that slot to replace it
6. Click "Next" when all 4 slots are filled

### Customization
- **Border Color**: Click color picker to choose frame border color
- **Filters**: Select from 4 filter options
  - Normal: No filter
  - Black & White: Full grayscale
  - Sepia: Warm vintage tone
  - Vivid: Enhanced contrast and saturation
- **Vintage Mode**: Automatically applies sepia + black border (no customization step)

### Download
- Click "Download Photo Strip" to save as PNG
- File will be named: `photobooth-[frametype]-[timestamp].png`
- Image is print-ready at 300 DPI

## Browser Compatibility

### Recommended
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- Modern browser with ES6+ support
- Camera access requires HTTPS or localhost
- JavaScript enabled

## Design Philosophy

- **Minimalistic**: Clean black and white interface
- **Intuitive**: Step-by-step guided workflow
- **Professional**: Print-ready output with exact dimensions
- **Accessible**: Clear visual hierarchy and navigation
- **Fast**: No external dependencies, pure vanilla JS

## Known Limitations

- Camera access requires secure context (HTTPS) or localhost
- Mobile camera UI not optimized (desktop-first design)
- Single session at a time (no multi-user support)
- No image editing tools (crop/rotate/adjust)
- Browser-dependent camera quality

## Future Enhancements

- Mobile-responsive camera controls
- QR code sharing
- Multiple photo strip copies
- Custom text overlays
- Save session for later
- Print directly to connected printers

## Change Tracking

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.

## License

Open source - feel free to modify and use for personal or commercial projects.

## Credits

- Built with vanilla JavaScript and modern browser APIs. No external libraries required.
- Font: Majestic Face from dafont: https://www.dafont.com/majestic-face.font?text=hiii&back=theme
