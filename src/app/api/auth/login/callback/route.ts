import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { AccountType } from "@/types/accounts";

type GoogleTokenResponse = {
    access_token?: string;
    id_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
};

export async function GET(req: Request) {
    const sql = neon(process.env.DATABASE_URL!);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const next = searchParams.get("state") ?? "/home";

        if (!code) throw new Error("No code");

        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${process.env.BASE_URL}/api/auth/login/callback`,
                grant_type: "authorization_code",
            }),
        });

        const tokens = (await tokenRes.json()) as GoogleTokenResponse;
        const idToken = tokens.id_token;
        if (!idToken) throw new Error("No ID token");

        const payload = JSON.parse(atob(idToken.split(".")[1]));
        const { email, picture } = payload;
        if (!email) throw new Error("No email");

        const result = await sql`
            SELECT *
            FROM (
                SELECT 'officer' AS source, to_jsonb(o) AS data
                FROM officer o
                WHERE email = ${email}
                LIMIT 1
            ) officers_result

            UNION ALL

            SELECT *
            FROM (
                SELECT 'primer' AS source, to_jsonb(p) AS data
                FROM primer p
                WHERE email = ${email}
                LIMIT 1
            ) primers_result

            UNION ALL

            SELECT *
            FROM (
                SELECT 'volunteer' AS source, to_jsonb(v) AS data
                FROM volunteer v
                WHERE email = ${email}
                LIMIT 1
            ) volunteers_result

            UNION ALL

            SELECT *
            FROM (
                SELECT 'boy' AS source, to_jsonb(b) AS data
                FROM boy b
                WHERE email = ${email}
                LIMIT 1
            ) boys_result

            LIMIT 1;
        `;

        if (result.length === 0) throw new Error("No user found");

        const row = result[0] as {
            source: AccountType;
            data: Record<string, unknown>;
        };

        const token = await new SignJWT({ ...row.data, type: row.source, picture })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);

        const cookieStore = await cookies();
        cookieStore.set("session", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return Response.redirect(new URL(next, process.env.BASE_URL));
    } catch (error) {
        console.error(error);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent((error as Error).message)}`, process.env.BASE_URL));
    }
}
