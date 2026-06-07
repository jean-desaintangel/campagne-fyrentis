# Revue de code — campagne-fyrentis (round 2)

> Revue ré-effectuée le 2026-06-07 sur l'**état actuel** du code, après le premier passage (nav/footer factorisés dans `layout.js`, styles inline externalisés vers `assets/css/pages/`, CSP durcie, bug zoom/pan de `carte.js` corrigé, variables mortes `scale/tx/ty` supprimées, BOM retiré). Axes demandés ici : **code mort, qualité, maintenabilité** (la sécurité n'est rappelée que brièvement). Site statique HTML/CSS/JS vanilla, données JSON, GitHub Pages.

## Synthèse

Le projet est sain et nettement assaini depuis le premier passage. Le rendu dynamique reste protégé par l'échappement systématique (`escapeHTML`/`escapeAttr`), la CSP est sans `'unsafe-inline'`, et la duplication structurelle majeure (nav, footer) est désormais centralisée dans `layout.js`. Les problèmes restants sont de faible gravité et relèvent surtout de finitions : une ancre morte sur `regles.html`, une classe d'état de navigation (`is-active`) injectée mais jamais stylée, le bouton « retour en haut » encore dupliqué sur 14 pages, et la classe utilitaire `.u-mt-05` redéfinie à l'identique dans 9 fichiers CSS de page. Inventaire : 8 JS, 3 CSS racine, 15 CSS de page, 16 HTML.

- **Niveau de risque sécurité : FAIBLE** (inchangé, surface quasi nulle, durcissements déjà appliqués).
- **Niveau de maintenabilité : BON** (forte amélioration ; reste de la duplication mineure et un éparpillement de petits fichiers CSS).

### 3 priorités d'action immédiates
1. **Corriger l'ancre morte** dans `autres/regles.html` (bouton `#top` sans cible `id="top"`).
2. **Décider du sort de `.is-active`** sur les boutons de nav : soit ajouter le style de surlignage de la page active, soit retirer le code qui l'injecte.
3. **Dédupliquer** : centraliser les classes utilitaires (`.u-mt-05` × 9) dans un seul fichier, et injecter le bouton « retour en haut » via `layout.js` comme la nav et le footer.

---

## Problèmes détaillés

### 1. Ancre « retour en haut » morte sur regles.html
- **Gravité :** Faible
- **Type :** code mort / bug fonctionnel
- **Emplacement :** `autres/regles.html` — `<a href="#top" id="back-top">` présent, mais **aucun élément `id="top"`** dans la page (les 13 autres pages ont bien l'ancre, généralement sur le hero).
- **Problème :** Le clic sur « Retour en haut » ne pointe vers aucune cible → l'ancre est inerte sur cette page.
- **Pourquoi c'est problématique :** Comportement incohérent d'une page à l'autre, fonctionnalité silencieusement cassée.
- **Recommandation concrète :** Ajouter `id="top"` sur le premier élément pertinent de `regles.html` (titre/section d'en-tête), ou retirer le bouton sur cette page.

### 2. Classe d'état `is-active` injectée mais jamais stylée
- **Gravité :** Faible
- **Type :** code mort / qualité
- **Emplacement :** `assets/js/layout.js` (helper `act()`, qui ajoute ` is-active" aria-current="page` sur le lien de la page courante) ; côté CSS, seul `.carousel__slide.is-active` existe dans `style.css` — **aucune règle `.btn-nav-page.is-active`**.
- **Problème :** L'intention (surligner l'onglet de la page active) ne produit aucun effet visuel ; `aria-current="page"` est correct pour l'accessibilité, mais le retour visuel manque.
- **Pourquoi c'est problématique :** Code qui suggère une fonctionnalité inexistante → confusion à la maintenance.
- **Recommandation concrète :** Ajouter une règle, p. ex. `.btn-nav-page.is-active { color: var(--gold); border-color: var(--gold); }`, ou supprimer l'ajout de `is-active` si le surlignage n'est pas voulu.

### 3. Helper `act()` peu lisible (chaîne qui ferme un attribut)
- **Gravité :** Faible
- **Type :** qualité (lisibilité)
- **Emplacement :** `assets/js/layout.js`, fonction `act(id)` → retourne `' is-active" aria-current="page'`.
- **Problème :** Le helper injecte une fin d'attribut `class` + un nouvel attribut au milieu d'un template. C'est fonctionnel mais fragile et déroutant à lire/modifier.
- **Recommandation concrète :** Construire la chaîne de classes et l'attribut séparément.
- **Exemple :**
```js
function navLink(id, href, cls, label, svg) {
  const active = id === active_id;
  const aria = active ? ' aria-current="page"' : "";
  const klass = `btn-nav-page ${cls}${active ? " is-active" : ""}`;
  return `<a href="${href}" class="${klass}"${aria} aria-label="${label}">${svg}${label}</a>`;
}
```

### 4. Bouton « retour en haut » dupliqué sur 14 pages
- **Gravité :** Faible
- **Type :** maintenabilité / duplication
- **Emplacement :** `id="back-top"` (≈ 10 lignes avec SVG) répété dans les 14 pages standard.
- **Problème :** Même bloc copié partout ; toute évolution (icône, libellé, seuil d'apparition) impose 14 éditions — exactement le problème déjà résolu pour la nav et le footer.
- **Recommandation concrète :** Injecter le bouton via `layout.js` (dans un conteneur `#site-backtop` ou directement) et le gérer dans `pages.js` comme aujourd'hui. Attention : il pointe sur `#top`, donc garantir l'ancre sur chaque page (cf. point 1).

### 5. Classe utilitaire `.u-mt-05` redéfinie dans 9 fichiers CSS
- **Gravité :** Faible
- **Type :** maintenabilité / duplication
- **Emplacement :** `assets/css/pages/*.css` — `.u-mt-05 { margin-top: 0.5rem; }` apparaît dans 9 fichiers (issu de l'extraction par page des anciens `style=` inline).
- **Problème :** Même règle dupliquée ; les utilitaires devraient être définis une seule fois.
- **Recommandation concrète :** Créer `assets/css/utilities.css` regroupant les classes `u-*` génériques (marges, `u-hidden`, `u-italic`…), le lier sur les pages concernées, et retirer les définitions dupliquées des CSS de page. Conserver dans les CSS de page uniquement les utilitaires réellement spécifiques (ex. `u-am-*` pour adeptus-mechanicus).

### 6. Éparpillement de très petits fichiers CSS de page
- **Gravité :** Faible
- **Type :** maintenabilité / structure
- **Emplacement :** `assets/css/pages/` — certains fichiers ne contiennent que 2–3 règles (`world-eaters.css`, `blood-angels.css`, `garde-imperiale.css`, `necrons.css`, `iron-warriors-de-khorne.css`).
- **Problème :** 15 fichiers de page dont plusieurs quasi vides → un peu de bruit. À l'inverse, `carte.css` (~88 blocs) et `sanctum.css` (~98 blocs) restent les plus gros (légitime : pages « app » autonomes).
- **Recommandation concrète :** Optionnel — fusionner les règles minimes des fiches d'armées dans `style.css` (sous une section « variantes par faction ») et ne garder un CSS de page que pour les pages réellement spécifiques. À arbitrer selon ta préférence (1 fichier/page vs regroupement).

### 7. Dead-CSS résiduel dans les blocs extraits — à vérifier
- **Gravité :** Faible
- **Type :** code mort (à vérifier)
- **Emplacement :** `assets/css/pages/*.css` (issus de l'extraction des anciens `<style>`).
- **Problème :** Les blocs `<style>` d'origine pouvaient contenir des règles devenues inutilisées ; l'extraction les a conservées telles quelles. **À vérifier** au cas par cas (je n'ai pas confirmé d'orphelin précis).
- **Recommandation concrète :** Passer un détecteur de CSS non utilisé (ex. extension « PurgeCSS » ou l'onglet *Coverage* de Chrome DevTools) page par page, puis supprimer les sélecteurs absents du HTML correspondant.

---

## Code mort à supprimer

| Élément | Confiance | Risque de suppression |
|---|---|---|
| Ajout de `is-active` sur la nav **sans** règle CSS correspondante (`layout.js` `act()`) | Élevée | Faible — soit styler, soit retirer |
| Ancre `#top` manquante rendant `#back-top` inerte sur `regles.html` | Élevée | Faible — ajouter l'ancre (ne pas supprimer le bouton) |
| Définitions dupliquées de `.u-mt-05` (8 copies sur 9 à factoriser) | Élevée | Faible — déplacer vers un fichier utilitaire unique |
| Règles CSS orphelines dans `pages/*.css` | Faible (à vérifier) | Moyen — vérifier l'usage avant suppression |

> Aucun fichier JS/CSS entièrement mort : tous les CSS sont liés, tous les JS chargés (`layout.js`+`pages.js` partout, `index.js`/`carte.js`/`sanctum.js`/`world-eaters.js` sur leurs pages). `back-top`/`#top` sont utilisés par `pages.js`.

---

## Refactorings recommandés

**Fort impact**
- Centraliser les utilitaires CSS (`utilities.css`) — supprime la duplication de `.u-mt-05` et clarifie où vivent les classes `u-*`.
- Injecter le bouton « retour en haut » via `layout.js` (cohérence avec nav/footer déjà factorisés) et garantir l'ancre `#top` partout.

**Quick wins**
- Corriger l'ancre de `regles.html` (point 1).
- Styler ou retirer `.btn-nav-page.is-active` (point 2).
- Rendre le helper `act()` plus lisible (point 3).

**Architecture / conventions à standardiser**
- Décider d'une règle claire : « 1 CSS par page » **ou** « variantes dans style.css + CSS de page seulement si spécifique ». S'y tenir.
- Généraliser la convention de nommage `u-*` pour tous les utilitaires et la documenter en tête de `utilities.css`.
- Conserver les points forts : échappement systématique, CSP stricte, programmation défensive (`|| []`, `clampCoord`, gardes `null`), commentaires expliquant le *pourquoi*.

---

## Plan d'action

**1. Corrections urgentes**
- Ajouter `id="top"` sur `regles.html`.
- Styler ou retirer `.btn-nav-page.is-active`.

**2. Nettoyage technique**
- Créer `assets/css/utilities.css`, y déplacer les `u-*` génériques, retirer les doublons des CSS de page.
- Vérifier le CSS non utilisé (Coverage DevTools) sur les pages les plus lourdes (`carte`, `sanctum`, rapports).

**3. Améliorations de long terme**
- Injecter `back-top` via `layout.js`.
- Arbitrer et uniformiser la stratégie des fichiers CSS de page (fusion des fiches d'armées minimes).
- Refactor lisibilité de `layout.js` (`act()` → construction explicite des liens).

---

## Tableau récapitulatif

| Gravité | Type | Emplacement | Action recommandée |
|---|---|---|---|
| Faible | Code mort / bug | `autres/regles.html` (`#back-top` sans `#top`) | Ajouter `id="top"` |
| Faible | Code mort / qualité | `layout.js` `act()` + `style.css` | Styler `.btn-nav-page.is-active` ou retirer l'ajout |
| Faible | Qualité (lisibilité) | `layout.js` `act()` | Construire classes + attribut séparément |
| Faible | Maintenabilité / duplication | `#back-top` × 14 HTML | Injecter via `layout.js` |
| Faible | Maintenabilité / duplication | `.u-mt-05` × 9 `pages/*.css` | Centraliser dans `utilities.css` |
| Faible | Maintenabilité / structure | `pages/*.css` (fichiers 2–3 règles) | Fusionner les minimes dans `style.css` |
| Faible (à vérifier) | Code mort | `pages/*.css` | Détecter le CSS orphelin (Coverage) puis purger |

**Points forts confirmés :** nav/footer centralisés (`layout.js`), styles externalisés, CSP sans `'unsafe-inline'`, échappement anti-XSS systématique, programmation défensive, JSON validés au chargement, commentaires pédagogiques expliquant les choix.
