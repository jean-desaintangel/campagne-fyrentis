// ── LAYOUT PARTAGÉ : navigation + pied de page + bouton « retour en haut » ──
// Évite de dupliquer ~150 lignes (nav + footer + back-top) sur chaque page.
//
// Chaque page déclare, sur la balise <body> :
//   data-base   : préfixe vers la racine du site ("", "../", "../../")
//   data-active : id du lien à surligner (carte|sanctum|inquisition|situation|regles)
//
// Le nav remplace <div id="site-nav"></div>, le footer remplit
// <footer id="site-footer"></footer>, et le bouton « retour en haut » est ajouté
// en fin de <body>. Ce module doit être chargé AVANT pages.js (qui attache les
// écouteurs sur la nav et sur #back-top). Les <script type="module"> s'exécutant
// dans l'ordre du document, placer layout.js en premier suffit.

const base = document.body.dataset.base || "";
const activeId = document.body.dataset.active || "";

// Définition déclarative des liens : un seul endroit à modifier pour le menu.
const NAV_LINKS = [
  {
    id: "carte",
    href: "autres/cartes/carte.html",
    cls: "btn-nav-page--carte",
    label: "Carte",
    aria: "Voir la Carte du secteur",
    svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  },
  {
    id: "sanctum",
    href: "autres/cartes/sanctum.html",
    cls: "btn-nav-page--sanctum",
    label: "Sanctum",
    aria: "Accéder au Sanctum",
    svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  },
  {
    id: "inquisition",
    href: "autres/rapports/rapport-inquisiteur.html",
    cls: "btn-nav-page--inquisition",
    label: "Inquisition",
    aria: "Lire les Rapports Inquisitoriaux",
    svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  },
  {
    id: "situation",
    href: "autres/rapports/coalition-vox.html",
    cls: "btn-nav-page--situation",
    label: "Situation",
    aria: "Consulter la Situation de la Campagne",
    svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  },
  {
    id: "regles",
    href: "autres/regles.html",
    cls: "btn-nav-page--regles",
    label: "Règles",
    aria: "Consulter les Règles Narratives",
    svg: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
  },
];

// Construit un lien de nav. La page active reçoit la classe is-active
// (surlignage CSS) et aria-current="page" (accessibilité).
function navLinkHTML(link) {
  const isActive = link.id === activeId;
  const klass = `btn-nav-page ${link.cls}${isActive ? " is-active" : ""}`;
  const current = isActive ? ' aria-current="page"' : "";
  return `<a href="${base}${link.href}" class="${klass}"${current} aria-label="${link.aria}">${link.svg} ${link.label}</a>`;
}

const navHTML = `
<nav class="nav" id="nav">
  <div class="nav-inner">
    <a href="${base}index.html" class="nav-logo" aria-label="Campagne Fyrentis">
      <svg class="nav-logo-icon" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <polygon points="18,2 34,28 2,28" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="18" cy="18" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
        <line x1="18" y1="2" x2="18" y2="12" stroke="currentColor" stroke-width="1"/>
        <line x1="18" y1="24" x2="18" y2="28" stroke="currentColor" stroke-width="1"/>
        <line x1="8.5" y1="22.3" x2="13.5" y2="18.9" stroke="currentColor" stroke-width="1"/>
        <line x1="27.5" y1="22.3" x2="22.5" y2="18.9" stroke="currentColor" stroke-width="1"/>
      </svg>
      <div>
        <span class="nav-logo-text">Fyrentis</span>
        <span class="nav-logo-sub">Campagne 40K</span>
      </div>
    </a>
    <div class="nav-actions">
      <div class="nav-page-links">
        ${NAV_LINKS.map(navLinkHTML).join("\n        ")}
      </div>
      <button class="btn-theme" data-theme-toggle aria-label="Basculer le thème">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
      <button class="nav-mobile-toggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</nav>`;

const footerHTML = `
  <div class="container">
    <div class="footer-logo">Sous-Secteur Fyrentis</div>
    <p class="footer-line">
      « Dans le futur sombre de l'humanité, il n'y a que la guerre. »
    </p>
    <p class="footer-line">
      Warhammer 40 000 • Campagne Narrative • 41ème Millénaire
    </p>
  </div>`;

const backTopHTML = `<a href="#top" class="back-top" id="back-top" aria-label="Retour en haut">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
</a>`;

const navMount = document.getElementById("site-nav");
if (navMount) navMount.outerHTML = navHTML;

const footerMount = document.getElementById("site-footer");
if (footerMount) footerMount.innerHTML = footerHTML;

// Bouton « retour en haut » injecté une seule fois en fin de body.
if (!document.getElementById("back-top"))
  document.body.insertAdjacentHTML("beforeend", backTopHTML);
