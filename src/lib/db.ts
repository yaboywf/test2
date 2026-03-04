import { neon } from "@neondatabase/serverless";
import { ServerSession } from "@/types/accounts";

const sql = neon(process.env.DATABASE_URL!);

export async function withDB<T>(session: ServerSession, fn: (db: typeof sql) => Promise<T>) {
    await sql`select set_config('app.type', ${session.type}, true)`;
    return fn(sql);
};
