import { z } from "zod";

export const customerCreateSchema = z.object({
    customerName: z.string().min(1, "Customer Name is required"),
    customerCode: z.string().min(1, "Customer Code is required"),
    customerType: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    phone: z.string().optional(),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    address: z.string().optional(),
    annualRevenue: z.number().optional(),
    employeeCount: z.number().optional(),
    assignedUserId: z.string().optional(),
    branchId: z.string().optional(),
    useAt: z.enum(["Y", "N"]).default("Y"),
});

export const customerUpdateSchema = customerCreateSchema;

export type CustomerCreateFormValues = z.infer<typeof customerCreateSchema>;
