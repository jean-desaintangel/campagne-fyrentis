// ── SÉLECTION SYSTÈME ──────────────────────────────────────────
const groups = document.querySelectorAll(".sys-group");
const details = document.querySelectorAll(".system-detail");
const emptyState = document.getElementById("empty-state");

function selectSystem(id) {
  groups.forEach((g) => g.classList.toggle("selected", g.dataset.sys === id));
  details.forEach((d) => d.classList.remove("active"));
  const detail = document.getElementById("detail-" + id);
  if (detail) {
    detail.classList.add("active");
    // Garde : la page peut ne pas avoir d'état vide.
    if (emptyState) emptyState.style.display = "none";
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
// Source de vérité UNIQUE : l'attribut viewBox du SVG.
// L'ancienne version maintenait en parallèle des variables scale/tx/ty mises à
// jour SEULEMENT par les boutons, jamais par la molette ni le pan. Résultat :
// après un zoom molette ou un pan, cliquer sur zoom-in/out repartait de valeurs
// périmées (scale=1, tx=0, ty=0) et la vue sautait. Tout passe désormais par le
// viewBox courant → plus aucune désynchronisation.
const svg = document.getElementById("map-svg");
const VIEWBOX_DEFAULT = "0 0 900 650";

// Bornes de la taille du viewBox (largeur/hauteur) pour éviter un zoom infini.
const MIN_W = 300,
  MAX_W = 1800,
  MIN_H = 200,
  MAX_H = 1300;

function getViewBox() {
  return (svg.getAttribute("viewBox") || VIEWBOX_DEFAULT).split(" ").map(Number);
}

function setViewBox(x, y, w, h) {
  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

// Zoom centré sur le milieu du viewBox courant.
// factor > 1 = on zoome (la fenêtre rétrécit), factor < 1 = on dézoome.
function zoomBy(factor) {
  const [x, y, w, h] = getViewBox();
  const nw = Math.min(Math.max(w / factor, MIN_W), MAX_W);
  const nh = Math.min(Math.max(h / factor, MIN_H), MAX_H);
  setViewBox(x + (w - nw) / 2, y + (h - nh) / 2, nw, nh);
}

if (svg) {
  const btnIn = document.getElementById("zoom-in");
  const btnOut = document.getElementById("zoom-out");
  const btnReset = document.getElementById("zoom-reset");
  if (btnIn) btnIn.addEventListener("click", () => zoomBy(1.3));
  if (btnOut) btnOut.addEventListener("click", () => zoomBy(1 / 1.3));
  if (btnReset)
    btnReset.addEventListener("click", () =>
      svg.setAttribute("viewBox", VIEWBOX_DEFAULT),
    );

  // Zoom molette centré sur le curseur (lit/écrit le viewBox courant).
  svg.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 / 1.18 : 1.18; // <1 dézoome, >1 zoome
      const rect = svg.getBoundingClientRect();
      const [ox, oy, ow, oh] = getViewBox();
      // Position du curseur en coordonnées SVG.
      const mx = ox + ((e.clientX - rect.left) / rect.width) * ow;
      const my = oy + ((e.clientY - rect.top) / rect.height) * oh;
      const nw = Math.min(Math.max(ow / delta, MIN_W), MAX_W);
      const nh = Math.min(Math.max(oh / delta, MIN_H), MAX_H);
      // On garde le point sous le curseur fixe pendant le zoom.
      const nx = mx - ((mx - ox) * nw) / ow;
      const ny = my - ((my - oy) * nh) / oh;
      setViewBox(nx, ny, nw, nh);
    },
    { passive: false },
  );

  // ── Pan (déplacement) : lit/écrit le viewBox courant ───────────
  let isDragging = false,
    startX = 0,
    startY = 0,
    startVBX = 0,
    startVBY = 0;

  svg.addEventListener("mousedown", (e) => {
    if (e.target.closest(".sys-group")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const [ox, oy] = getViewBox();
    startVBX = ox;
    startVBY = oy;
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const rect = svg.getBoundingClientRect();
    const [, , ow, oh] = getViewBox();
    const dx = (-(e.clientX - startX) / rect.width) * ow;
    const dy = (-(e.clientY - startY) / rect.height) * oh;
    setViewBox(startVBX + dx, startVBY + dy, ow, oh);
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
