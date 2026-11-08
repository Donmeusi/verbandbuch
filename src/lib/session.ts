import { SessionOptions } from "iron-session";

export interface SessionData {
    isAdmin?: boolean;
    username?: string;
}

const MIN_SECRET_LENGTH = 32;

function getSessionPassword(): string {
    const secret = process.env.SESSION_SECRET;

    // Bewusst kein Rückfallwert: ohne gesetztes Geheimnis muss die Session
    // fehlschlagen, statt mit einem öffentlich bekannten Wert weiterzulaufen.
    if (!secret || secret.length < MIN_SECRET_LENGTH) {
        throw new Error(
            `SESSION_SECRET fehlt oder ist kürzer als ${MIN_SECRET_LENGTH} Zeichen.`,
        );
    }

    return secret;
}

export const sessionOptions: SessionOptions = {
    get password() {
        return getSessionPassword();
    },
    cookieName: "verbandbuch-session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
    },
};
