import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { initDb } from "@/lib/db";
import Database from "better-sqlite3";
import path from "path";

interface BackupReport {
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
  created_at?: string;
  updated_at?: string;
}

interface BackupSetting {
  key: string;
  value: string;
}

interface BackupFile {
  version: number;
  reports: BackupReport[];
  settings: BackupSetting[];
}

export async function POST(request: NextRequest) {
  const res = NextResponse.json({});
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });
  }

  let backup: BackupFile;
  try {
    backup = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Datei" }, { status: 400 });
  }

  if (!backup.version || !Array.isArray(backup.reports)) {
    return NextResponse.json({ error: "Ungültiges Backup-Format" }, { status: 400 });
  }

  initDb();
  const db = new Database(path.join(process.cwd(), "data", "verbandbuch.db"));

  let restored = 0;
  let skipped = 0;

  const insertReport = db.prepare(`
    INSERT OR IGNORE INTO reports
      (edit_token, datum, uhrzeit, name, abteilung, unfallort, unfallhergang,
       verletzungsart, koerperteil, ersthelfer, erste_hilfe, arzt_aufgesucht,
       created_at, updated_at)
    VALUES
      (@edit_token, @datum, @uhrzeit, @name, @abteilung, @unfallort, @unfallhergang,
       @verletzungsart, @koerperteil, @ersthelfer, @erste_hilfe, @arzt_aufgesucht,
       @created_at, @updated_at)
  `);

  const insertMany = db.transaction((reports: BackupReport[]) => {
    for (const r of reports) {
      const result = insertReport.run({
        edit_token: r.edit_token,
        datum: r.datum,
        uhrzeit: r.uhrzeit,
        name: r.name,
        abteilung: r.abteilung,
        unfallort: r.unfallort,
        unfallhergang: r.unfallhergang,
        verletzungsart: r.verletzungsart,
        koerperteil: r.koerperteil,
        ersthelfer: r.ersthelfer,
        erste_hilfe: r.erste_hilfe,
        arzt_aufgesucht: r.arzt_aufgesucht ?? 0,
        created_at: r.created_at ?? new Date().toISOString(),
        updated_at: r.updated_at ?? new Date().toISOString(),
      });
      if (result.changes > 0) restored++;
      else skipped++;
    }
  });

  insertMany(backup.reports);

  if (Array.isArray(backup.settings)) {
    const upsertSetting = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    for (const s of backup.settings) {
      if (s.key && typeof s.value === "string") {
        upsertSetting.run(s.key, s.value);
      }
    }
  }

  db.close();

  return NextResponse.json({ success: true, restored, skipped });
}
