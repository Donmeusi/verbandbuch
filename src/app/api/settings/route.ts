import { NextResponse } from "next/server";
import { getSetting } from "@/lib/db";

export async function GET() {
    const arztbesuch_beschreibung = getSetting("arztbesuch_beschreibung") ??
        "Bei einem Arztbesuch muss eine Unfallanzeige bei der Berufsgenossenschaft eingereicht werden (Frist: 3 Werktage). Nach dem Absenden dieser Meldung erhalten Sie Download-Links für die erforderlichen Formulare.";
    return NextResponse.json({ arztbesuch_beschreibung });
}
