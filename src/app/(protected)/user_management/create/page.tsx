import { getServerSession } from "@/lib/jwt";
import AccountCreationForm from "./AccountCreationForm";
import { AccountSchema, AccountFormData } from "@/schemas/account.schema";
import { revalidateTag } from "next/cache";
import { SubmitResult } from "@/types/forms";
import { withDB } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function accountCreation() {
    const session = await getServerSession();
    if (!session || (session.type === 'boy' && !session.appointment)) notFound();

    const onSubmit = async (data: object): Promise<SubmitResult> => {
        'use server';

        const result = AccountSchema.safeParse(data as AccountFormData);
        if (!result.success) return { ok: false, errors: result.error.flatten() }
        const { type, name, email } = result.data;

        if (type === 'officer' && !['admin', 'officer'].includes(session.type)) return { ok: false, errors: { fieldErrors: { type: ["Unauthorised"] }, formErrors: [] } };

        try {
            switch (type) {
                case "officer": {
                    const { honorific, rank, class: userClass, member_id } = result.data;
                    await withDB(session, async (db) => db`INSERT INTO officer (email, honorific, name, rank, class, member_id) VALUES (${email}, ${honorific}, ${name}, ${rank}, ${userClass}, ${member_id})`);
                    break;
                }

                case "primer": {
                    const { rank, member_id } = result.data;
                    await withDB(session, async (db) => db`INSERT INTO primer (email, name, rank, member_id) VALUES (${email}, ${name}, ${rank}, ${member_id})`);
                    break;
                }

                case "volunteer": {
                    const { honorific, member_id } = result.data;
                    await withDB(session, async (db) => db`INSERT INTO volunteer (email, name, honorific, member_id) VALUES (${email}, ${name}, ${honorific}, ${member_id})`);
                    break;
                }

                case "boy": {
                    const { sec1_class, member_id } = result.data;
                    await withDB(session, async (db) => db`INSERT INTO boy (email, name, sec1_class, member_id) VALUES (${email}, ${name}, ${sec1_class}, ${member_id})`);
                    break;
                }
            }

            // LOG ENTRY
            const action = `Created ${email} account of type ${type}`;
            await withDB(session, (db) => db`
                INSERT INTO logs (user_email, action)
                VALUES (${session.email}, ${action});
            `);

            revalidateTag("users", "default");
            return { ok: true };
        } catch (err: unknown) {
            console.error("Account creation failed:", err);

            return {
                ok: false,
                errors: {
                    fieldErrors: {},
                    formErrors: ["Failed to create account. Please try again."]
                }
            };
        }
    }

    return <AccountCreationForm user={session} submitForm={onSubmit} />
}