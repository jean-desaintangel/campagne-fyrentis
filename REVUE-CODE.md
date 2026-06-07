# Revue de code — campagne-fyrentis

> Revue effectuée le 2026-06-07. Périmètre : site **statique** (HTML/CSS/JS vanilla, données JSON, hébergé sur GitHub Pages). **Aucun backend, aucun PHP, aucune base de données, aucune authentification** présents dans le code. Les axes « injection SQL / CSRF / sessions » sont donc sans objet ici (rien à attaquer côté serveur).

## Synthèse

Le projet est **nettement au-dessus de la moyenne** pour un site narratif statique. Le rendu dynamique passe systématiquement par `escapeHTML` / `escapeAttr` (defense-in-depth contre le XSS), une **CSP est présente sur les 16 pages**, il n'y a **aucun script inline, aucun handler `onclick=`, aucun `eval`/`document.write`**, et les liens externes sont validés (`safeHref`). Le JS est commenté avec des explications du *pourquoi* (rare et excellent pour des étudiants). Les vrais problèmes ne sont pas sécuritaires mais relèvent de la **maintenabilité** : structure HTML (nav, header, footer) dupliquée à l'identique sur 16 fichiers, gros blocs `<style>` inline (jusqu'à 608 lignes par page), README obsolète, et un **bug d'état réel dans `carte.js`** (zoom molette/pan désynchronisé des boutons). La robustesse du rendu dépend de la forme exacte du JSON (validation superficielle).

- **Niveau de risque sécurité global : FAIBLE.** Surface d'attaque quasi nulle (pas d'entrée utilisateur côté serveur, données same-origin maîtrisées par l'auteur).
- **Niveau de maintenabilité global : MOYEN.** Code propre fichier par fichier, mais duplication structurelle forte et absence de templating.

### 3 priorités d'action immédiates
1. **Corriger le bug de zoom/pan dans `carte.js`** (désynchronisation de `scale`/`tx`/`ty` avec le `viewBox`) — seul défaut fonctionnel avéré.
2. **Factoriser le `<head>`, la `<nav>` et le `<footer>`** dupliqués sur 16 pages (et sortir les `<style>` inline vers des fichiers CSS partagés) — la dette de maintenabilité n°1.
3. **Mettre à jour le README** (fichiers non documentés : `coalition-vox.html`, `utils.js`, `carte.js`, `sanctum.js`, `world-eaters.js`) et **retirer le BOM UTF-8** des 16 HTML + `campagne.json`.

---

## Problèmes détaillés

### 1. Bug d'état zoom/pan dans la carte
- **Gravité :** Moyen
- **Type :** qualité / bug fonctionnel avéré
- **Emplacement :** `assets/js/carte.js`, variables `scale/tx/ty` (l.30-37), `setViewBox()` (l.39-47), handler `wheel` (l.64-83), pan `mousemove` (l.98-111), `zoom-reset` (l.57-62).
- **Problème :** Les boutons `zoom-in`/`zoom-out` pilotent l'état via les variables `scale/tx/ty` puis `setViewBox()`. Mais la **molette** et le **pan** écrivent directement l'attribut `viewBox` **sans jamais mettre à jour `scale/tx/ty`**. `zoom-reset` remet aussi le `viewBox` à la main sans passer par `setViewBox()`.
- **Pourquoi c'est problématique :** Après un zoom molette ou un pan, cliquer sur `zoom-in`/`zoom-out` repart de `scale=1, tx=0, ty=0` (valeurs périmées) → la vue **saute** brutalement. C'est un bug observable par l'utilisateur.
- **Recommandation concrète :** Choisir **une seule source de vérité**. Le plus simple : tout faire passer par le `viewBox` et supprimer les variables `scale/tx/ty` + `setViewBox()` ; faire lire/écrire le `viewBox` aux boutons comme le fait déjà la molette.
- **Exemple de correction (zoom-in basé sur le viewBox courant) :**
```js
function zoomBy(factor) {
  const [x, y, w, h] = svg.getAttribute("viewBox").split(" ").map(Number);
  const nw = Math.min(Math.max(w / factor, 300), 1800);
  const nh = Math.min(Math.max(h / factor, 200), 1300);
  // zoom centré
  svg.setAttribute("viewBox", `${x + (w - nw) / 2} ${y + (h - nh) / 2} ${nw} ${nh}`);
}
document.getElementById("zoom-in").addEventListener("click", () => zoomBy(1.3));
document.getElementById("zoom-out").addEventListener("click", () => zoomBy(1 / 1.3));
document.getElementById("zoom-reset").addEventListener("click",
  () => svg.setAttribute("viewBox", "0 0 900 650"));
```

### 2. Validation du JSON trop superficielle → rendu fragile
- **Gravité :** Moyen
- **Type :** maintenabilité / robustesse (risque probable)
- **Emplacement :** `assets/js/index.js` — `validateCampagne()` (l.6-10) puis `renderFronts()` (l.92-108) ; idem `world-eaters.js`.
- **Problème :** `validateCampagne` vérifie seulement que `joueurs`, `lore.blocs` et `fronts` sont des tableaux. Or `renderFronts` appelle `f.batailles.map(...)`, `b.factions.map(...)`, `b.lien.label`, `j.armees.map(...)` **sans garde**. Données actuelles OK (vérifié), mais un front sans `batailles` ou une bataille sans `factions` ferait planter tout le rendu de la page (`TypeError`).
- **Pourquoi c'est problématique :** Le jour où vous éditez le JSON à la main (cas d'usage central du projet), une faute de frappe casse la page entière au lieu de dégrader proprement.
- **Recommandation concrète :** Soit étendre la validation aux champs réellement consommés, soit défendre au point d'usage avec `(f.batailles || [])`, `(b.factions || [])`, etc. (déjà fait pour `notable_features` dans `sanctum.js` — appliquer le même réflexe partout).

### 3. Coordonnées des vaisseaux non validées au chargement de localStorage
- **Gravité :** Faible
- **Type :** sécurité (risque probable, faible) / robustesse
- **Emplacement :** `assets/js/sanctum.js` — `loadTacticalState()` (l.142-163), `normalizeShips()` (l.106-114), `renderShips()` (`transform="translate(${ship.x}, ${ship.y})"`, ~l.355).
- **Problème :** `shipCounter` est validé (`Number.isFinite`), mais `ship.x` / `ship.y` issus de `localStorage` sont réinjectés tels quels dans un attribut SVG **sans coercition numérique ni borne**. `ship.name` est bien échappé, donc l'injection HTML est bloquée ; le risque résiduel est une valeur non numérique (localStorage corrompu) produisant un `translate` invalide.
- **Pourquoi c'est problématique :** `localStorage` est same-origin (seul le site ou l'utilisateur via console peut l'écrire) → pas un vecteur XSS réaliste. Mais une valeur corrompue dégrade silencieusement l'affichage tactique.
- **Recommandation concrète :** Dans `normalizeShips`, forcer le type et borner :
```js
x: Number.isFinite(+ship.x) ? Math.max(20, Math.min(680, +ship.x)) : CX + 140,
y: Number.isFinite(+ship.y) ? Math.max(20, Math.min(540, +ship.y)) : CY - 120,
```

### 4. CSP affaiblie par `'unsafe-inline'` sur les styles
- **Gravité :** Faible
- **Type :** sécurité (amélioration / durcissement)
- **Emplacement :** balise `<meta http-equiv="Content-Security-Policy">` de chaque page : `style-src 'self' 'unsafe-inline' ...`.
- **Problème :** `'unsafe-inline'` est nécessaire **uniquement** parce que chaque page embarque un gros bloc `<style>` inline. `script-src 'self'` (sans unsafe-inline) est déjà excellent.
- **Pourquoi c'est problématique :** `'unsafe-inline'` sur les styles réduit la valeur de la CSP (exfiltration via CSS, injection de styles). Surface faible ici, mais supprimable « gratuitement » si on externalise les styles.
- **Recommandation concrète :** Voir refactoring n°2 (sortir les `<style>` inline) → on peut alors retirer `'unsafe-inline'` de `style-src`.

### 5. BOM UTF-8 en tête de fichiers
- **Gravité :** Faible
- **Type :** qualité / hygiène
- **Emplacement :** **les 16 fichiers HTML** + `assets/data/campagne.json` (`sanctum.json` n'en a pas → incohérence).
- **Problème :** Octets `EF BB BF` en tête. Les navigateurs les tolèrent, mais le BOM peut gêner certains outils/diffs et trahit un éditeur mal configuré.
- **Recommandation concrète :** Enregistrer en UTF-8 **sans BOM** (réglage VS Code : *"files.encoding": "utf8"*). Commande de nettoyage en lot fournie plus bas.

### 6. README obsolète
- **Gravité :** Faible
- **Type :** maintenabilité / documentation
- **Emplacement :** `README.md`.
- **Problème :** Ne documente pas `autres/rapports/coalition-vox.html` (présent), ni les scripts `utils.js`, `carte.js`, `sanctum.js`, `world-eaters.js` (la section « js/ » n'en liste que 3 sur 7).
- **Recommandation concrète :** Synchroniser l'arborescence du README avec le contenu réel.

---

## Code mort à supprimer

| Élément | Confiance | Risque de suppression |
|---|---|---|
| Variables `scale`, `tx`, `ty`, `startTx`, `startTy` + fonction `setViewBox()` dans `carte.js` | **Élevée** (deviennent inutiles après le correctif n°1 « tout-viewBox ») | Faible — à supprimer **avec** le refactor, pas avant |
| `'unsafe-inline'` dans `style-src` de la CSP | **Élevée** (inutile une fois les `<style>` externalisés) | Faible — à retirer **après** externalisation |
| BOM UTF-8 (16 HTML + campagne.json) | **Élevée** | Aucun |

> Remarque : **aucun fichier mort détecté.** Tous les CSS sont référencés (`style.css` partout, `index.css` et `personnages-carousel.css` sur `index.html`), tous les JS sont chargés par au moins une page (`carte.js`→carte, `sanctum.js`→sanctum, `world-eaters.js`→world-eaters, `pages.js`→pages internes, `index.js`→accueil). Pas de fonction exportée inutilisée repérée. Les `console.warn/error` sont du logging légitime, pas du code mort.

---

## Refactorings recommandés

**Fort impact (maintenabilité)**
- **Éliminer la duplication structurelle.** `<head>`, `<nav id="nav">` et le footer sont **identiques sur les 16 pages** : modifier un lien de menu = 16 éditions, source d'incohérences. Options selon votre contexte pédagogique :
  - *Simple/statique :* injecter nav + footer via un petit `partials.js` (fetch d'un fragment HTML) — cohérent avec l'approche `fetch`+`render` déjà en place dans le projet.
  - *Build :* un générateur statique (Eleventy) ou même un include côté serveur si l'hébergement change.
- **Externaliser les `<style>` inline** (40 à 608 lignes par page) vers des fichiers CSS partagés/spécifiques. Bénéfice double : suppression de la duplication **et** durcissement de la CSP (point n°4).

**Quick wins**
- Correctif zoom/pan (n°1).
- Gardes `|| []` sur les `.map()` de `index.js`/`world-eaters.js` (n°2).
- Nettoyage BOM + README (n°5, n°6).
- `carte.js` : 6 `getElementById(...).addEventListener` sans garde `null`. Acceptable tant que le script reste couplé à `carte.html`, mais ajouter un garde en tête (`if (!svg) return;`) fiabilise en cas de réutilisation.

**Architecture / conventions à standardiser**
- `sanctum.js` (684 lignes) est cohérent et bien commenté, mais long : envisager un découpage en modules (`storage`, `render`, `drag`) si le fichier continue de croître.
- Standardiser le réflexe « défendre au point d'usage » déjà appliqué dans `sanctum.js` (commentaires sur `notable_features`, `shipCounter`, `getScreenCTM`) à `index.js`.
- Conserver et généraliser la **convention d'échappement** (`escapeHTML`/`escapeAttr` sur toute valeur injectée) — c'est déjà un point fort à préserver.

---

## Plan d'action

**1. Corrections urgentes (cette semaine)**
- Corriger le bug zoom/pan de `carte.js` (n°1).
- Ajouter les gardes `|| []` sur les rendus pilotés par JSON (n°2).

**2. Nettoyage technique (court terme)**
- Retirer le BOM des 16 HTML + `campagne.json`.
- Mettre à jour le README.
- Valider/borner `ship.x`/`ship.y` au chargement (n°3).

**3. Améliorations de long terme**
- Factoriser head/nav/footer (templating ou partial JS) sur les 16 pages.
- Externaliser les `<style>` inline → puis retirer `'unsafe-inline'` de la CSP.
- Découper `sanctum.js` si besoin ; généraliser la programmation défensive.

> Nettoyage BOM en lot (à exécuter à la racine du projet, après commit/sauvegarde) :
> ```bash
> for f in $(grep -rlP '^\xEF\xBB\xBF' --include='*.html' --include='*.json' .); do
>   sed -i '1s/^\xEF\xBB\xBF//' "$f"
> done
> ```

---

## Tableau récapitulatif

| Gravité | Type | Emplacement | Action recommandée |
|---|---|---|---|
| Moyen | Bug avéré | `carte.js` (zoom/pan vs `scale/tx/ty`) | Unifier l'état sur le `viewBox` |
| Moyen | Robustesse | `index.js` `renderFronts`, `validateCampagne` | Gardes `\|\| []` ou validation étendue |
| Faible | Sécurité/robustesse | `sanctum.js` `loadTacticalState`/`normalizeShips` | Coercer + borner `ship.x/y` |
| Faible | Sécurité (durcissement) | CSP `style-src 'unsafe-inline'` | Externaliser styles puis retirer |
| Faible | Hygiène | 16 HTML + `campagne.json` (BOM) | Réenregistrer UTF-8 sans BOM |
| Faible | Documentation | `README.md` | Synchroniser l'arborescence |
| — (refactor) | Maintenabilité | head/nav/footer × 16 pages | Factoriser (partial/templating) |
| — (refactor) | Maintenabilité | `<style>` inline (≤608 l./page) | Externaliser en CSS partagé |

**Points forts à conserver :** échappement systématique anti-XSS, CSP sur toutes les pages, `script-src 'self'` sans inline, validation des `href`, gestion d'erreurs `fetch` avec message utilisateur sobre (non bavard), commentaires expliquant le *pourquoi*, aucun secret exposé.
