# AGW – Ausschuss für die Geschichte der Wirtschaftswissenschaften

**Website des AGW (Verein für Socialpolitik) · Jahrestagung 2026**

[![Deploy to GitHub Pages](https://github.com/david-bieri/agw-vfs/actions/workflows/pages.yml/badge.svg)](https://github.com/david-bieri/agw-vfs/actions/workflows/pages.yml)

Konferenzwebsite und Komitee-Präsenz für den **Ausschuss für die Geschichte der Wirtschaftswissenschaften (AGW)** innerhalb des Verein für Socialpolitik (VfS).

🌐 **Live:** [david-bieri.github.io/agw-vfs](https://david-bieri.github.io/agw-vfs/)
📅 **Jahrestagung 2026:** 25.–27. Juni, Virginia Tech Steger Center, Riva San Vitale, Schweiz

---

## Architektur

Einzelne selbst-enthaltende HTML-Datei (`index.html`, ~152 KB). Kein Build-Prozess, kein Framework, kein Backend.

```
index.html              Website (CSS + HTML + JS, alles eingebettet)
AGW_en.json             Englische Übersetzungen — redaktionelles Dokument
AGW_SVfS_Band115.bib    BibTeX-Bibliographie (40 Bände)
AGW_Satzung.pdf         Satzung des Ausschusses
AGW_README.md           Vollständige Projektdokumentation
AGW_PROGRESS.md         Aufgaben und Fortschritt
AGW_DECISIONS.md        Architekturentscheidungen (ADRs)
SETUP.md                Schritt-für-Schritt Deployment-Anleitung
404.html                Weiterleitung zur Startseite
CNAME                   Custom-Domain-Konfiguration
.github/workflows/      GitHub Pages Deployment
```

**Sprachen:** Deutsch (Standard) · Englisch (Umschalter oben rechts, redaktionell zu prüfen)
**Deployment:** GitHub Pages via GitHub Actions (auto-deploy on push to `main`)

---

## Inhalt aktualisieren

Alle Inhalte werden direkt in `index.html` bearbeitet — kein Build-Schritt erforderlich.

| Was | Wo in index.html |
|---|---|
| Programm-Einträge | `.tl-item` Blöcke im `#tagungsprogramm` Abschnitt |
| Vorsitzende | `CHAIRS` Array im `<script>` Block |
| Mitgliederliste | `MEMBERS` Array im `<script>` Block |
| Archiv | `ARCHIVE` Array im `<script>` Block |
| Publikationen | `PUBLICATIONS` Array + `PUB_CHAPTERS` Objekt |
| EN-Übersetzungen | `const EN = { ... }` oben im `<script>` Block |

Vollständige Anleitung: **[AGW_README.md](AGW_README.md)**

---

## Deployment

```bash
# Beim ersten Mal: Repo klonen und lokal öffnen
git clone https://github.com/david-bieri/agw-vfs.git
cd agw-vfs
open index.html   # oder im Browser öffnen

# Änderungen veröffentlichen
git add .
git commit -m "content: [Beschreibung der Änderung]"
git push
# → GitHub Actions deployt automatisch auf GitHub Pages
```

**GitHub Pages aktivieren:**
1. Settings → Pages → Source: **GitHub Actions**
2. Erster Push triggert den Workflow automatisch

**Custom Domain:**
1. `CNAME` Datei enthält die Domain (aktuell: `agw-vfs.de`)
2. DNS: CNAME-Eintrag `agw-vfs.de → david-bieri.github.io` beim Domain-Anbieter setzen
3. Settings → Pages → Custom domain: Domain eintragen, HTTPS aktivieren

---

## Kontakt

**Gastgeber Jahrestagung 2026:** Dr. David Bieri · [bieri@vt.edu](mailto:bieri@vt.edu) · Virginia Tech SPIA
**Vorsitzender:** Prof. Dr. Rainer Klump · AGW / VfS
**VfS AGW Seite:** [history-economicthought.committee.socialpolitik.de](https://history-economicthought.committee.socialpolitik.de/)
