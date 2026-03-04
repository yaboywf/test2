import { withDB } from "@/lib/db";
import { getServerSession } from "@/lib/jwt";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const session = await getServerSession();
    if (!session) return Response.json({ success: false }, { status: 401 });

    const { token, deviceId } = await req.json() as { token: string, deviceId: string };
    if (!token || !deviceId) return Response.json({ success: false }, { status: 400 });
    const userAgent = (await headers()).get("user-agent");

    await withDB(session, (db) => db`
        INSERT INTO push_subscriptions (user_email, token, device_id, user_agent)
        VALUES (${session.email}, ${token}, ${deviceId}, ${userAgent})
        ON CONFLICT (token)
        DO UPDATE SET user_email = EXCLUDED.user_email;
    `).catch(() => []);

    return Response.json({ success: true });
}