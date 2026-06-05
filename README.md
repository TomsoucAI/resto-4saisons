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

### Photos des plats (par catégorie)

Déposez vos photos dans `src/assets/menu/`. Le **début du nom de fichier** détermine la catégorie. Plusieurs photos pour une même catégorie deviennent un **carrousel** que l'on fait défiler au doigt (flèches + points cliquables).

Nommez chaque fichier en commençant par la catégorie, puis un tiret et ce que vous voulez :

| Catégorie | Commencez le nom par | Exemples |
|---|---|---|
| Sandwichs | `sandwichs` | `sandwichs-jambon.jpg` |
| Entrées | `entrees` | `entrees-1.jpg` |
| Salades | `salades` | `salades-cesar.jpg` |
| Frites & Poutines | `frites` ou `poutine` | `poutine.jpg`, `frites-1.jpg` |
| Pâtes | `pates` | `pates-1.jpg`, `pates-2.jpg` |
| Pizza | `pizza` | `pizza-1.jpg`, `pizza-2.jpg` |
| Extra pizza | `extra-pizza` | `extra-pizza-1.jpg` |
| Poulet | `poulet` | `poulet-pane-1.jpg` |
| Smoked meat | `smoked-meat` | `smoked-meat-1.jpg` |
| Nos assiettes | `assiettes`, `nos-assiettes` ou `club` | `assiettes-club-poulet.jpg` |
| Divers | `divers` | `divers-hotdog.jpg` |
| Desserts | `desserts` | `desserts-gateau.jpg` |
| Breuvages | `breuvages` | `breuvages-1.jpg` |
| Bière et vin | `biere-vin` | `biere-vin-1.jpg` |

Les accents, espaces et majuscules sont tolérés (`Pâtes 1.jpg` fonctionne aussi). Plusieurs angles → carrousel : `pates-1.jpg`, `pates-2.jpg`, `pates-3.jpg`.

### Galerie du restaurant (intérieur)

Déposez vos photos de la salle / du restaurant dans `src/assets/interior/` (n'importe quel nom). Elles forment le **carrousel automatique** de la section « L'ambiance » (défilement toutes les ~3,5 s, avec flèches et points pour naviguer). Triées par nom de fichier. Dossier vide → la section ne s'affiche pas.

> Toutes les images sont optimisées automatiquement par Astro (WebP, redimensionnement, chargement différé). Note : `src/assets/menu/pizza-1.jpg` est encore un **exemple** (recadrage de la photo du hero) à remplacer par une vraie photo de pizza.

## À confirmer avant la mise en ligne

- Code postal exact (`G3H 2Z9` par défaut).
- Coordonnées GPS (`geo` dans infos.json).
- Domaine et hébergement (Netlify / Vercel / GitHub Pages).

## Déploiement

Site 100 % statique : `npm run build` puis publier le dossier `dist/`.
