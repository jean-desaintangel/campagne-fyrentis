/* ==========================================================================
   index.js
   Script principal de la page d'accueil — Campagne Fyrentis
   Univers World Eaters / Warhammer 40K
   Chargé en différé (defer) depuis index.html
   ========================================================================== */

(function () {
  // ── THEME TOGGLE
  const themeBtn = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;
  let theme =
    root.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.setAttribute("data-theme", theme);
  function updateThemeBtn() {
    if (!themeBtn) return;
    themeBtn.innerHTML =
      theme === "dark"
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    themeBtn.setAttribute(
      "aria-label",
      "Basculer vers le mode " + (theme === "dark" ? "clair" : "sombre"),
    );
  }
  updateThemeBtn();
  if (themeBtn)
    themeBtn.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      updateThemeBtn();
    });

  // ── NAV SCROLL + BACK-TO-TOP
  const nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("nav--scrolled", window.scrollY > 60);
      document
        .getElementById("back-top")
        .classList.toggle("visible", window.scrollY > 300);
    },
    { passive: true },
  );

  // ── REVEAL ON SCROLL
  function initReveal() {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
  }

  // ── TABS
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

  const COULEUR_TO_ARMEE = {
    red: { code: "we", label: "World Eaters" },
    blue: { code: "ba", label: "Blood Angels" },
    green: { code: "gi", label: "Garde Impériale" },
    purple: { code: "iw", label: "Iron Warriors" },
    gold: { code: "bt", label: "Black Templars" },
  };

  function renderJoueurs(joueurs) {
    document.getElementById("players-grid").innerHTML = joueurs
      .map((j) => {
        return `<article class="player-card player-card--${j.couleur} reveal${delayClass(j.delai)}">
        <p class="player-name">${j.nom}</p>
        <p class="player-role">${j.role}</p>
        <ul class="player-armies" role="list">${j.armees.map((a) => `<li>${a}</li>`).join("")}</ul>
      </article>`;
      })
      .join("");
  }

  function renderLore(lore) {
    document.getElementById("lore-desc").textContent = lore.description;
    document.getElementById("lore-grid").innerHTML = lore.blocs
      .map(
        (b, i) =>
          `<div class="lore-text reveal${i > 0 ? " reveal-delay-2" : ""}">
        <h3>${b.titre}</h3>
        ${b.paragraphes.map((p) => `<p>${p}</p>`).join("")}
        <div class="quote-block${b.citation.alerte ? " quote-block--alert" : ""}">
          <p class="quote-text">${b.citation.texte}</p>
          <span class="quote-author">${b.citation.auteur}</span>
        </div>
      </div>`,
      )
      .join("");
  }

  function renderFronts(fronts) {
    document.getElementById("fronts-tabs").innerHTML = fronts
      .map(
        (f, i) =>
          `<button class="front-tab${i === 0 ? " active" : ""}" role="tab" aria-selected="${i === 0}" data-tab="${f.id}">${f.nom}</button>`,
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
              `<div class="station-card"><div class="station-num">${s.num}</div><div class="station-label">Station</div><span class="station-owner ${s.classe}">${s.proprietaire}</span></div>`,
          )
          .join("")}</div>`
          : "";
        const imageHTML = f.image
          ? f.stations
            ? `<img src="${f.image}" alt="${f.image_alt}" width="1200" height="400" loading="lazy">`
            : `<div class="front-visual"><img src="${f.image}" alt="${f.image_alt}" width="1600" height="900" loading="lazy"></div>`
          : "";
        const bataillesHTML = f.batailles
          .map(
            (b) =>
              `<div class="battle-entry ${b.classe}">
          <p class="battle-label">${b.label}</p>
          <h4 class="battle-title">${b.titre}</h4>
          <p class="battle-text">${b.texte}</p>
          <div class="battle-factions">${b.factions.map((fc) => `<span class="faction-tag ${fc.classe}">${fc.label}</span>`).join("")}</div>
        </div>`,
          )
          .join("");
        return `<div class="front-panel${i === 0 ? " active" : ""}" id="tab-${f.id}" role="tabpanel">
        <div class="front-header">
          <div><h3 class="front-title">${f.titre}</h3><p class="front-desc">${f.description}</p></div>
          <span class="front-status ${f.statut_classe}">${f.statut}</span>
        </div>
        ${imageHTML}${stationsHTML}
        ${f.stations ? '<div class="ornament section-ornament"><span>Chronique des Batailles</span></div>' : ""}
        <div class="battle-log">${bataillesHTML}</div>
      </div>`;
      })
      .join("");
  }

  // ── MAIN : FETCH + RENDER
  fetch("assets/data/campagne.json")
    .then((r) => r.json())
    .then((d) => {
      renderJoueurs(d.joueurs);
      renderLore(d.lore);
      renderFronts(d.fronts);
      initTabs();
    })
    .catch((err) => {
      console.error("Erreur chargement campagne.json :", err);
      document.body.insertAdjacentHTML(
        "afterbegin",
        '<div style="background:#8b1c1c;color:#fff;padding:1rem;text-align:center">Erreur : impossible de charger campagne.json</div>',
      );
    })
    .finally(() => {
      initReveal(); // Toujours exécuté, même si le fetch échoue
    });

  // ── CARROUSEL
  (function () {
    "use strict";
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
      if (e.key === "ArrowLeft") {
        goTo(current - 1);
      }
      if (e.key === "ArrowRight") {
        goTo(current + 1);
      }
    });
    start();
  })();
})();
