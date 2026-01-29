import { z } from "zod";

export const pipelineStageCreateSchema = z.object({
    stageName: z.string().min(1, "Stage Name is required"),
    stageCode: z.string().min(1, "Stage Code is required"),
    stageOrder: z.coerce.number().min(0, "Order must be a positive number").optional(),
    probability: z.coerce.number().min(0).max(100, "Probability must be between 0 and 100").optional(),
    stageColor: z.string().optional(),
    isWon: z.enum(["Y", "N"]).default("N").optional(),
    isLost: z.enum(["Y", "N"]).default("N").optional(),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const pipelineStageUpdateSchema = pipelineStageCreateSchema.partial().extend({
    stageName: z.string().min(1, "Stage Name is required").optional(), // Making specific fields optional overrides required status if needed, but for updates usually we follow the create schema but allow partial content if the API supports PATCH, but here it looks like PUT. 
    // However, the UpdateRequest DTO has all fields optional.
    // Actually, for a form, we usually want the same validation as create if we are editing the whole object. 
    // But let's follow the DTO structure where technically they are optional, 
    // but practically in a form they might be required.
    // Let's stick to strict validation for the form fields that are present.
});

// Since we are likely using the same form for create and edit, 
// we generally use the create schema for the form values.

export type PipelineStageCreateFormValues = z.infer<typeof pipelineStageCreateSchema>;
export type PipelineStageUpdateFormValues = z.infer<typeof pipelineStageCreateSchema>; // reusing create schema for form values typically
