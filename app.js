const canvas = document.getElementById("pixelScene");
const cover = document.getElementById("cover");
const enterButton = document.getElementById("enterButton");
const backButton = document.getElementById("backButton");
const ctx = canvas.getContext("2d");

const state = {
  cols: 0,
  rows: 0,
  cell: 6,
  tick: 0,
};

function resizeCanvas() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  state.cell = width < 720 ? 7 : 8;
  state.cols = Math.ceil(width / state.cell);
  state.rows = Math.ceil(height / state.cell);
  canvas.width = state.cols;
  canvas.height = state.rows;
}

function noise(x, y, t) {
  const value = Math.sin(x * 12.9898 + y * 78.233 + t * 0.018) * 43758.5453;
  return value - Math.floor(value);
}

function drawPixelScene() {
  const { cols, rows, tick } = state;
  const portrait = rows > cols;
  ctx.clearRect(0, 0, cols, rows);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, cols, rows);

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const nx = x / cols;
      const ny = y / rows;
      const beamLine = portrait ? 0.86 - nx * 0.78 : 0.78 - nx * 0.55;
      const horizonLine = portrait ? 0.7 : 0.66;
      const beam = Math.max(0, 1 - Math.abs(ny - beamLine) * (portrait ? 5.1 : 6.2));
      const horizon = Math.max(0, 1 - Math.abs(ny - horizonLine) * 9);
      const field = noise(x, y, tick);
      const mountainA = ny > (portrait ? 0.66 : 0.6) + Math.sin(nx * 8) * 0.035 + nx * 0.12;
      const mountainB = ny > (portrait ? 0.76 : 0.72) + Math.cos(nx * 7) * 0.04 - nx * 0.1;
      let tone = beam * 0.72 + horizon * 0.18 + field * 0.17;

      if (mountainA) tone -= 0.35;
      if (mountainB) tone -= 0.25;

      const personX = Math.abs(nx - (portrait ? 0.62 : 0.55));
      const body = personX < (portrait ? 0.052 : 0.035) && ny > (portrait ? 0.64 : 0.57) && ny < 0.88;
      const head = personX < (portrait ? 0.04 : 0.026) && Math.abs(ny - (portrait ? 0.6 : 0.53)) < 0.04;
      if (body || head) tone = 0.02;

      if (field < tone) {
        const shade = Math.min(245, Math.max(35, Math.floor(34 + tone * 228)));
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    portrait ? 4 : 8,
    Math.floor(rows * (portrait ? 0.55 : 0.52)),
    cols - (portrait ? 8 : 16),
    Math.floor(rows * (portrait ? 0.34 : 0.36)),
  );

  state.tick += 1;
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
cover.addEventListener("click", openInvitation);
enterButton.addEventListener("click", openInvitation);
backButton.addEventListener("click", closeInvitation);

window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !document.body.classList.contains("is-open")) {
    openInvitation();
  }

  if (event.key === "Escape" && document.body.classList.contains("is-open")) {
    document.body.classList.remove("is-open");
  }
});
