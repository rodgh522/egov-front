import { z } from 'zod';

export const groupCreateSchema = z.object({
    groupName: z.string().min(2, 'Group Name must be at least 2 characters'),
    groupCode: z.string().min(2, 'Group Code must be at least 2 characters'),
    groupDescription: z.string().optional(),
    branchId: z.string().min(1, 'Branch is required'),
    useAt: z.enum(['Y', 'N']).default('Y'),
});

export const groupUpdateSchema = z.object({
    groupName: z.string().min(2, 'Group Name must be at least 2 characters'),
    groupCode: z.string().min(2, 'Group Code must be at least 2 characters'),
    groupDescription: z.string().optional(),
    branchId: z.string().min(1, 'Branch is required'),
    useAt: z.enum(['Y', 'N']),
});

export type GroupCreateFormValues = z.infer<typeof groupCreateSchema>;
export type GroupUpdateFormValues = z.infer<typeof groupUpdateSchema>;
