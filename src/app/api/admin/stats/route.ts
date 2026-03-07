import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getStatsData } from "@/lib/db";

export async function GET(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });

    const url = new URL(request.url);
    const filters = {
        dateFrom: url.searchParams.get("dateFrom") ?? undefined,
        dateTo: url.searchParams.get("dateTo") ?? undefined,
        abteilung: url.searchParams.get("abteilung") ?? undefined,
        verletzungsart: url.searchParams.get("verletzungsart") ?? undefined,
        year: url.searchParams.get("year") ?? undefined,
        month: url.searchParams.get("month") ?? undefined,
    };
    const data = getStatsData(filters);
    return NextResponse.json(data);
}
