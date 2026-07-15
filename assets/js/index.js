/**
 * index.js — Page d'accueil : rendu des sections (joueurs, lore, fronts,
 * personnages) depuis campagne.json + carrousel d'images du hero.
 * Dépendances : utils.js (échappement anti-XSS), pages.js (reveal),
 *               personnages-carousel.js, assets/data/campagne.json
 * @author  Jean
 * @since   2026-07
 */
import { escapeHTML, escapeAttr } from "./utils.js";
import { initPersonnagesCarousel } from "./personnages-carousel.js";
import { FyrentisReveal } from "./pages.js";

// ── VALIDATION SCHÉMA ──────────────────────────────────────────────────────
function validateCampagne(d) {
  if (!Array.isArray(d.joueurs)) throw new Error("joueurs manquant");
  if (!d.lore || !Array.isArray(d.lore.blocs)) throw new Error("lore invalide");
  if (!Array.isArray(d.fronts)) throw new Error("fronts manquant");
}

// ── TABS ───────────────────────────────────────────────────────────────────
function initTabs() {
  const tabs = document.querySelectorAll(".front-tab");
  const panels = document.querySelectorAll(".front-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      const p = document.getElementById("tab-" + tab.dataset.tab);
      if (p) p.classList.add("active");
    });
  });
}

function delayClass(n) {
  return n ? ` reveal-delay-${n}` : "";
}

// ── RENDER : JOUEURS ───────────────────────────────────────────────────────
// L'id "specificites-<joueur>" sert de cible aux liens « Retour à l'accueil »
// des pages armées (ex. index.html#specificites-freddy). Il vient du champ
// `id` de campagne.json : le garder synchronisé avec les liens des pages.
function renderJoueurs(joueurs) {
  document.getElementById("players-grid").innerHTML = joueurs
    .map(
      (j) =>
        `<article${j.id ? ` id="specificites-${escapeAttr(j.id)}"` : ""} class="player-card player-card--${escapeAttr(j.couleur)} reveal${delayClass(j.delai)}">
        <p class="player-name">${escapeHTML(j.nom)}</p>
        <p class="player-role">${escapeHTML(j.role)}</p>
        <ul class="player-armies" role="list">${(j.armees || []).map((a) => `<li>${escapeHTML(a)}</li>`).join("")}</ul>
      </article>`,
    )
    .join("");
}

// ── RENDER : LORE ──────────────────────────────────────────────────────────
function renderLore(lore) {
  document.getElementById("lore-desc").textContent = lore.description;
  document.getElementById("lore-grid").innerHTML = lore.blocs
    .map(
      (b, i) =>
        `<div class="lore-text reveal${i > 0 ? " reveal-delay-2" : ""}">
        <h3>${escapeHTML(b.titre)}</h3>
        ${(b.paragraphes || []).map((p) => `<p>${escapeHTML(p)}</p>`).join("")}
        ${
          b.citation
            ? `<div class="quote-block${b.citation.alerte ? " quote-block--alert" : ""}">
          <p class="quote-text">${escapeHTML(b.citation.texte)}</p>
          <span class="quote-author">${escapeHTML(b.citation.auteur)}</span>
        </div>`
            : ""
        }
      </div>`,
    )
    .join("");
}

// ── RENDER : FRONTS ────────────────────────────────────────────────────────
function renderFronts(fronts) {
  document.getElementById("fronts-tabs").innerHTML = fronts
    .map(
      (f, i) =>
        `<button class="front-tab${i === 0 ? " active" : ""}" role="tab" aria-selected="${i === 0}" data-tab="${escapeAttr(f.id)}">${escapeHTML(f.nom)}</button>`,
    )
    .join("");
  document.getElementById("fronts-panels").innerHTML = fronts
    .map((f, i) => {
      const stationsHTML = f.stations
        ? `
        <h4>Statut des ${f.stations.length} Agro-Stations</h4>
        <div class="stations-grid">${f.stations
          .map(
            (s) =>
              `<div class="station-card"><div class="station-num">${escapeHTML(s.num)}</div><div class="station-label">Station</div><span class="station-owner ${escapeAttr(s.classe)}">${escapeHTML(s.proprietaire)}</span></div>`,
          )
          .join("")}</div>`
        : "";
      const imageHTML = f.image
        ? f.stations
          ? `<img src="${escapeAttr(f.image)}" alt="${escapeAttr(f.image_alt)}" width="1200" height="400" loading="lazy">`
          : `<div class="front-visual"><img src="${escapeAttr(f.image)}" alt="${escapeAttr(f.image_alt)}" width="1600" height="900" loading="lazy"></div>`
        : "";
      const bataillesHTML = (f.batailles || [])
        .map((b) => {
          const hasUnsafeScheme =
            /^[a-z][a-z0-9+.-]*:/i.test(b.lien?.href || "") &&
            !/^https?:\/\//i.test(b.lien.href);
          const safeHref = b.lien && !hasUnsafeScheme ? b.lien.href : "#";
          const lienHTML = b.lien
            ? ` <a href="${escapeAttr(safeHref)}">${escapeHTML(b.lien.label)}</a>`
            : "";
          return `<div class="battle-entry ${escapeAttr(b.classe)}">
          <p class="battle-label">${escapeHTML(b.label)}</p>
          <h4 class="battle-title">${escapeHTML(b.titre)}</h4>
          <p class="battle-text">${escapeHTML(b.texte)}${lienHTML}</p>
          <div class="battle-factions">${(b.factions || []).map((fc) => `<span class="faction-tag ${escapeAttr(fc.classe)}">${escapeHTML(fc.label)}</span>`).join("")}</div>
        </div>`;
        })
        .join("");
      return `<div class="front-panel${i === 0 ? " active" : ""}" id="tab-${escapeAttr(f.id)}" role="tabpanel">
        <div class="front-header">
          <div><h3 class="front-title">${escapeHTML(f.titre)}</h3><p class="front-desc">${escapeHTML(f.description)}</p></div>
          <span class="front-status ${escapeAttr(f.statut_classe)}">${escapeHTML(f.statut)}</span>
        </div>
        ${imageHTML}${stationsHTML}
        ${f.stations ? '<div class="ornament section-ornament"><span>Chronique des Batailles</span></div>' : ""}
        <div class="battle-log">${bataillesHTML}</div>
      </div>`;
    })
    .join("");
}

// ── MAIN : FETCH + RENDER ──────────────────────────────────────────────────
fetch("assets/data/campagne.json")
  .then((r) => {
    // r.ok distingue une vraie erreur HTTP (404, 500) d'un JSON invalide :
    // sans ce test, un 404 produirait un SyntaxError JSON trompeur au débogage.
    if (!r.ok) throw new Error(`HTTP ${r.status} sur campagne.json`);
    return r.json();
  })
  .then((d) => {
    validateCampagne(d);
    renderJoueurs(d.joueurs);
    renderLore(d.lore);
    renderFronts(d.fronts);
    initTabs();
    initPersonnagesCarousel(d);
    // Les ancres #specificites-<joueur> n'existent qu'après ce rendu JS :
    // quand on arrive d'une page armée avec un hash, le navigateur a déjà
    // tenté (et raté) le défilement initial — on le rejoue maintenant.
    if (location.hash) {
      const cible = document.getElementById(location.hash.slice(1));
      if (cible) cible.scrollIntoView();
    }
  })
  .catch((err) => {
    console.error("Erreur chargement campagne.json :", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      '<div class="load-error">Erreur : impossible de charger campagne.json</div>',
    );
  })
  .finally(() => {
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) =>
      FyrentisReveal.observe(el),
    );
  });

// ── CARROUSEL IMAGES ───────────────────────────────────────────────────────
(function () {
  const carousel = document.getElementById("main-carousel");
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll(".carousel__slide"));
  const btnPrev = carousel.querySelector(".carousel__btn--prev");
  const btnNext = carousel.querySelector(".carousel__btn--next");
  if (!slides.length || !btnPrev || !btnNext) return;
  const INTERVAL = 3500;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let current = 0;
  let timer = null;

  // Chargement différé « réel » des slides.
  // Le loading="lazy" natif est inopérant ici : les slides sont empilées en
  // position:absolute/opacity:0, donc toutes « visibles » pour le navigateur,
  // qui téléchargerait les 31 images dès l'arrivée (~13 Mo en JPEG à l'époque).
  // On ne résout donc data-src/data-srcset qu'au moment où la slide devient
  // active — plus une slide d'avance pour que la transition reste fluide.
  function loadSlide(index) {
    const i = ((index % slides.length) + slides.length) % slides.length;
    const img = slides[i].querySelector("img[data-src]");
    if (!img) return; // déjà chargée
    img.srcset = img.dataset.srcset || "";
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
    img.removeAttribute("data-srcset");
  }

  function goTo(index) {
    slides[current].classList.remove("is-active");
    current = ((index % slides.length) + slides.length) % slides.length;
    loadSlide(current);
    loadSlide(current + 1); // pré-chargement de la suivante
    slides[current].classList.add("is-active");
  }

  function start() {
    if (reducedMotion) return;
    stop();
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }
  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  carousel.addEventListener("focusin", stop);
  carousel.addEventListener("focusout", start);
  btnPrev.addEventListener("click", () => {
    goTo(current - 1);
    if (!reducedMotion) {
      stop();
      start();
    }
  });
  btnNext.addEventListener("click", () => {
    goTo(current + 1);
    if (!reducedMotion) {
      stop();
      start();
    }
  });
  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(current - 1);
    if (e.key === "ArrowRight") goTo(current + 1);
  });
  loadSlide(1); // la slide 1 est eager dans le HTML ; on prépare la n°2
  start();
})();
