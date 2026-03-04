import UniformInspectionSummary from "./UniformInspectionSummary";
import { getUsers } from "../user_management/page";
import { getServerSession } from "@/lib/jwt";
import { BoyAccount, NormalisedAccount, ServerSession } from "@/types/accounts";
import { withDB } from "@/lib/db";
import { Pool } from "@neondatabase/serverless";
import { getUniformInspectionForm } from "./form/page";
import { notFound } from "next/navigation";

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const inspectionYearlyChange = async (session: ServerSession) => {
    const yearlyChange = await withDB(session, (db) => db`
        WITH yearly AS (
            SELECT
                EXTRACT(YEAR FROM inspection_date)::int AS year,
                COUNT(*) AS total_inspections
            FROM inspections
            GROUP BY year
        )
        SELECT
            current_year.year,
            current_year.total_inspections,
            COALESCE(prev_year.total_inspections, 0) AS prev_year,
            CASE
                WHEN COALESCE(prev_year.total_inspections, 0) = 0
                AND current_year.total_inspections > 0
                THEN 100
                WHEN COALESCE(prev_year.total_inspections, 0) = 0
                THEN 0
                ELSE ROUND(
                    (
                        current_year.total_inspections
                        - prev_year.total_inspections
                    )::numeric
                    / prev_year.total_inspections
                    * 100,
                    2
                )
            END AS percent_change
        FROM yearly current_year
        LEFT JOIN yearly prev_year
            ON prev_year.year = current_year.year - 1
        WHERE current_year.year = EXTRACT(YEAR FROM CURRENT_DATE);
    `)

    return yearlyChange;
}

export const getInspectionResults = async (session: ServerSession, boys: BoyAccount[]) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN")
        await client.query(
            `SELECT set_config('app.type', $1, true)`,
            [session.type]
        )

        const result = await client.query(`
            SELECT
                r.*,
                f.field_id,
                i.inspection_date,
                i.inspected_by
            FROM inspection_results r
            LEFT JOIN inspection_field_results f
                ON r.id = f.inspection_result_id
            JOIN inspections i
                ON i.id = r.inspection_id
            WHERE r.boy = ANY($1::text[])
            ORDER BY i.inspection_date DESC
        `, [boys.map(b => b.name)])

        await client.query("COMMIT")

        const normalisedResults: Record<string, any[]> = {}

        for (const row of result.rows) {
            if (!normalisedResults[row.boy]) normalisedResults[row.boy] = []
            normalisedResults[row.boy].push(row)
        }
        return normalisedResults;
    } catch (err) {
        console.error(err)
    } finally {
        client.release();
    }
}

export default async function uniformInspectionPage() {
    const session = await getServerSession()
    if (!session) notFound();
    if (!['admin', 'officer', 'primer'].includes(session.type)) notFound();

    const users = await getUsers(session, ['boy', 'officer', 'volunteer', 'primer'])
    const normalisedUsers = users.map(u => ({ ...u.data, type: u.role })) as NormalisedAccount[];
    const boys = normalisedUsers.filter(u => u.type === 'boy' && !u.graduated) as BoyAccount[];

    const yearlyChange = await inspectionYearlyChange(session);
    const inspections = await getInspectionResults(session, boys) || {};
    const components = await getUniformInspectionForm(session);
    const fieldIds = components.flatMap(category => category.components_fields.map(field => ({ field_id: field.id, score: field.field_score })))

    return <UniformInspectionSummary users={normalisedUsers} yearlyChange={yearlyChange} fullComponents={components} inspections={inspections} components={fieldIds} />
}