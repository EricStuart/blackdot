const canvas = document.getElementById("pixelScene");
const cover = document.getElementById("cover");
const enterButton = document.getElementById("enterButton");
const backButton = document.getElementById("backButton");
const ctx = canvas.getContext("2d");
const PIXEL_FLICKER_SPEED = 0.2;
const PIXEL_FRAME_INTERVAL_MS = 1000 / 12;
const GOLD_LOW = [86, 62, 20];
const GOLD_HIGH = [255, 232, 148];
const BEAM_APEX = { x: 0.98, y: 0.08 };

const state = {
  cols: 0,
  rows: 0,
  cell: 6,
  tick: 0,
  lastDrawAt: 0,
};

function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  state.cell = width < 720 ? 3.5 : 4;
  state.cols = Math.ceil(width / state.cell);
  state.rows = Math.ceil(height / state.cell);
  canvas.width = state.cols;
  canvas.height = state.rows;
}

function noise(x, y, t) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + t * 0.018) * 43758.5453;
  return value - Math.floor(value);
}

function goldGradient(tone, nx, ny) {
  const shimmer = Math.max(0, Math.min(1, tone + nx * 0.18 - ny * 0.08));
  return GOLD_LOW.map((channel, index) => {
    const value = channel + (GOLD_HIGH[index] - channel) * shimmer;
    return Math.round(value);
  });
}

function projectToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const progress =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const projectedX = start.x + progress * dx;
  const projectedY = start.y + progress * dy;
  return {
    distance: Math.hypot(point.x - projectedX, point.y - projectedY),
    progress,
  };
}

function sweepingBeamIntensity(nx, ny, tick, portrait) {
  const sweep = (Math.sin(tick * 0.09 - Math.PI / 2) + 1) / 2;
  const base = { x: 0.04 + sweep * 0.9, y: portrait ? 0.96 : 0.92 };
  const startWidth = portrait ? 0.012 : 0.01;
  const endWidth = portrait ? 0.36 : 0.28;
  const { distance, progress } = projectToSegment({ x: nx, y: ny }, BEAM_APEX, base);
  const currentWidth = startWidth + (endWidth - startWidth) * progress;
  const triangularSpread = Math.max(0, 1 - distance / currentWidth);
  return triangularSpread * (0.72 + progress * 0.28);
}

function drawPixelScene(timestamp = 0) {
  if (state.lastDrawAt && timestamp - state.lastDrawAt < PIXEL_FRAME_INTERVAL_MS) {
    window.requestAnimationFrame(drawPixelScene);
    return;
  }

  state.lastDrawAt = timestamp;
  const { cols, rows, tick } = state;
  const portrait = rows > cols;
  ctx.clearRect(0, 0, cols, rows);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cols, rows);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const nx = x / cols;
      const ny = y / rows;
      const beam = sweepingBeamIntensity(nx, ny, tick, portrait);
      const field = noise(x, y, tick);
      let tone = beam * 0.72 + field * 0.12;

      if (field < tone) {
        const [r, g, b] = goldGradient(tone, nx, ny);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  state.tick += PIXEL_FLICKER_SPEED;
  window.requestAnimationFrame(drawPixelScene);
}

function openInvitation() {
  document.body.classList.add("is-open");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function closeInvitation(event) {
  event.stopPropagation();
  document.body.classList.remove("is-open");
}

resizeCanvas();
drawPixelScene();

window.addEventListener("resize", resizeCanvas);
enterButton.addEventListener("click", openInvitation);
backButton.addEventListener("click", closeInvitation);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("is-open")) {
    document.body.classList.remove("is-open");
  }
});
