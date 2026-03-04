import { z } from "zod";

export const Sec1ClassSchema = z.string().regex(/^F1-[1-7]$/);
export const Sec2ClassSchema = z.string().regex(/^H2-[1-7]$/).optional().nullable();
export const Sec3ClassSchema = z.string().regex(/^J3-[1-7]$/).optional().nullable();
export const Sec4ClassSchema = z.string().regex(/^P4-[1-7]$/).optional().nullable();

const NullableNumber = z.preprocess(
    (val) => {
        if (val === "" || val === undefined || val === null) return null;
        const num = Number(val);
        return Number.isNaN(num) ? val : num;
    },
    z.number().int().nullable()
);

export const AccountSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("boy"),
        name: z.string().min(1),
        email: z.string().email(),
        sec1_class: Sec1ClassSchema,
        sec2_class: Sec2ClassSchema,
        sec3_class: Sec3ClassSchema,
        sec4_class: Sec4ClassSchema,
        sec5_class: Sec4ClassSchema,
        rank: z.string(),
        sec1_rank: z.enum(["REC", "PTE", "LCP"]).optional().nullable(),
        sec2_rank: z.enum(["REC", "PTE", "LCP", "CPL", "SGT"]).optional().nullable(),
        sec3_rank: z.enum(["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"]).optional().nullable(),
        sec4_rank: z.enum(["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"]).optional().nullable(),
        sec5_rank: z.enum(["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"]).optional().nullable(),
        member_id: z
            .string()
            .transform(v => v.trim())
            .transform(v => (v === "" ? null : v))
            .nullable()
            .optional(),
        graduated: z.boolean().optional(),
    }),

    z.object({
        type: z.literal("primer"),
        name: z.string().min(1),
        email: z.string().email(),
        rank: z.string(),
        member_id: NullableNumber,
    }),

    z.object({
        type: z.literal("officer"),
        name: z.string().min(1),
        email: z.string().email(),
        honorific: z.enum(["Mr", "Mrs", "Ms"]),
        class: z.enum(["VAL", "TCH", "A.CHP", "CHP"]),
        rank: z.string(),
        member_id: NullableNumber,
    }),

    z.object({
        type: z.literal("volunteer"),
        name: z.string().min(1),
        email: z.string().email(),
        honorific: z.enum(["Mr", "Mrs", "Ms"]),
        member_id: NullableNumber,
    }),
]);

export type AccountFormData = z.infer<typeof AccountSchema>;