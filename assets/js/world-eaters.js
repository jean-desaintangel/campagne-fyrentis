import { escapeHTML, escapeAttr } from "./utils.js";
import { FyrentisReveal } from "./pages.js";

function validateMecaniques(m) {
  if (!m || typeof m !== "object") throw new Error("mecaniques manquant");
  if (!m.vaisseau || !Array.isArray(m.vaisseau.bonus))
    throw new Error("vaisseau invalide");
  if (!m.cranes || !Array.isArray(m.cranes.paliers))
    throw new Error("cranes invalide");
  if (!m.sang || !Array.isArray(m.sang.paliers))
    throw new Error("sang invalide");
  if (!m.saint_carnage || !Array.isArray(m.saint_carnage.unites))
    throw new Error("saint_carnage invalide");
}

function renderMecaniques(m) {
  validateMecaniques(m);
  const vaisseau = m.vaisseau;
  const cranes = m.cranes;
  const sang = m.sang;
  const sc = m.saint_carnage;

  document.getElementById("mecaniques-container").innerHTML = `
<div class="ornament"><span>Le Conqueror</span></div>
<div class="ship-layout">
  <div class="ship-img-wrap reveal">
    <img src="../../${escapeAttr(vaisseau.image)}" alt="${escapeAttr(vaisseau.image_alt)}" width="800" height="360" loading="lazy">
  </div>
  <div class="reveal reveal-delay-2">
    <h3>Bonus de Vaisseau</h3>
    <ul class="ship-bonus-list" role="list">${vaisseau.bonus
      .map(
        (b) =>
          `<li class="ship-bonus"><span class="ship-bonus-icon">${escapeHTML(b.icone)}</span><div><p class="ship-bonus-name">${escapeHTML(b.nom)}</p><p class="ship-bonus-desc">${escapeHTML(b.desc)}</p></div></li>`,
      )
      .join("")}</ul>
  </div>
</div>

<div class="ornament"><span>Mécaniques Spéciales</span></div>
<div class="mechanics-grid">
  <div class="mechanic-card reveal">
    <span class="mechanic-icon">${escapeHTML(cranes.icone)}</span>
    <h3 class="mechanic-title"><span class="red">${escapeHTML(cranes.titre)}</span></h3>
    <p class="mechanic-desc">${escapeHTML(cranes.desc)}</p>
    <ul class="mechanic-tiers" role="list">${cranes.paliers
      .map(
        (p) =>
          `<li><span class="tier-num">${escapeHTML(p.seuil)}</span>${escapeHTML(p.effet)}</li>`,
      )
      .join("")}</ul>
  </div>
  <div class="mechanic-card reveal reveal-delay-2">
    <span class="mechanic-icon">${escapeHTML(sang.icone)}</span>
    <h3 class="mechanic-title"><span class="red">${escapeHTML(sang.titre)}</span></h3>
    <p class="mechanic-desc">${escapeHTML(sang.desc)}</p>
    <ul class="mechanic-tiers" role="list">${sang.paliers
      .map(
        (p) =>
          `<li><span class="tier-num gold">${escapeHTML(p.seuil)}</span>${escapeHTML(p.effet)}</li>`,
      )
      .join("")}</ul>
  </div>
  <div class="mechanic-card reveal">
    <span class="mechanic-icon">${escapeHTML(sc.icone)}</span>
    <h3 class="mechanic-title">Règle <span class="red">${escapeHTML(sc.titre)}</span></h3>
    <p class="mechanic-desc">${escapeHTML(sc.desc)}</p>
    <div>${sc.unites.map((u) => `<div><p>${escapeHTML(u.nom)}</p><p>${escapeHTML(u.detail)}</p></div>`).join("")}</div>
  </div>
</div>`;
}

fetch("../../assets/data/campagne.json")
  .then((r) => r.json())
  .then((d) => {
    renderMecaniques(d.mecaniques);
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) =>
      FyrentisReveal.observe(el),
    );
  })
  .catch((err) => {
    console.error("Erreur chargement campagne.json :", err);
    document.getElementById("mecaniques-container").innerHTML =
      '<p class="load-error">Erreur : impossible de charger les données.</p>';
  });
