# campagne-fyrentis-2

Site web statique pour la campagne narrative Warhammer 40,000 — Sous-secteur Fyrentis (Saison 2).

> **Site en ligne :** [djaunie.github.io/campagne-fyrentis-2](https://djaunie.github.io/campagne-fyrentis-2)

---

## Structure du projet

```
campagne-fyrentis-2/
├── index.html                        # Page d'accueil — hub de navigation
├── carte.html                        # Carte interactive du sous-secteur
├── sanctum.html                      # Fiche du système Sanctum
├── rapports-inquisiteurs.html        # Rapports des inquisiteurs
├── regles.html                       # Récapitulatif des règles
├── adeptus-mechanicus.html           # Fiche armée — Adeptus Mechanicus (Freddy)
├── black-templars.html               # Fiche armée — Black Templars (Freddy)
├── blood-angels.html                 # Fiche armée — Blood Angels (David)
├── death-guard.html                  # Fiche armée — Death Guard (Freddy)
├── garde-imperiale.html              # Fiche armée — Garde Impériale (Jeremy)
├── iron-warriors-de-khorne.html      # Fiche armée — Iron Warriors de Khorne (Vincent)
├── necrons.html                      # Fiche armée — Nécrons (Freddy)
├── silver-templars.html              # Fiche armée — Silver Templars (Freddy)
├── world-eaters.html                 # Fiche armée — World Eaters (Jean)
├── README.md
└── assets/
    ├── css/                          # Feuilles de style (thème Warhammer 40K)
    ├── js/                           # Scripts JavaScript (interactions, carte dynamique, scores)
    ├── img/                          # Images, illustrations et bannières des factions
    └── data/                         # Données JSON (scores, armées, résultats de batailles)
```

---

## Technologies utilisées

- **HTML5 / CSS3** — site entièrement statique, sans framework front-end
- **JavaScript vanilla** — gestion des interactions, cartes dynamiques et navigation
- **JSON** — stockage des données de campagne (scores, armées, résultats)
- **GitHub Pages** — hébergement gratuit et déploiement automatique depuis la branche `master`
- **Git** — gestion de version et collaboration entre joueurs

---

## Cloner et travailler en local

### 1. Cloner le dépôt

```bash
git clone https://github.com/djaunie/campagne-fyrentis-2.git
cd campagne-fyrentis-2
```

### 2. Ouvrir le site en local

Ouvrir directement `index.html` dans un navigateur, ou utiliser une extension Live Server (VS Code).

---

## Workflow Git — modifier et publier

### Modifier un fichier et pousser les changements

```bash
# 1. Vérifier l'état des fichiers modifiés
git status

# 2. Ajouter les fichiers modifiés au prochain commit
git add nom-du-fichier.html
# ou tout ajouter d'un coup :
git add .

# 3. Créer le commit avec un message descriptif
git commit -m "Mise à jour fiche World Eaters"

# 4. Pousser vers GitHub (branche master)
git push origin master
```

### Récupérer les dernières modifications (si travail à plusieurs)

```bash
git pull origin master
```

### Vérifier l'historique des commits

```bash
git log --oneline
```

---

## Déploiement — GitHub Pages

Le site est déployé automatiquement depuis la branche `master` via **GitHub Pages**.

Pour activer ou vérifier le déploiement :

1. Aller dans **Settings** du dépôt sur GitHub
2. Section **Pages** → Source : `Deploy from a branch` → branche `master` → dossier `/ (root)`
3. Le site est accessible à l'adresse : `https://djaunie.github.io/campagne-fyrentis-2`

Chaque `git push` sur `master` déclenche automatiquement une mise à jour du site (délai ~1 minute).

---

## Ajouter une nouvelle page

```bash
# 1. Créer le fichier HTML
cp world-eaters.html nouvelle-faction.html

# 2. Modifier le contenu
# (éditer nouvelle-faction.html dans votre éditeur)

# 3. Ajouter un lien dans index.html
# (éditer index.html pour ajouter la navigation)

# 4. Pousser
git add nouvelle-faction.html index.html
git commit -m "Ajout page nouvelle-faction"
git push origin master
```

---

## Commandes Git utiles

| Commande                  | Description                                  |
| ------------------------- | -------------------------------------------- |
| `git status`              | Voir les fichiers modifiés / non suivis      |
| `git add .`               | Ajouter tous les changements à l'index       |
| `git commit -m "message"` | Créer un commit                              |
| `git push origin master`  | Envoyer les commits vers GitHub              |
| `git pull origin master`  | Récupérer les derniers commits depuis GitHub |
| `git log --oneline`       | Historique des commits (format court)        |
| `git diff`                | Voir les modifications non encore commitées  |
| `git restore nom-fichier` | Annuler les modifications d'un fichier       |
| `git clone <url>`         | Cloner le dépôt en local                     |
