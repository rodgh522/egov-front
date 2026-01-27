import { z } from 'zod';

export const branchCreateSchema = z.object({
    branchName: z.string().min(2, 'Branch Name must be at least 2 characters'),
    branchCode: z.string().min(2, 'Branch Code must be at least 2 characters'),
    branchAddress: z.string().optional(),
    branchPhone: z.string().optional(),
    parentBranchId: z.string().optional(),
    useAt: z.enum(['Y', 'N']).default('Y'),
});

export const branchUpdateSchema = z.object({
    branchName: z.string().min(2, 'Branch Name must be at least 2 characters'),
    branchAddress: z.string().optional(),
    branchPhone: z.string().optional(),
    parentBranchId: z.string().optional(),
    useAt: z.enum(['Y', 'N']),
});

export type BranchCreateFormValues = z.infer<typeof branchCreateSchema>;
export type BranchUpdateFormValues = z.infer<typeof branchUpdateSchema>;
