import { BoyAccount, NormalisedAccount } from "@/types/accounts";
import UniformInspectionResultPage from "../view/[name]/UniformInspectionResultPage"
import { getInspectionResults } from "../page";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/jwt";
import { getUniformInspectionForm } from "../form/page";
import { getUsers } from "../../user_management/page";
import { notFound } from "next/navigation";

export default async function UniformInspectionUserPage() {
    const session = await getServerSession();
    if (!session) notFound();
    if (!['boy', 'admin'].includes(session.type)) notFound();

    const users = await getUsers(session, ['boy', 'officer', 'volunteer', 'primer'])
    const normalisedUsers = users.map(u => ({ ...u.data, type: u.role })) as NormalisedAccount[];

    const boy = normalisedUsers.find(u => u.name === session.name) as BoyAccount;
    if (!boy) return redirect('/uniform_inspection');
    const inspections = await getInspectionResults(session, [boy]) || {};
    const components = await getUniformInspectionForm(session);
    const fieldIds = components.flatMap(category => category.components_fields.map(field => ({ field_id: field.id, score: field.field_score })));

    return <UniformInspectionResultPage name={boy.name} inspections={inspections} users={normalisedUsers} components={fieldIds} fullComponents={components} />
}