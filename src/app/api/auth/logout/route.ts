import { withDB } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { getServerSession } from "@/lib/jwt";

export async function POST(req: Request) {
    const userAgent = (await headers()).get("user-agent");
    const cookieStore = await cookies();
    const session = await getServerSession();

    if (!session) return Response.json({ success: false }, { status: 401 });
    const { deviceId } = await req.json() as { deviceId: string };

    await withDB(session, (db) => db`
        DELETE FROM push_subscriptions
        WHERE user_email = ${session.email}
        AND device_id = ${deviceId}
        AND user_agent = ${userAgent};
    `);

    cookieStore.set("session", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return Response.json({ ok: true });
}
