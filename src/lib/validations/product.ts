import { z } from "zod";

export const productCreateSchema = z.object({
    productCode: z.string().min(1, "Product Code is required"),
    productName: z.string().min(1, "Product Name is required"),
    productCategory: z.string().optional(),
    productType: z.string().optional(),
    description: z.string().optional(),
    unitPrice: z.number().min(0, "Unit Price must be positive"),
    costPrice: z.number().min(0, "Cost Price must be positive").optional(),
    currency: z.string().optional(),
    taxRate: z.number().min(0, "Tax Rate must be positive").optional(),
    stockQuantity: z.number().min(0).optional(),
    isActive: z.enum(["Y", "N"]).default("Y"),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const productUpdateSchema = productCreateSchema;

export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;
export type ProductUpdateFormValues = z.infer<typeof productUpdateSchema>;
