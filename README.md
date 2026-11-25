# ProSchweiz Scorecard (SFF)

Interaktive Scorecard für die Schweizer Bundesversammlung (200 Nationalräte, 46 Ständeräte) und den Bundesrat (7 Mitglieder) inkl. «Die Schweiz in Zahlen»-Dashboard, interaktiver Kantonskarte, Fraktions-Sitzplan und offiziellen Parlaments-Dossiers.

## Features
- **Scorecard (Notensystem 1.0 – 6.0):** Authentische Schlussabstimmungen aus der 52. Legislatur (Frühjahrs-, Sommer- und Herbstsession 2026) direkt aus den offiziellen Parlamentsdaten (`ws.parlament.ch`).
- **Filter & Suche:** Filtern nach Partei, Kammer, Kanton, Kommission, Konfession/Religion, Staatsangehörigkeit/Pass und Note.
- **Interaktive Schweizer Karte:** 26 Kantone eingefärbt nach ProSchweiz-Durchschnittsnote.
- **Die Schweiz in Zahlen:** Amtliche Kennzahlen (BFS, SECO, ESTV), Migrationsstatistik 2011–2025, Bundesrat & Bundeskanzlei, 26 Kantone im Vergleich sowie interaktive Sitzpläne für Nationalrat (200) & Ständerat (46).
- **Offizielle Politiker-Dossiers:** Laufbahn, Beruf, Kommissionen, Interessenbindungen (Art. 11 ParlG), Fraktionstreue und Teilnahmequote.

## Lokal starten

```bash
cd frontend
npm install
npm run dev
```

Die App ist danach unter `http://localhost:5173/` erreichbar.

## Build (Produktion)

```bash
cd frontend
npm run build
```
