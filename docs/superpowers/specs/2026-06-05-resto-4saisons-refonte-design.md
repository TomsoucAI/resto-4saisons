# Refonte du site — Restaurant 4 Saisons

**Date :** 2026-06-05
**Statut :** Design approuvé — prêt pour le plan d'implémentation
**Source de contenu :** `resto-4saisons-contenu.md` (menu + infos scrapés depuis https://resto4saisons.com/ le 2026-06-05)

---

## 1. Objectif

Reconstruire le site du Restaurant 4 Saisons (Pont-Rouge, QC) en un site **moderne, rapide et optimisé UX/UI** qui remplace le site GoDaddy actuel. Le contenu existe déjà ; le problème est sa présentation. Le menu est aujourd'hui enfermé dans **deux images JPG** — illisible sur mobile, invisible pour Google, inaccessible, et pénible à mettre à jour.

### Critères de succès
- Menu entièrement en **texte réel** (cherchable, indexable, accessible, lisible sans zoom sur mobile).
- **Appel téléphonique** rendu trivial : bouton « Appeler » omniprésent + statut **« Ouvert / Fermé » en direct**.
- Score Lighthouse visé : **≥ 95** en Performance, Accessibilité, Bonnes pratiques et SEO.
- Site **mobile-first**, entièrement en **français**.
- Mise à jour d'un prix = **une seule ligne** à modifier dans un fichier de données.

### Hors périmètre (v1)
- Commande en ligne / paiement (décision : **click-to-call seulement** pour la v1).
- Chatbot IA en direct (coût récurrent et risque clé API injustifiés pour ce site).
- Version bilingue (français seulement).

---

## 2. Décisions (validées en brainstorming)

| Décision | Choix |
|---|---|
| Livrable | Site réel, déployable, qui remplace GoDaddy |
| Commande | Click-to-call + heures claires (pas de panier ni paiement) |
| Langue | Français uniquement |
| Structure | Page unique défilante, nav collante avec ancres |
| Direction visuelle | **A — Moderne chaleureux** : charcoal `#1c1b1a`, rouge brique `#e0473e`, crème `#fbf7f1` (fidèle au logo noir + rouge) |
| Stack | **Astro + Tailwind CSS** |
| Hébergement | Statique gratuit (Netlify / Vercel / GitHub Pages) |
| Stratégie IA | **IA pour les visuels d'ambiance au build** (hero, textures, icônes, illustrations) baked dans le repo. **Aucune clé API dans le site livré.** Photos de **plats = vraies photos** (réutiliser celles du site actuel, remplaçables plus tard). |

> **Note sécurité :** une clé API ne doit jamais être intégrée au front-end d'un site statique public (vol + facturation abusive). Les visuels IA sont générés à la conception et exportés en fichiers ; le site livré ne contient aucune clé ni appel API au runtime.

---

## 3. Architecture

### Stack technique
- **Astro** — génère du HTML statique, zéro JS par défaut (idéal site vitrine).
- **Tailwind CSS** — design system par tokens, cohérence et rapidité.
- **JS minimal** (Astro islands / `<script>` léger) uniquement pour : statut ouvert/fermé en direct, filtres de catégories du menu, menu mobile.
- **Données séparées du markup** : tout le menu et les infos dans des fichiers de données.

### Structure du repo (cible)
```
/
├── README.md
├── astro.config.mjs
├── tailwind.config.mjs
├── package.json
├── .gitignore
├── src/
│   ├── data/
│   │   ├── menu.json         # toutes les catégories, items, prix, tailles
│   │   └── infos.json        # nom, adresse, tél, heures, livraison, avis
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── OpenStatus.astro   # logique ouvert/fermé (île interactive)
│   │   ├── DeliveryBanner.astro
│   │   ├── MenuSection.astro  # rendu d'une catégorie
│   │   ├── PriceTable.astro   # items multi-tailles (pizza, frites)
│   │   ├── MenuFilters.astro  # chips de filtrage
│   │   ├── About.astro
│   │   ├── Reviews.astro
│   │   ├── HoursContact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro         # <head>, SEO, schema.org, fonts
│   └── pages/
│       └── index.astro        # assemble les sections
├── public/
│   ├── img/                   # visuels IA (hero, textures) + photos réelles
│   ├── favicon.svg
│   └── og-image.jpg
```

### Modèle de données du menu (`menu.json`)
Structure permettant des items à prix simple **et** des items multi-tailles :
```jsonc
{
  "categories": [
    {
      "id": "pizza",
      "nom": "Pizza",
      "colonnes": ["Mini 8\"", "Petite 9\"", "Med. 12\"", "Large 14\"", "Ex-large 16\""],
      "items": [
        { "nom": "Fromage", "prix": ["11,50","13,40","19,50","24,25","28,00"] },
        { "nom": "Pepperoni", "prix": ["13,25","15,25","23,50","28,25","33,50"] }
      ]
    },
    {
      "id": "divers",
      "nom": "Divers",
      "items": [
        { "nom": "Hamburger", "prix": "5,40", "desc": null },
        { "nom": "Hot-dog garni", "prix": "4,25", "desc": "ketchup, relish, moutarde, chou" }
      ]
    }
  ]
}
```
Le contenu exact (tous les items et prix) provient de `resto-4saisons-contenu.md`.

---

## 4. Sections de la page (ordre de défilement)

1. **Nav collante** — logo « 4 Saisons », ancres (Menu · À propos · Heures), bouton **📞 Appeler** persistant. Menu hamburger sur mobile.
2. **Hero** — accroche (« Pizzas généreuses & assiettes débordantes »), gros bouton d'appel, **statut Ouvert/Fermé en direct**, visuel d'ambiance (IA + photo réelle).
3. **Bandeau livraison** — fenêtres midi (11h30–13h30) & soir, jours de service.
4. **Menu** — texte réel, **chips de filtrage** par catégorie, tables de prix propres pour les items multi-tailles. Toutes les catégories : Sandwichs, Entrées, Salades, Frites & Poutines, Pâtes, Pizza, Poulet, Smoked meat, Assiettes, Divers, Desserts, Breuvages, Bière et vin.
5. **À propos + avis** — texte « qui sommes-nous » + 3 témoignages (Marie, Dave M., Jean-Denis C.).
6. **Heures & contact** — table horaire complète, heures de livraison, adresse, click-to-call, carte Google intégrée + « Obtenir l'itinéraire ».
7. **Footer** — adresse, téléphone, copyright.

---

## 5. Comportements interactifs

- **Statut ouvert/fermé** : calculé côté client à partir des heures dans `infos.json` (fuseau America/Toronto). Affiche « Ouvert · ferme à 20h » ou « Fermé · ouvre mercredi 6h ». Se met à jour au chargement.
- **Filtres de menu** : chips qui affichent/masquent les catégories ; « Tout » par défaut. Fonctionne sans JS (toutes catégories visibles si JS désactivé — progressive enhancement).
- **Nav mobile** : hamburger accessible (focus trap, `aria-expanded`).

---

## 6. Accessibilité, SEO & performance

- HTML sémantique, contraste AA minimum, navigation clavier, `alt` sur toutes les images.
- **Schema.org `Restaurant`** (JSON-LD) : nom, adresse, téléphone, `openingHoursSpecification`, `servesCuisine`, `menu`, `priceRange` — pour les résultats enrichis Google.
- Balises `<title>`, meta description, Open Graph + image OG pour partage social.
- Polices `font-display: swap`, images en WebP/AVIF, lazy-loading, zéro JS bloquant.
- Une **adresse canonique unique** réutilisée partout (résout l'incohérence du site actuel).

---

## 7. Items ouverts à confirmer avec le client

1. **Code postal** : `G3A 2Z9` (page d'accueil) vs `G3H 2Z9` (page Contact). Pont-Rouge est en zone `G3H` → **défaut retenu : `G3H 2Z9`**, à confirmer.
2. **Section « Bière et vin »** : affichée sans prix sur le menu actuel — confirmer s'il faut lister des prix ou simplement mentionner la disponibilité.
3. **Photos de plats** : réutiliser les photos actuelles (hébergées sur wsimg.com) au lancement ; prévoir de vraies photos à jour en phase 2.
4. **Domaine & hébergement** : confirmer la cible de déploiement (conserver `resto4saisons.com`, pointer le DNS vers le nouvel hébergeur).

---

## 8. Tests / vérification

- Build Astro sans erreur ; site se sert localement.
- Lighthouse ≥ 95 sur les 4 axes (mobile).
- Vérif manuelle : tous les items/prix du menu correspondent à `resto-4saisons-contenu.md`.
- Statut ouvert/fermé testé à différents jours/heures (mock de l'horloge).
- Navigation clavier + lecteur d'écran sur les sections clés.
- Liens `tel:` fonctionnels, carte et itinéraire OK.
