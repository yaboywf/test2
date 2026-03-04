import { getServerSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import UniformInspectionResultPage from "./UniformInspectionResultPage";
import { getInspectionResults } from "@/app/(protected)/uniform_inspection/page";
import { getUsers } from "@/app/(protected)/user_management/page";
import { BoyAccount, NormalisedAccount } from "@/types/accounts";
import { getUniformInspectionForm } from "@/app/(protected)/uniform_inspection/form/page";
import { notFound } from "next/navigation";

type UniformInspectionResultPageProps = {
    params: {
        name: string;
    };
};

export default async function UniformInspectionResultsPage({ params }: UniformInspectionResultPageProps) {
    const { name } = await params;
    const session = await getServerSession();
    if (!session) notFound();
    if (!['admin', 'officer', 'primer'].includes(session.type)) notFound();

    const users = await getUsers(session, ['boy', 'officer', 'volunteer', 'primer'])
    const normalisedUsers = users.map(u => ({ ...u.data, type: u.role })) as NormalisedAccount[];

    const boy = normalisedUsers.find(u => u.name === decodeURIComponent(name)) as BoyAccount;
    if (!boy) return redirect('/uniform_inspection');
    const inspections = await getInspectionResults(session, [boy]) || {};
    const components = await getUniformInspectionForm(session);
    const fieldIds = components.flatMap(category => category.components_fields.map(field => ({ field_id: field.id, score: field.field_score })));

    return <UniformInspectionResultPage name={boy.name} inspections={inspections} users={normalisedUsers} components={fieldIds} fullComponents={components} />
}