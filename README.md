# campagne-fyrentis

Site web statique pour la campagne narrative Warhammer 40,000 — Sous-secteur Fyrentis.

> **Site en ligne :** [jean-desaintangel.github.io/campagne-fyrentis](https://jean-desaintangel.github.io/campagne-fyrentis)

---

## Structure du projet

```
campagne-fyrentis/
├── index.html                              # Page d'accueil — hub de navigation
├── README.md
├── REVUE-CODE.md                           # Rapport de revue de code
├── assets/
│   ├── css/                                # Feuilles de style (thème Warhammer 40K)
│   │   ├── style.css                       # Style commun aux pages intérieures
│   │   ├── index.css                       # Style spécifique à la page d'accueil
│   │   ├── personnages-carousel.css        # Style du carrousel de personnages
│   │   └── pages/                          # Styles par page (ex-blocs <style> inline externalisés)
│   ├── js/                                 # Scripts JavaScript (modules ES)
│   │   ├── utils.js                        # Échappement HTML/attributs (anti-XSS)
│   │   ├── layout.js                       # Nav + footer partagés, injectés sur chaque page
│   │   ├── pages.js                        # Script commun (nav, thème, scroll, reveal)
│   │   ├── index.js                        # Script de la page d'accueil
│   │   ├── personnages-carousel.js         # Carrousel de personnages
│   │   ├── carte.js                        # Carte interactive (zoom/pan SVG)
│   │   ├── sanctum.js                      # Orrérie tactique du système Sanctum
│   │   └── world-eaters.js                 # Mécaniques spéciales World Eaters
│   ├── img/                                # Images, illustrations et bannières
│   └── data/                               # Données JSON
│       ├── campagne.json                   # Données de campagne (joueurs, fronts, batailles)
│       └── sanctum.json                    # Données du système Sanctum
└── autres/
    ├── regles.html                         # Récapitulatif des règles de campagne
    ├── armees/                             # Fiches des armées (9)
    │   ├── world-eaters.html               # World Eaters (Jean)
    │   ├── black-templars.html             # Black Templars (Freddy)
    │   ├── silver-templars.html            # Silver Templars (Freddy)
    │   ├── blood-angels.html               # Blood Angels (David)
    │   ├── death-guards.html               # Death Guard (Freddy)
    │   ├── garde-imperiale.html            # Garde Impériale (Jeremy)
    │   ├── iron-warriors-de-khorne.html    # Iron Warriors de Khorne (Vincent)
    │   ├── necrons.html                    # Nécrons (Freddy)
    │   └── adeptus-mechanicus.html         # Adeptus Mechanicus (Freddy)
    ├── cartes/                             # Cartes du sous-secteur
    │   ├── carte.html                      # Carte interactive
    │   └── sanctum.html                    # Fiche du système Sanctum
    └── rapports/                           # Rapports de bataille
        ├── rapport-inquisiteur.html        # Rapports des inquisiteurs
        ├── rapport-bataille-brokha.html    # Rapport — Bataille de Brokha
        └── coalition-vox.html              # Situation de la campagne (Coalition Vox)
```

---

## Technologies utilisées

- **HTML5 / CSS3** — site entièrement statique, sans framework front-end
- **JavaScript vanilla** — interactions, navigation mobile, carrousel, carte dynamique
- **JSON** — données de campagne (joueurs, fronts, batailles, scores)
- **GitHub Pages** — hébergement et déploiement automatique depuis la branche `main`
- **Git** — gestion de version

---

## Ouvrir le site en local

Ouvrir directement `index.html` dans un navigateur, ou utiliser l'extension **Live Server** (VS Code) pour éviter les restrictions CORS sur les `fetch()`.

---

## Workflow Git

```bash
# Récupérer les dernières modifications
git pull origin main

# Vérifier les fichiers modifiés
git status

# Ajouter les fichiers modifiés
git add nom-du-fichier.html

# Créer un commit
git commit -m "Description de la modification"

# Pousser vers GitHub
git push origin main
```

---

## Déploiement — GitHub Pages

Le site est déployé automatiquement depuis la branche `main` via **GitHub Pages**.

Pour activer ou vérifier :

1. Aller dans **Settings** du dépôt → section **Pages**
2. Source : `Deploy from a branch` → branche `main` → dossier `/ (root)`
3. Site accessible à : `https://djaunie.github.io/campagne-fyrentis`

Chaque `git push` sur `main` déclenche une mise à jour automatique (délai ~1 minute).

---

## Ajouter une fiche armée

```bash
# 1. Copier une fiche existante comme base
cp autres/armees/world-eaters.html autres/armees/nouvelle-faction.html

# 2. Modifier le contenu (éditeur de texte)

# 3. Ajouter le lien dans index.html (section navigation et liste des armées)

# 4. Committer et pousser
git add autres/armees/nouvelle-faction.html index.html
git commit -m "Ajout fiche armée nouvelle-faction"
git push origin main
```

---

## Comma
