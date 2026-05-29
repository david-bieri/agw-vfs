# AGW Website — GitHub Setup Guide

Step-by-step to go from these files to a live GitHub Pages site.
Estimated time: 20–30 minutes.

---

## Step 1 — Create the GitHub repository

1. Go to **github.com/new**
2. Settings:
   - **Repository name:** `agw-vfs`
   - **Visibility:** Public *(required for free GitHub Pages)*
   - **Do NOT** initialise with README, .gitignore, or licence
3. Click **Create repository**
4. Note the repo URL: `https://github.com/david-bieri/agw-vfs.git`

> **Org vs personal:** If a `agw-vfs` GitHub organisation exists or should be created,
> use that for the org URL `david-bieri.github.io/agw-vfs`. Otherwise a personal account
> works fine and the URL will be `[username].github.io/agw-website`.

---

## Step 2 — Assemble the repo files locally

Create a folder and copy all output files into it:

```bash
mkdir agw-vfs && cd agw-vfs

# Copy the website files (adjust source paths as needed)
cp /path/to/outputs/index.html          .
cp /path/to/outputs/AGW_en.json         .
cp /path/to/outputs/README.md           .
cp /path/to/outputs/AGW_README.md       .
cp /path/to/outputs/AGW_PROGRESS.md     .
cp /path/to/outputs/AGW_DECISIONS.md    .
cp /path/to/outputs/AGW_CLAUDE.md       .
cp /path/to/outputs/.gitignore          .
cp /path/to/outputs/404.html            .
cp /path/to/outputs/CNAME              .       # edit domain before commit

mkdir -p .github/workflows
cp /path/to/outputs/.github/workflows/pages.yml .github/workflows/
```

**Before committing: update two things**

1. **`CNAME`** — replace `agw-vfs.de` with your actual domain, or delete the file
   entirely if you're using the default `github.io` URL for now.

2. **`index.html` canonical URL** — search for `canonical` and update:
   ```html
   <link rel="canonical" href="https://[YOUR-USERNAME].github.io/agw-website/">
   ```
   Also update the two `og:url` and `og:image` meta tags with the same base URL.

---

## Step 3 — Initialise and push

```bash
git init
git add .
git commit -m "feat: AGW website v5 — conference microsite and committee site

- Full scientific programme (Do/Fr/Sa), social events, travel info
- 13 members, 5 archive entries, 26 publication volumes with citations
- DE/EN toggle (data-i18n), localStorage persistence, navigator.language auto-detection
- 4 citation formats per volume: BibTeX, EndNote, RIS, Chicago
- OpenStreetMap embed, OG meta tags, inline SVG favicon"

git branch -M main
git remote add origin https://github.com/david-bieri/agw-vfs.git
git push -u origin main
```

---

## Step 4 — Enable GitHub Pages

1. Go to the repo on GitHub
2. **Settings** → **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: **GitHub Actions**
4. The workflow runs automatically on the first push
5. After ~60 seconds: check the **Actions** tab for a green tick
6. Your site is live at: `https://[YOUR-USERNAME].github.io/agw-website/`

---

## Step 5 — Custom domain (optional, do after basic deployment works)

**If using a custom domain (e.g. `agw-vfs.de`):**

1. Ensure `CNAME` file contains exactly the domain: `agw-vfs.de`
2. At your domain registrar, add a DNS record:
   ```
   Type:  CNAME
   Name:  @  (or www, or agw)
   Value: [YOUR-USERNAME].github.io
   TTL:   3600
   ```
   *For an apex domain (`agw-vfs.de`) some registrars require A records instead:*
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
3. In GitHub: Settings → Pages → Custom domain → enter `agw-vfs.de` → Save
4. Tick **Enforce HTTPS** (available after DNS propagates, ~10 min–48 hrs)

**If using a VfS subdomain (e.g. `agw.socialpolitik.de`):**
The VfS secretariat needs to add a CNAME record on their DNS.
Provide them: `agw.socialpolitik.de CNAME [YOUR-USERNAME].github.io`

---

## Updating the site going forward

```bash
# Make changes to index.html (or any file)
git add .
git commit -m "content: update programme — Saturday lunch confirmed"
git push
# → Auto-deploys in ~60 seconds
```

**Commit message conventions (from AGW_CLAUDE.md):**
- `feat:` — new section or feature
- `fix:` — bug or error correction
- `content:` — programme, members, archive, publication data
- `docs:` — README, DECISIONS, PROGRESS updates
- `style:` — CSS/design changes

---

## Pre-launch checklist

- [ ] `CNAME` file contains correct domain (or deleted if using github.io URL)
- [ ] `canonical` URL in `index.html` `<head>` matches live URL
- [ ] `og:url` matches live URL
- [ ] EN editorial review complete (or EN toggle visibly marked as draft)
- [ ] Saturday lunch confirmed + added to programme
- [ ] PDF watermarks removed; links added to site
- [ ] VfS logo SVG added to nav (currently text "AGW")
- [ ] Share URL with Rainer Klump for final check
- [ ] Share URL with registered participants
