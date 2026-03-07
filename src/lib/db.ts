import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "verbandbuch.db");

function getDb() {
    if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    return db;
}

export function initDb() {
    const db = getDb();
    db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edit_token TEXT UNIQUE NOT NULL,
      datum TEXT NOT NULL,
      uhrzeit TEXT NOT NULL,
      name TEXT NOT NULL,
      abteilung TEXT NOT NULL,
      unfallort TEXT NOT NULL,
      unfallhergang TEXT NOT NULL,
      verletzungsart TEXT NOT NULL,
      koerperteil TEXT NOT NULL,
      ersthelfer TEXT NOT NULL,
      erste_hilfe TEXT NOT NULL,
      arzt_aufgesucht INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      filename TEXT NOT NULL,
      mimetype TEXT NOT NULL DEFAULT 'application/octet-stream',
      size INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

    // Insert default admin if not exists
    const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get("admin");
    if (!existing) {
        // password: admin123 (bcrypt-hashed)
        const bcrypt = require("bcryptjs");
        const hash = bcrypt.hashSync("admin123", 10);
        db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin", hash);
    }

    db.close();
}

export interface Report {
    id: number;
    edit_token: string;
    datum: string;
    uhrzeit: string;
    name: string;
    abteilung: string;
    unfallort: string;
    unfallhergang: string;
    verletzungsart: string;
    koerperteil: string;
    ersthelfer: string;
    erste_hilfe: string;
    arzt_aufgesucht: number;
    created_at: string;
    updated_at: string;
}

export function createReport(data: Omit<Report, "id" | "edit_token" | "created_at" | "updated_at">, token: string): Report {
    const db = getDb();
    initDb();
    const stmt = db.prepare(`
    INSERT INTO reports (edit_token, datum, uhrzeit, name, abteilung, unfallort, unfallhergang, verletzungsart, koerperteil, ersthelfer, erste_hilfe, arzt_aufgesucht)
    VALUES (@edit_token, @datum, @uhrzeit, @name, @abteilung, @unfallort, @unfallhergang, @verletzungsart, @koerperteil, @ersthelfer, @erste_hilfe, @arzt_aufgesucht)
  `);
    const result = stmt.run({ ...data, edit_token: token });
    const report = db.prepare("SELECT * FROM reports WHERE id = ?").get(result.lastInsertRowid) as Report;
    db.close();
    return report;
}

export function getReportByToken(token: string): Report | null {
    const db = getDb();
    initDb();
    const report = db.prepare("SELECT * FROM reports WHERE edit_token = ?").get(token) as Report | undefined;
    db.close();
    return report ?? null;
}

export function updateReportByToken(token: string, data: Partial<Report>): boolean {
    const db = getDb();
    initDb();
    const fields = Object.keys(data)
        .filter((k) => !["id", "edit_token", "created_at"].includes(k))
        .map((k) => `${k} = @${k}`)
        .join(", ");
    if (!fields) { db.close(); return false; }
    const stmt = db.prepare(`UPDATE reports SET ${fields}, updated_at = datetime('now') WHERE edit_token = @token`);
    const result = stmt.run({ ...data, token });
    db.close();
    return result.changes > 0;
}

export function deleteReportByToken(token: string): boolean {
    const db = getDb();
    initDb();
    const result = db.prepare("DELETE FROM reports WHERE edit_token = ?").run(token);
    db.close();
    return result.changes > 0;
}

export function getAllReports(): Report[] {
    const db = getDb();
    initDb();
    const reports = db.prepare("SELECT * FROM reports ORDER BY created_at DESC").all() as Report[];
    db.close();
    return reports;
}

export function getReportById(id: number): Report | null {
    const db = getDb();
    initDb();
    const report = db.prepare("SELECT * FROM reports WHERE id = ?").get(id) as Report | undefined;
    db.close();
    return report ?? null;
}

export function updateReportById(id: number, data: Partial<Report>): boolean {
    const db = getDb();
    initDb();
    const fields = Object.keys(data)
        .filter((k) => !["id", "edit_token", "created_at"].includes(k))
        .map((k) => `${k} = @${k}`)
        .join(", ");
    if (!fields) { db.close(); return false; }
    const stmt = db.prepare(`UPDATE reports SET ${fields}, updated_at = datetime('now') WHERE id = @id`);
    const result = stmt.run({ ...data, id });
    db.close();
    return result.changes > 0;
}

export function deleteReportById(id: number): boolean {
    const db = getDb();
    initDb();
    const result = db.prepare("DELETE FROM reports WHERE id = ?").run(id);
    db.close();
    return result.changes > 0;
}

export function getStatsData(filters: {
    dateFrom?: string; dateTo?: string;
    abteilung?: string; verletzungsart?: string;
    year?: string; month?: string;
}) {
    const db = getDb();
    initDb();

    let where = "WHERE 1=1";
    const params: Record<string, string> = {};

    if (filters.dateFrom) { where += " AND datum >= @dateFrom"; params.dateFrom = filters.dateFrom; }
    if (filters.dateTo) { where += " AND datum <= @dateTo"; params.dateTo = filters.dateTo; }
    if (filters.abteilung) { where += " AND abteilung = @abteilung"; params.abteilung = filters.abteilung; }
    if (filters.verletzungsart) { where += " AND verletzungsart = @verletzungsart"; params.verletzungsart = filters.verletzungsart; }
    if (filters.year) { where += " AND strftime('%Y', datum) = @year"; params.year = filters.year; }
    if (filters.month) { where += " AND strftime('%m', datum) = @month"; params.month = filters.month.padStart(2, "0"); }

    const total = (db.prepare(`SELECT COUNT(*) as count FROM reports ${where}`).get(params) as { count: number }).count;
    const arztCount = (db.prepare(`SELECT COUNT(*) as count FROM reports ${where} AND arzt_aufgesucht = 1`).get(params) as { count: number }).count;

    const byMonth = db.prepare(`
    SELECT strftime('%Y-%m', datum) as month, COUNT(*) as count
    FROM reports ${where}
    GROUP BY month ORDER BY month
  `).all(params);

    const byAbteilung = db.prepare(`
    SELECT abteilung, COUNT(*) as count
    FROM reports ${where}
    GROUP BY abteilung ORDER BY count DESC
  `).all(params);

    const byVerletzungsart = db.prepare(`
    SELECT verletzungsart, COUNT(*) as count
    FROM reports ${where}
    GROUP BY verletzungsart ORDER BY count DESC
  `).all(params);

    const byKoerperteil = db.prepare(`
    SELECT koerperteil, COUNT(*) as count
    FROM reports ${where}
    GROUP BY koerperteil ORDER BY count DESC
  `).all(params);

    const abteilungen = (db.prepare("SELECT DISTINCT abteilung FROM reports ORDER BY abteilung").all() as { abteilung: string }[]).map(r => r.abteilung);
    const verletzungsarten = (db.prepare("SELECT DISTINCT verletzungsart FROM reports ORDER BY verletzungsart").all() as { verletzungsart: string }[]).map(r => r.verletzungsart);
    // All years present in the DB (for dropddown population)
    const jahre = (db.prepare("SELECT DISTINCT strftime('%Y', datum) as year FROM reports WHERE datum != '' ORDER BY year DESC").all() as { year: string }[]).map(r => r.year);

    db.close();
    return { total, arztCount, byMonth, byAbteilung, byVerletzungsart, byKoerperteil, abteilungen, verletzungsarten, jahre };
}

export function verifyAdmin(username: string, password: string): boolean {
    const db = getDb();
    initDb();
    const admin = db.prepare("SELECT password_hash FROM admins WHERE username = ?").get(username) as { password_hash: string } | undefined;
    db.close();
    if (!admin) return false;
    const bcrypt = require("bcryptjs");
    return bcrypt.compareSync(password, admin.password_hash);
}

// ─── User Management ────────────────────────────────────────────────────────

export interface Admin {
    id: number;
    username: string;
    created_at?: string;
}

export function getAllAdmins(): Admin[] {
    const db = getDb();
    initDb();
    const admins = db.prepare("SELECT id, username FROM admins ORDER BY id ASC").all() as Admin[];
    db.close();
    return admins;
}

export function getAdminCount(): number {
    const db = getDb();
    initDb();
    const result = db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number };
    db.close();
    return result.count;
}

export function createAdmin(username: string, password: string): { success: boolean; error?: string } {
    const db = getDb();
    initDb();
    const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
    if (existing) { db.close(); return { success: false, error: "Benutzername bereits vergeben" }; }
    const bcrypt = require("bcryptjs");
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
    db.close();
    return { success: true };
}

export function updateAdminPassword(id: number, newPassword: string): boolean {
    const db = getDb();
    initDb();
    const bcrypt = require("bcryptjs");
    const hash = bcrypt.hashSync(newPassword, 10);
    const result = db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, id);
    db.close();
    return result.changes > 0;
}

export function updateAdminUsername(id: number, newUsername: string): { success: boolean; error?: string } {
    const db = getDb();
    initDb();
    const existing = db.prepare("SELECT id FROM admins WHERE username = ? AND id != ?").get(newUsername, id);
    if (existing) { db.close(); return { success: false, error: "Benutzername bereits vergeben" }; }
    const result = db.prepare("UPDATE admins SET username = ? WHERE id = ?").run(newUsername, id);
    db.close();
    return result.changes > 0 ? { success: true } : { success: false, error: "Benutzer nicht gefunden" };
}

export function deleteAdmin(id: number): { success: boolean; error?: string } {
    const db = getDb();
    initDb();
    const count = (db.prepare("SELECT COUNT(*) as count FROM admins").get() as { count: number }).count;
    if (count <= 1) { db.close(); return { success: false, error: "Der letzte Administrator kann nicht gelöscht werden" }; }
    const result = db.prepare("DELETE FROM admins WHERE id = ?").run(id);
    db.close();
    return result.changes > 0 ? { success: true } : { success: false, error: "Benutzer nicht gefunden" };
}

// ─── Document Management ─────────────────────────────────────────────────────

export interface Document {
    id: number;
    name: string;
    description: string;
    filename: string;
    mimetype: string;
    size: number;
    created_at: string;
}

export function getAllDocuments(): Document[] {
    const db = getDb();
    initDb();
    const docs = db.prepare("SELECT * FROM documents ORDER BY created_at DESC").all() as Document[];
    db.close();
    return docs;
}

export function createDocument(doc: Omit<Document, "id" | "created_at">): Document {
    const db = getDb();
    initDb();
    const result = db.prepare(`
        INSERT INTO documents (name, description, filename, mimetype, size)
        VALUES (@name, @description, @filename, @mimetype, @size)
    `).run(doc);
    const created = db.prepare("SELECT * FROM documents WHERE id = ?").get(result.lastInsertRowid) as Document;
    db.close();
    return created;
}

export function updateDocument(id: number, data: { name?: string; description?: string }): boolean {
    const db = getDb();
    initDb();
    const fields = Object.keys(data).map(k => `${k} = @${k}`).join(", ");
    if (!fields) { db.close(); return false; }
    const result = db.prepare(`UPDATE documents SET ${fields} WHERE id = @id`).run({ ...data, id });
    db.close();
    return result.changes > 0;
}

export function deleteDocument(id: number): Document | null {
    const db = getDb();
    initDb();
    const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as Document | undefined;
    if (!doc) { db.close(); return null; }
    db.prepare("DELETE FROM documents WHERE id = ?").run(id);
    db.close();
    return doc;
}


