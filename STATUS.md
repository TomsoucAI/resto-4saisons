# Restaurant 4 Saisons — État du projet (handoff)

_Dernière mise à jour : 2026-06-05_

Refonte du site du Restaurant 4 Saisons (Pont-Rouge, QC) — site vitrine statique, page unique, français, mobile-first.

## Liens

- **Aperçu en ligne (à montrer au propriétaire) :** https://tomsoucai.github.io/resto-4saisons/
- **Dépôt GitHub :** https://github.com/TomsoucAI/resto-4saisons (public)
- **Branche de travail :** `build/4saisons-site` · **Pull Request :** #1
- **Déploiement :** GitHub Actions → GitHub Pages. **Chaque push sur la branche redéploie** en ~30 s.

## Stack

Astro 6 + Tailwind CSS v4. Données dans `src/data/`. Images optimisées (WebP) par Astro. Tests : Vitest (`npm test`). Node ≥ 22.

## Ce qui est en place

- En-tête collant avec **logo « 4 Saisons »** + bouton **Appeler** (icône téléphone SVG).
- **Hero** : diaporama automatique (4 photos d'ambiance, fondu ~3 s) + appel + statut **Ouvert/Fermé** en direct.
- **Menu** en accordéons (tous fermés au chargement), trié par **note en étoiles** (Pizza 5★, Poulet 5★, Nos assiettes 4★, Frites & Poutines 3★, Pâtes 3★). Carrousels de photos par catégorie. Bouton « Tout déplier ».
- **À propos** + avis + **bouton d'avis Google** (lien direct `g.page`).
- **Galerie** intérieure (carrousel automatique).
- **Heures & contact** + carte Google + itinéraire. **Pied de page** avec bouton d'avis Google.
- SEO (schema.org Restaurant, Open Graph), accessibilité, polices auto-hébergées.

## Comment modifier le contenu

Voir **`README.md`** (section « Modifier le contenu ») :
- Menu/prix : `src/data/menu.json` · étoiles : champ `etoiles` (le menu se re-trie tout seul).
- Coordonnées/heures/avis/lien Google : `src/data/infos.json`.
- Photos des plats : `src/assets/menu/` (nom = catégorie). Galerie : `src/assets/interior/`. Hero : `src/assets/hero/`.

## À régler AVANT la mise en ligne sur le vrai domaine

1. **Domaine** : quand `resto4saisons.com` est disponible, mettre `base: '/'` et `site` au domaine dans `astro.config.mjs`, puis pointer le DNS.
2. **Code postal** à confirmer : `G3H 2Z9` (par défaut) vs `G3A 2Z9` (ancien site).
3. **Coordonnées GPS** (`geo` dans `infos.json`) à vérifier.
4. **Note Google** (optionnelle) : remplir `googleRating` / `googleReviewCount` si on veut afficher la note. _(Note : retiré du design actuel — le client a préféré la carte d'avis sans note.)_
5. **`pizza-1` du menu** : remplacer l'exemple par une vraie photo si désiré.
6. Lancer **Lighthouse** (cible ≥ 95) avant le lancement final.

## Pour reprendre le développement

```bash
npm install
npm run dev      # http://localhost:4321
npm run build && npm test
```
