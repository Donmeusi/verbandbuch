import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

export async function POST(request: NextRequest) {
    const res = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, res, sessionOptions);
    session.destroy();
    return res;
}
