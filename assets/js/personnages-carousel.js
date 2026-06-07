import { escapeHTML, escapeAttr } from "./utils.js";

const PLACEHOLDER_SVG =
  '<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="52" height="52" rx="2"/><path d="M4 40 l14-14 10 10 12-16 16 20"/><circle cx="42" cy="18" r="5"/></svg>';

function buildSlide(perso, index, total) {
  const imgHTML = [
    '<div class="perso-carousel__img-wrap">',
    "<img",
    '  class="perso-carousel__img"',
    `  src="${escapeAttr(perso.image)}"`,
    `  alt="${escapeAttr(perso.nom)}"`,
    `  loading="${index === 0 ? "eager" : "lazy"}"`,
    '  width="860"',
    '  height="420"',
    `  data-perso-index="${index}"`,
    ">",
    '<div class="perso-carousel__img-placeholder perso-carousel__img-placeholder--hidden" aria-hidden="true">',
    PLACEHOLDER_SVG,
    "<span>Image non disponible</span>",
    "</div>",
    "</div>",
  ].join("");

  const bodyHTML = [
    '<div class="perso-carousel__body">',
    `<span class="perso-carousel__faction">${escapeHTML(perso.faction)}</span>`,
    `<h3 class="perso-carousel__name">${escapeHTML(perso.nom)}</h3>`,
    `<p class="perso-carousel__title">${escapeHTML(perso.titre)}</p>`,
    '<div class="perso-carousel__ornament" aria-hidden="true"><span>&#9778; Dossier Inquisitorial &#9778;</span></div>',
    `<p class="perso-carousel__lore">${escapeHTML(perso.lore)}</p>`,
    "</div>",
  ].join("");

  return [
    "<article",
    '  class="perso-carousel__slide"',
    '  role="group"',
    '  aria-roledescription="slide"',
    `  aria-label="${escapeAttr(perso.nom)}, ${index + 1} sur ${total}"`,
    ">",
    imgHTML,
    bodyHTML,
    "</article>",
  ].join("");
}

function injectCarousel(section, personnages) {
  const total = personnages.length;

  const slidesHTML = personnages
    .map((p, i) => buildSlide(p, i, total))
    .join("");

  const dotsHTML = personnages
    .map(
      (p, i) =>
        [
          "<button",
          `  class="perso-carousel__dot${i === 0 ? " is-active" : ""}"`,
          '  role="tab"',
          `  aria-label="${escapeAttr(p.nom)}"`,
          `  aria-selected="${i === 0 ? "true" : "false"}"`,
          `  data-perso-dot="${i}"`,
          "></button>",
        ].join(""),
    )
    .join("");

  section.innerHTML = [
    '<div class="perso-carousel" id="perso-carousel" role="region" aria-roledescription="carrousel" aria-label="Personnages de la campagne">',
    '<div class="perso-carousel__viewport" id="perso-carousel-viewport">',
    '<div class="perso-carousel__track" id="perso-carousel-track" aria-live="polite">',
    slidesHTML,
    "</div>",
    "</div>",
    '<button class="perso-carousel__btn perso-carousel__btn--prev" id="perso-btn-prev" aria-label="Personnage précédent" type="button">',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>',
    "</button>",
    '<button class="perso-carousel__btn perso-carousel__btn--next" id="perso-btn-next" aria-label="Personnage suivant" type="button">',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
    "</button>",
    '<div class="perso-carousel__pagination" role="tablist" aria-label="Navigation des personnages">',
    dotsHTML,
    "</div>",
    `<p class="perso-carousel__counter" aria-live="polite" aria-atomic="true" id="perso-counter">1 / ${total}</p>`,
    "</div>",
  ].join("");
}

function initLogic() {
  const carousel = document.getElementById("perso-carousel");
  const viewport = document.getElementById("perso-carousel-viewport");
  const track = document.getElementById("perso-carousel-track");
  const btnPrev = document.getElementById("perso-btn-prev");
  const btnNext = document.getElementById("perso-btn-next");
  const counter = document.getElementById("perso-counter");
  const dots = Array.from(document.querySelectorAll("[data-perso-dot]"));
  const slides = Array.from(track.querySelectorAll(".perso-carousel__slide"));
  const total = slides.length;
  if (!total) return;

  let current = 0;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  slides.forEach((slide) => {
    const img = slide.querySelector(".perso-carousel__img");
    const placeholder = slide.querySelector(
      ".perso-carousel__img-placeholder",
    );
    if (!img) return;
    img.addEventListener("error", () => {
      img.style.display = "none";
      // On affiche le placeholder en retirant la classe qui le masque
      // (classList plutôt que style inline : compatible avec une CSP sans 'unsafe-inline').
      if (placeholder)
        placeholder.classList.remove("perso-carousel__img-placeholder--hidden");
    });
  });

  function goTo(index) {
    index = ((index % total) + total) % total;
    if (index === current) return;
    current = index;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
    if (counter) counter.textContent = `${current + 1} / ${total}`;
    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", i !== current ? "true" : "false");
    });
  }

  slides.forEach((slide, i) => {
    if (i !== 0) slide.setAttribute("aria-hidden", "true");
  });

  btnPrev.addEventListener("click", () => goTo(current - 1));
  btnNext.addEventListener("click", () => goTo(current + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () =>
      goTo(parseInt(dot.getAttribute("data-perso-dot"), 10)),
    );
  });

  carousel.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      goTo(current - 1);
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      goTo(current + 1);
    }
    if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    }
    if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  });

  if (!carousel.hasAttribute("tabindex")) carousel.setAttribute("tabindex", "0");

  // ── Swipe tactile
  let touchStartX = null;
  let touchStartY = null;
  const SWIPE_THRESH = 50;

  viewport.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  viewport.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dy) > Math.abs(dx)) {
        touchStartX = null;
        return;
      }
      if (dx < -SWIPE_THRESH) goTo(current + 1);
      else if (dx > SWIPE_THRESH) goTo(current - 1);
      touchStartX = null;
    },
    { passive: true },
  );

  // ── Drag souris (desktop)
  let mouseStartX = null;
  let isDragging = false;

  viewport.addEventListener("mousedown", (e) => {
    mouseStartX = e.clientX;
    isDragging = false;
    viewport.classList.add("perso-carousel__viewport--dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (mouseStartX === null) return;
    if (Math.abs(e.clientX - mouseStartX) > 5) isDragging = true;
  });

  window.addEventListener("mouseup", (e) => {
    if (mouseStartX === null) return;
    const dx = e.clientX - mouseStartX;
    if (isDragging) {
      if (dx < -SWIPE_THRESH) goTo(current + 1);
      else if (dx > SWIPE_THRESH) goTo(current - 1);
    }
    mouseStartX = null;
    isDragging = false;
    viewport.classList.remove("perso-carousel__viewport--dragging");
  });

  track.querySelectorAll("img").forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });
}

export function initPersonnagesCarousel(data) {
  const target = document.getElementById("perso-carousel-container");
  if (!target) return;
  const personnages = (data && data.personnages) || [];
  if (!personnages.length) return;
  injectCarousel(target, personnages);
  initLogic();
}
