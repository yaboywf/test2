import AwardManagementPage from "./AwardManagementPage";
import { getServerSession } from "@/lib/jwt";
import { getAwards } from "../results_generation/page";
import { getUsers } from "../user_management/page";
import { getSecLvl, RANK_ORDER } from "@/lib/user";
import { BoyAccount, ServerSession } from "@/types/accounts";
import { withDB } from "@/lib/db";
import { Attainment } from "@/types/awards";
import { notFound } from "next/navigation";

export async function getAttainments(session: ServerSession) {
	if (!session || (session.type === "boy" && !["csm", "ps", "admin"].some(r => session.appointment?.map(a => a.toLowerCase()).includes(r)))) return [];

	return await withDB(session, async (db) => db`SELECT * FROM attainments`) as Attainment[];
}

export default async function AwardsManagement() {
	const session = await getServerSession();
	if (!session) notFound();
	if (session.type === "boy" && !["csm", "ps", "admin"].some(r => session.appointment?.map(a => a.toLowerCase()).includes(r))) notFound();

	const awards = await getAwards(session);
	const normalisedAwards = awards.filter(award => award.badge_categories.length > 0);
	const users = await getUsers(session, ["boy"]);
	const normalisedUsers = users
		.filter(user => !user.data.graduated && user.role === 'boy')
		.map(user => ({
			...user.data,
			type: user.role
		}))
		.sort((a, b) => {
			const classDiff = getSecLvl(b as BoyAccount) - getSecLvl(a as BoyAccount);
			if (classDiff !== 0) return classDiff;

			const rankDiff = RANK_ORDER.indexOf(a.rank as string) - RANK_ORDER.indexOf(b.rank as string);
			if (rankDiff !== 0) return rankDiff;

			return a.name.localeCompare(b.name);
		})

	const attainments = await getAttainments(session);

	return <AwardManagementPage awards={normalisedAwards} boys={normalisedUsers as BoyAccount[]} attainments={attainments} />
}