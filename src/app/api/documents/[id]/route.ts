import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { updateDocument, deleteDocument } from "@/lib/db";
import path from "path";
import fs from "fs";

const DOCS_DIR = path.join(process.cwd(), "data", "documents");

// PUT – rename/redescribe
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const updated = updateDocument(Number(id), {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined ? { description: body.description.trim() } : {}),
    });
    if (!updated) return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });
    return NextResponse.json({ success: true });
}

// DELETE – remove file and DB record
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const { id } = await params;
    const doc = deleteDocument(Number(id));
    if (!doc) return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });

    // Remove the physical file
    const filePath = path.join(DOCS_DIR, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return NextResponse.json({ success: true });
}
