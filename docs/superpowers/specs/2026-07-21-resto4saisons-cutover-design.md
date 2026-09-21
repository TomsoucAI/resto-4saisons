# Cutover of resto4saisons.com to the new Astro site

- **Date:** 2026-07-21
- **Status:** Design approved — spec pending review
- **Predecessor:** [2026-06-05-resto-4saisons-refonte-design.md](./2026-06-05-resto-4saisons-refonte-design.md) (open item #4: "confirmer la cible de déploiement")
- **Trigger: Execute on client signature. Not before.**

> Written in English per the global language rule (2026-07-08), which postdates the French June spec. The client-facing message in §10 is in French because its recipients are francophone.

---

## 1. Context

The rebuilt Astro site is complete and live at https://tomsoucai.github.io/resto-4saisons/. The restaurant's real domain, resto4saisons.com, still serves the old GoDaddy site.

The owner is interested but has not signed. The GitHub URL is adequate to pitch with, so nothing here executes until they commit. This spec exists so that cutover is a checklist on signature day rather than a research project.

The domain is administered by a local web company the restaurant hired. Tom can speak to the owner directly.

**Success criteria**

- The domain's SEO history and age are preserved (same domain, no redirect chain).
- Rollback is available in under an hour at any point.
- Total recurring hosting cost: $0.

**Out of scope**

- Acquiring or transferring the domain.
- Changing DNS providers or registrar.
- Any AWS spend.
- Google Business Profile changes. Reviews are attached to the GBP, not the domain, and are unaffected by any step here.

---

## 2. Current state (verified by live DNS query, 2026-07-21)

Registrar/DNS: GoDaddy (ns49.domaincontrol.com, ns50.domaincontrol.com). Apex A record TTL: 3600s.

The eight Microsoft 365 records — **these must survive untouched**:

| Type  | Name                   | Value                                                  |
| ----- | ---------------------- | ------------------------------------------------------ |
| MX    | @                      | resto4saisons-com.mail.protection.outlook.com (pref 0) |
| TXT   | @                      | `v=spf1 include:spf.protection.outlook.com -all`       |
| TXT   | @                      | `MS=ms97668601`                                        |
| CNAME | autodiscover           | autodiscover.outlook.com                               |
| CNAME | enterpriseregistration | enterpriseregistration.windows.net                     |
| CNAME | lyncdiscover           | webdir.online.lync.com                                 |
| CNAME | sip                    | sipdir.online.lync.com                                 |
| SRV   | _sipfederationtls._tcp | sipfed.online.lync.com, port 5061 (priority 100, weight 1) |

No DMARC record. No DKIM selectors configured.

Records to be changed:

| Type  | Name | Current (TTL 3600)              | Becomes                   |
| ----- | ---- | ------------------------------- | ------------------------- |
| A     | @    | 76.223.105.230, 13.248.243.5    | GitHub's four IPs (§5)    |
| CNAME | www  | → resto4saisons.com             | → tomsoucai.github.io     |

www is a CNAME pointing at the apex — verified by live query. The change is a retarget of the existing record, not a type change.

This email infrastructure was undocumented. It appears in no project file and the site displays no address — it was found only by querying live DNS. Any plan that migrates this zone must recreate all eight records, including the SRV. That risk is the primary driver of the approach below.

---

## 3. Decisions

| Decision         | Choice                              | Rationale                                             |
| ---------------- | ----------------------------------- | ----------------------------------------------------- |
| Host             | GitHub Pages (unchanged)            | Only candidate offering static apex IPs — see §4      |
| DNS provider     | GoDaddy (unchanged)                 | Zero risk to the M365 tenant                          |
| Registrar        | Unchanged                           | No transfer needed                                    |
| Access model     | Owner requests specific record changes | No credentials change hands                        |
| Cost             | $0/month                            | Free hosting, free SSL, no new services               |
| Execution window | Monday (restaurant closed Mon–Tue)  | Cert provisioning may take up to 24h                  |
| AWS Amplify      | Rejected — see §9                   | Costs money and forces zone migration; buys nothing   |

---

## 4. Why GitHub Pages, in one paragraph

GoDaddy does not support ALIAS/ANAME records — this is stated in AWS's own GoDaddy guide, which recommends migrating DNS to Route 53 as a result. An apex domain therefore needs real A records pointing at static IPs. Amplify and Cloudflare front their traffic with CDNs that have no fixed IPs, so putting the apex on either requires migrating the whole zone away from GoDaddy — which means hand-recreating the eight M365 records above. GitHub Pages publishes four permanent apex IPs, making it the only option that attaches to the apex without touching a single email record. The alternative on GoDaddy — their 302 domain-forwarding workaround — leaks SEO value on a site whose entire purpose is local search visibility, and is rejected.

---

## 5. Repo changes (two files)

**astro.config.mjs**

```js
site: 'https://resto4saisons.com',
// `base` line deleted entirely (Astro's default is '/')
```

Currently `base: '/resto-4saisons'` prefixes 21 asset URLs in dist/index.html (count verified against the current build). Deployed to an apex unchanged, every stylesheet and image 404s and the page renders as unstyled text. `src/` and `public/` contain zero hardcoded `/resto-4saisons/` references (verified by grep), so removing `base` and rebuilding fixes it completely.

**public/CNAME** — new file, one line:

```
resto4saisons.com
```

Set alongside the repo's Settings → Pages custom-domain field. Both, because the Settings value can be cleared on Actions-based redeploys.

`.github/workflows/deploy.yml` needs no changes.

**Sequencing caveat:** removing `base` breaks tomsoucai.github.io/resto-4saisons/, the URL currently used for pitching. Make these changes on signature, not before, or on a branch that isn't auto-deployed.

Target DNS values:

```
A      @    185.199.108.153
A      @    185.199.109.153
A      @    185.199.110.153
A      @    185.199.111.153
CNAME  www  tomsoucai.github.io
```

---

## 6. Cutover procedure

**T-7 days — commercial**

1. Owner confirms in writing they want the switch.
2. Owner checks what the web company currently bills for hosting — the new setup is $0/mo, so this becomes a recurring saving and a closing argument.
3. Confirm whether the web company also administers the Microsoft 365 tenant; that relationship continues undisturbed either way.

**T-2 days — prepare**

4. Apply the §5 repo changes; merge; confirm the Actions deploy succeeds.
5. Set the custom domain in repo Settings → Pages.
6. Capture full current DNS state: nslookup every record in §2 and screenshot the GoDaddy zone. This is the rollback reference.
7. Owner sends the §10 request to the web company, naming the agreed Monday date. The message asks them to lower the apex A and www CNAME TTLs to 300s immediately, then make the record changes on the agreed date. The TTL must propagate ahead of cutover or rollback is delayed by the old 3600s value.
8. Confirm the TTL drop has taken effect before Monday.

**T-0, Monday morning — execute**

9. Web company replaces the two apex A records with the four GitHub IPs and retargets the www CNAME to tomsoucai.github.io.
10. Wait for propagation (~5 min at 300s TTL). Verify apex resolves to 185.199.x.153.
11. In repo Settings → Pages, enable Enforce HTTPS once the option appears. May take up to 24h.
12. Run the §7 email gate, then the §11 verification checklist.
13. Restore TTLs to 3600s once stable for 24h.

The old GoDaddy site remains live and untouched throughout. There is no window in which the restaurant has no website.

---

## 7. Email safety protocol

**Hard gate. Email verification precedes any judgement about the website.**

- Before: record all eight §2 values via nslookup; screenshot the GoDaddy zone.
- After: re-query all eight; every value must be byte-identical.
- Send a live test message in both directions through the restaurant's mailbox.
- If any of the eight changed, or mail fails: roll back immediately (§8), regardless of how the website looks.

Rationale: mail failures are silent. The site being visibly fine is not evidence that mail survived.

---

## 8. Rollback

Restore the two original apex A records (76.223.105.230, 13.248.243.5) and retarget the www CNAME back to resto4saisons.com, per the §6.6 screenshot. At 300s TTL, recovery is roughly five minutes.

Rollback is a DNS revert, not a rebuild — the old site is never deleted or modified. The web company should be told in advance that a revert may be requested, so it isn't a surprise ticket.

---

## 9. Alternatives, with trigger conditions

**B — Move DNS to Cloudflare.** Free, unlimited bandwidth, CNAME flattening solves apex cleanly, and Cloudflare's nameserver import auto-scans existing records, reducing (not eliminating) the M365 replication risk. Gains full DNS self-service, removing the web company from the loop permanently. *Trigger:* the company becomes slow or obstructive on routine record changes, or the site gains a backend needing frequent DNS work. Cost: $0.

**C — Route 53 + AWS Amplify.** Requires full zone migration and manual recreation of all eight M365 records including the SRV. Roughly $1.50/month after the 12-month free tier ($0.90 bandwidth, $0.50 hosted zone, $0.08 builds); free for year one. Uncapped bandwidth means a traffic spike or scraper has no cost ceiling. *Trigger:* the site needs SSR, API routes, or auth — none currently in scope — or AWS experience is independently worth paying for. *Assessment:* buys this static brochure site nothing technically.

**Rejected — GoDaddy 302 forwarding.** GoDaddy's own apex workaround. A temporary redirect that leaks SEO value and handles apex HTTPS poorly. Unacceptable for a site built for local search.

---

## 10. Request for the owner to forward

Sent by the owner to the web company — not by Tom. The restaurant is their client; an identical request from an unknown third party looks like a hijacking attempt and should be refused.

> Bonjour,
>
> Nous mettons en ligne une nouvelle version du site web du Restaurant 4 Saisons. Le nom de domaine resto4saisons.com reste le même et demeure chez vous — nous avons seulement besoin de faire pointer le site vers son nouvel hébergement.
>
> Pourriez-vous effectuer les modifications DNS suivantes le [date convenue — un lundi] ?
>
> **1. Remplacer les enregistrements A du domaine racine (@)**
> Retirer : 76.223.105.230 et 13.248.243.5
> Ajouter les quatre suivants :
>
> ```
> A   @   185.199.108.153
> A   @   185.199.109.153
> A   @   185.199.110.153
> A   @   185.199.111.153
> ```
>
> **2. Modifier l'enregistrement www**
> L'enregistrement www est actuellement un CNAME qui pointe vers resto4saisons.com. Remplacer sa cible :
>
> ```
> CNAME   www   tomsoucai.github.io
> ```
>
> **Important — ne rien modifier d'autre.** Les enregistrements liés à Microsoft 365 (MX, SPF, MS=, autodiscover, sip, lyncdiscover, enterpriseregistration, et l'enregistrement SRV _sipfederationtls._tcp) doivent rester exactement tels quels afin que le courriel et Teams continuent de fonctionner sans interruption.
>
> Si possible, pourriez-vous aussi abaisser dès maintenant le TTL des enregistrements A (@) et du CNAME www à 300 secondes ? Cela nous permettra de revenir en arrière rapidement si nécessaire le jour du changement.
>
> Merci beaucoup,

---

## 11. Verification checklist (T-0, after propagation)

The §7 email gate passes first — before any judgement about the website.

- https://resto4saisons.com loads the new site over HTTPS with a valid certificate.
- https://www.resto4saisons.com redirects (301) to the apex — GitHub Pages does this automatically once the apex is the custom domain.
- All stylesheets and images load; zero 404s in the browser console (confirms the §5 `base` removal).
- Phone number, address, and opening hours on the live site match src/data/infos.json.
- Lighthouse ≥95 on all four axes (mobile), per the original spec.
- Google Business Profile still links correctly; review count unchanged.

---

## 12. Open items

- Owner has not signed. Everything here is blocked on that.
- Current hosting invoice amount from the web company — needed as the closing argument.
- Whether the web company also administers the Microsoft 365 tenant.
- Carried from the June spec: confirm postal code (G3H 2Z9 vs G3A 2Z9 — infos.json currently says G3H 2Z9), verify GPS coordinates, replace the src/assets/menu/pizza-1.jpg placeholder.

---

**Sources:**
[AWS — GoDaddy custom domain](https://docs.aws.amazon.com/amplify/latest/userguide/to-add-a-custom-domain-managed-by-godaddy.html) · [GitHub Pages — managing a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) · [Amplify pricing](https://aws.amazon.com/amplify/pricing/) · [Route 53 pricing](https://aws.amazon.com/route53/pricing/)
