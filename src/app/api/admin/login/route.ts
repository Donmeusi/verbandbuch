import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { verifyAdmin } from "@/lib/db";

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: false });
    try {
        const body = await request.json();
        const { username, password } = body;
        const valid = verifyAdmin(username, password);
        if (!valid) {
            return NextResponse.json({ error: "Ungültige Anmeldedaten" }, { status: 401 });
        }
        const res = NextResponse.json({ success: true });
        const session = await getIronSession<SessionData>(request, res, sessionOptions);
        session.isAdmin = true;
        session.username = username;
        await session.save();
        return res;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Anmeldefehler" }, { status: 500 });
    }
}
