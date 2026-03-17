import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getSetting, updateSetting } from "@/lib/db";

export async function GET(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const arztbesuch_beschreibung = getSetting("arztbesuch_beschreibung") ?? "";
    return NextResponse.json({ arztbesuch_beschreibung });
}

export async function PUT(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const body = await request.json();
    const { arztbesuch_beschreibung } = body;

    if (typeof arztbesuch_beschreibung !== "string") {
        return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    updateSetting("arztbesuch_beschreibung", arztbesuch_beschreibung.trim());
    return NextResponse.json({ success: true });
}
