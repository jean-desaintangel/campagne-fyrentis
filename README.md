# campagne-fyrentis

Site web statique pour la campagne narrative Warhammer 40,000 — Sous-secteur Fyrentis.

> **Site en ligne :** [djaunie.github.io/campagne-fyrentis](https://djaunie.github.io/campagne-fyrentis)

---

## Structure du projet

```
campagne-fyrentis/
├── index.html                              # Page d'accueil — hub de navigation
├── README.md
├── assets/
│   ├── css/                               # Feuilles de style (thème Warhammer 40K)
│   │   ├── style.css                      # Style commun à toutes les pages intérieures
│   │   ├── index.css                      # Style spécifique à la page d'accueil
│   │   └── personnages-carousel.css       # Style du carrousel de personnages
│   ├── js/                                # Scripts JavaScript
│   │   ├── pages.js                       # Script commun (nav, thème, scroll)
│   │   ├── index.js                       # Script de la page d'accueil
│   │   └── personnages-carousel.js        # Carrousel de personnages
│   ├── img/                               # Images, illustrations et bannières
│   └── data/                              # Données JSON
│       ├── campagne.json                  # Données de campagne (joueurs, fronts, batailles)
│       └── sanctum.json                   # Données du système Sanctum
└── autres/
    ├── regles.html                        # Récapitulatif des règles de campagne
    ├── armees/                            # Fiches des armées
    │   ├── world-eaters.html              # World Eaters (Jean)
    │   ├── black-templars.html            # Black Templars (Freddy)
    │   ├── silver-templars.html           # Silver Templars (Freddy)
    │   ├── blood-angels.html              # Blood Angels (David)
    │   ├── death-guards.html              # Death Guard (Freddy)
    │   ├── garde-imperiale.html           # Garde Impériale (Jeremy)
    │   ├── iron-warriors-de-khorne.html   # Iron Warriors de Khorne (Vincent)
    │   ├── necrons.html                   # Nécrons (Freddy)
    │   └── adeptus-mechanicus.html        # Adeptus Mechanicus (Freddy)
    ├── cartes/                            # Cartes du sous-secteur
    │   ├── carte.html                     # Carte interactive
    │   └── sanctum.html                   # Fiche du système Sanctum
    └── rapports/                          # Rapports de bataille
        ├── rapports-inquisiteurs.html     # Rapports des inquisiteurs
        └── rapport-bataille-brokha.html   # Rapport — Bataille de Brokha
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

## Commandes Git utiles

| Commande                  | Description                                   |
| ------------------------- | --------------------------------------------- |
| `git status`              | Voir les fichiers modifiés / non suivis       |
| `git add .`               | Ajouter tous les changements                  |
| `git commit -m "message"` | Créer un commit                               |
| `git push origin main`    | Envoyer les commits vers GitHub               |
| `git pull origin main`    | Récupérer les derniers commits depuis GitHub  |
| `git log --oneline`       | Historique des commits (format court)         |
| `git diff`                | Voir les modifications non encore commitées   |
| `git restore nom-fichier` | Annuler les modifications d'un fichier        |
