import { getServerSession } from "@/lib/jwt";
import { unstable_cache, revalidateTag } from "next/cache";
import UserManagementPage from "./UserManagementPage";
import { NonNormalisedAccount, AccountType, NormalisedAccount, ServerSession, BoyAccount } from "@/types/accounts";
import { withDB } from "@/lib/db";
import { AppointmentInput, UpdateAppointmentInput } from "@/types/appointments";
import { AppointmentSchema } from "@/schemas/appointment.schema";
import { SubmitResult } from "@/types/forms";
import { getSecLvl } from "@/lib/user";
import { notFound } from "next/navigation";

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

function canViewUser(session: ServerSession, user: NormalisedAccount): boolean {
    switch (user.type) {
        case "officer":
            return ['admin', 'officer'].includes(session.type);

        case "volunteer":
        case "primer":
            return session.type !== 'boy';

        case "boy": {
            const sessionSec = getSecAppt(session.appointment ?? []);
            const userSec = getSecLvl(user);
            const appt = getRoleFromAppointment(session.appointment ?? []);

            if (session.type !== 'boy' && (appt?.some(r => r.includes("csm")) || appt?.some(r => r.includes("admin")))) return true;
            if (session.type === 'boy') return !!sessionSec && !!userSec && sessionSec === userSec;
            return true;
        }

        default:
            return false;
    }
}

export const getUsers = (session: ServerSession, accounts: AccountType[]) => unstable_cache(
    async () => {
        return await withDB(session, (db) =>
            db`
                SELECT *
                FROM users_all
                ORDER BY array_position(${accounts}, role);
            `
        ) as NonNormalisedAccount[]
    },
    ["users", session.type, ...accounts.sort()],
    { tags: ["users"] }
)();

export default async function userManagementPage() {
    const session = await getServerSession();
    if (!session) notFound();
    if (session.type === "boy" && !["csm", "admin"].some(r => session.appointment?.map(a => a.toLowerCase()).includes(r))) notFound();

    const ROLE_ORDER = ["officer", "volunteer", "primer", "boy"];
    const RANK_ORDER = ["LTA", "2LT", "OCT", "SCL", "CLT", "WO", "SSG", "SGT", "CPL", "LCP", "PTE", "REC"];

    const allUsers = await getUsers(session, ROLE_ORDER as AccountType[]);

    let allowedRoles: AccountType[];

    switch (session.type) {
        case "admin":
        case "officer":
            allowedRoles = ROLE_ORDER as AccountType[];
            break;
        case "volunteer":
        case "primer":
            allowedRoles = ["volunteer", "primer", "boy"] as AccountType[];
            break;
        case "boy":
            allowedRoles = ["boy"] as AccountType[];
            break;
    }

    const filtered = allUsers
        .filter(u => allowedRoles.includes(u.role))
        .map(u => ({
            name: u.data.name,
            email: u.data.email,
            type: u.role.toLowerCase().trim() as AccountType,
            rank: u.data.rank,
            graduated: u.data.graduated ?? null,
            appointment: u.data.appointment,
            sec: getSecLvl(u.data as BoyAccount),
            member_id: u.data.member_id,
            honorific: u.data.honorific,
        }))
        .filter(u => canViewUser(session, u as NormalisedAccount))
        .sort((a, b) => {
            if (a.type === "boy" && b.type === "boy") {
                const ag = !!a.graduated;
                const bg = !!b.graduated;

                if (ag !== bg) return ag ? 1 : -1;
            }

            const ROLE_PRIORITY: Record<string, number> = {
                officer: 0,
                volunteer: 1,
                primer: 2,
                boy: 3,
            };

            const aPriority = ROLE_PRIORITY[a.type] ?? 999;
            const bPriority = ROLE_PRIORITY[b.type] ?? 999;

            const typeDiff = aPriority - bPriority;
            if (typeDiff !== 0) return typeDiff;

            if (a.rank && b.rank) {
                const rankDiff = RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
                if (rankDiff !== 0) return rankDiff;
            }

            return a.name.localeCompare(b.name);
        });

    const create = async (data: object): Promise<SubmitResult> => {
        'use server';

        const result = AppointmentSchema.safeParse(data as AppointmentInput);
        if (!result.success) return { ok: false, errors: result.error.flatten() };
        const { email, appointment_name } = result.data;

        try {
            await withDB(session, (db) => db`
                UPDATE boy
                SET appointment = array_append(appointment, ${appointment_name})
                WHERE email = ${email};
            `);

            // LOG ENTRY
            const action = `Added ${appointment_name} to ${email}`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err) {
            console.error(err);
            return { ok: false, errors: { formErrors: ["Failed to create appointment"], fieldErrors: {} } };
        }
    }

    const remove = async (data: object): Promise<SubmitResult> => {
        'use server';

        const result = AppointmentSchema.safeParse(data as AppointmentInput);
        if (!result.success) return { ok: false, errors: result.error.flatten() };
        const { email, appointment_name } = result.data;

        try {
            await withDB(session, (db) => db`
                UPDATE boy
                SET appointment = array_remove(appointment, ${appointment_name})
                WHERE email = ${email};
            `);

            // LOG ENTRY
            const action = `Removed ${appointment_name} from ${email}`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err) {
            console.error(err);
            return { ok: false, errors: { formErrors: ["Failed to delete appointment"], fieldErrors: {} } };
        }
    }

    const update = async (data: object): Promise<SubmitResult> => {
        'use server';

        const result = AppointmentSchema.safeParse(data as UpdateAppointmentInput);
        if (!result.success) return { ok: false, errors: result.error.flatten() };
        const { email, appointment_name, original_email } = result.data;
        if (email === original_email) return { ok: true };

        try {
            await withDB(session, (db) => db`
                UPDATE boy
                SET appointment = array_remove(appointment, ${appointment_name})
                WHERE email = ${original_email};
            `);

            await withDB(session, (db) => db`
                UPDATE boy
                SET appointment = array_append(appointment, ${appointment_name})
                WHERE email = ${email};
            `);

            // LOG ENTRY
            const action = `Update appointment from ${original_email} to ${email}`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err) {
            console.error(err);
            return { ok: false, errors: { formErrors: ["Failed to update appointment"], fieldErrors: {} } };
        }
    }

    return <UserManagementPage user={session} usersList={filtered as NormalisedAccount[]} createAppointment={create} deleteAppointment={remove} updateAppointment={update} />
}