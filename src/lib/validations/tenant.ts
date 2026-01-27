import { z } from "zod";

export const tenantCreateSchema = z.object({
    tenantId: z.string().min(1, "Tenant ID is required"),
    tenantName: z.string().min(1, "Tenant Name is required"),
    tenantDescription: z.string().optional(),
    useAt: z.string().optional().default("Y"),
});

export const tenantUpdateSchema = z.object({
    tenantName: z.string().min(1, "Tenant Name is required"),
    tenantDescription: z.string().optional(),
    useAt: z.string().optional(),
});

export type TenantCreateFormValues = z.infer<typeof tenantCreateSchema>;
export type TenantUpdateFormValues = z.infer<typeof tenantUpdateSchema>;
