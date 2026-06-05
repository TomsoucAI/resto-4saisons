# Spec — Migrate `resto-4saisons` from GitHub Pages project path to apex domain `resto4saisons.com`

## Objective
Reconfigure this Astro + GitHub Pages repo so the site serves correctly from `https://resto4saisons.com/` instead of `https://tomsoucai.github.io/resto-4saisons/`. **Repo-side changes only** — DNS records and GitHub UI settings are handled separately, outside this task.

## Current state (verify, do not assume)
- Astro static site, deployed to GitHub Pages as a **project** site under `/resto-4saisons/`.
- Built asset URLs currently carry the `/resto-4saisons/` base path.
- The "Laisser un avis" / Google review buttons point to a generic Google Maps **search** URL (a fallback), not the business's real review short-link.

**Before changing anything**, open `astro.config.*` and the deploy workflow and report the actual current `site`, `base`, installed integrations (esp. `@astrojs/sitemap`), and publishing method.

## Tasks

1. **Astro config**
   - Set `site: 'https://resto4saisons.com'`.
   - Set `base: '/'` (or remove the `base` key entirely).
   - Leave everything else intact. Show the before/after.

2. **Hunt hardcoded base paths**
   - Grep all of `src/`, `public/`, and any MD/MDX content for the literal `resto-4saisons`, for paths like `/resto-4saisons/`, and for `tomsoucai.github.io`.
   - Astro-generated asset links fix themselves on rebuild — only touch **hand-written** references: manual `<a href>`, `<img src>`, `import`/`fetch` paths, `og:url`/canonical/meta tags. Replace `/resto-4saisons/…` with `/…`; replace `tomsoucai.github.io/resto-4saisons` literals with the new domain or a relative path.
   - List every change made.

3. **CNAME file**
   - Create `public/CNAME` containing exactly one line — `resto4saisons.com` — no protocol, no trailing slash, no extra whitespace.

4. **Deployment method check**
   - Detect whether deploy is via GitHub Actions (`.github/workflows/*.yml` using `withastro/action` + `actions/deploy-pages`) or branch-based.
   - If Actions: confirm the workflow uploads the full `dist/` (which will include the built `CNAME`) and that nothing in the workflow hardcodes the old base path. Do **not** touch repo Settings.
   - If branch-based: confirm the `CNAME` won't be wiped on rebuild (that's why it lives in `public/`).

5. **Centralize the review link — do NOT invent it**
   - The real Google review link (`https://g.page/r/.../review`) is **pending and not yet available**. Do not fabricate or guess one.
   - Refactor the review-button URL into a single constant (e.g. `src/config.ts` → `GOOGLE_REVIEW_URL`) referenced by every review button. Keep the **current Maps-search URL as the value**, with a `// TODO: replace with real g.page review link from owner` comment. The future swap must be a one-line change.

6. **Build + verify locally**
   - Run the project build (`npm run build` or equivalent) and a local preview.
   - Confirm: no emitted URL contains `/resto-4saisons/`; no `tomsoucai.github.io` reference remains in `dist/`; assets resolve from root `/`; if `@astrojs/sitemap` is present, sitemap + canonical now use `resto4saisons.com`.

7. **Commit + push**
   - One clean commit: `chore: migrate to apex custom domain resto4saisons.com`.
   - Push to the deploy branch. Report the commit hash and confirm the Pages/CI build was triggered.

## Acceptance criteria
- [ ] `astro.config` has `site = https://resto4saisons.com` and root `base`.
- [ ] `public/CNAME` exists with the bare domain on one line.
- [ ] No hand-written `/resto-4saisons/` or `tomsoucai.github.io` references remain in source or `dist/`.
- [ ] Local build succeeds; preview renders with all assets loading from `/`.
- [ ] Review URL is a single centralized constant with a TODO, still the Maps fallback (not a fabricated link).
- [ ] Changes committed, pushed, build triggered.

## Out of scope — do NOT do
- Any DNS record changes.
- Any GitHub repo **Settings** changes (Custom domain field, Enforce HTTPS) — handled in the GitHub UI separately.
- Fabricating or guessing the real Google review link.

## Final output
End with: list of files changed, the config diff, the list of replaced references, and confirmation the local build passed.
