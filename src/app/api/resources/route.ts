import { getServerSession } from "@/lib/jwt";
import { triggerPusher } from "@/lib/pusher-server";
import { Pool } from "@neondatabase/serverless";

type Resource = {
    resource: 'target';
    emails: string[];
}

export async function POST(req: Request) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const { resource, emails } = await req.json() as Resource;
    const client = await pool.connect();
    const serverSession = await getServerSession()

    if (!serverSession || serverSession.type === 'boy') return new Response(JSON.stringify({ success: false }), { status: 401 })

    try {
        await client.query("BEGIN")
        await client.query(
            `SELECT set_config('app.type', $1, true)`,
            [serverSession.type]
        )

        const { rows } = await client.query(
            `SELECT id FROM resources WHERE name = $1`,
            [resource]
        )

        if (rows.length === 0) throw new Error("Resource not found")
        const resourceId = rows[0].id

        await client.query(`
            DELETE FROM resources_whitelist WHERE resource = $1
        `, [resourceId])

        for (const email of emails) {
            await client.query(
                'INSERT INTO resources_whitelist (resource, email) VALUES ($1, $2)',
                [resourceId, email]
            )
        }

        await client.query(
            `INSERT INTO logs (user_email, action) VALUES ($1, $2)`,
            [serverSession.email, `Updated ${resource} whitelist to ${emails.join(', ')}`]
        )

        await client.query("COMMIT")
    } catch (err) {
        console.error(err)
        await client.query('ROLLBACK')
    } finally {
        client.release();
    }

    await triggerPusher("resources", "updated", {});

    return new Response(JSON.stringify({ success: true }));
}

export async function GET(req: Request) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const { searchParams } = new URL(req.url)
    const resource = searchParams.get('resource')
    const client = await pool.connect();

    if (!resource) return new Response(JSON.stringify({ success: false }), { status: 400 })

    try {
        const { rows } = await client.query(
            `SELECT email FROM resources_whitelist WHERE resource = (
                SELECT id FROM resources WHERE name = $1
            )`,
            [resource]
        )
        return new Response(JSON.stringify({ whitelist: rows.map(r => r.email) }))
    } catch (err) {
        console.error(err)
        return new Response(JSON.stringify({ success: false }), { status: 500 })
    } finally {
        client.release();
    }
}
