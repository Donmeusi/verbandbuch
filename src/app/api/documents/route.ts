import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getAllDocuments, createDocument } from "@/lib/db";
import path from "path";
import fs from "fs";

const DOCS_DIR = path.join(process.cwd(), "data", "documents");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIMES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.text",
    "application/vnd.oasis.opendocument.spreadsheet",
    "image/png",
    "image/jpeg",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".odt", ".ods", ".png", ".jpg", ".jpeg"]);

// GET – list all documents (public)
export async function GET() {
    const docs = getAllDocuments();
    return NextResponse.json(docs);
}

// POST – admin upload
export async function POST(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null)?.trim();
    const description = (formData.get("description") as string | null)?.trim() ?? "";

    if (!file) return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
    if (name.length > 200) return NextResponse.json({ error: "Name zu lang (max. 200 Zeichen)" }, { status: 400 });
    if (description.length > 500) return NextResponse.json({ error: "Beschreibung zu lang (max. 500 Zeichen)" }, { status: 400 });

    // Validate file size
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Datei zu groß (max. 10 MB)" }, { status: 400 });
    }

    // Validate extension and MIME type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json({ error: `Dateityp nicht erlaubt. Erlaubt: PDF, Word, Excel, ODT, PNG, JPG` }, { status: 400 });
    }
    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_MIMES.has(mime)) {
        return NextResponse.json({ error: `MIME-Typ nicht erlaubt: ${mime}` }, { status: 400 });
    }

    if (!fs.existsSync(DOCS_DIR)) fs.mkdirSync(DOCS_DIR, { recursive: true });

    // Safe unique filename (strip directory traversal characters)
    const safeBase = path.basename(file.name).replace(/[^a-zA-Z0-9_\-\.]/g, "_").replace(ext, "");
    const filename = `${Date.now()}_${safeBase}${ext}`;
    const filePath = path.join(DOCS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const doc = createDocument({ name, description, filename, mimetype: mime, size: buffer.length });
    return NextResponse.json({ success: true, doc });
}
