import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getAllAdmins, createAdmin } from "@/lib/db";

export async function GET(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });
    const admins = getAllAdmins();
    return NextResponse.json(admins);
}

export async function POST(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const body = await request.json();
    const { username, password } = body;

    if (!username || username.trim().length < 3) {
        return NextResponse.json({ error: "Benutzername muss mindestens 3 Zeichen lang sein" }, { status: 400 });
    }
    if (!password || password.length < 6) {
        return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 });
    }

    const result = createAdmin(username.trim(), password);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });
    return NextResponse.json({ success: true });
}
