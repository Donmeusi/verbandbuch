import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getAllDocuments } from "@/lib/db";

const DOCS_DIR = path.join(process.cwd(), "data", "documents");

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const docs = getAllDocuments();
    const { id } = await params;
    const doc = docs.find(d => d.id === Number(id));
    if (!doc) return NextResponse.json({ error: "Dokument nicht gefunden" }, { status: 404 });

    // Security: sanitise filename with path.basename to prevent directory traversal
    const safeFilename = path.basename(doc.filename);
    const filePath = path.join(DOCS_DIR, safeFilename);

    // Double-check: resolved path must be inside DOCS_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(DOCS_DIR) + path.sep)) {
        return NextResponse.json({ error: "Ungültige Datei" }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) return NextResponse.json({ error: "Datei nicht gefunden" }, { status: 404 });

    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(safeFilename);
    const downloadName = `${doc.name.replace(/[^\w\-äöüÄÖÜß ]/g, "_")}${ext}`;

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": doc.mimetype,
            "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
            "Content-Length": buffer.length.toString(),
            "X-Content-Type-Options": "nosniff",
        },
    });
}
