# 🩹 Verbandbuch – Digitale Erste-Hilfe-Dokumentation

Eine moderne Web-App zur digitalen Erfassung von Bagatellunfällen gemäß **DGUV Vorschrift 1 §24**.  
Entwickelt mit **Next.js**, **SQLite** und einem modernen Corporate Design.

---

## ✨ Features

### Öffentlicher Bereich
- 📋 Unfallmeldung erfassen (öffentlich zugänglich, ohne Login)
- 🔗 Automatisch generierter, persönlicher Bearbeitungslink nach dem Absenden
- ✏️ Meldung bearbeiten oder löschen über den persönlichen Link
- 🏥 Warnung bei Arztbesuch + automatische Download-Links für Pflichtformulare (BG-Formulare)
- 🆓 Freitext-Eingabe bei „Sonstiges" (Verletzungsart & Körperteil)

### Admin-Bereich (`/admin`)
- 🔐 Sicherer Login mit bcrypt-gehashten Passwörtern und HTTP-only Session-Cookie
- 📊 Dashboard mit allen Meldungen (Suche, Bearbeiten, Löschen, CSV-Export)
- 📈 **Statistiken** mit interaktiven Diagrammen, Filtern und **PDF-Export**
- 📂 **Dokumentenverwaltung** – Formulare als PDF/Word/Excel hochladen und verwalten
- 👥 **Benutzerverwaltung** – Admin-Konten erstellen, umbenennen, Passwort ändern, löschen
- ⚙️ **Einstellungen** – Hinweistexte anpassen
- 💾 **Datensicherung & Wiederherstellung** – Backup als JSON exportieren und importieren

---

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Donmeusi/verbandbuch_hs.git
cd verbandbuch_hs
npm install
npm run dev
```

Die App läuft anschließend unter **http://localhost:3000**

### Standard-Zugangsdaten (Admin)

| Benutzername | Passwort |
|---|---|
| `admin` | `admin123` |

> ⚠️ **Wichtig:** Das Standard-Passwort nach der ersten Anmeldung sofort ändern!

---

## 📄 PDF-Statistikbericht

Der Admin-Bereich bietet unter **Statistiken** einen vollständigen PDF-Export:

- Deckblatt mit Branding (Dunkelblau + Rot)
- KPI-Kacheln (Unfälle gesamt, Arztbesuche, Rate, häufigste Abteilung)
- Alle 4 interaktiven Diagramme als hochauflösende Bilder
- Datentabellen für Abteilungen, Verletzungsarten und Körperteile
- Seitenfußzeile mit Seitennummern auf jeder Seite
- Berücksichtigt die aktuell eingestellten Filter

---

## 💾 Datensicherung

Unter **Einstellungen → Datensicherung** können alle Meldungen und Einstellungen:

- **Exportiert** werden (JSON-Datei, mit einem Klick)
- **Importiert/Wiederhergestellt** werden (fehlende Einträge werden ergänzt, vorhandene nicht überschrieben)

---

## 🏗️ Projektstruktur

```
verbandbuch/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Öffentliches Meldeformular
│   │   ├── confirmation/         # Bestätigungsseite mit Bearbeitungslink
│   │   ├── edit/[token]/         # Persönliche Bearbeitungsseite
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin-Dashboard (Meldungen)
│   │   │   ├── stats/            # Statistiken + PDF-Export
│   │   │   ├── documents/        # Dokumentenverwaltung
│   │   │   ├── users/            # Benutzerverwaltung
│   │   │   ├── settings/         # Einstellungen + Datensicherung
│   │   │   └── login/            # Admin-Login
│   │   └── api/
│   │       ├── reports/          # CRUD für Meldungen
│   │       ├── documents/        # Upload & Download von Formularen
│   │       └── admin/            # Auth, Statistiken, Backup/Restore, Admin-CRUD
│   └── lib/
│       ├── db.ts                 # SQLite-Datenbankfunktionen
│       └── session.ts            # iron-session Konfiguration
├── data/
│   ├── verbandbuch.db            # SQLite-Datenbank (auto-erstellt)
│   └── documents/                # Hochgeladene Formulare
└── public/
```

---

## 🛠️ Technologie-Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js (App Router) |
| Datenbank | SQLite via `better-sqlite3` |
| Session | `iron-session` (HTTP-only Cookie) |
| Passwörter | `bcryptjs` |
| Diagramme | `chart.js` |
| PDF-Export | `jspdf` |
| IDs/Token | `uuid` |
| Styling | Vanilla CSS (Corporate Design) |
| Schriften | Montserrat & Source Sans 3 (Google Fonts) |

---

## 🎨 Design

- **Primärfarbe:** Dunkelblau `#13017C`
- **Akzentfarbe:** Rot `#E4001C`
- **Schriften:** Montserrat (Überschriften) · Source Sans 3 (Fließtext)
- Weiße Navbar mit roter Unterlinie
- Karten mit dunkelblauem Top-Border
- Admin-Sidebar in Dunkelblau, aktiver Link in Rot

---

## 🔒 Sicherheit

- Passwörter werden mit **bcrypt** gehasht (cost factor 10)
- Sessions über **HTTP-only, Secure Cookies** (iron-session)
- **Pfad-Traversal-Schutz** beim Datei-Download (`path.basename` + Resolving)
- **MIME-Typ & Dateiendungs-Whitelist** beim Upload
- **Dateigrößenlimit** von 10 MB beim Upload
- **Serverseitige Eingabevalidierung** für alle öffentlichen Formulare
- **`X-Content-Type-Options: nosniff`** auf Datei-Downloads
- Letzter Administrator kann nicht gelöscht werden (Lockout-Schutz)

---

## 📝 Lizenz

MIT License – siehe [LICENSE](LICENSE)
