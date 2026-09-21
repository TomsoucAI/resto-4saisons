# resto4saisons.com — Enregistrements DNS à configurer

_Préparé le 2026-09-21 pour le responsable du domaine resto4saisons.com._

Le nouveau site du Restaurant 4 Saisons est hébergé sur **GitHub Pages**. Il n'y a **rien à téléverser** sur votre serveur : il suffit de pointer le domaine vers GitHub. Le HTTPS est fourni automatiquement par GitHub (certificat Let's Encrypt) une fois le DNS en place.

Le domaine est géré chez GoDaddy (serveurs de noms `ns49/ns50.domaincontrol.com`). Les modifications se font dans **GoDaddy → Mon portefeuille de produits → DNS**.

---

## 1. Enregistrements à ajouter ou remplacer

### Domaine principal `resto4saisons.com` (nom `@`)

**Supprimez** les enregistrements **A** actuels de `@` (présentement `13.248.243.5` et `76.223.105.230`), ainsi que tout enregistrement CNAME, ALIAS ou « Forwarding » sur `@`, puis ajoutez :

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 1 heure (ou par défaut) |
| A | `@` | `185.199.109.153` | 1 heure |
| A | `@` | `185.199.110.153` | 1 heure |
| A | `@` | `185.199.111.153` | 1 heure |

Les **quatre** enregistrements A sont requis (GitHub répartit la charge entre eux).

Facultatif mais recommandé (IPv6) :

| Type | Nom | Valeur |
|---|---|---|
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

### Sous-domaine `www`

Supprimez tout enregistrement A ou CNAME existant sur `www`, puis ajoutez :

| Type | Nom | Valeur |
|---|---|---|
| CNAME | `www` | `tomsoucai.github.io` |

(sans `https://`, sans barre oblique à la fin). `www.resto4saisons.com` redirigera automatiquement vers `resto4saisons.com`.

---

## 2. Ce qu'il ne faut PAS toucher

Le courriel du restaurant passe par **Microsoft 365** (MX `resto4saisons-com.mail.protection.outlook.com`). **Ne modifiez et ne supprimez aucun** de ces enregistrements :

- **MX** (`@` → `resto4saisons-com.mail.protection.outlook.com`)
- **TXT** sur `@` commençant par `v=spf1 ...` (SPF), les TXT `MS=...` (vérification Microsoft) et `_dmarc` (DMARC)
- **CNAME** `autodiscover` → `autodiscover.outlook.com` et tout CNAME `selector1._domainkey` / `selector2._domainkey` (DKIM)
- Tout autre enregistrement **SRV** ou **TXT** lié à Microsoft 365 / Teams

Seuls les enregistrements **A / AAAA sur `@`** et **CNAME sur `www`** changent. Après la modification, vérifiez que le MX est toujours là :

```bash
nslookup -type=MX resto4saisons.com
```

---

## 3. Vérification

La propagation prend habituellement de quelques minutes à 1 heure chez GoDaddy (jusqu'à 24 h dans le pire cas).

```bash
nslookup resto4saisons.com
# doit retourner les quatre adresses 185.199.108.153 ... 185.199.111.153

nslookup www.resto4saisons.com
# doit retourner tomsoucai.github.io
```

Ensuite :

- `https://resto4saisons.com/` affiche le nouveau site (photos, menu, heures).
- `http://resto4saisons.com/` et `https://www.resto4saisons.com/` redirigent vers `https://resto4saisons.com/`.

Le certificat HTTPS est émis par GitHub automatiquement dans l'heure qui suit la propagation du DNS. Si le site affiche un avertissement de certificat pendant ce délai, c'est normal ; il disparaît de lui-même.

---

Questions techniques : Tom Soucy — tomsoucy1@gmail.com.
