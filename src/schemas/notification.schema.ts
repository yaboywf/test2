import { z } from "zod";

export const NotificationSchema = z.object({
    token: z.string(),
    title: z.string(),
    body: z.string(),
})