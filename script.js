// State Management
const appState = {
  currentStep: 1,
  selectedFrame: null,
  inputMethod: null,
  images: [],
  borderColor: '#000000',
  filter: 'none',
  cameraStream: null
};

const FRAME_CONFIG = {
  'strip': { 
    width: 600,   // 5.08cm at 300 DPI
    height: 1800, // 15.24cm at 300 DPI
    slots: 4, 
    name: 'Normal Strip', 
    hasTimestamp: true, 
    aspectRatio: 4.5/3.3  // Photo size: 4.5 × 3.3 cm (1.36:1)
  },
  'grid': { 
    width: 1181,  // 10cm at 300 DPI
    height: 1181, // 10cm at 300 DPI (square)
    slots: 4, 
    name: '2×2 Grid', 
    hasTimestamp: true, 
    aspectRatio: 4/5  // Photo size: 4 × 5 cm (0.8:1)
  },
  'vintage': { 
    width: 449,   // 3.8cm at 300 DPI
    height: 1800, // 15.24cm at 300 DPI
    slots: 4, 
    name: 'Vintage', 
    locked: true, 
    hasTimestamp: false, 
    aspectRatio: 3.5/3.6  // Photo size: 3.5 × 3.6 cm (~0.97:1, almost square)
  }
};

function playShutterSound() {
  if (!appState.shutterSound) {
    appState.shutterSound = new Audio('assets/shutter.wav');
    appState.shutterSound.preload = 'auto';
    appState.shutterSound.volume = 0.9;
  }

  appState.shutterSound.currentTime = 0;
  appState.shutterSound.play().catch(() => {
    // Ignore autoplay/playback failures to avoid blocking capture flow.
  });
}

// NAVIGATION
function goToStep(stepNumber) {
  // Clean up previous step
  if (appState.currentStep === 3) {
    stopCamera();
  }
  
  // Hide all steps
  for (let i = 1; i <= 5; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    if (stepEl) stepEl.style.display = 'none';
  }
  
  // Show target step
  const targetStep = document.getElementById(`step-${stepNumber}`);
  if (targetStep) {
    targetStep.style.display = 'block';
    appState.currentStep = stepNumber;
  }
  
  // Special handling for steps
  if (stepNumber === 3) {
    // Show correct view based on input method
    const fileView = document.getElementById('file-upload-view');
    const cameraView = document.getElementById('camera-capture-view');
    
    if (appState.inputMethod === 'files') {
      if (fileView) fileView.style.display = 'block';
      if (cameraView) cameraView.style.display = 'none';
      renderFilePreview();
    } else if (appState.inputMethod === 'camera') {
      if (fileView) fileView.style.display = 'none';
      if (cameraView) cameraView.style.display = 'block';
      
      // Reset camera view state
      const captureBtn = document.getElementById('camera-capture-btn');
      if (captureBtn) {
        captureBtn.style.display = 'block';
        captureBtn.textContent = 'Start Capture';
        captureBtn.onclick = startCameraCapture;
      }
      
      const previewGrid = document.getElementById('camera-preview-grid');
      if (previewGrid) {
        previewGrid.style.display = 'none';
        previewGrid.innerHTML = '';
      }
      
      initCameraPreview();
    }
  }
  
  if (stepNumber === 4) {
    renderCustomizationPreview();
  }
  
  if (stepNumber === 5) {
    renderFinalPreview();
  }
}

function validateStep(stepNumber) {
  switch(stepNumber) {
    case 1:
      if (!appState.selectedFrame) {
        alert('Please select a frame style.');
        return false;
      }
      return true;
    case 2:
      if (!appState.inputMethod) {
        alert('Please choose an input method.');
        return false;
      }
      return true;
    case 3:
      const requiredSlots = FRAME_CONFIG[appState.selectedFrame].slots;
      const filledSlots = appState.images.filter(img => img !== null).length;
      if (filledSlots < requiredSlots) {
        alert(`Please add all ${requiredSlots} photos before proceeding.`);
        return false;
      }
      return true;
    case 4:
      return true;
    default:
      return true;
  }
}

function nextStep() {
  if (validateStep(appState.currentStep)) {
    // Stop camera before leaving step 3
    if (appState.currentStep === 3) {
      stopCamera();
    }
    
    // Vintage mode skips customization (step 4)
    if (appState.currentStep === 3 && appState.selectedFrame === 'vintage') {
      appState.filter = 'sepia(80%)';
      appState.borderColor = '#000000';
      goToStep(5);
    } else {
      goToStep(appState.currentStep + 1);
    }
  }
}

function previousStep() {
  if (appState.currentStep > 1) {
    // Skip step 4 going backwards if vintage
    if (appState.currentStep === 5 && appState.selectedFrame === 'vintage') {
      goToStep(3);
    } else {
      goToStep(appState.currentStep - 1);
    }
  }
}

function resetApp() {
  stopCamera();
  appState.currentStep = 1;
  appState.selectedFrame = null;
  appState.inputMethod = null;
  appState.images = [];
  appState.borderColor = '#000000';
  appState.filter = 'none';
  
  // Clear file input
  const fileInput = document.getElementById('file-input');
  if (fileInput) fileInput.value = '';
  
  goToStep(1);
}

// CAMERA
function startCamera() {
  return navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      appState.cameraStream = stream;
      const video = document.getElementById("video");
      if (video) {
        video.srcObject = stream;
      }
      return stream;
    });
}

function stopCamera() {
  if (appState.cameraStream) {
    appState.cameraStream.getTracks().forEach(track => track.stop());
    appState.cameraStream = null;
  }
  const video = document.getElementById("video");
  if (video) video.srcObject = null;
}

// STEP 1: Frame Selection
function selectFrame(frameType) {
  appState.selectedFrame = frameType;
  const requiredSlots = FRAME_CONFIG[frameType].slots;
  appState.images = new Array(requiredSlots).fill(null);
  
  // Highlight selected frame
  document.querySelectorAll('.frame-option').forEach(el => {
    el.classList.remove('selected');
  });
  event.target.closest('.frame-option').classList.add('selected');
  
  // Auto advance after brief delay
  setTimeout(() => nextStep(), 500);
}

// STEP 2: Input Method Selection
function selectInputMethod(method) {
  const isMethodChanged = appState.inputMethod && appState.inputMethod !== method;
  if (isMethodChanged && appState.selectedFrame) {
    const requiredSlots = FRAME_CONFIG[appState.selectedFrame].slots;
    appState.images = new Array(requiredSlots).fill(null);
  }

  appState.inputMethod = method;
  setTimeout(() => nextStep(), 300);
}

// STEP 3A: File Upload
function handleFileSelect(event) {
  const files = Array.from(event.target.files);
  const requiredSlots = FRAME_CONFIG[appState.selectedFrame].slots;
  
  // Validate file types
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const validFiles = files.filter(file => validTypes.includes(file.type));
  
  if (validFiles.length !== files.length) {
    alert('Only JPEG, PNG, and WEBP images are allowed.');
  }
  
  // Load images
  validFiles.slice(0, requiredSlots).forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        appState.images[index] = img;
        renderFilePreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function removeImage(index) {
  appState.images[index] = null;
  renderFilePreview();
}

function replaceImage(index) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          appState.images[index] = img;
          renderFilePreview();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function renderFilePreview() {
  const previewGrid = document.getElementById('file-preview-grid');
  if (!previewGrid) return;
  
  previewGrid.innerHTML = '';
  
  const frameConfig = FRAME_CONFIG[appState.selectedFrame];
  
  appState.images.forEach((img, index) => {
    const slot = document.createElement('div');
    slot.className = 'preview-slot';
    
    if (img && img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement('canvas');
      const targetAspect = frameConfig.aspectRatio;
      
      // Set canvas size based on aspect ratio
      if (targetAspect >= 1) {
        canvas.width = 150;
        canvas.height = 150 / targetAspect;
      } else {
        canvas.height = 150;
        canvas.width = 150 * targetAspect;
      }
      
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawImageCropped(ctx, img, 0, 0, canvas.width, canvas.height, targetAspect);
      
      slot.appendChild(canvas);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => removeImage(index);
      slot.appendChild(removeBtn);
    } else {
      slot.innerHTML = '<button class="choose-btn" onclick="replaceImage(' + index + ')">Choose File</button>';
    }
    
    previewGrid.appendChild(slot);
  });
}

// STEP 3B: Camera Capture
async function initCameraPreview() {
  await startCamera();
  renderCameraPreview(); // Show empty slots initially
}

async function startCameraCapture() {
  const requiredSlots = FRAME_CONFIG[appState.selectedFrame].slots;
  const emptySlots = appState.images.map((img, idx) => img === null ? idx : -1).filter(idx => idx !== -1);
  
  if (emptySlots.length === 0) return;
  
  // Show preview grid
  document.getElementById('camera-preview-grid').style.display = 'grid';
  
  for (let i = 0; i < emptySlots.length; i++) {
    const slotIndex = emptySlots[i];
    await countdown(3);
    await captureToSlot(slotIndex); // Wait for capture to complete
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for image to process
    renderCameraPreview(); // Update preview after each capture
  }
  
  stopCamera();
  document.getElementById('camera-capture-btn').style.display = 'none';
}

function captureToSlot(index) {
  return new Promise((resolve) => {
    const video = document.getElementById("video");
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    
    const ctx = tempCanvas.getContext("2d");
    playShutterSound();
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    const img = new Image();
    img.onload = () => {
      appState.images[index] = img;
      resolve(); // Resolve promise after image loads
    };
    img.src = tempCanvas.toDataURL('image/png'); // Use PNG for better quality
  });
}

async function retakePhoto(index) {
  appState.images[index] = null;
  renderCameraPreview();
  await startCamera();
  
  const captureBtn = document.getElementById('camera-capture-btn');
  captureBtn.style.display = 'block';
  captureBtn.textContent = 'Capture Photo';
  captureBtn.onclick = async () => {
    await countdown(3);
    await captureToSlot(index);
    await new Promise(resolve => setTimeout(resolve, 100));
    renderCameraPreview();
    stopCamera();
    captureBtn.style.display = 'none';
    captureBtn.textContent = 'Start Capture';
    captureBtn.onclick = startCameraCapture;
  };
}

async function clearCameraSlot(index) {
  appState.images[index] = null;
  renderCameraPreview();

  const captureBtn = document.getElementById('camera-capture-btn');
  if (captureBtn) {
    captureBtn.style.display = 'block';
    captureBtn.textContent = 'Start Capture';
    captureBtn.onclick = startCameraCapture;
  }

  if (!appState.cameraStream) {
    await startCamera();
  }
}

function renderCameraPreview() {
  const previewGrid = document.getElementById('camera-preview-grid');
  if (!previewGrid) return;
  
  previewGrid.innerHTML = '';
  previewGrid.style.display = 'grid';
  
  const frameConfig = FRAME_CONFIG[appState.selectedFrame];
  
  appState.images.forEach((img, index) => {
    const slot = document.createElement('div');
    slot.className = 'preview-slot';
    
    if (img && img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement('canvas');
      const targetAspect = frameConfig.aspectRatio;
      
      // Set canvas size based on aspect ratio
      if (targetAspect >= 1) {
        canvas.width = 150;
        canvas.height = 150 / targetAspect;
      } else {
        canvas.height = 150;
        canvas.width = 150 * targetAspect;
      }
      
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawImageCropped(ctx, img, 0, 0, canvas.width, canvas.height, targetAspect);
      
      slot.appendChild(canvas);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '×';
      removeBtn.onclick = () => clearCameraSlot(index);
      slot.appendChild(removeBtn);
    } else {
      slot.classList.add('empty-slot');
      slot.innerHTML = '<div class="slot-number">' + (index + 1) + '</div>';
    }
    
    previewGrid.appendChild(slot);
  });
}

// COUNTDOWN
function countdown(seconds) {
  return new Promise(resolve => {
    const el = document.getElementById("countdown");
    el.style.display = "block";

    let count = seconds;
    el.innerText = count;

    const interval = setInterval(() => {
      count--;
      el.innerText = count;

      if (count === 0) {
        clearInterval(interval);
        el.style.display = "none";
        resolve();
      }
    }, 1000);
  });
}

// STEP 4: Customization
function setBorderColor(color) {
  appState.borderColor = color;
  renderCustomizationPreview();
}

function setFilter(filterValue) {
  appState.filter = filterValue;
  renderCustomizationPreview();
}

function renderCustomizationPreview() {
  const canvas = document.getElementById('customization-preview');
  if (!canvas) return;
  
  renderToCanvas(canvas, appState.selectedFrame, appState.images, 
                 appState.filter, appState.borderColor, 0.5);
}

// STEP 5: Final Preview
function renderFinalPreview() {
  const canvas = document.getElementById('final-canvas');
  if (!canvas) return;
  
  renderToCanvas(canvas, appState.selectedFrame, appState.images, 
                 appState.filter, appState.borderColor, 1);
}

// Helper function to draw image with proper cropping (cover mode)
function drawImageCropped(ctx, img, x, y, width, height, targetAspect) {
  if (!img || !img.width || !img.height) return;
  
  const imgAspect = img.width / img.height;
  
  let sx, sy, sWidth, sHeight;
  
  // Calculate the aspect ratio of the target area
  const targetAreaAspect = width / height;
  
  if (imgAspect > targetAreaAspect) {
    // Image is wider than target area, crop sides
    sHeight = img.height;
    sWidth = img.height * targetAreaAspect;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    // Image is taller than target area, crop top/bottom
    sWidth = img.width;
    sHeight = img.width / targetAreaAspect;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }
  
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
}

function supportsCanvasFilter(ctx) {
  if (!ctx || typeof ctx.filter !== 'string') return false;

  const original = ctx.filter;
  try {
    ctx.filter = 'sepia(80%)';
    const isSet = ctx.filter === 'sepia(80%)';
    ctx.filter = original;
    return isSet;
  } catch {
    ctx.filter = original;
    return false;
  }
}

function clampColor(value) {
  if (value < 0) return 0;
  if (value > 255) return 255;
  return value;
}

function applyFallbackFilterToRegion(ctx, region, filter) {
  if (!region || !filter || filter === 'none') return;

  const x = Math.max(0, Math.floor(region.x));
  const y = Math.max(0, Math.floor(region.y));
  const width = Math.min(ctx.canvas.width - x, Math.ceil(region.width));
  const height = Math.min(ctx.canvas.height - y, Math.ceil(region.height));
  if (width <= 0 || height <= 0) return;

  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;

  const grayscaleMatch = filter.match(/grayscale\((\d+)%\)/i);
  const sepiaMatch = filter.match(/sepia\((\d+)%\)/i);
  const contrastMatch = filter.match(/contrast\((\d+)%\)/i);
  const saturateMatch = filter.match(/saturate\((\d+)%\)/i);

  const grayscaleAmount = grayscaleMatch ? Math.max(0, Math.min(1, Number(grayscaleMatch[1]) / 100)) : 0;
  const sepiaAmount = sepiaMatch ? Math.max(0, Math.min(1, Number(sepiaMatch[1]) / 100)) : 0;
  const contrastAmount = contrastMatch ? Number(contrastMatch[1]) / 100 : 1;
  const saturateAmount = saturateMatch ? Number(saturateMatch[1]) / 100 : 1;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (grayscaleAmount > 0) {
      const gray = (r + g + b) / 3;
      r = r * (1 - grayscaleAmount) + gray * grayscaleAmount;
      g = g * (1 - grayscaleAmount) + gray * grayscaleAmount;
      b = b * (1 - grayscaleAmount) + gray * grayscaleAmount;
    }

    if (sepiaAmount > 0) {
      const sepiaR = (r * 0.393) + (g * 0.769) + (b * 0.189);
      const sepiaG = (r * 0.349) + (g * 0.686) + (b * 0.168);
      const sepiaB = (r * 0.272) + (g * 0.534) + (b * 0.131);
      r = r * (1 - sepiaAmount) + sepiaR * sepiaAmount;
      g = g * (1 - sepiaAmount) + sepiaG * sepiaAmount;
      b = b * (1 - sepiaAmount) + sepiaB * sepiaAmount;
    }

    if (contrastAmount !== 1) {
      r = ((r - 128) * contrastAmount) + 128;
      g = ((g - 128) * contrastAmount) + 128;
      b = ((b - 128) * contrastAmount) + 128;
    }

    if (saturateAmount !== 1) {
      const gray = (r * 0.299) + (g * 0.587) + (b * 0.114);
      r = gray + (r - gray) * saturateAmount;
      g = gray + (g - gray) * saturateAmount;
      b = gray + (b - gray) * saturateAmount;
    }

    data[i] = clampColor(Math.round(r));
    data[i + 1] = clampColor(Math.round(g));
    data[i + 2] = clampColor(Math.round(b));
  }

  ctx.putImageData(imageData, x, y);
}

// Return readable text color based on background brightness.
function getContrastTextColor(backgroundColor) {
  if (!backgroundColor || typeof backgroundColor !== 'string') return '#000000';

  let r;
  let g;
  let b;

  // Handle hex colors: #RGB or #RRGGBB
  if (backgroundColor.startsWith('#')) {
    let hex = backgroundColor.slice(1).trim();

    if (hex.length === 3) {
      hex = hex.split('').map(ch => ch + ch).join('');
    }

    if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
  } else {
    // Handle rgb()/rgba() fallback formats.
    const match = backgroundColor.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      r = Number(match[1]);
      g = Number(match[2]);
      b = Number(match[3]);
    }
  }

  // Fallback to black text if parsing fails.
  if (![r, g, b].every(Number.isFinite)) return '#000000';

  // Perceived brightness (YIQ). Higher means brighter background.
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 150 ? '#ffffff' : '#000000';
}

// RENDER TO CANVAS (Main rendering function)
function renderToCanvas(canvas, frameType, images, filter, borderColor, scale = 1) {
  const config = FRAME_CONFIG[frameType];
  const ctx = canvas.getContext("2d");
  const canUseNativeFilter = supportsCanvasFilter(ctx);
  const photoRegions = [];
  
  canvas.width = config.width * scale;
  canvas.height = config.height * scale;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Thicker borders/margins
  const margin = 30 * scale;  // Increased from 10px
  const timestampHeight = config.hasTimestamp ? 80 * scale : 0;
  
  // Draw border background
  ctx.fillStyle = borderColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Calculate available space for photos
  const availableWidth = canvas.width - (margin * 2);
  const availableHeight = canvas.height - (margin * 2) - timestampHeight;
  
  // Apply filter
  ctx.filter = canUseNativeFilter ? filter : 'none';
  
  // Draw images based on frame type with proper cropping
  if (frameType === "strip") {
    // 4 photos stacked vertically
    const photoHeight = availableHeight / 4;
    const photoWidth = availableWidth;
    const gap = 8 * scale;
    
    images.forEach((img, i) => {
      if (img) {
        const x = margin;
        const y = margin + (i * (photoHeight + gap));
        const w = photoWidth;
        const h = photoHeight - gap;
        
        drawImageCropped(ctx, img, x, y, w, h, config.aspectRatio);
        photoRegions.push({ x, y, width: w, height: h });
      }
    });
  }
  
  if (frameType === "grid") {
    // 2x2 grid
    const photoWidth = (availableWidth - (8 * scale)) / 2;
    const photoHeight = (availableHeight - (8 * scale)) / 2;
    const gap = 8 * scale;
    
    images.forEach((img, i) => {
      if (img) {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + (col * (photoWidth + gap));
        const y = margin + (row * (photoHeight + gap));
        
        drawImageCropped(ctx, img, x, y, photoWidth, photoHeight, config.aspectRatio);
        photoRegions.push({ x, y, width: photoWidth, height: photoHeight });
      }
    });
  }
  
  if (frameType === "vintage") {
    // 4 photos stacked vertically, tight spacing
    const photoHeight = availableHeight / 4;
    const photoWidth = availableWidth;
    const gap = 5 * scale;
    
    images.forEach((img, i) => {
      if (img) {
        const x = margin;
        const y = margin + (i * (photoHeight + gap));
        const w = photoWidth;
        const h = photoHeight - gap;
        
        drawImageCropped(ctx, img, x, y, w, h, config.aspectRatio);
        photoRegions.push({ x, y, width: w, height: h });
      }
    });
  }

  // Fallback for mobile browsers that do not apply canvas ctx.filter reliably.
  if (!canUseNativeFilter && filter && filter !== 'none') {
    photoRegions.forEach(region => applyFallbackFilterToRegion(ctx, region, filter));
  }
  
  // Reset filter for text
  ctx.filter = 'none';
  
  // Add timestamp if applicable
  if (config.hasTimestamp) {
    const timestampY = canvas.height - timestampHeight;
    
    // Draw timestamp background
    ctx.fillStyle = borderColor;
    ctx.fillRect(0, timestampY, canvas.width, timestampHeight);
    
    // Draw timestamp text
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    const timestamp = `${dateStr} ${timeStr}`.toLowerCase();
    
    ctx.fillStyle = getContrastTextColor(borderColor);
    ctx.font = `bold ${20 * scale}px 'Majestic Face', 'Times New Roman', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(timestamp, canvas.width / 2, timestampY + (timestampHeight / 2));
  }
}

// DOWNLOAD
function download() {
  const canvas = document.getElementById("final-canvas");
  const link = document.createElement("a");
  const frameName = appState.selectedFrame || 'photobooth';
  link.download = `photobooth-${frameName}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Initialize app on load
window.addEventListener('DOMContentLoaded', () => {
  goToStep(1);
});