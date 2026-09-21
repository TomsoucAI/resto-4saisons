# Restaurant 4 Saisons — Guide de mise en ligne (resto4saisons.com)

_Préparé le 2026-09-21 pour l'hébergeur du domaine resto4saisons.com._

Ce document explique quoi faire avec le fichier **`resto4saisons-site.zip`** pour mettre le nouveau site en ligne sur votre serveur. Aucune base de données, aucun PHP, aucun Node sur le serveur : c'est un site **100 % statique** (HTML, CSS, images, polices).

---

## 1. C'est quoi, le zip

`resto4saisons-site.zip` contient le site déjà compilé, prêt à servir. Les fichiers sont **directement à la racine du zip** (pas de sous-dossier) :

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | La page d'accueil (le site est une page unique) |
| `404.html` | Page « introuvable » à afficher pour les URL inexistantes |
| `_astro/` | CSS, images optimisées (WebP) et polices. Noms de fichiers avec empreinte (hash) : ils changent à chaque rebuild, ce qui permet une mise en cache longue |
| `favicon.svg` | Icône du site |
| `og-image.jpg` | Image d'aperçu pour Facebook / Messenger / iMessage (1200 × 630) |
| `robots.txt` | Autorise l'indexation et pointe vers le sitemap |
| `sitemap-index.xml`, `sitemap-0.xml` | Sitemap pour Google |

Toutes les URL internes sont **absolues à partir de la racine** (`/_astro/...`, `/favicon.svg`). Le site doit donc être servi **à la racine du domaine** (`https://resto4saisons.com/`), pas dans un sous-dossier comme `/site/`.

N'importe quel serveur web fait l'affaire : Apache, Nginx, LiteSpeed, IIS, cPanel, Plesk, etc.

---

## 2. Où téléverser les fichiers

1. Décompressez le zip.
2. Téléversez **tout le contenu** (y compris le dossier `_astro/`) dans la **racine web** du domaine. Selon l'hébergement, ce dossier s'appelle habituellement `public_html/`, `www/`, `htdocs/` ou `/var/www/resto4saisons.com/`.
3. Résultat attendu : `index.html` se trouve directement dans la racine web, et `https://resto4saisons.com/_astro/` est accessible.
4. Si l'ancien site est encore dans ce dossier, videz-le d'abord (faites-en une copie de sauvegarde si vous voulez pouvoir revenir en arrière).

Test rapide une fois en ligne :

- `https://resto4saisons.com/` affiche la page (photos, menu, heures).
- `https://resto4saisons.com/robots.txt` et `https://resto4saisons.com/sitemap-index.xml` répondent.
- `https://resto4saisons.com/nimporte-quoi` affiche la page 404 du site (voir configuration ci-dessous).
- `http://resto4saisons.com/` redirige vers `https://`.

---

## 3. Configuration serveur recommandée

Trois choses à mettre en place : la **redirection HTTP → HTTPS**, la **page 404** et la **mise en cache** des fichiers de `/_astro/` (leurs noms contiennent une empreinte unique, on peut donc les garder en cache un an sans risque). Le `index.html`, lui, ne doit **pas** être mis en cache longtemps, sinon les clients verront un vieux menu après une mise à jour.

Le site n'utilise pas `www`. Les balises canoniques et le sitemap pointent vers `https://resto4saisons.com/`. Si vous gardez aussi `www.resto4saisons.com`, faites-le rediriger (301) vers le domaine sans `www`.

### Apache (`.htaccess` à déposer dans la racine web, à côté de `index.html`)

Nécessite les modules `mod_rewrite` et `mod_headers` (activés par défaut sur la plupart des hébergements cPanel / Plesk).

```apache
# --- HTTP -> HTTPS et www -> sans www ---
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\. [NC]
RewriteRule ^ https://resto4saisons.com%{REQUEST_URI} [L,R=301]

# --- Page 404 du site ---
ErrorDocument 404 /404.html

# --- Mise en cache ---
<IfModule mod_headers.c>
  # Fichiers sous /_astro/ : noms avec empreinte, cache 1 an, immuable
  <FilesMatch "\.(css|js|woff2?|webp|jpe?g|png|svg)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  # Pages HTML, sitemap, robots : toujours revalider
  <FilesMatch "\.(html|xml|txt)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  # Favicon et image d'aperçu : ils ne portent pas d'empreinte, cache 1 jour
  <FilesMatch "^(favicon\.svg|og-image\.jpg)$">
    Header set Cache-Control "public, max-age=86400"
  </FilesMatch>
  # Quelques en-têtes de sécurité de base
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# --- Compression (si mod_deflate est présent) ---
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/xml image/svg+xml
</IfModule>

# --- Types MIME au cas où le serveur ne les connaît pas ---
AddType font/woff2 .woff2
AddType font/woff  .woff
AddType image/webp .webp
```

### Nginx (blocs `server`)

```nginx
# Redirection HTTP -> HTTPS (et www -> sans www)
server {
    listen 80;
    listen [::]:80;
    server_name resto4saisons.com www.resto4saisons.com;
    return 301 https://resto4saisons.com$request_uri;
}

# www en HTTPS -> sans www
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.resto4saisons.com;
    # ssl_certificate / ssl_certificate_key : mêmes fichiers que ci-dessous
    return 301 https://resto4saisons.com$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name resto4saisons.com;

    # ssl_certificate     /etc/letsencrypt/live/resto4saisons.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/resto4saisons.com/privkey.pem;

    root  /var/www/resto4saisons.com;   # dossier où le contenu du zip a été déposé
    index index.html;

    # Page 404 du site
    error_page 404 /404.html;

    # Fichiers avec empreinte : cache 1 an, immuable
    location /_astro/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Favicon et image d'aperçu : cache 1 jour
    location ~ ^/(favicon\.svg|og-image\.jpg)$ {
        add_header Cache-Control "public, max-age=86400";
    }

    # Pages HTML, sitemap, robots : toujours revalider
    location ~* \.(html|xml|txt)$ {
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }

    location / {
        try_files $uri $uri/ =404;
    }

    # Compression
    gzip on;
    gzip_types text/html text/css text/plain text/xml application/xml image/svg+xml;

    # En-têtes de sécurité de base
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Nginx connaît déjà les types MIME `woff2` et `webp` dans son `mime.types` par défaut.

### Certificat HTTPS

Le site doit être servi en HTTPS (les balises canoniques, le sitemap et l'image d'aperçu utilisent `https://`). Let's Encrypt (certbot) ou le certificat fourni par votre panneau d'hébergement convient parfaitement.

---

## 4. DNS : ce qu'il faut changer, et ce qu'il ne faut PAS toucher

Pour pointer le domaine vers votre serveur, vous n'avez qu'à modifier l'enregistrement **A** (et **AAAA** si vous avez une adresse IPv6) :

| Type | Nom | Valeur |
|---|---|---|
| A | `@` (resto4saisons.com) | adresse IP de votre serveur |
| A ou CNAME | `www` | même IP, ou CNAME vers `resto4saisons.com` (optionnel, avec la redirection ci-dessus) |

**Important : ne touchez pas aux enregistrements MX** (ni aux enregistrements TXT / SPF / DKIM / DMARC qui vont avec). Ils gèrent le courriel du restaurant. Modifier ou supprimer un MX en changeant l'enregistrement A couperait les courriels du client. Vérifiez après la modification que les MX sont toujours là :

```bash
nslookup -type=MX resto4saisons.com
```

Aucun enregistrement DNS spécial (CNAME vers GitHub, TXT de vérification, etc.) n'est requis pour ce site.

---

## 5. Mettre à jour le site plus tard (rebuild à partir du dépôt)

Vous n'avez pas besoin de ça pour la mise en ligne : le zip est prêt. C'est pour le jour où le menu ou les heures changent.

Le code source est dans le dépôt GitHub `TomsoucAI/resto-4saisons` (branche `master` une fois la PR fusionnée). Les prix, le menu et les heures sont dans des fichiers JSON faciles à modifier (`src/data/menu.json`, `src/data/infos.json`), voir le `README.md` du dépôt.

Prérequis : **Node.js 22 LTS ou plus récent** (le site a été compilé avec Node 24) et npm.

```bash
git clone https://github.com/TomsoucAI/resto-4saisons.git
cd resto-4saisons
npm ci            # installe exactement les versions verrouillées (package-lock.json)
npm run build     # génère le site dans le dossier dist/
```

Le dossier **`dist/`** contient exactement ce qu'il y a dans le zip. Téléversez son contenu dans la racine web pour remplacer l'ancienne version. Le dossier `_astro/` peut être écrasé sans crainte : les anciens fichiers avec empreinte ne sont plus référencés.

Facultatif : `npm test` lance les tests unitaires (heures d'ouverture, validation du menu).

Note : par défaut, le build cible `https://resto4saisons.com` à la racine. La variable d'environnement `DEPLOY_TARGET=github-pages` sert uniquement à l'aperçu GitHub Pages et ne doit pas être utilisée pour la production.

---

## 6. Aide-mémoire pour la mise en ligne

- [ ] Contenu du zip déposé dans la racine web (`index.html` à la racine).
- [ ] Redirection `http://` → `https://` en place, certificat HTTPS valide.
- [ ] `www` redirige vers le domaine sans `www` (si `www` est conservé).
- [ ] Page 404 configurée (`/404.html`).
- [ ] Cache long sur `/_astro/`, cache court sur `index.html`.
- [ ] Enregistrement A mis à jour ; **MX, SPF, DKIM, DMARC intacts**.
- [ ] Test sur téléphone : photos, menu, bouton « Appeler », carte Google.
- [ ] Facultatif : soumettre `https://resto4saisons.com/sitemap-index.xml` dans Google Search Console.

Questions techniques : Tom Soucy — tomsoucy1@gmail.com.
