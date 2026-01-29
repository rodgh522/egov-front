import { z } from "zod";

export const quoteItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Unit price must be non-negative"),
    discountRate: z.number().min(0, "Discount rate must be non-negative").max(100, "Discount rate cannot exceed 100").optional(),
    taxRate: z.number().min(0, "Tax rate must be non-negative").optional(),
    description: z.string().optional(),
});

export const quoteSchema = z.object({
    quoteNumber: z.string().min(1, "Quote number is required"),
    opportunityId: z.string().optional(),
    customerId: z.string().min(1, "Customer is required"),
    contactId: z.string().optional(),
    quoteStatus: z.string().optional(),
    quoteDate: z.date(),
    validUntil: z.date().optional(),
    currency: z.string().optional(),
    paymentTerms: z.string().optional(),
    deliveryTerms: z.string().optional(),
    notes: z.string().optional(),
    assignedUserId: z.string().optional(),
    items: z.array(quoteItemSchema),
});

export type QuoteFormValues = z.infer<typeof quoteSchema>;
export type QuoteItemFormValues = z.infer<typeof quoteItemSchema>;
