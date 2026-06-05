# Restaurant 4 Saisons — Site web

Site vitrine statique (Astro + Tailwind CSS). Page unique, français, mobile-first.

## Développement

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
npm test         # tests unitaires
```

## Modifier le contenu

- **Menu et prix** : `src/data/menu.json` (une ligne par item).
- **Coordonnées, heures, avis** : `src/data/infos.json`.
  - `heures` et `livraison` sont ordonnés dimanche → samedi (index 0 = dimanche).
- **Image du hero** : `public/img/hero-restaurant.jpg`.

### Photos du menu (par catégorie)

Déposez une photo dans `src/assets/menu/` nommée selon l'**identifiant de la catégorie**. Elle apparaît automatiquement en haut de l'accordéon de cette catégorie. Plusieurs photos pour une même catégorie (`pizza.jpg`, `pizza-2.jpg`, `pizza-3.jpg`…) deviennent un **carrousel** que l'on fait défiler au doigt.

Identifiants disponibles : `sandwichs`, `entrees`, `salades`, `frites`, `pates`, `pizza`, `extra-pizza`, `poulet`, `smoked-meat`, `assiettes`, `divers`, `desserts`, `breuvages`, `biere-vin`.

Exemple : `src/assets/menu/poulet.jpg` → photo dans la catégorie « Poulet ».

### Galerie du restaurant

Déposez vos photos d'ambiance / du restaurant dans `src/assets/gallery/` (n'importe quel nom). Elles forment le carrousel de la section « En images », triées par nom de fichier. Si le dossier est vide, la section ne s'affiche pas.

> Les images dans `src/assets/menu/` et `src/assets/gallery/` sont actuellement des **exemples** (recadrages de la photo du hero) à remplacer par vos vraies photos. Astro les optimise automatiquement (WebP, redimensionnement, chargement différé).

## À confirmer avant la mise en ligne

- Code postal exact (`G3H 2Z9` par défaut).
- Coordonnées GPS (`geo` dans infos.json).
- Domaine et hébergement (Netlify / Vercel / GitHub Pages).

## Déploiement

Site 100 % statique : `npm run build` puis publier le dossier `dist/`.
