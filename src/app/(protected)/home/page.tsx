import DashboardPageWrapper from "./DashboardWrapper";
import { getServerSession } from "@/lib/jwt";
import { AccountType, NormalisedAccount } from "@/types/accounts";
import { notFound } from "next/navigation";

export default async function HomePage() {
    const session = await getServerSession();
    if (!session) notFound();

    const safeSession = {
        name: session.name,
        type: session.type as AccountType,
        rank: session.rank,
        appointment: session.appointment,
        honorific: session.honorific,
        member_id: session.member_id,
    } as Partial<NormalisedAccount>;

    return <DashboardPageWrapper user={safeSession} />;
}
