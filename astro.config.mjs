// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// Production target: the apex domain, served from the web root by the
// contractor's own server (no base path).
//
// The GitHub Pages preview (tomsoucai.github.io/resto-4saisons) is kept alive
// by the deploy workflow, which sets DEPLOY_TARGET=github-pages before building.
const isGitHubPages = process.env.DEPLOY_TARGET === 'github-pages';

export default defineConfig({
  site: isGitHubPages ? 'https://tomsoucai.github.io' : 'https://resto4saisons.com',
  ...(isGitHubPages ? { base: '/resto-4saisons' } : {}),

  output: 'static',
  trailingSlash: 'ignore',

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
