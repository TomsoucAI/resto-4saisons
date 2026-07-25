// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// `base` targets the GitHub Pages preview at tomsoucai.github.io/resto-4saisons.
// When the real domain is connected, set base to '/' and site to the domain.
export default defineConfig({
  site: 'https://tomsoucai.github.io',
  base: '/resto-4saisons',

  vite: {
    plugins: [tailwindcss()],
  },
});