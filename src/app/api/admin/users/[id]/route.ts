import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { updateAdminPassword, updateAdminUsername, deleteAdmin } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Username update
    if (body.username !== undefined) {
        if (!body.username || body.username.trim().length < 3) {
            return NextResponse.json({ error: "Benutzername muss mindestens 3 Zeichen lang sein" }, { status: 400 });
        }
        const result = updateAdminUsername(Number(id), body.username.trim());
        if (!result.success) return NextResponse.json({ error: result.error }, { status: 409 });
    }

    // Password update
    if (body.password !== undefined) {
        if (!body.password || body.password.length < 6) {
            return NextResponse.json({ error: "Passwort muss mindestens 6 Zeichen lang sein" }, { status: 400 });
        }
        const ok = updateAdminPassword(Number(id), body.password);
        if (!ok) return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const result = deleteAdmin(Number(id));
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
}
