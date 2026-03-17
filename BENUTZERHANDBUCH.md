# 📖 Benutzerhandbuch – Digitales Verbandbuch

**Version:** 1.0  
**Letzte Aktualisierung:** März 2026  
**Rechtliche Grundlage:** DGUV Vorschrift 1 §24

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Öffentlicher Bereich – Unfallmeldung erfassen](#öffentlicher-bereich--unfallmeldung-erfassen)
   - [Formular ausfüllen](#formular-ausfüllen)
   - [Meldung einreichen](#meldung-einreichen)
   - [Bestätigungsseite und persönlicher Bearbeitungslink](#bestätigungsseite-und-persönlicher-bearbeitungslink)
3. [Eigene Meldung bearbeiten oder löschen](#eigene-meldung-bearbeiten-oder-löschen)
4. [Arztbesuch – Pflichtformulare](#arztbesuch--pflichtformulare)
5. [Admin-Bereich](#admin-bereich)
   - [Anmelden](#anmelden)
   - [Dashboard – Alle Meldungen](#dashboard--alle-meldungen)
   - [Statistiken](#statistiken)
   - [Dokumentenverwaltung](#dokumentenverwaltung)
   - [Benutzerverwaltung](#benutzerverwaltung)
   - [Abmelden](#abmelden)
6. [Hinweise zur Datensicherheit](#hinweise-zur-datensicherheit)
7. [Häufige Fragen (FAQ)](#häufige-fragen-faq)

---

## Überblick

Das **digitale Verbandbuch** ersetzt das handschriftliche Papierbuch zur Dokumentation von Bagatellunfällen am Arbeitsplatz gemäß **DGUV Vorschrift 1 §24**. Die App ermöglicht:

- Das einfache und schnelle Erfassen von Unfallmeldungen – **ohne Login**
- Das nachträgliche Bearbeiten oder Löschen einer Meldung über einen **persönlichen Bearbeitungslink**
- Die Verwaltung aller Meldungen und Auswertungen durch **Administratoren**
- Das Bereitstellen von **Pflichtformularen** (z. B. BG-Formulare) zum Download bei Arztbesuchen

---

## Öffentlicher Bereich – Unfallmeldung erfassen

Die Startseite der App ist unter **http://localhost:3000** (oder der konfigurierten URL Ihres Unternehmens) erreichbar und kann **ohne Login** genutzt werden.

### Formular ausfüllen

Das Meldeformular ist in drei Abschnitte unterteilt:

#### 📋 Grunddaten des Unfalls

| Feld | Beschreibung | Pflichtfeld |
|---|---|---|
| **Datum des Unfalls** | Vorausgefüllt mit dem heutigen Datum | ✅ |
| **Uhrzeit** | Vorausgefüllt mit der aktuellen Uhrzeit | ✅ |
| **Name der verletzten Person** | Vor- und Nachname | ✅ |
| **Abteilung** | z. B. Produktion, Lager, Verwaltung | ✅ |
| **Unfallort** | z. B. Halle 3, Maschine 12 | ✅ |
| **Unfallhergang** | Freie Beschreibung des Ablaufs | ✅ |

#### 🏥 Art der Verletzung

| Feld | Beschreibung | Pflichtfeld |
|---|---|---|
| **Verletzungsart** | Auswahl aus Liste (z. B. Schnittwunde, Prellung) oder freie Eingabe bei „Sonstiges" | ✅ |
| **Betroffenes Körperteil** | Auswahl aus Liste (z. B. Finger, Knie) oder freie Eingabe bei „Sonstiges" | ✅ |
| **Arztbesuch erforderlich?** | Checkbox – bei Arztbesuch erscheint ein Warnhinweis und nach dem Absenden werden Pflichtformulare angezeigt | ❌ |

> ⚠️ **Wichtig:** Wenn ein Arzt aufgesucht wurde oder werden muss, ist eine **Unfallanzeige bei der Berufsgenossenschaft** innerhalb von **3 Werktagen** einzureichen!

#### ⛑️ Erste-Hilfe-Maßnahmen

| Feld | Beschreibung | Pflichtfeld |
|---|---|---|
| **Ersthelfer (Name)** | Name der Person, die Erste Hilfe geleistet hat | ✅ |
| **Durchgeführte Maßnahmen** | z. B. „Wunde gereinigt, Pflaster angelegt" | ✅ |

### Meldung einreichen

Nach dem Ausfüllen aller Pflichtfelder klicken Sie auf **„✅ Meldung einreichen"**. Die App prüft alle Felder und gibt bei fehlenden Angaben eine Fehlermeldung aus.

### Bestätigungsseite und persönlicher Bearbeitungslink

Nach dem Absenden werden Sie auf eine **Bestätigungsseite** weitergeleitet. Diese Seite zeigt:

- Eine Bestätigungsmeldung, dass die Unfallmeldung gespeichert wurde
- **Ihren persönlichen Bearbeitungslink** – speichern oder notieren Sie diesen Link unbedingt!
- Bei Arztbesuch: Download-Links für alle erforderlichen Pflichtformulare

> 💡 **Tipp:** Der Bearbeitungslink ist nur Ihnen bekannt. Über diesen Link können Sie die Meldung jederzeit nachbearbeiten oder löschen.

---

## Eigene Meldung bearbeiten oder löschen

Über Ihren persönlichen Bearbeitungslink (erhalten nach dem Einreichen der Meldung) gelangen Sie auf die **Bearbeitungsseite**.

Dort können Sie:

- Alle Felder der Meldung **ändern** und unter **„💾 Änderungen speichern"** sichern
- Die gesamte Meldung über **„🗑️ Meldung löschen"** **dauerhaft löschen**

> ⚠️ **Achtung:** Das Löschen einer Meldung kann **nicht rückgängig** gemacht werden. Es erscheint vorher ein Bestätigungsdialog.

Wenn der Link ungültig ist oder die Meldung bereits gelöscht wurde, erscheint eine entsprechende Meldung.

---

## Arztbesuch – Pflichtformulare

Falls in der Meldung ein Arztbesuch vermerkt ist, werden auf der Bestätigungs- und Bearbeitungsseite **Download-Links für Pflichtformulare** angezeigt (z. B. Unfallanzeige-Vorlagen der Berufsgenossenschaft), sofern diese von einem Administrator hochgeladen wurden.

Falls keine Formulare hinterlegt sind, erscheint der Hinweis: *„Wenden Sie sich an Ihre Personalabteilung für die erforderlichen Formulare."*

---

## Admin-Bereich

Der Admin-Bereich ist unter **/admin** erreichbar. Er ist passwortgeschützt und nur für autorisierte Administratoren zugänglich.

### Anmelden

Navigieren Sie zu `/admin/login` oder klicken Sie auf **„Admin-Bereich"** in der Navigationsleiste.

Geben Sie Benutzernamen und Passwort ein und klicken Sie auf **„Anmelden"**.

> ⚠️ **Wichtig:** Die Standard-Zugangsdaten nach der Installation lauten `admin` / `admin123`. **Bitte ändern Sie das Passwort sofort nach der ersten Anmeldung!**

---

### Dashboard – Alle Meldungen

Nach dem Login gelangen Sie direkt zum **Dashboard** (`/admin`), das alle gespeicherten Unfallmeldungen in einer Tabelle anzeigt.

#### Suche

Das Suchfeld oben filtert die Tabelle in Echtzeit nach:
- Name der verletzten Person
- Abteilung
- Unfallort
- Verletzungsart

#### Tabellenansicht

Die Tabelle zeigt pro Meldung: ID, Datum & Uhrzeit, Name, Abteilung, Unfallort, Verletzungsart, Körperteil, ob ein Arzt aufgesucht wurde, und den Ersthelfer.

#### Meldung bearbeiten

Klicken Sie auf **✏️** neben einer Meldung, um sie in einem Bearbeitungsdialog zu öffnen. Alle Felder können geändert und mit **„💾 Speichern"** gesichert werden.

#### Meldung löschen

Klicken Sie auf **🗑️** neben einer Meldung, um diese nach Bestätigung dauerhaft zu löschen.

#### CSV-Export

Der Button **„📥 CSV exportieren"** lädt eine CSV-Datei aller aktuell gefilterten Meldungen herunter. Die Datei ist UTF-8 kodiert und in Excel problemlos zu öffnen.

---

### Statistiken

Der Bereich **Statistiken** (`/admin/stats`) zeigt grafische Auswertungen aller Unfallmeldungen.

#### Filter

Alle Diagramme reagieren dynamisch auf folgende Filter:

| Filter | Beschreibung |
|---|---|
| **Jahr** | Filtert nach Kalenderjahr |
| **Monat** | Filtert nach Monat (kombinierbar mit Jahr) |
| **Von / Bis (Datum)** | Freies Datumsintervall |
| **Abteilung** | Zeigt nur Meldungen einer bestimmten Abteilung |
| **Verletzungsart** | Zeigt nur eine bestimmte Verletzungsart |

Der Button **„✕ Zurücksetzen"** setzt alle Filter auf den Ausgangszustand zurück.

#### Kennzahlen (KPIs)

Oben auf der Seite werden vier Kennzahlen angezeigt:
- **Unfälle gesamt** im gewählten Zeitraum
- **Arztbesuche** (Anzahl)
- **Arztbesuchsrate** in Prozent
- **Häufigste Abteilung**

#### Diagramme

| Diagramm | Typ | Beschreibung |
|---|---|---|
| Unfälle pro Monat | Liniendiagramm | Verlauf der Unfälle im Zeitverlauf |
| Unfälle nach Abteilung | Balkendiagramm | Vergleich der Abteilungen |
| Verletzungsarten | Kreisdiagramm (Doughnut) | Anteil der einzelnen Verletzungsarten |
| Betroffene Körperteile | Horizontales Balkendiagramm | Häufigkeit nach Körperteil |

---

### Dokumentenverwaltung

Unter **Dokumente** (`/admin/documents`) können Formulare, Vorlagen und andere Dateien verwaltet werden.

Hochgeladene Dokumente stehen Meldenden automatisch als **Download-Links** zur Verfügung, wenn in einer Meldung ein Arztbesuch vermerkt ist.

#### Dokument hochladen

1. Geben Sie einen **Anzeigenamen** ein (z. B. „Unfallanzeige BG")
2. Optional: **Beschreibung** hinzufügen (z. B. „Auszufüllen bei Arztbesuch")
3. Wählen Sie eine **Datei** aus (zulässige Formate: PDF, Word, Excel, ODT, ODS, PNG, JPG – max. **10 MB**)
4. Klicken Sie auf **„📤 Hochladen"**

#### Dokument bearbeiten

Klicken Sie auf **✏️** um den Anzeigenamen und die Beschreibung eines Dokuments zu ändern. Die Datei selbst kann nicht ersetzt werden – löschen Sie das Dokument und laden Sie es neu hoch.

#### Dokument herunterladen

Klicken Sie auf **⬇️** um ein Dokument direkt herunterzuladen.

#### Dokument löschen

Klicken Sie auf **🗑️** und bestätigen Sie den Dialog. Das Dokument wird dauerhaft gelöscht und steht Meldenden nicht mehr zur Verfügung.

---

### Benutzerverwaltung

Unter **Benutzerverwaltung** (`/admin/users`) können Administrator-Konten verwaltet werden. Alle aufgelisteten Benutzer haben **vollen Admin-Zugriff**.

#### Neuen Administrator erstellen

1. Klicken Sie auf **„➕ Neuen Benutzer erstellen"**
2. Geben Sie einen **Benutzernamen** ein (min. 3 Zeichen)
3. Geben Sie ein **Passwort** ein (min. 6 Zeichen) und bestätigen Sie es
4. Klicken Sie auf **„✅ Benutzer erstellen"**

#### Benutzernamen ändern

Klicken Sie auf **„✏️ Benutzername"** neben dem entsprechenden Konto und geben Sie den neuen Namen ein.

#### Passwort ändern

Klicken Sie auf **„🔑 Passwort"** neben dem entsprechenden Konto, geben Sie das neue Passwort ein und bestätigen Sie es.

#### Administrator löschen

Klicken Sie auf **🗑️** neben dem Konto und bestätigen Sie den Dialog.

> ⚠️ **Wichtig:** Der **letzte verbleibende Administrator** kann nicht gelöscht werden. Mindestens ein Admin-Konto muss immer vorhanden bleiben.

---

### Abmelden

Klicken Sie in der Navigationsleiste oben rechts auf **„Abmelden"**, um die Session zu beenden.

---

## Hinweise zur Datensicherheit

- **Passwörter** werden sicher mit **bcrypt** gehasht gespeichert (kein Klartext)
- **Sessions** laufen über HTTP-only Cookies (nicht von JavaScript auslesbar)
- **Dateien** werden serverseitig auf Typ und Größe geprüft (max. 10 MB, Whitelist)
- Alle öffentlichen Formulareingaben werden **serverseitig validiert**
- Es erfolgt kein automatisches Backup der Datenbank – regelmäßige manuelle Sicherungen der Datei `data/verbandbuch.db` werden empfohlen

---

## Häufige Fragen (FAQ)

**Ich habe meinen Bearbeitungslink vergessen. Was kann ich tun?**  
Der Link ist nur Ihnen bekannt und kann nicht wiederhergestellt werden. Wenden Sie sich an einen Administrator, der die Meldung im Admin-Bereich bearbeiten oder löschen kann.

**Kann ich eine gelöschte Meldung wiederherstellen?**  
Nein. Gelöschte Meldungen können nicht wiederhergestellt werden. Admins können zuvor exportierte CSV-Backups als Nachweis verwenden.

**Was passiert, wenn ich „Arztbesuch erforderlich" vergessen habe anzuklicken?**  
Öffnen Sie die Meldung über Ihren persönlichen Bearbeitungslink und aktivieren Sie die Checkbox „Arzt aufgesucht". Danach erscheinen die Pflichtformulare zum Download.

**Wie viele Personen können gleichzeitig Meldungen einreichen?**  
Unbegrenzt – das öffentliche Formular benötigt keinen Login und ist für alle Mitarbeitenden zugänglich.

**Welche Browser werden unterstützt?**  
Alle modernen Browser (Chrome, Firefox, Edge, Safari) in aktueller Version werden unterstützt.

**Wer darf in den Admin-Bereich?**  
Nur Personen mit einem Administrator-Konto (Benutzername + Passwort). Neue Konten können nur von bestehenden Administratoren angelegt werden.

**Wie exportiere ich alle Meldungen?**  
Im Admin-Dashboard auf **„📥 CSV exportieren"** klicken. Die Datei enthält alle aktuell angezeigten (ggf. gefilterten) Meldungen.
