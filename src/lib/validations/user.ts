import { z } from 'zod';

export const userCreateSchema = z.object({
    userId: z.string().min(3, 'User ID must be at least 3 characters'),
    userName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    phone: z.string().optional(),
    deptId: z.string().optional(), // Mapping to groupId/branchId logic if needed, but keeping simple for now
    useAt: z.enum(['Y', 'N']).default('Y'),
});

export const userUpdateSchema = z.object({
    userName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    useAt: z.enum(['Y', 'N']),
});

export type UserCreateFormValues = z.infer<typeof userCreateSchema>;
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
