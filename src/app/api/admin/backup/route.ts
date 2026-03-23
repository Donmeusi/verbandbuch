import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getAllReports } from "@/lib/db";
import Database from "better-sqlite3";
import path from "path";

export async function GET(request: NextRequest) {
  const res = NextResponse.json({});
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });
  }

  const reports = getAllReports();

  const db = new Database(path.join(process.cwd(), "data", "verbandbuch.db"));
  const settings = db.prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  db.close();

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    reports,
    settings,
  };

  const json = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="verbandbuch_backup_${date}.json"`,
    },
  });
}
