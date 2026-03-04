import { z } from "zod";

export const UUID = z.string().uuid();

export const AttainmentSchema = z.object({
    boy: z.string().email(),
    badge_id: UUID,
    value: z.string().nullable(),
    checked: z.boolean(),
});