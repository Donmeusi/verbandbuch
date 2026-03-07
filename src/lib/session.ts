import { SessionOptions } from "iron-session";

export interface SessionData {
    isAdmin?: boolean;
    username?: string;
}

export const sessionOptions: SessionOptions = {
    password: "verbandbuch-secret-key-at-least-32-chars-long-2024",
    cookieName: "verbandbuch-session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 8, // 8 hours
    },
};
