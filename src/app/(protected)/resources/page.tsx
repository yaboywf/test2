import { getServerSession } from "@/lib/jwt";
import ResourcePage from "./ResourcePage";
import { getUsers } from "../user_management/page";
import { withDB } from "@/lib/db";
import { BoyAccount } from "@/types/accounts";
import { getSecLvl } from "@/lib/user";
import { notFound } from "next/navigation";

export default async function Resources() {
    const session = await getServerSession();
    if (!session) notFound();

    const users = await getUsers(session, ['boy']);
    const normalisedUsers = users.map(user => ({ ...user.data, type: user.role }));
    const appointments = normalisedUsers
        .filter(user => user.appointment && user.appointment.length > 0)
        .flatMap(user => user.appointment!.map(appt => ({
            name: user.name,
            appointment: appt
        })))
        .sort((a, b) => a.appointment.localeCompare(b.appointment))

    let boys: { name: string, email: string, sec: number }[] = [];
    if (session.type !== 'boy') {
        boys = normalisedUsers
            .filter((user): user is BoyAccount => user.type === 'boy')
            .map(user => ({ name: user.name, email: user.email, sec: getSecLvl(user) }))
            .sort((a, b) => {
                if (a.sec !== b.sec) return b.sec - a.sec
                return a.name.localeCompare(b.name)
            })
    }

    let allowedResources: string[] = [];
    if (session.type === 'boy') {
        const query = await withDB(session, (db) => db`
            SELECT DISTINCT r.name
            FROM resources r
            JOIN resources_whitelist w
            ON r.id = w.resource
            WHERE w.email = ${session.email};
        `);
        allowedResources = query.map(resource => resource.name);
    }
    return <ResourcePage user={session} appointments={appointments} allowedResources={allowedResources} boys={boys} />
}
