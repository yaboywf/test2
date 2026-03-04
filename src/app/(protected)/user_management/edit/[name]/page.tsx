import { getServerSession } from "@/lib/jwt";
import { redirect } from "next/navigation";
import UserInformation from "./UserInformation";
import { getUsers } from "@/app/(protected)/user_management/page";
import { revalidateTag } from "next/cache";
import { AccountSchema, AccountFormData } from "@/schemas/account.schema";
import { PrimerAccount, BoyAccount, OfficerAccount, VolunteerAccount, NonNormalisedAccount } from "@/types/accounts";
import { SubmitResult } from "@/types/forms";
import { neon } from "@neondatabase/serverless";
import { withDB } from "@/lib/db";
import { getSecLvl } from "@/lib/user";
import { notFound } from "next/navigation";

type PageProps = {
    params: {
        name: string;
    };
};

const sql = neon(process.env.DATABASE_URL!);

const TABLE_MAP = {
    boy: "boy",
    officer: "officer",
    primer: "primer",
    volunteer: "volunteer",
} as const;

function getSecAppt(appointments?: string[]): number | null {
    if (!appointments || appointments.length === 0) return null;

    for (const appt of appointments) {
        const match = appt.match(/sec\s*(\d)/i);
        if (match) return Number(match[1]);
    }

    return null;
}

function getRoleFromAppointment(appointments?: string[]): string[] {
    if (!appointments) return [];
    return appointments.map(a => a.toLowerCase());
}

function normaliseUser(user: NonNormalisedAccount): OfficerAccount | PrimerAccount | VolunteerAccount | BoyAccount {
    switch (user.role) {
        case "officer":
            return { ...user.data, type: "officer" } as OfficerAccount;
        case "primer":
            return { ...user.data, type: "primer" } as PrimerAccount;
        case "volunteer":
            return { ...user.data, type: user.role } as VolunteerAccount;
        case "boy":
            return { ...user.data, type: "boy" } as BoyAccount;
        default:
            throw new Error("Invalid user role");
    }
}

function deepEqual(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
}

export default async function userInformation({ params }: PageProps) {
    const { name } = await params;
    const session = await getServerSession();
    if (!session || (session.type === 'boy' && !session.appointment)) notFound();
    const decodedName = decodeURIComponent(name);

    const users = await getUsers(session, ["officer", "volunteer", "primer", "boy"]);
    const user = users.find(u => u.data.name === decodedName);
    if (!user) return redirect("/user_management");
    const normalisedUser = normaliseUser(user);

    switch (normalisedUser.type) {
        case "officer":
            if (!['admin', 'officer'].includes(session.type)) return redirect("/user_management");
            break;
        case "volunteer":
        case "primer":
            if (session.type === 'boy') return redirect("/user_management");
            break;
        case "boy":
            const sessionSec = getSecAppt(session.appointment ?? []);
            const userSec = getSecLvl(normalisedUser);
            const appt = getRoleFromAppointment(session.appointment ?? []);

            if ((appt?.includes("csm") || appt?.includes('admin')) && session.type !== 'boy') break;
            if (session.type === 'boy' && (!sessionSec || !userSec || sessionSec !== userSec)) return redirect("/user_management");
            break;
        default:
            return redirect("/user_management");
    }

    const submitForm = async (data: object): Promise<SubmitResult> => {
        'use server';

        const result = AccountSchema.safeParse(data as AccountFormData);
        if (!result.success) return { ok: false, errors: result.error.flatten() };
        if (deepEqual(result.data, normalisedUser)) return { ok: true };
        const { type, email, ...rest } = result.data;

        const clean = Object.fromEntries(
            Object.entries(rest).filter(([, v]) => v !== undefined && v !== null)
        );

        if (Object.keys(clean).length === 0) return { ok: true };

        const table = TABLE_MAP[type];
        const setClauses = Object.entries(clean).map(
            ([key, value]) => sql`${sql.unsafe(`"${key}"`)} = ${value}`
        );

        try {
            const oldUser = await withDB(session, async (db) => db`
                SELECT * FROM ${sql.unsafe(table)} WHERE email = ${email}
            `);
            const oldName = oldUser[0]?.name;

            const updatedUser = await withDB(session, async (db) => db`
                UPDATE ${sql.unsafe(table)}
                SET ${setClauses.reduce(
                (acc, clause, i) => i === 0 ? clause : sql`${acc}, ${clause}`,
                sql``
            )}
                WHERE email = ${email}
                RETURNING name;
            `);
            const newName = updatedUser[0]?.name;

            if (oldName && newName && oldName !== newName) {
                await withDB(session, async (db) => db`
                    UPDATE inspection_results
                    SET boy = ${newName}
                    WHERE boy = ${oldName}
                `);
            }

            // LOG ENTRY
            const action = `Updated ${email} account`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err) {
            console.error(err);
            return {
                ok: false,
                errors: { fieldErrors: {}, formErrors: ["Failed to update account"] },
            };
        }
    }

    const deleteForm = async (): Promise<SubmitResult> => {
        'use server';

        try {
            await withDB(session, async (db) => db`DELETE FROM ${sql.unsafe(TABLE_MAP[normalisedUser.type])} WHERE email = ${normalisedUser.email}`);

            // LOG ENTRY
            const action = `Deleted ${normalisedUser.email} account`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            await withDB(session, (db) => db`
                DELETE FROM inspection_field_results
                WHERE inspection_result_id IN (
                    SELECT id FROM inspection_results WHERE boy = ${normalisedUser.name}
                )
            `);

            await withDB(session, (db) => db`
                DELETE FROM inspection_results
                WHERE boy = ${normalisedUser.name}
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err) {
            console.error(err);
            return {
                ok: false,
                errors: { fieldErrors: {}, formErrors: ["Failed to delete account"] },
            };
        }
    }

    return <UserInformation selectedUserInfo={normalisedUser} submitForm={submitForm} deleteForm={deleteForm} />;
}