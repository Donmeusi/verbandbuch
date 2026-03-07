import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { updateReportById, deleteReportById } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const updated = updateReportById(Number(id), {
        datum: body.datum,
        uhrzeit: body.uhrzeit,
        name: body.name,
        abteilung: body.abteilung,
        unfallort: body.unfallort,
        unfallhergang: body.unfallhergang,
        verletzungsart: body.verletzungsart,
        koerperteil: body.koerperteil,
        ersthelfer: body.ersthelfer,
        erste_hilfe: body.erste_hilfe,
        arzt_aufgesucht: body.arzt_aufgesucht ? 1 : 0,
    });
    if (!updated) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const deleted = deleteReportById(Number(id));
    if (!deleted) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
    return NextResponse.json({ success: true });
}
