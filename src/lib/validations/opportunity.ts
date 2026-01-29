import { z } from "zod";

export const opportunityCreateSchema = z.object({
    opportunityName: z.string().min(1, "Opportunity Name is required"),
    customerId: z.string().min(1, "Customer is required"),
    contactId: z.string().optional(),
    stageId: z.string().min(1, "Stage is required"),
    amount: z.number().min(0, "Amount must be positive").optional(),
    expectedCloseDate: z.date().optional(),
    leadSource: z.string().optional(),
    description: z.string().optional(),
    nextStep: z.string().optional(),
    competitorInfo: z.string().optional(),
    assignedUserId: z.string().optional(),
    branchId: z.string().optional(),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const opportunityUpdateSchema = opportunityCreateSchema.extend({
    wonReason: z.string().optional(),
    lostReason: z.string().optional(),
});

export type OpportunityCreateFormValues = z.infer<typeof opportunityCreateSchema>;
export type OpportunityUpdateFormValues = z.infer<typeof opportunityUpdateSchema>;
