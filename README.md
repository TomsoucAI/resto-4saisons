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
- **Visuels** : déposer les images dans `public/img/`.

## À confirmer avant la mise en ligne

- Code postal exact (`G3H 2Z9` par défaut).
- Coordonnées GPS (`geo` dans infos.json).
- Domaine et hébergement (Netlify / Vercel / GitHub Pages).

## Déploiement

Site 100 % statique : `npm run build` puis publier le dossier `dist/`.
