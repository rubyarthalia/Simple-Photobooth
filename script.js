let images = [];
let frame = "strip";
let filter = "none";

// CAMERA
function startCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      document.getElementById("video").srcObject = stream;
    });
}

// AUTO SESSION
async function startCapture() {
  images = [];

  for (let i = 0; i < 4; i++) {
    await countdown(3);
    takePhoto();
    render(); // update preview instantly
  }
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

// TAKE PHOTO
function takePhoto() {
  const video = document.getElementById("video");

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;

  const ctx = tempCanvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const img = new Image();
  img.src = tempCanvas.toDataURL();

  images.push(img);
}

// UPLOAD
function uploadImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = () => {
      images.push(img);
      render(); // auto update
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// FRAME
function setFrame(type) {
  frame = type;
  render();
}

// FILTER
function setFilter(f) {
  filter = f;
  render();
}

// 🔥 AUTO RENDER (MAIN FEATURE)
function render() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = filter;

  if (frame === "strip") {
    canvas.width = 300;
    canvas.height = 600;

    images.forEach((img, i) => {
      ctx.drawImage(img, 0, i * 150, 300, 150);
    });
  }

  if (frame === "grid") {
    canvas.width = 300;
    canvas.height = 300;

    images.forEach((img, i) => {
      const x = (i % 2) * 150;
      const y = Math.floor(i / 2) * 150;
      ctx.drawImage(img, x, y, 150, 150);
    });
  }

  if (frame === "vintage") {
    canvas.width = 200;
    canvas.height = 600;

    images.forEach((img, i) => {
      ctx.drawImage(img, 0, i * 150, 200, 150);
    });
  }
}

// DOWNLOAD
function download() {
  const canvas = document.getElementById("canvas");
  const link = document.createElement("a");
  link.download = "photobooth.png";
  link.href = canvas.toDataURL();
  link.click();
}