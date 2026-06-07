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
function renderJoueurs(joueurs) {
  document.getElementById("players-grid").innerHTML = joueurs
    .map(
      (j) =>
        `<article class="player-card player-card--${escapeAttr(j.couleur)} reveal${delayClass(j.delai)}">
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
          const safeHref =
            b.lien &&
            (/^https?:\/\//i.test(b.lien.href) ||
              b.lien.href.startsWith("/") ||
              b.lien.href.startsWith("."))
              ? b.lien.href
              : "#";
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
  .then((r) => r.json())
  .then((d) => {
    validateCampagne(d);
    renderJoueurs(d.joueurs);
    renderLore(d.lore);
    renderFronts(d.fronts);
    initTabs();
    initPersonnagesCarousel(d);
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
  const dotsWrap = carousel.querySelector(".carousel__dots");
  const btnPrev = carousel.querySelector(".carousel__btn--prev");
  const btnNext = carousel.querySelector(".carousel__btn--next");
  if (!slides.length || !dotsWrap || !btnPrev || !btnNext) return;
  const INTERVAL = 3500;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let current = 0;
  let timer = null;
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.classList.add("carousel__dot");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Image ${i + 1} sur ${slides.length}`);
    dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
    if (i === 0) dot.classList.add("is-active");
    dot.addEventListener("click", () => {
      goTo(i);
      if (!reducedMotion) {
        stop();
        start();
      }
    });
    dotsWrap.appendChild(dot);
    return dot;
  });
  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    dots[current].setAttribute("aria-selected", "false");
    current = ((index % slides.length) + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    dots[current].setAttribute("aria-selected", "true");
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
  start();
})();
