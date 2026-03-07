import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { getAllReports } from "@/lib/db";

export async function GET(request: NextRequest) {
    const res = NextResponse.json({});
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    if (!session.isAdmin) {
        return NextResponse.json({ error: "Kein Zugriff" }, { status: 401 });
    }
    const reports = getAllReports();
    return NextResponse.json(reports);
}
