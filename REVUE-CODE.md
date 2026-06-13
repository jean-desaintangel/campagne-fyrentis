# Revue de code — campagne-fyrentis (round 3)

> Revue effectuée le 2026-06-10 sur l'état actuel (`adc58e0`). Les corrections du round 2 (ancre `#top` de regles.html, style `.btn-nav-page.is-active`, centralisation `.u-mt-05`, suppression du helper `act()`) sont **toutes appliquées et vérifiées**. Depuis, seul `campagne.json` a évolué. Ce round 3 est une analyse fraîche et plus profonde : croisement systématique CSS ↔ HTML ↔ JS ↔ JSON, relecture intégrale des 8 fichiers JS.

## Résumé global de l'état de santé

Le code est globalement sain : architecture claire (layout partagé, données JSON, échappement XSS systématique, CSP stricte et identique sur toutes les pages, programmation défensive bien commentée). La dette technique est faible et localisée. Cette passe révèle néanmoins **un bug fonctionnel introduit par le refactoring du scroll** (le bouton « retour en haut » n'apparaît plus lors d'un défilement lent — toutes les pages standard sont touchées), **un doublon de données dans l'orrérie Sanctum** (la lune Brokha est dessinée deux fois : une version codée en dur et une version pilotée par le JSON, superposées au même pixel), et environ **150 lignes de CSS mort certain** réparties dans 7 fichiers, plus une série de variantes CSS pilotées par les données à trancher manuellement. Lisibilité : bonne ; les commentaires expliquent le *pourquoi*, ce qui est exactement ce qu'on attend.

- **Bug fonctionnel : 1 critique** (back-top), 1 important (double Brokha).
- **Code mort : ~150 lignes CSS sûres + 4 entrées JS + quelques variantes « à vérifier »**.
- **Maintenabilité : bonne**, avec deux points de duplication de source de vérité à traiter.

### 3 priorités d'action immédiates
1. **Corriger la visibilité du bouton « retour en haut »** (`pages.js`) — cassé en défilement lent sur les 14 pages standard.
2. **Supprimer la lune Brokha codée en dur** dans `sanctum.js` — elle fait doublon avec la planète 8 du JSON (deux marqueurs superposés, deux fiches détail divergentes à terme).
3. **Dédupliquer `.player-card--*`** défini à l'identique dans `style.css` ET `index.css` (la cascade dépend de l'ordre des `<link>`).

---

## 1. Bugs et problèmes critiques

### 1.1 ⛔ CRITIQUE — Le bouton « retour en haut » n'apparaît pas en défilement lent
- **Emplacement :** `assets/js/pages.js`, lignes 55-69 (bloc « NAV SCROLL + BACK-TO-TOP »).
- **Problème :** la mise à jour de la classe `visible` du back-top est **imbriquée dans le garde `if (scrolled !== wasScrolled)`**, qui ne se déclenche qu'au franchissement du seuil de 60 px (état de la nav). Le seuil du back-top est 300 px : entre 60 et 300 px, plus aucun événement ne met à jour le bouton.
- **Scénario de reproduction :** depuis le haut de page, défiler lentement jusqu'à 400 px. Le premier événement après 60 px fixe `visible = (scrollY > 300)` → `false`, puis le garde bloque toute mise à jour : le bouton **n'apparaît jamais**. Symétriquement, en remontant lentement depuis le bas, il **reste affiché** entre 300 et 60 px. Le bug est masqué en défilement rapide (le premier événement tombe souvent au-delà de 300 px), d'où sa discrétion.
- **Cause :** régression du refactoring qui a fusionné les deux logiques de scroll dans un seul garde (l'optimisation « ne toucher au DOM qu'au changement d'état » a couplé deux seuils indépendants).
- **Correction (deux états indépendants, on conserve l'optimisation) :**

```js
// Deux seuils indépendants → deux états mémorisés séparément.
// L'ancien code mettait à jour le back-top UNIQUEMENT quand la nav
// franchissait 60 px : entre 60 et 300 px, le bouton était figé.
let navScrolled = false;
let backTopVisible = false;
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    const s = y > 60;
    if (s !== navScrolled) {
      navScrolled = s;
      nav.classList.toggle("nav--scrolled", s);
    }
    const v = y > 300;
    if (backTop && v !== backTopVisible) {
      backTopVisible = v;
      backTop.classList.toggle("visible", v);
    }
  },
  { passive: true },
);
```

### 1.2 🔶 IMPORTANT — Lune Brokha dessinée deux fois (codée en dur + pilotée par JSON)
- **Emplacement :** `assets/js/sanctum.js` —
  - bloc codé en dur : lignes 276-286 (`if (p.id === 1) { … data-pid="brokha" … }`) ;
  - version JSON : la planète **id 8** (« Brokha — Bastion Chapitral », `svg_position: "brokha_moon"`) rendue par la boucle `specialPlanets` (lignes 300-318), positionnée par `specialPositions.brokha_moon` (lignes 292-297) **aux mêmes coordonnées exactes** (`sp.x + 18, sp.y - 14`) ;
  - fiche détail codée en dur : branche `if (pid === "brokha")` de `showDetail()` (lignes 549-559), dont le texte duplique la `description` de la planète 8 du JSON.
- **Problème :** deux groupes `.planet-group` cliquables et focusables (`tabindex="0"`) superposés au même point. La version JSON, rendue après, couvre la version codée en dur à la souris ; mais **au clavier (Tab + Entrée), les deux sont atteignables** et affichent deux fiches différentes. Deux labels SVG se chevauchent (« Brokha » et « Brokha… »). Toute mise à jour du lore dans le JSON ne sera pas répercutée dans la fiche codée en dur → divergence garantie.
- **Pourquoi je le considère (quasi) mort :** le marqueur codé en dur est inaccessible à la souris (recouvert), sa fiche n'est servie qu'au clavier, et tout son contenu existe déjà dans `sanctum.json` (planète 8). C'est un reliquat d'avant la migration data-driven.
- **Suppression en sécurité :**
  1. Supprimer le bloc `if (p.id === 1) {…}` (lignes 276-286) et l'entrée `state.planetPositions["brokha"]`.
  2. Supprimer la branche `if (pid === "brokha")` de `showDetail()` (lignes 549-559) — le `else` couvre la planète 8.
  3. Vérifier qu'aucun drapeau sauvegardé ne pointe sur la clé `"brokha"` : ajouter une ligne de migration dans `loadTacticalState()` — `if (parsed.flags && "brokha" in parsed.flags) delete parsed.flags.brokha;` (ou laisser : `renderFlags()` ignore déjà silencieusement les positions inconnues… non — `planetPositions["brokha"]` disparaissant, le garde `if (!pos || !faction) return;` ligne 343 protège bien. Migration facultative donc, mais propre).
  4. Tester : clic souris ET navigation clavier sur la lune, pose/retrait de drapeau sur `pid = "8"`.

---

## 2. Code mort

### 2.1 CSS mort certain (suppression sûre — vérifié par croisement avec tout le HTML, JS et JSON)

| Priorité | Fichier | Lignes | Sélecteurs | Pourquoi c'est mort |
|---|---|---|---|---|
| Mineure | `assets/css/index.css` | 8-72 (3 blocs) | `.hero-nav-btns`, `.btn-hero-page`, `.btn-hero-page--carte`, `.btn-hero-page--sanctum` (+ media queries) | Anciens boutons CTA du hero ; plus aucune occurrence dans `index.html` (remplacés par la nav de `layout.js`). ~65 lignes. |
| Mineure | `assets/css/style.css` | 1605, 1691 | `.carousel__caption` | Le carrousel d'images de `index.html` ne génère aucune légende (ni en HTML ni dans `index.js`). |
| Mineure | `assets/css/style.css` | 892 | `.front-visual--sanctum` | Variante absente du HTML et jamais construite par `index.js` (qui n'émet que `.front-visual`). |
| Mineure | `assets/css/pages/carte.css` | 176, 252, 262, 468 | `.route--chaos`, `.status--chaos`, `.status--necron` | `carte.html` (statique) n'utilise que `route--warp/contested/unknown` et `status--imperium/contested/unknown`. |
| Mineure | `assets/css/pages/coalition-vox.css` | 262, 277 | `.coalition-badge-official`, `.coalition-badge-confirmed` | Aucune occurrence dans `coalition-vox.html`. |
| Mineure | `assets/css/pages/rapport-bataille-brokha.css` | 94-123 | `.breadcrumb`, `.breadcrumb-inner` (+ descendants) | Le fil d'Ariane n'existe plus dans la page (remplacé par la nav commune). ~30 lignes. |
| Mineure | `assets/css/pages/sanctum.css` | 147, 163 | `.warp-path` | `sanctum.js` ne génère jamais cette classe ; le tracé warp est rendu via `.warp-alert` dans la sidebar. |
| Mineure | `assets/css/personnages-carousel.css` | 153 | `.perso-carousel__img--missing` | Le JS gère l'image manquante via `.perso-carousel__img-placeholder--hidden` (retrait de classe), jamais via `--missing`. |

**Méthode de suppression :** supprimer bloc par bloc, puis re-tester chaque page concernée (le CSS étant sans build, un `grep -rn "nom-de-classe"` sur `*.html`, `*.js`, `*.json` avant chaque suppression confirme l'absence d'usage).

### 2.2 ⚠️ Variantes CSS pilotées par les données — À VÉRIFIER MANUELLEMENT (ne pas supprimer aveuglément)

Ces classes sont construites dynamiquement (`station-owner ${s.classe}`, `faction-tag ${fc.classe}`, `battle-entry ${b.classe}` dans `index.js`) à partir de valeurs de `campagne.json`. Elles sont **inutilisées par les données actuelles** mais peuvent redevenir actives à la prochaine mise à jour de campagne :

| Fichier | Lignes | Sélecteurs | État actuel des données |
|---|---|---|---|
| `style.css` | 1094-1135 | `.station-owner--{iw, we, ba, gi, nc, ork}` | JSON n'utilise que `--bt`, `--dg`, `--ruine`, `--st` |
| `style.css` | 1014, 1044 | `.faction-tag--st`, `.faction-tag--nc` | JSON utilise `--ba, --bt, --dg, --gi, --iw, --ork, --we` |
| `style.css` | 964 | `.battle-entry--defeat` | JSON utilise `--contested`, `--nurgle`, `--victory` |
| `sanctum.js` | 13-14 | `FACTION_ICONS["Blood Angels"]`, `FACTION_ICONS["Garde Impériale"]` | `key_figures` du JSON ne contient que Black Templars, Inquisition, Mechanicus |

**Recommandation :** les **conserver** (ce sont des palettes prêtes à l'emploi pour les factions de la campagne — Nécrons et Silver Templars existent bien dans le lore du site), mais ajouter un commentaire en tête de section : `/* Variantes pilotées par campagne.json — certaines peuvent être momentanément inutilisées. */`. Ainsi un futur nettoyage automatique (PurgeCSS, Coverage) ne les supprimera pas par erreur.

### 2.3 Code mort JS (suppression sûre)

| Priorité | Emplacement | Élément | Pourquoi c'est mort |
|---|---|---|---|
| Mineure | `sanctum.js` l.91-102 | 4 entrées identité de `LEGACY_SHIP_TYPE_MAP` : `"croiseur-attaque"`, `"barge-bataille"`, `"croiseur-lourd"`, `"forteresse-monastere"` | `normalizeShipType()` (l.104-108) teste `SHIP_STYLES[type]` **avant** la map legacy : ces clés, présentes dans `SHIP_STYLES`, rendent les entrées inatteignables. Garder uniquement les vraies traductions (`escorteur`, `croiseur`, `cuirasse`, `transport`, `gloriana`, `escorte`). |
| Mineure | `sanctum.js` l.672 | `state.ships = normalizeShips(savedState.ships)` | Double normalisation : `loadTacticalState()` (l.171) retourne déjà `normalizeShips(parsed.ships)`. Idempotent mais inutile — écrire simplement `state.ships = savedState.ships`. |

---

## 3. Problèmes de maintenabilité

### 3.1 🔶 IMPORTANT — `.player-card--*` défini deux fois (style.css ET index.css)
- **Emplacement :** `assets/css/style.css` l.704-765 et `assets/css/index.css` l.103-163 — mêmes sélecteurs (`::before`, `.player-armies li::before`, `.player-role`, `:hover` pour red/blue/green/purple/gold).
- **Problème :** double source de vérité chargée simultanément sur `index.html`. À spécificité égale, c'est **l'ordre des `<link>`** qui décide (index.css gagne car chargé après). Modifier une couleur dans style.css ne produit aucun effet visible → piège classique de débogage.
- **Recommandation :** garder **une seule** définition. Les cartes joueurs n'apparaissant que sur l'accueil, supprimer le bloc de `style.css` (l.704-765) et tout conserver dans `index.css`. Diff visuel avant/après pour valider (les deux versions peuvent différer subtilement — comparer avant de supprimer).

### 3.2 🔶 IMPORTANT — Factions et types de vaisseaux : 3 sources de vérité
- **Emplacement :** `autres/cartes/sanctum.html` l.80-117 (les `<option>` des deux `<select>`) + `sanctum.js` (`FACTION_FLAG_STYLES` l.18-61, `SHIP_STYLES` l.63-75, `SHIP_TYPE_LABELS` l.77-89).
- **Problème :** ajouter une faction ou un type de vaisseau exige 2 à 3 éditions synchronisées (HTML + 1-2 dictionnaires JS). Un oubli produit soit une option sans style (repli silencieux sur `croiseur-attaque`), soit un style inutilisable.
- **Recommandation :** générer les `<option>` depuis les dictionnaires JS — le HTML garde des `<select>` vides, le JS devient l'unique source de vérité :

```js
// Remplit un <select> depuis un dictionnaire JS : une seule source de vérité.
// Ajouter une faction = ajouter UNE entrée dans FACTION_FLAG_STYLES, rien d'autre.
function fillSelect(id, entries) {
  document.getElementById(id).innerHTML = entries
    .map(([value, label]) => `<option value="${escapeAttr(value)}">${escapeHTML(label)}</option>`)
    .join("");
}
fillSelect("faction-select", Object.entries(FACTION_FLAG_STYLES).map(([k, v]) => [k, v.label]));
fillSelect("ship-type", Object.entries(SHIP_TYPE_LABELS));
```

  Au passage, fusionner `SHIP_STYLES` et `SHIP_TYPE_LABELS` (mêmes clés) en un seul dictionnaire `{ label, color, short }`, comme `FACTION_FLAG_STYLES`.

### 3.3 Mineure — Bornes de drag dupliquées en « nombres magiques »
- **Emplacement :** `sanctum.js` — constantes `SHIP_MIN_X/MAX_X/MIN_Y/MAX_Y` (l.111-114) utilisées par `normalizeShips()`, mais le clamp du drag (l.494-495) recode `20, 680, 20, 540` en dur. Le commentaire l.110 (« identiques au clamp du drag ») avoue la duplication.
- **Recommandation :** `ship.x = Math.max(SHIP_MIN_X, Math.min(SHIP_MAX_X, p.x - state.drag.dx));` (idem pour y). Une seule définition des bornes.

### 3.4 Mineure — `sanctum.js` : 702 lignes, responsabilités multiples
- **Problème :** un seul module concentre configuration (5 dictionnaires), persistance localStorage (+ migration legacy), géométrie SVG, rendu (orrérie, drapeaux, vaisseaux, fiches), et interactions (drag, clavier, menus contextuels). On reste sous le seuil critique, mais c'est le fichier qui croîtra à chaque évolution du jeu.
- **Recommandation (à faire à l'occasion, pas urgent) :** découper en 3 modules ES :
  - `sanctum-config.js` — dictionnaires et constantes (factions, vaisseaux, orbites) ;
  - `sanctum-storage.js` — `loadTacticalState` / `saveTacticalState` / migration ;
  - `sanctum.js` — rendu + interactions (importe les deux autres).
  Découpage purement mécanique (déplacer + `export`/`import`), risque faible, gros gain de navigation. Bon exercice de modules ES6 pour des BTS SIO, au demeurant.

### 3.5 Mineure — Chargement implicite de `pages.js` sur deux pages
- **Emplacement :** `index.html` et `autres/armees/world-eaters.html` ne déclarent pas `<script src=".../pages.js">` ; `pages.js` ne s'y exécute que parce que `index.js` / `world-eaters.js` l'importent (`import { FyrentisReveal } from "./pages.js"`). Les 12 autres pages le chargent explicitement.
- **Problème :** le thème, la nav mobile et le back-top de ces deux pages dépendent d'un **effet de bord d'import**. Si demain `world-eaters.js` n'a plus besoin de `FyrentisReveal` et qu'on retire l'import, toute l'interactivité commune disparaît silencieusement.
- **Recommandation :** ajouter la balise `<script type="module" src=".../pages.js"></script>` sur ces deux pages (les modules ES ne s'exécutent qu'une fois, l'import en double est sans coût), et commenter dans `pages.js` que le module a des effets de bord à l'exécution.

### 3.6 Mineure — Gardes manquants sur `getElementById` dans `index.js`
- **Emplacement :** `index.js` l.37 (`players-grid`), l.51-52 (`lore-desc`, `lore-grid`), l.73, 79 (`fronts-tabs`, `fronts-panels`).
- **Problème :** si un id disparaît du HTML, `null.innerHTML` lève un TypeError… qui est avalé par le `.catch()` du fetch et affiché comme « impossible de charger campagne.json » — diagnostic trompeur (le JSON s'est bien chargé). Les autres modules (`sanctum.js`, `pages.js`) gardent systématiquement.
- **Recommandation :** soit garder (`const grid = document.getElementById("players-grid"); if (!grid) return;`), soit séparer le `catch` réseau du rendu pour que l'erreur loggée pointe la vraie cause.

### 3.7 Mineure — Incohérence d'approche : `carte.html` statique vs `sanctum.html` data-driven
- **Emplacement :** `autres/cartes/carte.html` (992 lignes : tous les systèmes, routes et fiches détail écrits à la main) vs l'orrérie Sanctum (générée depuis `sanctum.json`).
- **Problème :** deux philosophies pour deux pages jumelles. Mettre à jour la carte du secteur = éditer du SVG et du HTML à la main ; mettre à jour Sanctum = éditer du JSON. Pas un défaut en soi (la carte bouge peut-être moins), mais à **documenter comme choix assumé** dans le README, sinon migrer la carte vers un `secteur.json` sur le modèle de Sanctum.

### 3.8 Mineure — Poids des images (performance, pas du code à proprement parler)
- **Emplacement :** `assets/img/` — 32 Mo au total ; une douzaine de fichiers entre 1,5 et 2,2 Mo (`combat-general.jpg` 2,2 Mo, `carroussel/2.jpg` 1,9 Mo, portraits ~1,7 Mo chacun).
- **Problème :** sur GitHub Pages sans CDN d'images, l'accueil charge plusieurs Mo. Le `loading="lazy"` déjà en place aide, mais les fichiers eux-mêmes sont surdimensionnés.
- **Recommandation :** convertir en WebP qualité ~80 avec largeur max 1600 px (`cwebp` ou Squoosh) — gain attendu : 60-80 %. Aucune modification de code hormis les extensions dans JSON/HTML.

---

## 4. Récapitulatif priorisé

| Priorité | Type | Emplacement | Action |
|---|---|---|---|
| **Critique** | Bug fonctionnel | `pages.js` l.55-69 | Découpler les deux seuils de scroll (fix §1.1) |
| **Important** | Doublon / code mort | `sanctum.js` l.276-286, 549-559 | Supprimer la Brokha codée en dur, garder la planète 8 JSON |
| **Important** | Duplication CSS | `style.css` l.704-765 vs `index.css` l.103-163 | Une seule définition de `.player-card--*` |
| **Important** | Sources de vérité | `sanctum.html` l.80-117 + dictionnaires `sanctum.js` | Générer les `<option>` depuis le JS (§3.2) |
| Mineure | CSS mort | 7 fichiers, cf. tableau §2.1 | Supprimer ~150 lignes (grep avant chaque bloc) |
| Mineure | JS mort | `sanctum.js` l.91-102, l.672 | Purger les entrées identité + double normalisation |
| Mineure | Nombres magiques | `sanctum.js` l.494-495 | Réutiliser `SHIP_MIN_X/…` |
| Mineure | Structure | `sanctum.js` (702 l.) | Découper en 3 modules (config / storage / rendu) |
| Mineure | Implicite fragile | `index.html`, `world-eaters.html` | Charger `pages.js` explicitement |
| Mineure | Robustesse | `index.js` l.37-79 | Gardes sur `getElementById` ou catch séparé |
| Mineure | Cohérence | `carte.html` vs `sanctum.html` | Documenter (ou migrer la carte vers JSON) |
| Mineure | Performance | `assets/img/` (32 Mo) | Compression WebP ≤ 1600 px |
| **À vérifier** | CSS data-driven | `style.css` (station-owner, faction-tag, battle-entry) + `FACTION_ICONS` | Conserver mais commenter comme « palette JSON » (§2.2) |

## Plan d'action suggéré

**1. Tout de suite (≤ 30 min)** — fix back-top (§1.1) ; suppression Brokha codée en dur (§1.2) ; `pages.js` explicite sur les 2 pages (§3.5).

**2. Nettoyage (1 h)** — purge des ~150 lignes de CSS mort (§2.1) avec grep de confirmation par bloc ; dédoublonnage `.player-card--*` (§3.1) ; entrées mortes de `LEGACY_SHIP_TYPE_MAP` et double normalisation (§2.3) ; constantes de clamp (§3.3) ; commentaire « palette JSON » sur les variantes conservées (§2.2).

**3. Fond (à l'occasion)** — `<option>` générés depuis le JS + fusion `SHIP_STYLES`/`SHIP_TYPE_LABELS` (§3.2) ; découpage de `sanctum.js` (§3.4) ; compression des images (§3.8) ; documenter le choix statique de `carte.html` (§3.7).

---

**Points forts confirmés (à ne pas casser) :** échappement XSS systématique (`escapeHTML`/`escapeAttr`) sur tout rendu dynamique, CSP stricte et uniforme sans `'unsafe-inline'`, layout centralisé (`layout.js`), programmation défensive commentée (clamp localStorage, gardes `getScreenCTM`, normalisation des types legacy), validation des JSON au chargement, accessibilité soignée (aria-current, aria-live, navigation clavier des carrousels et de l'orrérie).
