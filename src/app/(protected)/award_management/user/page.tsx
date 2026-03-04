import { withDB } from "@/lib/db";
import { getAwards } from "../../results_generation/page";
import UserAwards from "./UserAwards";
import { getServerSession } from "@/lib/jwt";
import { Attainment } from "@/types/awards";
import { notFound } from "next/navigation";

const UserAwardsPage = async () => {
    const session = await getServerSession();
    if (!session) notFound();
    if (!["admin", "boy"].includes(session.type)) notFound();

    const awards = await getAwards(session);
    const attainments = await withDB(session, async (db) => db`SELECT * FROM attainments WHERE boy = ${session.email}`)

    return <UserAwards awards={awards} attainments={attainments as Attainment[]} />
}

export default UserAwardsPage