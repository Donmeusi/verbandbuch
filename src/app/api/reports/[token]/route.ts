import { NextRequest, NextResponse } from "next/server";
import { getReportByToken, updateReportByToken, deleteReportByToken } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const report = getReportByToken(token);
    if (!report) return NextResponse.json({ error: "Meldung nicht gefunden" }, { status: 404 });
    return NextResponse.json(report);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const body = await request.json();
    const updated = updateReportByToken(token, {
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
    if (!updated) return NextResponse.json({ error: "Meldung nicht gefunden" }, { status: 404 });
    return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const deleted = deleteReportByToken(token);
    if (!deleted) return NextResponse.json({ error: "Meldung nicht gefunden" }, { status: 404 });
    return NextResponse.json({ success: true });
}
