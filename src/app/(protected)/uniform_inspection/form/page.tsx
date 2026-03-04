import UniformInspectionForm from "./UniformInspectionForm"
import { getServerSession } from "@/lib/jwt";
import { getUsers } from "@/app/(protected)/user_management/page";
import { NormalisedAccount, ServerSession } from "@/types/accounts";
import { unstable_cache } from "next/cache";
import { withDB } from "@/lib/db";
import { UniformCategory, UniformInspectionFormValues } from "@/types/inspection";
import { Pool } from "@neondatabase/serverless";
import { revalidateTag } from "next/cache";
import { notFound } from "next/navigation";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const getUniformInspectionForm = unstable_cache(async (session: ServerSession) => {
    const components = await withDB(session, (db) => db`
        SELECT
            c.id,
            c.component_name,
            c."order",
            c.total_score,
            json_agg(
                json_build_object(
                    'id', f.id,
                    'field_description', f.field_description,
                    'field_score', f.field_score
                )
            ) as components_fields
        FROM uniform_categories c
        LEFT JOIN uniform_category_fields f
        ON f.category_id = c.id
        GROUP BY c.id
        ORDER BY c."order";
    `);
    return components as UniformCategory[];
}, ['uniform_inspection_form'], { tags: ['uniform_inspection_form'] })

export default async function UniformInspectionFormPage() {
    const session = await getServerSession()
    if (!session) notFound();
    if (!['admin', 'officer', 'primer'].includes(session.type)) notFound();

    const users = await getUsers(session, ['boy', 'officer', 'volunteer', 'primer'])
    const normalisedUsers = users.map(u => ({ ...u.data, type: u.role })) as NormalisedAccount[];
    const components = await getUniformInspectionForm(session);

    const onSubmit = async (data: UniformInspectionFormValues): Promise<void> => {
        'use server';

        const client = await pool.connect()

        try {
            await client.query("BEGIN")
            await client.query(`SELECT set_config('app.type', $1, true)`, [session.type])

            const inspectionRes = await client.query(`
                INSERT INTO inspections (inspected_by)
                VALUES ($1)
                RETURNING id
            `, [session.email])

            const inspectionId = inspectionRes.rows[0].id

            for (const [name, boyData] of Object.entries(data)) {
                for (const [sectionId, fieldArray] of Object.entries(boyData.fields)) {
                    const remarks = boyData.remarks[sectionId]
                    const result = await client.query(`
                        INSERT INTO inspection_results(inspection_id, boy, section_id, remarks)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id
                    `, [inspectionId, name, sectionId, remarks])

                    const resultId = result.rows[0].id

                    if (fieldArray.length > 0) {
                        await client.query(`
                            INSERT INTO inspection_field_results
                            (inspection_result_id, field_id)
                            SELECT $1, UNNEST($2::text[])
                        `, [resultId, fieldArray])
                    }
                }
            }

            await client.query(`
                INSERT INTO logs (user_email, action)
                VALUES ($1, 'Inspection submitted for ' || $2)
            `, [session.email, Object.keys(data).join(", ")])

            await client.query("COMMIT")
        } catch (err) {
            await client.query("ROLLBACK")
            throw err
        } finally {
            client.release()
            revalidateTag('uniform_inspection_form', 'default')
        }
    }

    return <UniformInspectionForm users={normalisedUsers} components={components} onSubmit={onSubmit} />
}