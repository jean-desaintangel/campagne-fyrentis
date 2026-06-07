// ── SÉLECTION SYSTÈME ──────────────────────────────────────────
const groups = document.querySelectorAll(".sys-group");
const details = document.querySelectorAll(".system-detail");
const emptyState = document.getElementById("empty-state");

function selectSystem(id) {
  groups.forEach((g) =>
    g.classList.toggle("selected", g.dataset.sys === id),
  );
  details.forEach((d) => d.classList.remove("active"));
  const detail = document.getElementById("detail-" + id);
  if (detail) {
    detail.classList.add("active");
    emptyState.style.display = "none";
  }
}

groups.forEach((g) => {
  g.addEventListener("click", () => selectSystem(g.dataset.sys));
  g.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectSystem(g.dataset.sys);
    }
  });
});

// ── ZOOM / PAN SVG ──────────────────────────────────────────────
const svg = document.getElementById("map-svg");
let scale = 1,
  tx = 0,
  ty = 0;
let isDragging = false,
  startX = 0,
  startY = 0,
  startTx = 0,
  startTy = 0;

function setViewBox() {
  const vw = 900,
    vh = 650;
  const x = -tx / scale,
    y = -ty / scale;
  const w = vw / scale,
    h = vh / scale;
  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

document.getElementById("zoom-in").addEventListener("click", () => {
  scale = Math.min(scale * 1.3, 4);
  setViewBox();
});
document.getElementById("zoom-out").addEventListener("click", () => {
  scale = Math.max(scale / 1.3, 0.5);
  setViewBox();
});
document.getElementById("zoom-reset").addEventListener("click", () => {
  scale = 1;
  tx = 0;
  ty = 0;
  svg.setAttribute("viewBox", "0 0 900 650");
});

svg.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 900;
    const my = ((e.clientY - rect.top) / rect.height) * 650;
    const [ox, oy, ow, oh] = svg
      .getAttribute("viewBox")
      .split(" ")
      .map(Number);
    const nx = mx - (mx - ox) * delta;
    const ny = my - (my - oy) * delta;
    const nw = Math.min(Math.max(ow * delta, 300), 1800);
    const nh = Math.min(Math.max(oh * delta, 200), 1300);
    svg.setAttribute("viewBox", `${nx} ${ny} ${nw} ${nh}`);
  },
  { passive: false },
);

// Pan
svg.addEventListener("mousedown", (e) => {
  if (e.target.closest(".sys-group")) return;
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  const [ox, oy, ow, oh] = svg
    .getAttribute("viewBox")
    .split(" ")
    .map(Number);
  startTx = ox;
  startTy = oy;
});
window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const rect = svg.getBoundingClientRect();
  const [, , ow, oh] = svg
    .getAttribute("viewBox")
    .split(" ")
    .map(Number);
  const dx = (-(e.clientX - startX) / rect.width) * ow;
  const dy = (-(e.clientY - startY) / rect.height) * oh;
  svg.setAttribute(
    "viewBox",
    `${startTx + dx} ${startTy + dy} ${ow} ${oh}`,
  );
});
window.addEventListener("mouseup", () => {
  isDragging = false;
});
