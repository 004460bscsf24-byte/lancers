/**
 * Lancers Auto-Playing Hero Frame Animation
 * 270 Frames Auto Play Covering Full Screen Device Display Size
 */

const TOTAL_FRAMES = 270;
const FRAME_PATH_PREFIX = 'lncers/frames/ezgif-frame-';
const FRAME_EXTENSION = '.jpg';
const FPS = 30; // 30 Frames per second playback speed

// State variables
const images = [];
let framesLoaded = 0;
let currentFrameIndex = 0;
let lastTimestamp = 0;
let resizeTimer = null; // debounce timer for resize

// DOM Elements
const canvas = document.getElementById('frameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * Format frame index to 3-digit string (e.g., 1 -> '001')
 */
function formatFrameNumber(num) {
  return String(num).padStart(3, '0');
}

/**
 * Preload all 270 frames into memory
 */
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameNumStr = formatFrameNumber(i);
    img.src = `${FRAME_PATH_PREFIX}${frameNumStr}${FRAME_EXTENSION}`;

    img.onload = () => {
      framesLoaded++;

      if (framesLoaded === 1) {
        resizeCanvas();
      }

      if (framesLoaded === TOTAL_FRAMES) {
        onAllFramesLoaded();
      }
    };

    img.onerror = () => {
      console.warn(`Failed to load frame ${i}`);
      framesLoaded++;
      if (framesLoaded === TOTAL_FRAMES) {
        onAllFramesLoaded();
      }
    };

    images.push(img);
  }
}

function onAllFramesLoaded() {
  // All frames ready — animation begins immediately
}

/**
 * Resize Canvas & Adjust for High DPI Screen Size
 * Resets transform each time to prevent DPR accumulation on repeated resize.
 */
function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;

  // Use the parent container dimensions so canvas truly fills the section
  const parent = canvas.parentElement || canvas;
  const w = parent.clientWidth  || window.innerWidth;
  const h = parent.clientHeight || window.innerHeight;

  // Reset accumulated transforms before re-applying DPR scale
  canvas.width  = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  renderCanvas();
}

/**
 * Render frame onto canvas covering full screen display according to screen size
 */
function renderCanvas() {
  if (!images.length || !canvas || !ctx) return;

  const frameIdx = Math.min(Math.max(Math.floor(currentFrameIndex), 0), TOTAL_FRAMES - 1);
  const img = images[frameIdx];

  if (!img || !img.complete || img.naturalWidth === 0) return;

  const rect = canvas.getBoundingClientRect();
  const cWidth = rect.width;
  const cHeight = rect.height;

  ctx.clearRect(0, 0, cWidth, cHeight);

  const imgRatio = img.naturalWidth / img.naturalHeight;
  const containerRatio = cWidth / cHeight;

  let drawWidth, drawHeight, drawX, drawY;

  // Cover full screen container display according to screen size
  if (containerRatio > imgRatio) {
    drawWidth = cWidth;
    drawHeight = cWidth / imgRatio;
  } else {
    drawHeight = cHeight;
    drawWidth = cHeight * imgRatio;
  }

  drawX = (cWidth - drawWidth) / 2;
  drawY = (cHeight - drawHeight) / 2;

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

/**
 * Continuous Auto-Play Animation Loop
 */
function animate(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const elapsed = timestamp - lastTimestamp;

  const frameDuration = 1000 / FPS;

  if (elapsed >= frameDuration) {
    currentFrameIndex = (currentFrameIndex + 1) % TOTAL_FRAMES;
    renderCanvas();
    lastTimestamp = timestamp - (elapsed % frameDuration);
  }

  requestAnimationFrame(animate);
}

function setupEventListeners() {
  // Debounce resize to avoid rapid-fire calls during orientation change / drag
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 100);
  });

  // Also handle orientation change on mobile devices
  window.addEventListener('orientationchange', () => {
    // Small delay lets the browser update layout dimensions first
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 200);
  });
}

function init() {
  preloadFrames();
  setupEventListeners();
  resizeCanvas();
  requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', init);
