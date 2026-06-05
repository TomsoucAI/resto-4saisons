# Refonte Restaurant 4 Saisons — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fast, accessible, French-only single-page marketing site for Restaurant 4 Saisons (Pont-Rouge, QC) that replaces the current GoDaddy site, with the full menu as real text and prominent click-to-call.

**Architecture:** Static site built with Astro (zero JS by default) + Tailwind CSS v4. All content lives in two data files (`menu.json`, `infos.json`); Astro components render them. The only client-side JS is a tiny island that computes live "open/closed" status, the menu category filter, and the mobile nav. Deploys as static files to any host (Netlify/Vercel/GitHub Pages).

**Tech Stack:** Astro 5+, Tailwind CSS v4 (via `@tailwindcss/vite`), Vitest (unit tests for pure logic + data integrity), @fontsource (self-hosted fonts). Node 24 / npm 11.

**Visual direction (A — Moderne chaleureux):** charcoal `#1c1b1a`, brick red `#e0473e`, cream `#fbf7f1`.

**Authoritative content source:** `resto-4saisons-contenu.md` (scraped menu + business info). The data files in Task 2/3 already contain the full transcribed content — `resto-4saisons-contenu.md` is the reference to cross-check against.

---

## File Structure

```
/
├── package.json                 # scripts + deps
├── astro.config.mjs             # Astro + Tailwind vite plugin
├── tsconfig.json
├── vitest.config.js             # test runner
├── README.md                    # setup + how to edit menu/hours
├── src/
│   ├── data/
│   │   ├── menu.json            # all categories/items/prices (real data)
│   │   └── infos.json           # name, address, phone, hours, delivery, reviews
│   ├── lib/
│   │   ├── hours.js             # pure open/closed logic + TZ helper
│   │   └── hours.test.js        # unit tests
│   ├── data/menu.test.js        # menu data-integrity test
│   ├── styles/
│   │   └── global.css           # tailwind import + theme tokens
│   ├── layouts/
│   │   └── Base.astro           # <head>, SEO, fonts, schema.org JSON-LD
│   ├── components/
│   │   ├── Nav.astro            # sticky nav + mobile menu + call button
│   │   ├── Hero.astro
│   │   ├── OpenStatus.astro     # live open/closed island
│   │   ├── DeliveryBanner.astro
│   │   ├── PriceTable.astro     # multi-size items
│   │   ├── MenuSection.astro    # one category
│   │   ├── Menu.astro           # filters + all sections
│   │   ├── About.astro
│   │   ├── Reviews.astro
│   │   ├── HoursContact.astro   # hours table + delivery + map
│   │   └── Footer.astro
│   └── pages/
│       └── index.astro          # assembles all sections
└── public/
    ├── favicon.svg
    └── img/                      # AI ambiance visuals + real food photos (added later)
```

---

## Task 1: Scaffold Astro + Tailwind project

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/global.css`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 10)

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "resto-4saisons",
  "type": "module",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install Astro and create config**

Run:
```bash
npm install astro
```
Expected: Astro added to dependencies, `node_modules/` created.

- [ ] **Step 3: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://resto4saisons.com',
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 5: Add Tailwind v4 (non-interactive)**

Run:
```bash
npx astro add tailwind --yes
```
Expected: installs `tailwindcss` + `@tailwindcss/vite`, updates `astro.config.mjs` to register the Vite plugin, and creates `src/styles/global.css` with `@import "tailwindcss";`. (If it does not create the file, create it in the next step.)

- [ ] **Step 6: Replace `src/styles/global.css` with theme tokens**

```css
@import "tailwindcss";

@theme {
  --color-charcoal: #1c1b1a;
  --color-charcoal-soft: #262524;
  --color-brick: #e0473e;
  --color-brick-dark: #c8341f;
  --color-cream: #fbf7f1;
  --color-cream-line: #f0eadf;
  --font-display: "Poppins", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}

html { scroll-behavior: smooth; }
body { font-family: var(--font-body); color: var(--color-charcoal); }
:target { scroll-margin-top: 4.5rem; }
```

- [ ] **Step 7: Create temporary `src/pages/index.astro`**

```astro
---
import '../styles/global.css';
---
<html lang="fr">
  <head><meta charset="utf-8" /><title>4 Saisons</title></head>
  <body class="bg-cream"><h1 class="text-brick text-3xl p-8 font-bold">4 Saisons — en construction</h1></body>
</html>
```

- [ ] **Step 8: Verify the build succeeds**

Run:
```bash
npm run build
```
Expected: "Complete!" with no errors; `dist/index.html` created containing the brick-red heading.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro + Tailwind v4 project"
```

---

## Task 2: Menu data file + integrity test

**Files:**
- Create: `src/data/menu.json`
- Create: `src/data/menu.test.js`
- Create: `vitest.config.js`

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest
```
Expected: `vitest` in devDependencies.

- [ ] **Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['src/**/*.test.js'] },
});
```

- [ ] **Step 3: Create `src/data/menu.json` with the full menu**

```json
{
  "categories": [
    { "id": "sandwichs", "nom": "Sandwichs", "items": [
      { "nom": "Jambon", "price": "6,00" },
      { "nom": "Poulet", "price": "6,00" },
      { "nom": "Œufs", "price": "6,00" },
      { "nom": "Tomates", "price": "5,75" },
      { "nom": "Fromage", "price": "5,25" },
      { "nom": "Grilled-Cheese", "price": "5,25" }
    ]},
    { "id": "entrees", "nom": "Entrées", "items": [
      { "nom": "Oignons français", "price": "7,50" },
      { "nom": "Soupe maison", "price": "4,50" },
      { "nom": "Fondue parmesan (2)", "price": "7,00" }
    ]},
    { "id": "salades", "nom": "Salades", "columns": ["Petite", "Repas"], "items": [
      { "nom": "Salade du Chef", "prices": ["9,50", "14,25"] },
      { "nom": "Salade César", "prices": ["9,95", "16,25"] },
      { "nom": "Salade de poulet", "prices": [null, "16,25"] },
      { "nom": "Salade de jambon", "prices": [null, "16,25"] },
      { "nom": "Salade aux œufs", "prices": [null, "15,60"] },
      { "nom": "Salade 4 saisons", "prices": [null, "15,85"] }
    ]},
    { "id": "frites", "nom": "Frites & Poutines", "note": "Producteur de pommes de terre local pour un meilleur goût", "columns": ["Bébé", "Petite", "Moy.", "Gros", "Ex-gros"], "items": [
      { "nom": "Frites", "prices": [null, "5,75", "8,10", "10,45", "12,95"] },
      { "nom": "Frites épicées", "prices": [null, "6,80", null, null, null] },
      { "nom": "Frites sauce", "prices": ["6,15", "7,10", "9,30", "12,95", null] },
      { "nom": "Frites sauce chou", "prices": ["6,80", "8,15", "10,80", "16,00", null] },
      { "nom": "Frites Caruso", "prices": ["7,40", "8,65", "12,35", "17,35", null] },
      { "nom": "Poutine", "desc": "sauce brune ou B.B.Q.", "prices": ["7,70", "8,95", "13,40", "19,10", null] },
      { "nom": "Poutine Caruso", "prices": ["8,95", "11,10", "14,50", "20,85", null] },
      { "nom": "Poutine Popcorn", "prices": [null, "12,10", "17,00", "23,95", null] },
      { "nom": "Poutine pizza", "prices": [null, "12,10", "17,00", "23,95", null] },
      { "nom": "Galvaude", "prices": [null, "11,15", "14,55", "21,00", null] },
      { "nom": "Galvaude fromage", "prices": [null, "12,35", "17,50", "24,75", null] },
      { "nom": "Dulton", "prices": [null, "12,20", "17,20", "24,75", null] }
    ]},
    { "id": "pates", "nom": "Pâtes", "columns": ["Demi", "Régulier"], "items": [
      { "nom": "Spaghetti", "prices": ["11,05", "15,80"] },
      { "nom": "Spaghetti végétarien", "prices": ["11,05", "15,80"] },
      { "nom": "Spaghetti gratiné", "prices": ["13,80", "18,65"] },
      { "nom": "Spaghetti 4 saisons", "desc": "oignons, piments, champignons, pepperoni, le tout gratiné", "prices": ["15,30", "23,05"] },
      { "nom": "Lasagne", "prices": ["15,00", "20,15"] },
      { "nom": "Lasagne 4 saisons", "prices": ["16,30", "23,90"] },
      { "nom": "Extra champignons", "prices": ["3,75", null] }
    ]},
    { "id": "pizza", "nom": "Pizza", "columns": ["Mini 8\"", "Petite 9\"", "Med. 12\"", "Large 14\"", "Ex-large 16\""], "items": [
      { "nom": "Fromage", "prices": ["11,50", "13,40", "19,50", "24,25", "28,00"] },
      { "nom": "Pepperoni", "prices": ["13,25", "15,25", "23,50", "28,25", "33,50"] },
      { "nom": "Champignons", "prices": ["12,80", "14,70", "21,50", "26,75", "32,00"] },
      { "nom": "Garnie", "prices": ["14,50", "17,25", "26,35", "33,00", "39,00"] },
      { "nom": "Végétarienne", "prices": ["14,50", "17,25", "26,35", "33,00", "39,00"] },
      { "nom": "Smoked meat", "prices": ["17,75", "20,90", "31,75", "39,90", "47,50"] },
      { "nom": "4 saisons", "desc": "pizza, sauce spaghetti, pepperoni, oignons, champignons, piments, fromage, bacon", "prices": ["17,75", "20,90", "31,75", "39,90", "47,50"] },
      { "nom": "Au poulet BBQ", "prices": ["16,95", "19,95", "29,45", "38,20", "44,90"] }
    ]},
    { "id": "extra-pizza", "nom": "Extra pizza", "columns": ["Mini", "Petite", "Med.", "Large", "Ex-large"], "items": [
      { "nom": "Oignons", "prices": ["1,00", "1,00", "2,00", "2,00", "3,00"] },
      { "nom": "Légumes", "desc": "champignons, piments, tomates, olives vertes ou noires", "prices": ["2,00", "2,50", "3,50", "4,25", "4,75"] },
      { "nom": "Fromage et viandes", "desc": "fromage, pepperoni, bacon, sauce spaghetti, poulet B.B.Q.", "prices": ["3,50", "3,75", "5,00", "5,50", "7,00"] },
      { "nom": "Smoked meat", "prices": ["4,00", "4,00", "6,25", "6,25", "7,75"] }
    ]},
    { "id": "poulet", "nom": "Poulet", "items": [
      { "nom": "1 morceau pané", "price": "15,75" },
      { "nom": "2 morceaux panés", "price": "17,25" },
      { "nom": "3 morceaux panés", "price": "18,90" },
      { "nom": "Cuisse B.B.Q.", "price": "16,50" },
      { "nom": "Poitrine B.B.Q.", "price": "19,10" },
      { "nom": "½ poulet B.B.Q.", "price": "23,25" },
      { "nom": "½ poulet B.B.Q. en cuisse", "price": "21,00" },
      { "nom": "6 croquettes de poulet", "price": "12,35" },
      { "nom": "3 lanières de poulet", "desc": "servis avec frites, salade de chou, sauce B.B.Q.", "price": "15,25" },
      { "nom": "4 ailes de poulet", "price": "9,75" },
      { "nom": "8 ailes de poulet", "price": "14,25" },
      { "nom": "16 ailes de poulet", "desc": "servis avec frites, salade de chou, sauce piquante", "price": "22,40" }
    ]},
    { "id": "smoked-meat", "nom": "Smoked meat", "columns": ["Petit", "Gros"], "items": [
      { "nom": "Smoked meat seul", "prices": ["11,15", "14,30"] },
      { "nom": "Smoked meat assiette", "desc": "servis avec frites, chou et cornichons", "prices": ["17,15", "19,95"] }
    ]},
    { "id": "assiettes", "nom": "Nos assiettes", "note": "Servies avec frites et salade de chou", "items": [
      { "nom": "Club au poulet", "price": "17,95" },
      { "nom": "Club au jambon", "price": "17,95" },
      { "nom": "Club aux œufs", "price": "17,95" },
      { "nom": "Club du vendredi", "desc": "œuf, tomates, salade, fromage", "price": "17,95" },
      { "nom": "Club smoked meat", "price": "20,75" },
      { "nom": "Hot chicken", "price": "16,00" },
      { "nom": "Hot hamburger", "price": "15,95" },
      { "nom": "Hamburger Caruso", "price": "17,00" },
      { "nom": "Hamburger 4 saisons", "desc": "2 portions de viande, ketchup, relish, moutarde, chou, tomates, salade, mayo, bacon, fromage, oignons", "price": "18,90" },
      { "nom": "Hamburger garni", "price": "16,75" },
      { "nom": "Steak haché", "price": "18,00" },
      { "nom": "Spécial Hélène", "desc": "steak haché servi avec salade du chef et pommes de terre rissolées", "price": "18,95" },
      { "nom": "Guedille aux œufs géante", "desc": "2 guedilles", "price": "14,65" },
      { "nom": "Guedille au poulet géante", "desc": "2 guedilles", "price": "14,95" },
      { "nom": "Hot-dog géant", "desc": "2 hot-dogs", "price": "13,95" },
      { "nom": "Hot-dog géant garni", "desc": "2 hot-dogs", "price": "14,60" },
      { "nom": "Pain à la viande géant", "desc": "2 pains à la viande", "price": "16,20" }
    ]},
    { "id": "divers", "nom": "Divers", "items": [
      { "nom": "Hamburger", "price": "5,40" },
      { "nom": "Hamburger garni", "desc": "ketchup, relish, moutarde, chou", "price": "5,85" },
      { "nom": "Hamburger poulet", "price": "7,40" },
      { "nom": "Cheeseburger", "price": "6,40" },
      { "nom": "Cheeseburger garni", "desc": "ketchup, relish, moutarde, chou", "price": "6,50" },
      { "nom": "Hot-dog", "price": "3,90" },
      { "nom": "Hot-dog garni", "desc": "ketchup, relish, moutarde, chou", "price": "4,25" },
      { "nom": "Hot-dog spécial", "desc": "relish, fromage, bacon", "price": "6,00" },
      { "nom": "Pain à la viande", "price": "6,25" },
      { "nom": "Guedille aux œufs", "price": "5,55" },
      { "nom": "Guedille au poulet", "price": "5,85" },
      { "nom": "Pogo", "price": "3,85" }
    ]},
    { "id": "desserts", "nom": "Desserts", "items": [
      { "nom": "Gâteau (choix varié)", "price": "4,25" }
    ]},
    { "id": "breuvages", "nom": "Breuvages", "items": [
      { "nom": "Café, thé, tisane", "price": "3,00" },
      { "nom": "Boisson gazeuse (canette)", "price": "3,25" },
      { "nom": "Eau pétillante", "price": "2,75" },
      { "nom": "Jus", "desc": "raisin, orange, pomme, fruits", "price": "2,75" },
      { "nom": "Eau en bouteille", "price": "2,00" }
    ]},
    { "id": "biere-vin", "nom": "Bière et vin", "note": "Disponible sur place — informez-vous auprès du personnel.", "items": [] }
  ]
}
```

- [ ] **Step 4: Write the failing integrity test `src/data/menu.test.js`**

```js
import { describe, it, expect } from 'vitest';
import menu from './menu.json';

describe('menu.json', () => {
  it('has 14 categories', () => {
    expect(menu.categories).toHaveLength(14);
  });

  it('has 95 items total', () => {
    const total = menu.categories.reduce((n, c) => n + c.items.length, 0);
    expect(total).toBe(95);
  });

  it('every multi-size item has one price per column', () => {
    for (const cat of menu.categories) {
      if (!cat.columns) continue;
      for (const item of cat.items) {
        expect(item.prices).toHaveLength(cat.columns.length);
      }
    }
  });

  it('every simple item has a price string', () => {
    for (const cat of menu.categories) {
      if (cat.columns) continue;
      for (const item of cat.items) {
        expect(typeof item.price).toBe('string');
      }
    }
  });

  it('spot-checks known prices', () => {
    const pizza = menu.categories.find((c) => c.id === 'pizza');
    const fromage = pizza.items.find((i) => i.nom === 'Fromage');
    expect(fromage.prices).toEqual(['11,50', '13,40', '19,50', '24,25', '28,00']);
  });
});
```

- [ ] **Step 5: Run the test**

Run:
```bash
npm test
```
Expected: all 5 tests PASS. If a count assertion fails, the JSON was transcribed wrong — fix `menu.json` against `resto-4saisons-contenu.md`, do not change the test.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add full menu data with integrity tests"
```

---

## Task 3: Business info data file

**Files:**
- Create: `src/data/infos.json`

- [ ] **Step 1: Create `src/data/infos.json`**

Note: `heures` is ordered Sunday→Saturday (index 0 = dimanche) to match JS `Date.getDay()`. `codePostal` default is `G3H 2Z9` (open item: confirm with client). `geo` is approximate — confirm exact coordinates before launch.

```json
{
  "nom": "Restaurant 4 Saisons",
  "telephoneAffiche": "(418) 873-3003",
  "telephoneLien": "+14188733003",
  "adresse": {
    "rue": "29 rue du Collège",
    "ville": "Pont-Rouge",
    "province": "QC",
    "codePostal": "G3H 2Z9",
    "pays": "CA"
  },
  "geo": { "lat": 46.7549, "lng": -71.6962 },
  "apropos": "Le restaurant 4 Saisons est implanté au cœur de Pont-Rouge depuis des dizaines d'années et continue d'offrir à sa clientèle une nourriture de qualité et un service courtois. Les récentes rénovations laissent place à une ambiance moderne et décontractée. Laissez-vous tenter par nos pizzas généreuses et nos assiettes débordantes de saveurs disponibles aussi en livraison.",
  "avis": [
    { "texte": "Un incontournable à chaque semaine", "auteur": "Marie" },
    { "texte": "Une pizza de pizzeria", "auteur": "Dave M." },
    { "texte": "Toujours Bon!", "auteur": "Jean-Denis C." }
  ],
  "heures": [
    { "jour": "Dimanche", "ouvert": "06:00", "ferme": "19:00" },
    { "jour": "Lundi", "ouvert": null, "ferme": null },
    { "jour": "Mardi", "ouvert": null, "ferme": null },
    { "jour": "Mercredi", "ouvert": "06:00", "ferme": "20:00" },
    { "jour": "Jeudi", "ouvert": "06:00", "ferme": "20:00" },
    { "jour": "Vendredi", "ouvert": "06:00", "ferme": "20:00" },
    { "jour": "Samedi", "ouvert": "06:00", "ferme": "20:00" }
  ],
  "livraison": [
    { "jour": "Lundi", "midi": null, "soir": null },
    { "jour": "Mardi", "midi": null, "soir": null },
    { "jour": "Mercredi", "midi": "11 h 30 – 13 h 30", "soir": "16 h 30 – 19 h 45" },
    { "jour": "Jeudi", "midi": "11 h 30 – 13 h 30", "soir": "16 h 00 – 19 h 45" },
    { "jour": "Vendredi", "midi": "11 h 30 – 13 h 30", "soir": "16 h 00 – 19 h 45" },
    { "jour": "Samedi", "midi": "11 h 30 – 13 h 30", "soir": "16 h 00 – 19 h 45" },
    { "jour": "Dimanche", "midi": "11 h 30 – 13 h 30", "soir": "16 h 00 – 18 h 45" }
  ]
}
```

- [ ] **Step 2: Verify it is valid JSON**

Run:
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('src/data/infos.json','utf8')).nom)"
```
Expected: prints `Restaurant 4 Saisons`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add business info data file"
```

---

## Task 4: Open/closed status logic (TDD)

**Files:**
- Create: `src/lib/hours.js`
- Create: `src/lib/hours.test.js`

- [ ] **Step 1: Write the failing tests `src/lib/hours.test.js`**

```js
import { describe, it, expect } from 'vitest';
import { toMinutes, computeStatus } from './hours.js';

const schedule = [
  { ouvert: '06:00', ferme: '19:00' }, // dim
  { ouvert: null, ferme: null },       // lun
  { ouvert: null, ferme: null },       // mar
  { ouvert: '06:00', ferme: '20:00' }, // mer
  { ouvert: '06:00', ferme: '20:00' }, // jeu
  { ouvert: '06:00', ferme: '20:00' }, // ven
  { ouvert: '06:00', ferme: '20:00' }, // sam
];

describe('toMinutes', () => {
  it('converts HH:MM to minutes', () => {
    expect(toMinutes('06:00')).toBe(360);
    expect(toMinutes('16:30')).toBe(990);
  });
});

describe('computeStatus', () => {
  it('is open during hours', () => {
    const r = computeStatus(3, 720, schedule); // mercredi 12:00
    expect(r.open).toBe(true);
    expect(r.label).toBe('Ouvert · ferme à 20 h');
  });

  it('is closed before opening, same day', () => {
    const r = computeStatus(3, 300, schedule); // mercredi 05:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre à 6 h');
  });

  it('is closed after closing, points to next day as demain', () => {
    const r = computeStatus(3, 1260, schedule); // mercredi 21:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre demain à 6 h');
  });

  it('is closed on a closed day, names the next open day', () => {
    const r = computeStatus(1, 600, schedule); // lundi 10:00
    expect(r.open).toBe(false);
    expect(r.label).toBe('Fermé · ouvre mercredi à 6 h');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm test -- hours
```
Expected: FAIL — "Failed to resolve import './hours.js'" / functions undefined.

- [ ] **Step 3: Implement `src/lib/hours.js`**

```js
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function formatHeure(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

// schedule: array of 7 { ouvert, ferme } (string|null), index 0 = dimanche
export function computeStatus(weekday, minutes, schedule) {
  const today = schedule[weekday];
  if (today && today.ouvert && today.ferme) {
    const open = toMinutes(today.ouvert);
    const close = toMinutes(today.ferme);
    if (minutes >= open && minutes < close) {
      return { open: true, label: `Ouvert · ferme à ${formatHeure(today.ferme)}` };
    }
    if (minutes < open) {
      return { open: false, label: `Fermé · ouvre à ${formatHeure(today.ouvert)}` };
    }
  }
  for (let i = 1; i <= 7; i++) {
    const d = (weekday + i) % 7;
    const day = schedule[d];
    if (day && day.ouvert && day.ferme) {
      const quand = i === 1 ? 'demain' : JOURS[d];
      return { open: false, label: `Fermé · ouvre ${quand} à ${formatHeure(day.ouvert)}` };
    }
  }
  return { open: false, label: 'Fermé' };
}

export function nowInToronto(date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekday = map[parts.weekday];
  const hour = parseInt(parts.hour, 10) % 24;
  const minutes = hour * 60 + parseInt(parts.minute, 10);
  return { weekday, minutes };
}

export function getStatus(schedule, date = new Date()) {
  const { weekday, minutes } = nowInToronto(date);
  return computeStatus(weekday, minutes, schedule);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:
```bash
npm test -- hours
```
Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: open/closed status logic with tests"
```

---

## Task 5: Base layout with SEO + schema.org

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `public/favicon.svg`

- [ ] **Step 1: Install self-hosted fonts**

Run:
```bash
npm install @fontsource/poppins @fontsource/inter
```
Expected: both packages in dependencies.

- [ ] **Step 2: Create `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#1c1b1a"/><text x="32" y="44" font-family="Georgia,serif" font-size="34" font-weight="bold" text-anchor="middle" fill="#e0473e">4</text></svg>
```

- [ ] **Step 3: Create `src/layouts/Base.astro`**

```astro
---
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '../styles/global.css';
import infos from '../data/infos.json';

const { title = 'Restaurant 4 Saisons — Pizzas et cuisine à Pont-Rouge', description = infos.apropos.slice(0, 155) } = Astro.props;

const jours = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const openingHours = infos.heures
  .filter((h) => h.ouvert && h.ferme)
  .map((h, i) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: jours[infos.heures.indexOf(h)],
    opens: h.ouvert,
    closes: h.ferme,
  }));

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: infos.nom,
  servesCuisine: ['Pizza', 'Cuisine canadienne', 'Casse-croûte'],
  telephone: infos.telephoneLien,
  url: 'https://resto4saisons.com',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: infos.adresse.rue,
    addressLocality: infos.adresse.ville,
    addressRegion: infos.adresse.province,
    postalCode: infos.adresse.codePostal,
    addressCountry: infos.adresse.pays,
  },
  geo: { '@type': 'GeoCoordinates', latitude: infos.geo.lat, longitude: infos.geo.lng },
  openingHoursSpecification: openingHours,
};
---
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="restaurant" />
    <meta property="og:locale" content="fr_CA" />
    <meta name="theme-color" content="#1c1b1a" />
    <set:html set:html={`<script type="application/ld+json">${JSON.stringify(schema)}</script>`} />
  </head>
  <body class="bg-cream antialiased">
    <slot />
  </body>
</html>
```

Note: the `<set:html>` line injects the JSON-LD script tag without Astro trying to process its contents.

- [ ] **Step 4: Point `index.astro` at the layout to verify it renders**

Replace `src/pages/index.astro` with:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base>
  <main class="p-8">
    <h1 class="font-[var(--font-display)] text-4xl font-bold text-brick">4 Saisons</h1>
  </main>
</Base>
```

- [ ] **Step 5: Build and verify the schema is present**

Run:
```bash
npm run build && grep -c "application/ld+json" dist/index.html
```
Expected: build succeeds and grep prints `1`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: base layout with SEO meta and Restaurant schema"
```

---

## Task 6: Nav component

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
import infos from '../data/infos.json';
const liens = [
  { href: '#menu', label: 'Menu' },
  { href: '#apropos', label: 'À propos' },
  { href: '#heures', label: 'Heures & contact' },
];
---
<header class="sticky top-0 z-50 bg-charcoal/95 backdrop-blur text-white">
  <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
    <a href="#top" class="font-[var(--font-display)] text-lg font-bold">
      <span class="text-brick">4</span> Saisons
    </a>

    <ul class="hidden gap-6 text-sm md:flex">
      {liens.map((l) => (
        <li><a href={l.href} class="text-white/80 transition hover:text-white">{l.label}</a></li>
      ))}
    </ul>

    <div class="flex items-center gap-2">
      <a href={`tel:${infos.telephoneLien}`} class="rounded-lg bg-brick px-3 py-2 text-sm font-semibold transition hover:bg-brick-dark">
        📞 <span class="hidden sm:inline">Appeler</span>
      </a>
      <button id="navToggle" aria-label="Ouvrir le menu" aria-expanded="false" class="md:hidden p-2">
        <span class="block h-0.5 w-6 bg-white"></span>
        <span class="mt-1.5 block h-0.5 w-6 bg-white"></span>
        <span class="mt-1.5 block h-0.5 w-6 bg-white"></span>
      </button>
    </div>
  </nav>

  <ul id="navMobile" class="hidden flex-col gap-1 border-t border-white/10 px-4 pb-3 md:hidden">
    {liens.map((l) => (
      <li><a href={l.href} class="block py-2 text-white/90">{l.label}</a></li>
    ))}
  </ul>
</header>

<script>
  const btn = document.getElementById('navToggle');
  const menu = document.getElementById('navMobile');
  btn?.addEventListener('click', () => {
    const open = menu?.classList.toggle('hidden') === false;
    menu?.classList.toggle('flex', open);
    btn.setAttribute('aria-expanded', String(open));
  });
  menu?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
      btn?.setAttribute('aria-expanded', 'false');
    })
  );
</script>
```

- [ ] **Step 2: Render Nav in index.astro and verify build**

In `src/pages/index.astro`, import and place `<Nav />` at the top of the page (inside `<Base>`):

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
---
<Base>
  <div id="top"></div>
  <Nav />
  <main class="p-8"><h1 class="text-2xl">Test</h1></main>
</Base>
```

Run:
```bash
npm run build && grep -c "navToggle" dist/index.html
```
Expected: build succeeds, grep prints `1`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: sticky nav with mobile menu and call button"
```

---

## Task 7: Hero, OpenStatus island, DeliveryBanner

**Files:**
- Create: `src/components/OpenStatus.astro`
- Create: `src/components/Hero.astro`
- Create: `src/components/DeliveryBanner.astro`

- [ ] **Step 1: Create `src/components/OpenStatus.astro`**

```astro
---
import infos from '../data/infos.json';
import { getStatus } from '../lib/hours.js';
const initial = getStatus(infos.heures); // build-time fallback for no-JS
---
<span
  id="openStatus"
  data-status
  class:list={['inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold', initial.open ? 'bg-green-600/20 text-green-300' : 'bg-white/10 text-white/80']}
>
  <span class:list={['h-2 w-2 rounded-full', initial.open ? 'bg-green-400' : 'bg-white/50']} data-dot></span>
  <span data-label>{initial.label}</span>
</span>

<script>
  import infos from '../data/infos.json';
  import { getStatus } from '../lib/hours.js';
  const el = document.getElementById('openStatus');
  if (el) {
    const { open, label } = getStatus(infos.heures);
    el.querySelector('[data-label]').textContent = label;
    const dot = el.querySelector('[data-dot]');
    el.className = 'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ' +
      (open ? 'bg-green-600/20 text-green-300' : 'bg-white/10 text-white/80');
    dot.className = 'h-2 w-2 rounded-full ' + (open ? 'bg-green-400' : 'bg-white/50');
  }
</script>
```

- [ ] **Step 2: Create `src/components/Hero.astro`**

```astro
---
import infos from '../data/infos.json';
import OpenStatus from './OpenStatus.astro';
---
<section class="relative overflow-hidden bg-charcoal text-white">
  <div class="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
    <p class="text-xs font-semibold tracking-[0.2em] text-brick">PONT-ROUGE · DEPUIS DES DÉCENNIES</p>
    <h1 class="mx-auto mt-4 max-w-2xl font-[var(--font-display)] text-4xl font-bold leading-tight sm:text-5xl">
      Pizzas généreuses &amp; assiettes débordantes
    </h1>
    <p class="mx-auto mt-4 max-w-xl text-white/70">
      Cuisine maison et service courtois au cœur de Pont-Rouge — sur place et en livraison.
    </p>
    <div class="mt-8 flex flex-col items-center gap-4">
      <a href={`tel:${infos.telephoneLien}`} class="rounded-xl bg-brick px-7 py-4 text-lg font-semibold shadow-lg transition hover:bg-brick-dark">
        📞 {infos.telephoneAffiche}
      </a>
      <OpenStatus />
    </div>
  </div>
</section>
```

Note: the AI-generated ambiance background image is added later by dropping a file into `public/img/` and adding a background layer here; the design works without it.

- [ ] **Step 3: Create `src/components/DeliveryBanner.astro`**

```astro
<div class="bg-charcoal-soft text-center text-sm text-white/85">
  <p class="mx-auto max-w-5xl px-4 py-2.5">
    🚚 <strong class="text-white">Livraison</strong> — midi (11 h 30 – 13 h 30) &amp; soir, du mercredi au dimanche
  </p>
</div>
```

- [ ] **Step 4: Build and verify hydration script is bundled**

Add `<Hero />` and `<DeliveryBanner />` to `index.astro` under `<Nav />`, then run:
```bash
npm run build && grep -rc "openStatus" dist/index.html
```
Expected: build succeeds, grep prints at least `1` (the server-rendered span).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: hero, live open/closed status, delivery banner"
```

---

## Task 8: Menu — PriceTable, MenuSection, Menu with filters

**Files:**
- Create: `src/components/PriceTable.astro`
- Create: `src/components/MenuSection.astro`
- Create: `src/components/Menu.astro`

- [ ] **Step 1: Create `src/components/PriceTable.astro`** (multi-size items)

```astro
---
const { category } = Astro.props;
---
<div class="overflow-x-auto">
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="text-left text-charcoal/50">
        <th class="py-2 pr-2 font-semibold">&nbsp;</th>
        {category.columns.map((c) => (
          <th class="px-2 py-2 text-right font-semibold whitespace-nowrap">{c}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {category.items.map((item) => (
        <tr class="border-t border-cream-line align-top">
          <th scope="row" class="py-2.5 pr-2 text-left font-semibold">
            {item.nom}
            {item.desc && <span class="block text-xs font-normal text-charcoal/50">{item.desc}</span>}
          </th>
          {item.prices.map((p) => (
            <td class="px-2 py-2.5 text-right tabular-nums whitespace-nowrap">{p ? `${p} $` : '—'}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

- [ ] **Step 2: Create `src/components/MenuSection.astro`** (one category, simple or multi-size)

```astro
---
import PriceTable from './PriceTable.astro';
const { category } = Astro.props;
---
<section data-category={category.id} class="menu-cat scroll-mt-24">
  <h3 class="font-[var(--font-display)] text-xl font-bold text-charcoal">{category.nom}</h3>
  {category.note && <p class="mt-1 text-sm italic text-charcoal/50">{category.note}</p>}

  <div class="mt-3 rounded-xl bg-white p-4 shadow-sm sm:p-5">
    {category.columns ? (
      <PriceTable category={category} />
    ) : category.items.length === 0 ? (
      <p class="text-sm text-charcoal/60">{category.note}</p>
    ) : (
      <ul class="divide-y divide-cream-line">
        {category.items.map((item) => (
          <li class="flex items-baseline justify-between gap-4 py-2.5">
            <span class="font-semibold">
              {item.nom}
              {item.desc && <span class="block text-xs font-normal text-charcoal/50">{item.desc}</span>}
            </span>
            <span class="tabular-nums font-semibold whitespace-nowrap">{item.price} $</span>
          </li>
        ))}
      </ul>
    )}
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/Menu.astro`** (filters + all sections)

```astro
---
import menu from '../data/menu.json';
import MenuSection from './MenuSection.astro';
---
<section id="menu" class="scroll-mt-20 bg-cream py-14">
  <div class="mx-auto max-w-5xl px-4">
    <p class="text-xs font-semibold tracking-[0.2em] text-brick">NOTRE MENU</p>
    <h2 class="mt-2 font-[var(--font-display)] text-3xl font-bold">Le menu complet</h2>

    <div id="menuFilters" class="mt-5 flex flex-wrap gap-2">
      <button data-filter="all" class="filter-chip rounded-full bg-charcoal px-3 py-1.5 text-sm font-semibold text-white" aria-pressed="true">Tout</button>
      {menu.categories.map((c) => (
        <button data-filter={c.id} class="filter-chip rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-charcoal/70 shadow-sm" aria-pressed="false">{c.nom}</button>
      ))}
    </div>

    <div id="menuSections" class="mt-8 grid gap-8 sm:grid-cols-2">
      {menu.categories.map((c) => <MenuSection category={c} />)}
    </div>
  </div>
</section>

<script>
  const chips = document.querySelectorAll('.filter-chip');
  const cats = document.querySelectorAll('.menu-cat');
  function activate(filter) {
    cats.forEach((el) => {
      const show = filter === 'all' || el.getAttribute('data-category') === filter;
      el.style.display = show ? '' : 'none';
    });
    chips.forEach((chip) => {
      const on = chip.getAttribute('data-filter') === filter;
      chip.setAttribute('aria-pressed', String(on));
      chip.classList.toggle('bg-charcoal', on);
      chip.classList.toggle('text-white', on);
      chip.classList.toggle('bg-white', !on);
      chip.classList.toggle('text-charcoal/70', !on);
    });
  }
  chips.forEach((chip) => chip.addEventListener('click', () => activate(chip.getAttribute('data-filter'))));
</script>
```

Note: the filter is progressive enhancement — with JS disabled, all categories stay visible (nothing is hidden server-side).

- [ ] **Step 4: Add `<Menu />` to index.astro and build**

Run:
```bash
npm run build && grep -c "menuFilters" dist/index.html
```
Expected: build succeeds, grep prints `1`, and `dist/index.html` contains menu item text (e.g. "Poutine Caruso").

- [ ] **Step 5: Verify menu text is real (not an image)**

Run:
```bash
grep -c "Poutine Caruso" dist/index.html && grep -c "20,85" dist/index.html
```
Expected: each prints `1` — confirming menu content is selectable text.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: full menu with category filters and price tables"
```

---

## Task 9: About, Reviews, Hours & Contact, Footer

**Files:**
- Create: `src/components/About.astro`
- Create: `src/components/Reviews.astro`
- Create: `src/components/HoursContact.astro`
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Reviews.astro`**

```astro
---
import infos from '../data/infos.json';
---
<div class="mt-8 grid gap-4 sm:grid-cols-3">
  {infos.avis.map((a) => (
    <figure class="rounded-xl bg-charcoal-soft p-5">
      <div class="text-brick" aria-hidden="true">★★★★★</div>
      <blockquote class="mt-2 text-white/90">« {a.texte} »</blockquote>
      <figcaption class="mt-2 text-sm text-white/50">— {a.auteur}</figcaption>
    </figure>
  ))}
</div>
```

- [ ] **Step 2: Create `src/components/About.astro`**

```astro
---
import infos from '../data/infos.json';
import Reviews from './Reviews.astro';
---
<section id="apropos" class="scroll-mt-20 bg-charcoal py-14 text-white">
  <div class="mx-auto max-w-5xl px-4">
    <p class="text-xs font-semibold tracking-[0.2em] text-brick">QUI SOMMES-NOUS</p>
    <h2 class="mt-2 font-[var(--font-display)] text-3xl font-bold">Une institution de Pont-Rouge</h2>
    <p class="mt-4 max-w-3xl text-white/75 leading-relaxed">{infos.apropos}</p>
    <Reviews />
  </div>
</section>
```

- [ ] **Step 3: Create `src/components/HoursContact.astro`**

```astro
---
import infos from '../data/infos.json';
const adr = infos.adresse;
const adresseTexte = `${adr.rue}, ${adr.ville}, ${adr.province} ${adr.codePostal}`;
const mapQuery = encodeURIComponent(`${infos.nom}, ${adresseTexte}`);
const livraisonActive = infos.livraison.filter((l) => l.midi || l.soir);
---
<section id="heures" class="scroll-mt-20 bg-cream py-14">
  <div class="mx-auto grid max-w-5xl gap-8 px-4 md:grid-cols-2">
    <div>
      <p class="text-xs font-semibold tracking-[0.2em] text-brick">HEURES &amp; CONTACT</p>
      <h2 class="mt-2 font-[var(--font-display)] text-3xl font-bold">Venez nous voir</h2>

      <table class="mt-5 w-full text-sm">
        <caption class="sr-only">Heures d'ouverture</caption>
        <tbody>
          {infos.heures.map((h) => (
            <tr class="border-t border-cream-line">
              <th scope="row" class="py-2 text-left font-semibold">{h.jour}</th>
              <td class="py-2 text-right tabular-nums">{h.ouvert ? `${h.ouvert} – ${h.ferme}` : 'Fermé'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 class="mt-6 font-semibold">Heures de livraison</h3>
      <table class="mt-2 w-full text-sm">
        <tbody>
          {livraisonActive.map((l) => (
            <tr class="border-t border-cream-line">
              <th scope="row" class="py-2 text-left font-semibold">{l.jour}</th>
              <td class="py-2 text-right">{l.midi} · {l.soir}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <address class="mt-6 not-italic">
        <p class="font-semibold">{infos.nom}</p>
        <p class="text-charcoal/70">{adresseTexte}</p>
        <a href={`tel:${infos.telephoneLien}`} class="mt-2 inline-block font-semibold text-brick">📞 {infos.telephoneAffiche}</a>
      </address>
      <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener" class="mt-4 inline-block rounded-lg bg-brick px-4 py-2.5 font-semibold text-white transition hover:bg-brick-dark">
        Obtenir l'itinéraire
      </a>
    </div>

    <div class="min-h-[320px] overflow-hidden rounded-xl shadow-sm">
      <iframe
        title="Carte — Restaurant 4 Saisons"
        class="h-full min-h-[320px] w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
      ></iframe>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Create `src/components/Footer.astro`**

```astro
---
import infos from '../data/infos.json';
const adr = infos.adresse;
---
<footer class="bg-charcoal py-8 text-center text-sm text-white/50">
  <p>{adr.rue}, {adr.ville}, {adr.province} {adr.codePostal} · <a href={`tel:${infos.telephoneLien}`} class="text-white/70">{infos.telephoneAffiche}</a></p>
  <p class="mt-1">© 2026 {infos.nom} — Tous droits réservés.</p>
</footer>
```

- [ ] **Step 5: Build to verify all components compile**

Run:
```bash
npm run build
```
Expected: build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: about, reviews, hours/contact with map, footer"
```

---

## Task 10: Assemble page, README, final verification

**Files:**
- Modify: `src/pages/index.astro`
- Create: `README.md`

- [ ] **Step 1: Write the final `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import DeliveryBanner from '../components/DeliveryBanner.astro';
import Menu from '../components/Menu.astro';
import About from '../components/About.astro';
import HoursContact from '../components/HoursContact.astro';
import Footer from '../components/Footer.astro';
---
<Base>
  <div id="top"></div>
  <Nav />
  <main>
    <Hero />
    <DeliveryBanner />
    <Menu />
    <About />
    <HoursContact />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 2: Create `README.md`**

```markdown
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
  - `heures` est ordonné dimanche → samedi (index 0 = dimanche).
- **Visuels** : déposer les images dans `public/img/`.

## À confirmer avant la mise en ligne
- Code postal exact (`G3H 2Z9` par défaut).
- Coordonnées GPS (`geo` dans infos.json).
- Domaine et hébergement (Netlify / Vercel / GitHub Pages).

## Déploiement
Site 100 % statique : `npm run build` puis publier le dossier `dist/`.
```

- [ ] **Step 3: Run the full test suite**

Run:
```bash
npm test
```
Expected: all tests in `hours.test.js` and `menu.test.js` PASS.

- [ ] **Step 4: Build and start preview**

Run:
```bash
npm run build && npm run preview
```
Expected: build succeeds; preview serves at `http://localhost:4321`. Open it and confirm visually: nav sticky, hero call button, live status, full menu with working category filters, hours table, map, footer. Stop preview with Ctrl+C.

- [ ] **Step 5: Run Lighthouse (manual gate)**

In the browser, open DevTools → Lighthouse → analyze (mobile). Expected: Performance, Accessibility, Best Practices, SEO each ≥ 95. Note any item below 95 and fix before launch.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: assemble single-page site, add README"
```

---

## Open items to confirm with client (carry from spec §7)

These do not block the build; sensible defaults are in `infos.json`:
1. **Postal code** — `G3H 2Z9` (default) vs `G3A 2Z9`.
2. **GPS coordinates** in `geo` — verify exact location.
3. **Bière et vin** — list prices or keep "informez-vous" note.
4. **Food photos** — reuse current site photos at launch; replace with fresh photos later.
5. **Domain / host** — keep `resto4saisons.com`, repoint DNS to the new static host.

---

## Self-review notes (completed by plan author)

- **Spec coverage:** real-text menu (Task 8) ✓, click-to-call (Tasks 5/7/9) ✓, live open/closed (Tasks 4/7) ✓, French single-page (Task 10) ✓, Direction A tokens (Task 1) ✓, Astro+Tailwind (Task 1) ✓, structured menu data (Task 2) ✓, schema.org/SEO/perf (Task 5, Task 10 Lighthouse gate) ✓, canonical address (Task 3) ✓, all menu categories incl. bière/vin (Task 2) ✓.
- **AI visuals:** intentionally not a build task — assets are generated separately and dropped into `public/img/`; components render correctly without them (noted in Tasks 7).
- **Type consistency:** `infos.heures` shape `{jour,ouvert,ferme}` used identically in hours.js tests, OpenStatus, Base schema, and HoursContact. `menu` item shapes (`price` vs `prices`) handled consistently in PriceTable/MenuSection and asserted in menu.test.js.
```
