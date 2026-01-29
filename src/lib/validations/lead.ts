import { z } from "zod";

export const leadCreateSchema = z.object({
    leadName: z.string().min(1, "Lead Name is required"),
    companyName: z.string().optional(),
    contactName: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    leadSource: z.string().optional(),
    leadStatus: z.string().optional(),
    leadScore: z.number().int().min(0).optional(),
    industry: z.string().optional(),
    estimatedRevenue: z.number().min(0, "Revenue must be positive").optional(),
    description: z.string().optional(),
    assignedUserId: z.string().optional(),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const leadUpdateSchema = leadCreateSchema.extend({
    // Add specific update optional fields if any, but usually structure is same
});

export type LeadCreateFormValues = z.infer<typeof leadCreateSchema>;
export type LeadUpdateFormValues = z.infer<typeof leadUpdateSchema>;
