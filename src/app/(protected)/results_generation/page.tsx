import { getServerSession } from "@/lib/jwt";
import ResultGenerationPageWrapper from "./ResultGenerationPageWrapper";
import { getUsers } from "../user_management/page";
import { NormalisedAccount, ServerSession } from "@/types/accounts";
import { unstable_cache } from "next/cache";
import { withDB } from "@/lib/db";
import { Badge } from '@/types/awards'
import { notFound } from "next/navigation";

export const getAwards = unstable_cache(async (session: ServerSession) => {
    const awards = await withDB(session, (db) => db`
        SELECT
        b.id,
        b.badge_name,
        b.badge_categories,
        b.description,
        COALESCE(
            json_agg(
            json_build_object(
                'id', m.id,
                'mastery_name', m.mastery_name,
                'mastery_description', m.mastery_description,
                'mastery_description_hint', m.mastery_description_hint,
                'recommended_level', m.recommended_level
            )
            ORDER BY m.mastery_name
            ) FILTER (WHERE m.id IS NOT NULL),
            '[]'
        ) AS masteries
        FROM badges b
        LEFT JOIN badge_masteries m
        ON b.id = m.badge_id
        GROUP BY b.id
        ORDER BY b.badge_name;
    `);
    return awards as Badge[];
}, ["awards"], { tags: ["awards"] });

export default async function userManagementPage() {
    const session = await getServerSession();
    if (!session) notFound();
    if (session.type === "boy" && !["csm", "ps", "admin"].some(r => session.appointment?.map(a => a.toLowerCase()).includes(r))) notFound();

    const users = await getUsers(session, ["officer", "primer", "volunteer", "boy"]);
    const normalisedUsers = users.map(user => ({ ...user.data, type: user.role })) as NormalisedAccount[];

    const awards = await getAwards(session);

    return <ResultGenerationPageWrapper allUsers={normalisedUsers} awards={awards} />
}