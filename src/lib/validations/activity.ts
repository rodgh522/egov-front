import { z } from "zod";

export const activityCreateSchema = z.object({
    activitySubject: z.string().min(1, "Subject is required"),
    activityType: z.string().min(1, "Type is required"), // e.g., CALL, EMAIL, MEETING, TASK
    activityDescription: z.string().optional(),
    activityStatus: z.string().default("PENDING"),
    priority: z.string().default("MEDIUM"),
    dueDate: z.date().optional(),
    durationMinutes: z.number().optional(),
    relatedType: z.string().optional(),
    relatedId: z.string().optional(),
    assignedUserId: z.string().optional(),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const activityUpdateSchema = activityCreateSchema.extend({
    // Add any update-specific fields if needed, or just extend
});

export type ActivityCreateFormValues = z.infer<typeof activityCreateSchema>;
export type ActivityUpdateFormValues = z.infer<typeof activityUpdateSchema>;
