import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createReport, initDb } from "@/lib/db";

const MAX_LENGTHS: Record<string, number> = {
    name: 200, abteilung: 200, unfallort: 500,
    unfallhergang: 3000, verletzungsart: 200, koerperteil: 200,
    ersthelfer: 200, erste_hilfe: 3000,
};

export async function POST(request: NextRequest) {
    try {
        initDb();
        const body = await request.json();

        // Validate required fields and max lengths
        const required = ["datum", "uhrzeit", "name", "abteilung", "unfallort", "unfallhergang", "verletzungsart", "koerperteil", "ersthelfer", "erste_hilfe"];
        for (const field of required) {
            if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
                return NextResponse.json({ error: `Pflichtfeld fehlt: ${field}` }, { status: 400 });
            }
            const maxLen = MAX_LENGTHS[field];
            if (maxLen && body[field].trim().length > maxLen) {
                return NextResponse.json({ error: `Feld '${field}' zu lang (max. ${maxLen} Zeichen)` }, { status: 400 });
            }
        }

        // Basic format validation
        if (!/^\d{4}-\d{2}-\d{2}$/.test(body.datum)) {
            return NextResponse.json({ error: "Ungültiges Datumsformat" }, { status: 400 });
        }
        if (!/^\d{2}:\d{2}$/.test(body.uhrzeit)) {
            return NextResponse.json({ error: "Ungültiges Uhrzeitformat" }, { status: 400 });
        }

        const token = uuidv4();
        const report = createReport(
            {
                datum: body.datum.trim(),
                uhrzeit: body.uhrzeit.trim(),
                name: body.name.trim(),
                abteilung: body.abteilung.trim(),
                unfallort: body.unfallort.trim(),
                unfallhergang: body.unfallhergang.trim(),
                verletzungsart: body.verletzungsart.trim(),
                koerperteil: body.koerperteil.trim(),
                ersthelfer: body.ersthelfer.trim(),
                erste_hilfe: body.erste_hilfe.trim(),
                arzt_aufgesucht: body.arzt_aufgesucht ? 1 : 0,
            },
            token
        );
        return NextResponse.json({ success: true, token: report.edit_token });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Fehler beim Speichern der Meldung" }, { status: 500 });
    }
}
