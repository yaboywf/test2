import { z } from "zod";

export const AppointmentSchema = z.object({
    appointment_name: z.string().min(1),
    email: z.string().email(),
    original_email: z.string().email().optional(),
});