import { z } from 'zod';

export const positionCreateSchema = z.object({
    positionName: z.string().min(1, 'Position Name is required'),
    positionCode: z.string().min(1, 'Position Code is required'),
    positionLevel: z.coerce.number().min(0, 'Level must be 0 or greater'),
    positionDescription: z.string().optional(),
    useAt: z.enum(['Y', 'N']).default('Y'),
});

export const positionUpdateSchema = z.object({
    positionName: z.string().min(1, 'Position Name is required'),
    positionCode: z.string().min(1, 'Position Code is required'),
    positionLevel: z.coerce.number().min(0, 'Level must be 0 or greater'),
    positionDescription: z.string().optional(),
    useAt: z.enum(['Y', 'N']),
});

export type PositionCreateFormValues = z.infer<typeof positionCreateSchema>;
export type PositionUpdateFormValues = z.infer<typeof positionUpdateSchema>;
