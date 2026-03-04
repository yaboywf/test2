import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const next = searchParams.get("next") || "/home";

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.BASE_URL}/api/auth/login/callback`,
        response_type: "code",
        scope: "openid email profile",
        prompt: "select_account",
        state: next
    });

    return NextResponse.redirect(
        `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
}
