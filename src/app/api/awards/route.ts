import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/jwt";
import { withDB } from "@/lib/db";
import { triggerPusher } from "@/lib/pusher-server";
import { AwardUpdatePayload } from "@/types/awards";
import { AttainmentSchema, UUID } from "@/schemas/attainment.schema";
import { sendNotification } from "@/lib/notification";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();
        if (!session || (session.type === 'boy' && !['admin', 'csm', 'ps'].some(r => session.appointment?.map(a => a.toLowerCase()).includes(r)))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const validated = AttainmentSchema.safeParse(body);
        if (!validated.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

        const { boy, badge_id, value, checked } = validated.data;

        const isYear = value === "year1" || value === "year2" || value === "year3";
        const isMastery = value !== null && !isYear && UUID.safeParse(value).success;

        if (value !== null && !isYear && !isMastery) return NextResponse.json({ error: "Invalid value" }, { status: 400 });

        const mastery_id = isMastery ? value : null;
        const misc = isYear ? value : null;

        const badgeText = await withDB(session, async (db) => {
            if (mastery_id) {
                const [m] = await db`
                    SELECT b.badge_name, m.mastery_name
                    FROM badge_masteries m
                    JOIN badges b ON m.badge_id = b.id
                    WHERE m.id = ${mastery_id}::uuid
                `.catch(() => []);

                if (m) return `${m.badge_name} (${m.mastery_name})`;
            }

            const [b] = await db`
                SELECT badge_name
                FROM badges
                WHERE id = ${badge_id}::uuid
            `.catch(() => []);

            return b?.badge_name ?? "Unknown badge";
        });

        await withDB(session, async (db) => {
            if (checked) {
                await db`
                    INSERT INTO attainments (boy, badge_id, mastery_id, misc)
                    VALUES (
                        ${boy},
                        ${badge_id}::uuid,
                        ${mastery_id ? db`${mastery_id}::uuid` : db`NULL`},
                        ${misc}
                    )
                    ON CONFLICT DO NOTHING
                `;

                await db`
                    INSERT INTO logs (user_email, action)
                    VALUES (${session.email}, ${`Awarded ${badgeText}${misc ? ` (${misc})` : ""} to ${boy}`})
                `;

                const notificationToken = await db`
                    SELECT token
                    FROM push_subscriptions
                    WHERE user_email = ${boy};
                `;

                if (notificationToken.length === 0) return;
                await Promise.all(
                    notificationToken.map(t =>
                        sendNotification(
                            t.token,
                            "Your award has been updated!",
                            `You have been awarded ${badgeText}${misc ? ` (${misc})` : ""}`
                        )
                    )
                );
            } else {
                await db`
                    DELETE FROM attainments
                    WHERE boy = ${boy}
                    AND badge_id = ${badge_id}::uuid
                    AND mastery_id IS NOT DISTINCT FROM ${mastery_id ? db`${mastery_id}::uuid` : db`NULL`}
                    AND misc IS NOT DISTINCT FROM ${misc}::text
                `;

                await db`
                    INSERT INTO logs (user_email, action)
                    VALUES (${session.email}, ${`Revoked ${badgeText}${misc ? ` (${misc})` : ""} from ${boy}`})
                `;
            }
        });

        await triggerPusher("awards", "award-update", validated.data as AwardUpdatePayload);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update attainment" }, { status: 500 });
    }
}
