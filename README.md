# 🩹 Verbandbuch – Digitale Erste-Hilfe-Dokumentation

Eine moderne Web-App zur digitalen Erfassung von Bagatellunfällen gemäß DGUV Vorschrift 1 §24. Entwickelt mit **Next.js 14**, **SQLite** und einem dunklen Glassmorphism-Design.

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
- 📈 **Statistiken** mit Diagrammen und Filtern (Jahr, Monat, Datumsbereich, Abteilung, Verletzungsart)
- 📂 **Dokumentenverwaltung** – Formulare als PDF/Word/Excel hochladen und verwalten
- 👥 **Benutzerverwaltung** – Admin-Konten erstellen, umbenennen, Passwort ändern, löschen

---

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Donmeusi/verbandbuch.git
cd verbandbuch
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
│   │   │   ├── stats/            # Statistiken
│   │   │   ├── documents/        # Dokumentenverwaltung
│   │   │   ├── users/            # Benutzerverwaltung
│   │   │   └── login/            # Admin-Login
│   │   └── api/
│   │       ├── reports/          # CRUD für Meldungen
│   │       ├── documents/        # Upload & Download von Formularen
│   │       └── admin/            # Auth, Statistiken, Admin-CRUD
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
| Framework | Next.js 14 (App Router) |
| Datenbank | SQLite via `better-sqlite3` |
| Session | `iron-session` (HTTP-only Cookie) |
| Passwörter | `bcryptjs` |
| Diagramme | `chart.js` |
| IDs/Token | `uuid` |
| Styling | Vanilla CSS (Glassmorphism Dark Theme) |
| Schrift | Inter (Google Fonts) |

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
